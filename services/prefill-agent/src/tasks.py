"""In-memory task store for prefill jobs."""
from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass, field
from typing import Any, Literal

TaskStatus = Literal["pending", "running", "done", "failed"]


@dataclass
class TaskInfo:
    task_id: str
    status: TaskStatus = "pending"
    progress: int = 0       # 0-100
    stage: str = "准备中"
    values: dict[str, Any] | None = None
    error: str | None = None


_store: dict[str, TaskInfo] = {}
_lock = asyncio.Lock()


async def create() -> str:
    task_id = str(uuid.uuid4())
    async with _lock:
        _store[task_id] = TaskInfo(task_id=task_id)
    return task_id


async def get(task_id: str) -> TaskInfo | None:
    async with _lock:
        info = _store.get(task_id)
    return info


async def update(task_id: str, **kwargs: Any) -> None:
    async with _lock:
        info = _store.get(task_id)
        if info:
            for k, v in kwargs.items():
                setattr(info, k, v)
