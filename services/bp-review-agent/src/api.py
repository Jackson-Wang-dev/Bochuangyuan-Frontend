"""
FastAPI 服务。

端点：
  POST /review        上传文件 + mode(A/B) -> Markdown 报告
  POST /compare       上传文件 -> A、B 两份报告（并发执行）
  POST /review-text   纯文本输入（方便测试和前端集成）
  GET  /health        健康检查

启动方式：
  uvicorn src.api:app --host 0.0.0.0 --port 8001 --reload
"""
from __future__ import annotations

import os
import tempfile
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .document import extract_text
from .engine import adk_pipeline

app = FastAPI(
    title="BP 评审引擎",
    description="三视角商业计划书 AI 评审服务（Google ADK + DeepSeek）",
    version="0.1.0",
)

# CORS：允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_DRY_RUN_DEFAULT = os.environ.get("DRY_RUN", "0") == "1"


# ---------------------------------------------------------------------------
# 健康检查
# ---------------------------------------------------------------------------


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "dry_run": _DRY_RUN_DEFAULT,
        "version": "0.1.0",
    }


# ---------------------------------------------------------------------------
# POST /review  —— 文件上传
# ---------------------------------------------------------------------------


@app.post("/review")
async def review_file(
    file: UploadFile = File(..., description="BP 文件（PDF/PPTX/DOCX/TXT）"),
    mode: Literal["A", "B"] = Form(default="A", description="A=直接评审，B=含历史意见"),
    dry_run: bool = Form(default=False, description="干跑模式，不调用真实 LLM"),
):
    """
    上传 BP 文件，返回 Markdown 格式评审报告。
    """
    suffix = os.path.splitext(file.filename or "")[-1] or ".tmp"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        bp_text = extract_text(tmp_path)
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        os.unlink(tmp_path)

    if not bp_text.strip():
        raise HTTPException(status_code=422, detail="文件内容为空，无法评审")

    try:
        report = await adk_pipeline.review_async(
            bp_text, mode=mode, dry_run=dry_run or _DRY_RUN_DEFAULT
        )
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return {"mode": mode, "report": report}


# ---------------------------------------------------------------------------
# POST /compare  —— 文件上传，A/B 对比
# ---------------------------------------------------------------------------


@app.post("/compare")
async def compare_file(
    file: UploadFile = File(...),
    dry_run: bool = Form(default=False),
):
    """
    上传 BP 文件，并发运行模式 A 和模式 B，返回两份报告。
    """
    suffix = os.path.splitext(file.filename or "")[-1] or ".tmp"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        bp_text = extract_text(tmp_path)
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        os.unlink(tmp_path)

    if not bp_text.strip():
        raise HTTPException(status_code=422, detail="文件内容为空，无法评审")

    try:
        report_a, report_b = await adk_pipeline.compare_async(
            bp_text, dry_run=dry_run or _DRY_RUN_DEFAULT
        )
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return {
        "report_a": report_a,
        "report_b": report_b,
    }


# ---------------------------------------------------------------------------
# POST /review-text  —— 纯文本输入（方便测试和前端集成）
# ---------------------------------------------------------------------------


class ReviewTextRequest(BaseModel):
    text: str
    mode: Literal["A", "B"] = "A"
    dry_run: bool = False


class CompareTextRequest(BaseModel):
    text: str
    dry_run: bool = False


@app.post("/review-text")
async def review_text(req: ReviewTextRequest):
    """
    纯文本 BP 输入，返回 Markdown 格式评审报告。
    适合前端直接传文本内容而不上传文件。
    """
    if not req.text.strip():
        raise HTTPException(status_code=422, detail="text 不能为空")

    try:
        report = await adk_pipeline.review_async(
            req.text,
            mode=req.mode,
            dry_run=req.dry_run or _DRY_RUN_DEFAULT,
        )
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return {"mode": req.mode, "report": report}


@app.post("/compare-text")
async def compare_text(req: CompareTextRequest):
    """纯文本 BP 输入，并发运行 A/B 对比。"""
    if not req.text.strip():
        raise HTTPException(status_code=422, detail="text 不能为空")

    try:
        report_a, report_b = await adk_pipeline.compare_async(
            req.text,
            dry_run=req.dry_run or _DRY_RUN_DEFAULT,
        )
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return {"report_a": report_a, "report_b": report_b}
