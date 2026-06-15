"""
FastAPI 预填服务。

端点：
  POST /api/prefill/tasks       上传文件 + 字段 schema → task_id
  GET  /api/prefill/tasks/{id}  查询状态与结果
  GET  /health                  健康检查

启动方式：
  uvicorn src.api:app --host 0.0.0.0 --port 8002 --reload
"""
from __future__ import annotations

import asyncio
import json
import os
import tempfile
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import tasks
from .pipeline import run as pipeline_run

app = FastAPI(
    title="AI 预填服务",
    description="动态 schema 驱动的文档结构化抽取服务（MinerU + instructor）",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_ACCEPTED_SUFFIXES = {".pdf", ".docx", ".pptx", ".txt", ".md", ".jpg", ".jpeg", ".png", ".webp"}
_MAX_FILE_MB = int(os.environ.get("MAX_FILE_MB", "50"))


# --------------------------------------------------------------------------- #
# Response models
# --------------------------------------------------------------------------- #

class CreateTaskResponse(BaseModel):
    task_id: str


class TaskStatusResponse(BaseModel):
    taskId: str
    status: str
    values: dict | None = None
    error: str | None = None


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #

@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/api/prefill/tasks", response_model=CreateTaskResponse)
async def create_task(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    schema: str = Form(...),  # JSON string of PrefillSchema
) -> CreateTaskResponse:
    # ── Validate file ────────────────────────────────────────────────────────
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in _ACCEPTED_SUFFIXES:
        raise HTTPException(
            status_code=415,
            detail=f"不支持的文件格式 {suffix}；支持：{', '.join(sorted(_ACCEPTED_SUFFIXES))}",
        )

    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > _MAX_FILE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"文件过大（{size_mb:.1f} MB），上限 {_MAX_FILE_MB} MB",
        )

    # ── Validate schema JSON ─────────────────────────────────────────────────
    try:
        schema_dict = json.loads(schema)
        if not isinstance(schema_dict.get("fields"), list):
            raise ValueError("schema.fields must be a list")
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=f"schema 格式错误：{exc}") from exc

    # ── Create task and launch background job ────────────────────────────────
    task_id = await tasks.create()
    background_tasks.add_task(
        _run_pipeline, task_id, file_bytes, file.filename or "upload", schema_dict
    )
    return CreateTaskResponse(task_id=task_id)


@app.get("/api/prefill/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task(task_id: str) -> TaskStatusResponse:
    info = await tasks.get(task_id)
    if info is None:
        raise HTTPException(status_code=404, detail=f"任务不存在：{task_id}")
    return TaskStatusResponse(
        taskId=info.task_id,
        status=info.status,
        values=info.values,
        error=info.error,
    )


# --------------------------------------------------------------------------- #
# Background helper
# --------------------------------------------------------------------------- #

async def _run_pipeline(
    task_id: str,
    file_bytes: bytes,
    filename: str,
    schema: dict,
) -> None:
    await pipeline_run(task_id, file_bytes, filename, schema)
