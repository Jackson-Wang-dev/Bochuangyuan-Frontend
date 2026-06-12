"""
CLI 入口：python -m src.main --file <路径> [--mode A|B] [--compare] [--dry-run]

示例：
    python -m src.main --file samples/sample_bp.txt --dry-run
    python -m src.main --file samples/sample_bp.txt --mode B --dry-run
    python -m src.main --file samples/sample_bp.txt --compare --dry-run
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

# 确保在模块方式运行时能找到 src 包
_SERVICE_ROOT = Path(__file__).parent.parent
if str(_SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(_SERVICE_ROOT))

from src import document  # noqa: E402
from src.engine import adk_pipeline  # noqa: E402


def _safe_print(text: str) -> None:
    """在 Windows GBK 终端下安全输出（emoji 用 ? 替代，避免 UnicodeEncodeError）。"""
    try:
        print(text)
    except UnicodeEncodeError:
        encoded = text.encode(sys.stdout.encoding or "utf-8", errors="replace")
        sys.stdout.buffer.write(encoded + b"\n")


def _save_and_print(label: str, report: str, output_dir: str = "outputs") -> None:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = os.path.join(output_dir, f"report_{label}_{ts}.md")
    os.makedirs(output_dir, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(report)
    _safe_print(f"\n{'=' * 60}")
    _safe_print(f"模式 {label} 报告已保存至: {out_path}")
    _safe_print(f"{'=' * 60}")
    # 预览前 2000 字符
    preview = report[:2000]
    _safe_print(preview)
    if len(report) > 2000:
        _safe_print(f"\n... [报告已截断，完整内容见 {out_path}]")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="BP 三视角评审 CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例：
  python -m src.main --file samples/sample_bp.txt --dry-run
  python -m src.main --file samples/sample_bp.txt --mode B
  python -m src.main --file samples/sample_bp.txt --compare --dry-run
        """,
    )
    parser.add_argument("--file", required=True, help="BP 文件路径（PDF/PPTX/DOCX/TXT）")
    parser.add_argument(
        "--mode",
        choices=["A", "B"],
        default="A",
        help="A=直接评审（默认），B=标准评审·含历史修改意见",
    )
    parser.add_argument(
        "--compare",
        action="store_true",
        help="同时运行模式 A 和 B，并发对比",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        dest="dry_run",
        help="干跑模式：不调用真实 LLM，返回桩文本（用于测试）",
    )
    args = parser.parse_args()

    # 解析文档
    print(f"正在读取文件: {args.file}")
    try:
        text = document.extract_text(args.file)
    except (FileNotFoundError, ValueError) as e:
        print(f"[错误] {e}", file=sys.stderr)
        sys.exit(1)

    word_count = len(text)
    print(f"文档读取成功，字符数: {word_count}")

    if args.compare:
        print("\n[对比模式] 并发运行模式 A（直接评审）和模式 B（含历史意见）...")
        report_a, report_b = asyncio.run(
            adk_pipeline.compare_async(text, dry_run=args.dry_run)
        )
        _save_and_print("A", report_a)
        _save_and_print("B", report_b)
    else:
        mode_desc = "直接评审" if args.mode == "A" else "标准评审·含历史修改意见"
        print(f"\n[模式 {args.mode}] {mode_desc}...")
        report = asyncio.run(
            adk_pipeline.review_async(text, mode=args.mode, dry_run=args.dry_run)
        )
        _save_and_print(args.mode, report)


if __name__ == "__main__":
    main()
