"""
BP 评审 ADK 引擎。

引擎底座：Shubhamsaboo/awesome-llm-apps VC 尽调 agent 模块（Google ADK，Apache-2.0）
配置方式：rk-vashista/pitch 风格外置 YAML 配置
LLM：DeepSeek，通过 Google ADK 的 LiteLLM 集成

Apache-2.0 notice: Engine structure adapted from
https://github.com/Shubhamsaboo/awesome-llm-apps (Apache License 2.0)
"""
from __future__ import annotations

import asyncio
import os
import re
import uuid
from datetime import datetime
from typing import Optional

# ---------------------------------------------------------------------------
# DRY_RUN 桩文本 —— 不调用任何 LLM，用于本地测试
# ---------------------------------------------------------------------------

_DRY_RUN_EXPERT = """### 🧠 行业专家视角
- **技术专业性**：7/10 — 技术路线基本可行，图神经网络用于供应链优化是合理方向，但已验证部分与规划中混写，读者难以分辨现有能力与未来愿景
- **技术/产品可行性**：核心功能在技术上可实现，规模化阶段的推理成本与实时性未论证；供应链数据接入标准化难度被低估
- **需要补强的地方**：
  - 技术路线需明确区分"已完成验证"与"规划中"两个阶段
  - 缺少对数据来源与数据质量的说明，这是 ML 供应链产品的核心依赖
  - 团队核心成员缺少过往业绩引用（如：主导过哪个规模的供应链项目）
- **团队能力匹配度**：CEO 供应链背景与方向匹配，CTO AI 背景合理，但 3 人团队缺少行业 BD 与客户成功角色，To B 落地将面临执行瓶颈
- **核心建议**：在融资前先跑通一个付费 POC，用真实客户数据验证核心算法，比任何 PPT 都有说服力"""

_DRY_RUN_INVESTOR = """### 💰 投资人视角
- **市场空间**：中国制造业供应链管理软件市场规模合理，500 亿估计属于 TAM 层级，可达的 SAM（有数字化改造意愿的中大型制造企业）更接近 50-80 亿，SOM 在融资窗口内（3 年）约 1-3 亿。市场成立，但竞争格局需要说清楚（SAP/Oracle/本土 ERP 厂商都在做）
- **商业模式与单位经济**：SaaS 月费 3 万/企业，ARR 36 万/客户，定价区间合理但偏中端。缺失关键信息：CAC（To B 销售周期多长？）、LTV（续约率是多少？）、回收周期未提及——这是 Pre-A 融资中投资人必问的三个数字
- **估值与融资节奏**：5000 万估值、融资 500 万（10% 稀释），估值倍数在无收入阶段较高；如有付费 POC 或 ARR 数据支撑，估值可支撑，否则需要向下调整或以里程碑分期释放
- **退出路径**：未提及退出路径——这是缺失项。供应链软件的并购买家包括用友/金蝶/SAP 中国，但需要说清楚你的差异化能否成为并购标的
- **投资倾向**：🔍需补充关键信息 — 补充 CAC/LTV/至少一个付费 POC 后可进入尽调"""

_DRY_RUN_RISK = """### 🛡️ 风险预警

| 风险点 | 类别 | 严重度 | 缓解建议 |
|--------|------|--------|----------|
| 500 万融资对应约 12-15 个月 runway（3 人团队 + 运营），时间窗口偏紧 | 财务 | 高 | 控制早期招聘节奏，优先跑通 1-2 个标杆客户后再扩团队 |
| 缺少付费 POC，产品市场契合度（PMF）未验证 | 执行 | 高 | 在融资前签下至少一个付费试用客户，哪怕打折也要有真实回款 |
| 供应链数据敏感，企业客户对数据上云有顾虑 | 合规 | 中 | 提前准备私有化部署方案或混合云架构，作为客户谈判筹码 |
| SAP/Oracle/本土 ERP 厂商均有类似模块，替代风险高 | 市场 | 中 | 明确聚焦一个垂直行业（如汽车零部件/电子制造）建立标杆案例，而非泛供应链 |
| 3 人团队缺少 To B 销售经验，客户获取难度被低估 | 执行 | 中 | 尽早引入 1 名有制造业客户资源的 BD 顾问（可用期权激励） |
| 图神经网络推理成本与延迟在大规模 SKU 场景未验证 | 执行 | 中 | 在 POC 阶段用真实数据规模（而非 demo 数据集）跑通技术可行性 |

**整体风险提示**：最优先处理的风险是「无付费 POC + runway 偏紧」的组合——当前状态下，融资成功概率偏低，建议先以极小团队跑通一个客户的付费验证，再启动正式融资"""


def _dry_run_stub(mode: str) -> str:
    """返回干跑模式下的完整报告字符串。"""
    mode_label = "直接评审" if mode == "A" else "标准评审 · 含历史修改意见"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    header = f"# BP 评审报告（{mode_label}）\n_生成时间：{now}_\n\n"
    body = "\n\n".join([_DRY_RUN_EXPERT, _DRY_RUN_INVESTOR, _DRY_RUN_RISK])
    return header + body


# ---------------------------------------------------------------------------
# 后处理：裁掉首个 ### 之前的开场白
# ---------------------------------------------------------------------------

def _strip_preamble(text: str) -> str:
    """
    裁掉 LLM 输出中第一个 ### 标题之前的所有内容（修复开场白 bug）。
    如果没有 ###，原样返回。
    """
    match = re.search(r"^(#{1,3}\s)", text, re.MULTILINE)
    if match:
        return text[match.start():]
    return text


# ---------------------------------------------------------------------------
# 真实 ADK 运行逻辑
# ---------------------------------------------------------------------------

