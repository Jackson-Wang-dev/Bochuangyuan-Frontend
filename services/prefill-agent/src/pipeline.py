"""
Two-stage prefill pipeline:
  Stage 1 — MinerU / fallback text extraction
  Stage 2 — Dynamic schema construction + instructor structured extraction
"""
from __future__ import annotations

import asyncio
import os
from typing import Any

import instructor  # type: ignore
from openai import OpenAI  # type: ignore

from . import tasks
from .extractor import extract_text
from .schema_builder import build_model, build_system_prompt

# Maximum characters sent to the model per chunk.
# ~8 000 chars ≈ 3 000 tokens for Chinese text (well within deepseek-chat 32k context).
# For very long docs we split and merge results.
_CHUNK_SIZE = int(os.environ.get("PREFILL_CHUNK_SIZE", "8000"))


async def run(task_id: str, file_bytes: bytes, filename: str, schema: dict[str, Any]) -> None:
    """Entry-point for the background task."""
    await tasks.update(task_id, status="running")
    try:
        values = await _execute(file_bytes, filename, schema)
        await tasks.update(task_id, status="done", values=values)
    except Exception as exc:  # noqa: BLE001
        await tasks.update(task_id, status="failed", error=str(exc))


# --------------------------------------------------------------------------- #
# Internal
# --------------------------------------------------------------------------- #

async def _execute(
    file_bytes: bytes,
    filename: str,
    schema: dict[str, Any],
) -> dict[str, Any]:
    fields = schema.get("fields", [])

    # Stage 1: text extraction
    text = await extract_text(file_bytes, filename)

    # Stage 2: structured extraction
    ExtractionModel = build_model(fields)
    system_prompt = build_system_prompt(fields)
    client = _get_client()
    model = _get_model()

    chunks = _chunk(text, _CHUNK_SIZE)
    merged: dict[str, Any] = {}

    for chunk in chunks:
        partial = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda c=chunk: _extract_chunk(client, model, ExtractionModel, system_prompt, c),
        )
        # Merge: first non-null value wins for scalars; lists are concatenated
        for k, v in partial.items():
            if v is None:
                continue
            if k not in merged:
                merged[k] = v
            elif isinstance(v, list) and isinstance(merged.get(k), list):
                merged[k] = merged[k] + v

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
