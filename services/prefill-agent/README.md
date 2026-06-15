# prefill-agent

AI 预填服务 — 将上传文件解析为结构化项目表单数据。

## 架构

```
POST /api/prefill/tasks
  ├── 接收文件 + 前端传来的字段定义 JSON (schema)
  ├── 创建异步任务，立即返回 task_id
  └── 后台执行两段式 pipeline：
        Stage 1: MinerU CLI（可选，需单独安装）或 pypdf / python-docx / pptx 提取文本
        Stage 2: pydantic.create_model 动态构造 schema + instructor 结构化抽取

GET /api/prefill/tasks/{task_id}
  └── 返回 { taskId, status, values, error }
      status: pending | running | done | failed
```

**字段定义由前端传入，后端不存储任何字段清单。**  
表单增删改字段时，只需修改前端 `constants/projectFieldDefs.ts`，后端自动适应。

## 启动

```bash
cd services/prefill-agent

# 1. 创建虚拟环境
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY（或其他 provider 的 key）

# 4. 启动服务（端口 8002）
uvicorn src.api:app --host 0.0.0.0 --port 8002 --reload
```

服务启动后访问 http://localhost:8002/docs 查看 Swagger UI。

## MinerU（可选，提升 PDF 解析质量）

```bash
# CPU-only 安装（无 GPU 时）
pip install "magic-pdf[full]" --extra-index-url https://wheels.myhloli.com
# 安装后 mineru 命令即可用，服务自动检测并优先使用
```

未安装时自动回退到 pypdf（PDF）/ python-docx（Word）/ python-pptx（PPT）。

## 切换 LLM Provider

编辑 `.env` 中的 `LLM_PROVIDER`：

| Provider | 环境变量 | 默认模型 |
|----------|----------|---------|
| `deepseek` | `DEEPSEEK_API_KEY` | `deepseek-chat` |
| `qwen` | `DASHSCOPE_API_KEY` | `qwen-max` |
| `openai` | `OPENAI_API_KEY` | `gpt-4o` |
| `claude` | `ANTHROPIC_API_KEY` | `claude-sonnet-4-6` |

## 前端环境变量

在 `apps/entrepreneur-dashboard/.env.local` 中添加：

```env
VITE_PREFILL_API_URL=http://localhost:8002
```

## 文件格式支持

| 格式 | 解析方式 |
|------|---------|
| `.pdf` | MinerU（优先）/ pypdf |
| `.docx` | MinerU（优先）/ python-docx |
| `.pptx` | MinerU（优先）/ python-pptx |
| `.txt` / `.md` | 直接读取 |
| `.jpg` / `.png` / `.webp` | Vision 模型 OCR |
