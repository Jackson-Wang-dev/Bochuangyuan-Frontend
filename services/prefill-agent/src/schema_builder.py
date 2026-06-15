"""
Dynamically builds a Pydantic v2 model from the frontend field-definition JSON.

Field definition format (sent by the frontend):
    {
      "key": "projectName",
      "label": "项目名称",
      "type": "string" | "number" | "integer" | "boolean" | "date" | "enum" | "array" | "object",
      "description": "AI extraction hint",
      "options": [...],    # enum only
      "unit": "万元",       # number/integer only
      "fields": [...],     # object / array-of-objects
      "item":  {...}       # array-of-primitives
    }

All fields are Optional[T] with default None so missing info stays null.
"""
from __future__ import annotations

import re
from enum import Enum
from typing import Annotated, Any, List, Optional

from pydantic import BaseModel, BeforeValidator, Field, create_model


def _coerce_null(v: Any) -> Any:
    """LLM often outputs the string 'null' instead of JSON null. Normalise to None."""
    if isinstance(v, str) and v.strip().lower() in ("null", "none", "n/a", ""):
        return None
    return v


_NullGuard = BeforeValidator(_coerce_null)


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #

def build_model(fields: list[dict[str, Any]], model_name: str = "PrefillResult") -> type[BaseModel]:
    """Return a Pydantic model class for the given field list."""
    return _make_model(fields, model_name)


def build_system_prompt(fields: list[dict[str, Any]]) -> str:
    """Build a Chinese system prompt that lists every field and its hint."""
    lines = [
        "你是一个结构化信息抽取助手。",
        "请从用户提供的文档内容中，按照以下字段定义抽取信息。",
        "规则：",
        "  1. 只抽取文档中明确提及的内容，不要推测或编造。",
        "  2. 文档中没有的字段一律返回 null / 空列表，不要填写占位文本。",
        "  3. 金额字段须换算为指定单位（万元）的纯数字。",
        "  4. 日期统一格式：完整日期用 YYYY-MM-DD，年月用 YYYY-MM。",
        "",
        "需要抽取的字段：",
    ]
    _append_field_hints(lines, fields, indent=0)
    return "\n".join(lines)


# --------------------------------------------------------------------------- #
# Internals
# --------------------------------------------------------------------------- #

def _make_model(fields: list[dict[str, Any]], name: str) -> type[BaseModel]:
    field_defs: dict[str, Any] = {}
    for f in fields:
        key = f["key"]
        label = f.get("label", key)
        desc = _field_description(f)
        py_type = _python_type(f, name)
        # Wrap with _NullGuard so the model string "null" → Python None before validation
        guarded = Annotated[Optional[py_type], _NullGuard]  # type: ignore[valid-type]
        field_defs[key] = (guarded, Field(default=None, description=desc))
    return create_model(name, **field_defs)


def _field_description(f: dict[str, Any]) -> str:
    parts = [f.get("description") or f.get("label", f["key"])]
    unit = f.get("unit")
    if unit:
        parts.append(f"（单位：{unit}，须换算为{unit}的纯数字）")
    return "".join(parts)


def _python_type(f: dict[str, Any], parent: str) -> Any:
    t = f.get("type", "string")
    key = f["key"]
    child_name = f"{parent}_{_to_pascal(key)}"

    if t in ("string", "text", "phone"):
        return str
    if t == "number":
        return float
    if t == "integer":
        return int
    if t == "boolean":
        return bool
    if t in ("date", "month"):
        return str  # YYYY-MM-DD or YYYY-MM
    if t == "enum":
        opts = f.get("options") or []
        return _make_enum(child_name, opts) if opts else str
    if t == "object":
        sub = f.get("fields") or []
        return _make_model(sub, child_name) if sub else dict
    if t == "array":
        sub_fields = f.get("fields")  # array-of-objects
        item_def = f.get("item")       # array-of-primitives
        if sub_fields:
            item_model = _make_model(sub_fields, f"{child_name}Item")
            return List[item_model]  # type: ignore[valid-type]
        if item_def:
            return List[_python_type(item_def, child_name)]  # type: ignore[valid-type]
        return List[str]
    return str


def _make_enum(name: str, values: list[str]) -> type[Enum]:
    # Pydantic enums must have valid Python identifiers as names
    members = {f"v{i}": v for i, v in enumerate(values)}
    return Enum(name, members)  # type: ignore[return-value]


def _to_pascal(snake: str) -> str:
    return re.sub(r"(?:^|_)(\w)", lambda m: m.group(1).upper(), snake)


def _append_field_hints(lines: list[str], fields: list[dict], indent: int) -> None:
    pad = "  " * indent
    for f in fields:
        key = f["key"]
        label = f.get("label", key)
        desc = f.get("description") or label
        unit = f.get("unit")
        suffix = f" [单位: {unit}]" if unit else ""
        lines.append(f"{pad}- {key}（{label}）：{desc}{suffix}")
        # Recurse into nested fields
        sub = f.get("fields")
        if sub:
            _append_field_hints(lines, sub, indent + 1)
