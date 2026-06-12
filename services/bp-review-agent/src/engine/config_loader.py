"""
配置加载器：从 YAML/MD 动态构建 ADK LlmAgent 对象。
改变配置文件即改变 agent 行为，无需修改代码。
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

import yaml

# 项目根目录（此文件位于 src/engine/，上两级为服务根）
_SERVICE_ROOT = Path(__file__).parent.parent.parent

_CONFIG_DIR = _SERVICE_ROOT / "config"
_KNOWLEDGE_DIR = _SERVICE_ROOT / "knowledge"


def _load_yaml(filename: str) -> dict:
    path = _CONFIG_DIR / filename
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def _load_md(path: Path) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()


def load_agents_config() -> dict:
    """加载 config/agents.yaml"""
    return _load_yaml("agents.yaml")


def load_tasks_config() -> dict:
    """加载 config/tasks.yaml"""
    return _load_yaml("tasks.yaml")


def load_historical_feedback() -> str:
    """加载 knowledge/historical_feedback.md"""
    return _load_md(_KNOWLEDGE_DIR / "historical_feedback.md")


def load_required_format() -> str:
    """加载 config/required_format.md"""
    return _load_md(_CONFIG_DIR / "required_format.md")


def build_instruction(
    perspective: str,
    bp_text: str,
    inject_history: bool = False,
) -> str:
    """
    根据 agents.yaml + tasks.yaml 构建完整的 agent instruction 字符串。

    Args:
        perspective: "expert" | "investor" | "risk"
        bp_text: 商业计划书正文（注入到 instruction 中，让 agent 在上下文里读取）
        inject_history: 是否追加历史修改意见（模式 B）

    Returns:
        完整的 instruction 字符串，传给 LlmAgent(instruction=...)
    """
    agents_cfg = load_agents_config()
    tasks_cfg = load_tasks_config()

    agent_cfg = agents_cfg[perspective]
    task_cfg = tasks_cfg[perspective]

    backstory: str = agent_cfg["backstory"].strip()
    focus_items: list = agent_cfg.get("focus", [])
    task_desc: str = task_cfg["description"].strip()
    expected_output: str = task_cfg["expected_output"].strip()

    focus_text = "\n".join(f"- {item}" for item in focus_items)

    instruction_parts = [
        f"## 你的角色",
        backstory,
        "",
        f"## 你的关注重点",
        focus_text,
        "",
        f"## 当前任务",
        task_desc,
        "",
        f"## 输出格式要求",
        expected_output,
    ]

    if inject_history:
        history = load_historical_feedback()
        instruction_parts += [
            "",
            "## 历史评审偏好（请结合以下偏好给出更有针对性的意见）",
            history,
        ]

    instruction_parts += [
        "",
        "## 商业计划书内容",
        "---",
        bp_text,
        "---",
    ]

    return "\n".join(instruction_parts)


def build_agent(
    perspective: str,
    bp_text: str,
    inject_history: bool = False,
    llm_model: Optional[object] = None,
) -> "LlmAgent":
    """
    动态构建单个视角的 ADK LlmAgent。

    Args:
        perspective: "expert" | "investor" | "risk"
        bp_text: 商业计划书正文
        inject_history: 是否注入历史意见（模式 B）
        llm_model: LiteLlm 实例；传 None 则使用默认占位（干跑时不调用此函数）

    Returns:
        google.adk.agents.LlmAgent 实例
    """
    from google.adk.agents.llm_agent import LlmAgent  # type: ignore

    agents_cfg = load_agents_config()
    agent_cfg = agents_cfg[perspective]

    instruction = build_instruction(perspective, bp_text, inject_history)

    return LlmAgent(
        name=f"bp_review_{perspective}",
        model=llm_model,
        description=agent_cfg["goal"].strip(),
        instruction=instruction,
        output_key=f"{perspective}_result",
    )
