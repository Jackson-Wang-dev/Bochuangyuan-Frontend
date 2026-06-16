"""
Two-stage prefill pipeline:
  Stage 1 — MinerU / fallback text extraction
  Stage 2 — Dynamic schema construction + instructor structured extraction
"""
from __future__ import annotations

import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Any

import instructor  # type: ignore
from openai import OpenAI  # type: ignore

from . import tasks
from .extractor import extract_text
from .schema_builder import build_model, build_system_prompt

# Maximum characters sent to the model per chunk.
# ~8 000 chars ≈ 3 000 tokens for Chinese text (well within deepseek-chat 32k context).
_CHUNK_SIZE = int(os.environ.get("PREFILL_CHUNK_SIZE", "8000"))

# Dedicated thread pool for blocking LLM calls so asyncio loop is never blocked.
_EXECUTOR = ThreadPoolExecutor(max_workers=8)


async def run(task_id: str, file_bytes: bytes, filename: str, schema: dict[str, Any]) -> None:
    """Entry-point for the background task."""
    await tasks.update(task_id, status="running", progress=0, stage="准备中…")
    try:
        values = await _execute(task_id, file_bytes, filename, schema)
        await tasks.update(task_id, status="done", progress=100, stage="完成", values=values)
    except Exception as exc:  # noqa: BLE001
        await tasks.update(task_id, status="failed", error=str(exc))


# --------------------------------------------------------------------------- #
# Internal
# --------------------------------------------------------------------------- #

async def _execute(
    task_id: str,
    file_bytes: bytes,
    filename: str,
    schema: dict[str, Any],
) -> dict[str, Any]:
    all_fields = schema.get("fields", [])
    flat_fields = [f for f in all_fields if f.get("type") not in ("array", "object")]
    coll_fields = [f for f in all_fields if f.get("type") in ("array", "object")]

    # Stage 1: text extraction (0 → 15%)
    await tasks.update(task_id, progress=5, stage="正在解析文档…")
    text = await extract_text(file_bytes, filename)
    await tasks.update(task_id, progress=15, stage="文档解析完成，正在提取字段…")

    client = _get_client()
    model = _get_model()
    loop = asyncio.get_event_loop()

    async def _run_flat() -> dict[str, Any]:
        if not flat_fields:
            return {}
        ExtractionModel = build_model(flat_fields)
        system_prompt = build_system_prompt(flat_fields)
        partials = await asyncio.gather(*[
            loop.run_in_executor(
                _EXECUTOR,
                lambda c=chunk: _extract_chunk(client, model, ExtractionModel, system_prompt, c),
            )
            for chunk in _chunk(text, _CHUNK_SIZE)
        ])
        merged: dict[str, Any] = {}
        for p in partials:
            for k, v in p.items():
                if k not in merged and v is not None:
                    merged[k] = v
        return merged

    async def _run_coll(field: dict) -> dict[str, Any]:
        ExtractionModel = build_model([field])
        system_prompt = build_system_prompt([field])
        return await loop.run_in_executor(
            _EXECUTOR,
            lambda: _extract_chunk(client, model, ExtractionModel, system_prompt, text[: _CHUNK_SIZE * 3]),
        )

    # Launch flat + all collections concurrently; report progress as each finishes
    n_total = 1 + len(coll_fields)
    all_futs: list[asyncio.Future] = [
        asyncio.ensure_future(_run_flat()),
        *[asyncio.ensure_future(_run_coll(f)) for f in coll_fields],
    ]

    merged: dict[str, Any] = {}
    completed = 0
    for fut in asyncio.as_completed(all_futs):
        result = await fut
        merged.update(result)
        completed += 1
        progress = 15 + int(80 * completed / n_total)
        await tasks.update(
            task_id,
            progress=min(progress, 95),
            stage=f"字段提取中… ({completed}/{n_total})",
        )

    return merged


def _extract_chunk(
    client: Any,
    model: str,
    ExtractionModel: type,
    system_prompt: str,
    chunk: str,
) -> dict[str, Any]:
    result = client.chat.completions.create(
        model=model,
        response_model=ExtractionModel,
        max_retries=3,
        max_tokens=4096,   # each call outputs one field only; 4096 is plenty
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"文档内容如下：\n\n{chunk}"},
        ],
    )
    # Serialize and strip None recursively so frontend defaults fill the gaps
    raw = result.model_dump()
    return _strip_none(raw)


def _strip_none(obj: Any) -> Any:
    """Recursively remove None values so frontend schema-defaults fill the gaps."""
    if obj is None:
        return None
    if isinstance(obj, list):
        return [_strip_none(item) for item in obj]
    if isinstance(obj, dict):
        return {k: _strip_none(v) for k, v in obj.items() if v is not None}
    return obj


def _chunk(text: str, size: int) -> list[str]:
    if len(text) <= size:
        return [text]
    # Split on blank lines first; fall back to hard split
    chunks: list[str] = []
    buf = ""
    for para in text.split("\n\n"):
        if len(buf) + len(para) + 2 > size:
            if buf:
                chunks.append(buf.strip())
            buf = para
        else:
            buf = (buf + "\n\n" + para).lstrip()
    if buf.strip():
        chunks.append(buf.strip())
    return chunks or [text[:size]]


def _get_client():
    provider = os.environ.get("LLM_PROVIDER", "deepseek")

    if provider == "deepseek":
        raw = OpenAI(
            api_key=os.environ["DEEPSEEK_API_KEY"],
            base_url="https://api.deepseek.com",
        )
        return instructor.from_openai(raw)

    if provider == "qwen":
        raw = OpenAI(
            api_key=os.environ["DASHSCOPE_API_KEY"],
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )
        return instructor.from_openai(raw)

    if provider == "openai":
        raw = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
        return instructor.from_openai(raw)

    if provider == "claude":
        import anthropic  # type: ignore
        raw = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        return instructor.from_anthropic(raw)

    raise ValueError(f"未知 LLM_PROVIDER: {provider}")


def _get_model() -> str:
    defaults = {
        "deepseek": "deepseek-chat",
        "qwen": "qwen-max",
        "openai": "gpt-4o",
        "claude": "claude-sonnet-4-6",
    }
    provider = os.environ.get("LLM_PROVIDER", "deepseek")
    return os.environ.get("LLM_MODEL", defaults.get(provider, "deepseek-chat"))