def _get_llm_model() -> "LiteLlm":  # noqa: F821
    """
    从环境变量构建 LiteLlm 实例。

    环境变量：
        DEEPSEEK_API_KEY   —— DeepSeek API Key（必填）
        DEEPSEEK_BASE_URL  —— 默认 https://api.deepseek.com
        DEEPSEEK_MODEL     —— 默认 deepseek/deepseek-chat

    LiteLlm 导入路径（已通过官方文档确认）：
        from google.adk.models.lite_llm import LiteLlm
    """
    from google.adk.models.lite_llm import LiteLlm  # type: ignore

    api_key = os.environ.get("DEEPSEEK_API_KEY", "")
    base_url = os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    model_name = os.environ.get("DEEPSEEK_MODEL", "deepseek/deepseek-chat")

    if not api_key:
        raise EnvironmentError(
            "DEEPSEEK_API_KEY 未设置，请在 .env 文件中配置，或使用 --dry-run 模式"
        )

    # LiteLLM 通过环境变量读取 API key，需要手动设置
    os.environ["DEEPSEEK_API_KEY"] = api_key
    # LiteLLM DeepSeek 需要设置 base_url，通过 api_base 传入
    return LiteLlm(model=model_name, api_base=base_url)


async def _run_single_agent(
    perspective: str,
    bp_text: str,
    inject_history: bool,
    llm_model: object,
) -> str:
    """
    运行单个视角的 LlmAgent，返回文本结果。

    使用 InMemoryRunner（ADK 内置，无需外部会话服务）。
    ADK Runner API（已通过官方文档确认）：
        from google.adk.runners import InMemoryRunner
        runner = InMemoryRunner(agent=agent)
        async for event in runner.run_async(user_id=..., session_id=..., new_message=...):
            if event.is_final_response():
                return event.content.parts[0].text
    """
    from google.adk.runners import InMemoryRunner  # type: ignore
    from google.genai import types as genai_types  # type: ignore
    from .config_loader import build_agent

    agent = build_agent(perspective, bp_text, inject_history, llm_model)
    runner = InMemoryRunner(agent=agent)

    session_id = f"bp_review_{perspective}_{uuid.uuid4().hex[:8]}"
    user_id = "bp_review_engine"

    # instruction 已包含 bp_text，user message 使用简短触发词
    user_message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text="请开始评审上述商业计划书。")],
    )

    result_text = ""
    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=user_message,
    ):
        if event.is_final_response():
            if event.content and event.content.parts:
                result_text = event.content.parts[0].text or ""
            break

    return _strip_preamble(result_text)


async def _run_three_perspectives(
    bp_text: str,
    inject_history: bool,
    llm_model: object,
) -> tuple[str, str, str]:
    """
    并发运行 expert / investor / risk 三个视角，返回三份文本。
    使用 asyncio.gather 实现真并发。
    """
    expert_task = _run_single_agent("expert", bp_text, inject_history, llm_model)
    investor_task = _run_single_agent("investor", bp_text, inject_history, llm_model)
    risk_task = _run_single_agent("risk", bp_text, inject_history, llm_model)

    expert_result, investor_result, risk_result = await asyncio.gather(
        expert_task, investor_task, risk_task
    )
    return expert_result, investor_result, risk_result


def _assemble_report(mode: str, expert: str, investor: str, risk: str) -> str:
    """拼装最终报告，加上报告头。"""
    mode_label = "直接评审" if mode == "A" else "标准评审 · 含历史修改意见"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    header = f"# BP 评审报告（{mode_label}）\n_生成时间：{now}_\n\n"
    body = "\n\n".join([expert, investor, risk])
    return header + body


# ---------------------------------------------------------------------------
# 公开 API
# ---------------------------------------------------------------------------

async def review_async(
    bp_text: str,
    mode: str = "A",
    dry_run: bool = False,
) -> str:
    """
    运行单次 BP 评审。

    Args:
        bp_text: 商业计划书纯文本
        mode: "A"（直接评审）或 "B"（含历史修改意见）
        dry_run: True 时跳过真实 LLM，返回桩文本

    Returns:
        Markdown 格式的完整报告字符串
    """
    if dry_run or os.environ.get("DRY_RUN", "0") == "1":
        return _dry_run_stub(mode)

    inject_history = mode == "B"
    llm_model = _get_llm_model()

    expert, investor, risk = await _run_three_perspectives(
        bp_text, inject_history, llm_model
    )
    return _assemble_report(mode, expert, investor, risk)


async def compare_async(
    bp_text: str,
    dry_run: bool = False,
) -> tuple[str, str]:
    """
    并发运行模式 A 和模式 B 两次评审，返回 (report_A, report_B)。

    两次评审通过 asyncio.gather 真并发执行。
    """
    if dry_run or os.environ.get("DRY_RUN", "0") == "1":
        report_a = _dry_run_stub("A")
        report_b = _dry_run_stub("B")
        return report_a, report_b

    llm_model = _get_llm_model()

    # 模式 A（不注入历史）和模式 B（注入历史）并发运行
    a_task = _run_three_perspectives(bp_text, False, llm_model)
    b_task = _run_three_perspectives(bp_text, True, llm_model)

    (a_expert, a_investor, a_risk), (b_expert, b_investor, b_risk) = (
        await asyncio.gather(a_task, b_task)
    )

    report_a = _assemble_report("A", a_expert, a_investor, a_risk)
    report_b = _assemble_report("B", b_expert, b_investor, b_risk)
    return report_a, report_b


# 同步包装（供 CLI 使用，内部调用 asyncio.run）
def review(bp_text: str, mode: str = "A", dry_run: bool = False) -> str:
    return asyncio.run(review_async(bp_text, mode, dry_run))


def compare(bp_text: str, dry_run: bool = False) -> tuple[str, str]:
    return asyncio.run(compare_async(bp_text, dry_run))
