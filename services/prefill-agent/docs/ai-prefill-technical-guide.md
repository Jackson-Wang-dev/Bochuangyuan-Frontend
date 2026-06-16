# AI 预填写功能技术说明

## 1. 功能概述

用户在新建项目时，可上传申报书 / 商业计划书（PDF、Word、PPT、图片等），系统自动扫描文件，将与表单字段相关的信息抽取并预填到对应栏位，用户再核对修改后提交。

**核心设计原则：字段定义以前端表单为唯一真源。** 后端不硬编码任何字段清单；前端在每次请求时将当前表单的字段定义序列化后随请求一并发送，后端据此动态构造抽取 schema。

---

## 2. 用户使用路径

```
用户点击「AI 预填」按钮
        ↓
选择文件（PDF / DOCX / PPTX / TXT / 图片）
        ↓
前端读取当前表单字段定义（buildPrefillSchema）
        ↓
POST /api/prefill/tasks
  body: multipart/form-data
    file: <文件>
    schema: <字段定义 JSON>
        ↓
后端返回 task_id，前端开始轮询
        ↓
GET /api/prefill/tasks/{task_id}  （每 1.5 秒）
  response: { status, progress, stage, values? }
        ↓
前端进度条实时更新（0% → 100%）
        ↓
status === "done" → values 回填到表单各字段
        ↓
用户核对修改 → 正常提交保存
```

---

## 3. 系统架构

```
前端 (Vite + React)
│
│  buildPrefillSchema()          ← 字段定义唯一真源
│  createPrefillTask(file, schema)
│  pollPrefillTask(id, { onProgress })
│  applyPrefillValues(values)    ← null 值用 schemaDefaults 填充
│
│  Vite Dev Server proxy
│    /api/prefill/* → localhost:8002
│    /api/*         → 39.106.61.160:8080
│
└──── HTTP ────────────────────────────────────────┐
                                                   ↓
                               prefill-agent (FastAPI, port 8002)
                               │
                               ├── POST /api/prefill/tasks
                               │     创建任务 → 异步后台执行 pipeline
                               │
                               ├── GET  /api/prefill/tasks/{id}
                               │     返回 { status, progress, stage, values }
                               │
                               └── pipeline.py
                                     Stage 1: 文本提取 (extractor.py)
                                     Stage 2: 结构化抽取 (schema_builder.py)
                                              ↑
                                              instructor + DeepSeek API
```

---

## 4. 技术选型

### 4.1 文本提取

| 文件格式 | 解析方案 | 说明 |
|----------|----------|------|
| PDF（可复制文字版） | pypdf（fallback）/ MinerU（优先） | MinerU 支持中文、表格、公式；pypdf 仅提取嵌入文本层 |
| PDF（扫描版 / 纯图片）| ❌ 不支持 | DeepSeek 无 OCR 能力，pypdf 提取文本为空；MinerU 需额外配置 OCR 模型 |
| DOCX | python-docx | 提取段落 + 表格单元格文本 |
| PPTX | python-pptx | 提取所有形状的文本框 |
| TXT / MD | 直接 UTF-8 解码 | — |
| 图片（jpg/png/webp）| ❌ 不支持 | DeepSeek Chat 不提供视觉 OCR，前端已从 accept 属性中移除 |

**MinerU 调用方式**：CLI 子进程（`mineru -p <file> -o <outdir> -b pipeline`），CPU 模式无需 GPU，超时 300 秒。MinerU 存在时优先使用，否则自动 fallback 到 pypdf 等。

### 4.2 结构化抽取

**instructor**（Pydantic 驱动）+ **DeepSeek Chat**（`deepseek-chat` = `deepseek-v4-flash`）

- instructor 负责将 LLM 输出强制解析为 Pydantic 模型，校验失败自动重试（`max_retries=3`）
- 后端使用 `pydantic.create_model` 根据前端传入的字段定义**动态**构造 Pydantic 模型，无任何硬编码字段
- 每次 API 调用 `max_tokens=4096`，防止长列表输出截断

**模型切换**：通过环境变量 `LLM_PROVIDER` / `LLM_MODEL` 控制，支持 DeepSeek、Qwen（DashScope）、OpenAI、Claude 四种 provider，均走 OpenAI 兼容接口。

### 4.3 并行提取策略

为降低延迟，采用两级并行：

```
文档文本提取（单次）
        ↓
┌─────────────────────────────────────────────────┐
│  并行执行（asyncio.as_completed + ThreadPoolExecutor）
│
│  任务 1: flat 字段（项目名、申报人信息、机构信息…）
│           → 多 chunk 并行，merge 结果
│
│  任务 2: educations     → 独立 API 调用
│  任务 3: works          → 独立 API 调用
│  任务 4: teamMembers    → 独立 API 调用
│  任务 5: patents        → 独立 API 调用
│  任务 6: papers         → 独立 API 调用
│  …（每个 collection 字段各一个调用）
└─────────────────────────────────────────────────┘
        ↓
merge 所有结果（scalar: first-non-null wins；array: 拼接）
```

**关键决策**：collection 字段拆分为独立调用，是因为所有集合字段合并成一次调用时，输出 JSON 可能达到数万 token，超出模型单次输出上限导致截断。拆分后每次调用仅输出一个列表，通常在 200-800 token 以内。

### 4.4 null 值处理

LLM 对无法在文档中找到的字段有时返回 JSON `null`，有时返回字符串 `"null"`。两处防御：

- **后端 schema_builder**：每个字段包裹 `BeforeValidator(_coerce_null)`，将字符串 `"null"` / `"none"` / `""` 统一转换为 Python `None`，避免 enum 字段校验失败。
- **后端 pipeline**：`_strip_none` 递归移除 model_dump() 结果中的 `None`，不将 null 传给前端。
- **前端 applyPrefillValues**：collection item 合并时先用 `schemaDefaults(schema)` 生成类型安全默认值（`boolean→false`，`number→0`，其余→`""`），再将 AI 提取的非 null 值覆盖上去，确保不向后端发送 null。

### 4.5 进度上报

任务在内存中维护 `progress: int (0-100)` 和 `stage: str`，前端每 1.5 秒轮询一次，无需 WebSocket：

| 阶段 | 进度 |
|------|------|
| 准备中 | 0% |
| 正在解析文档 | 5% |
| 文档解析完成 | 15% |
| 每完成一个字段组 | +80%/N |
| 全部完成 | 100% |

---

## 5. 字段定义契约

前端 `buildPrefillSchema()` 返回如下结构，随每次请求发送：

```jsonc
{
  "fields": [
    {
      "key": "projectName",
      "label": "项目名称",
      "type": "string",
      "description": "项目的正式全称"
    },
    {
      "key": "educations",
      "label": "教育经历",
      "type": "array",
      "description": "只提取主申报人（非团队成员）的教育经历",
      "fields": [
        { "key": "institution", "label": "院校名称", "type": "string" },
        { "key": "startDate",   "label": "开始时间", "type": "date" },
        { "key": "isFullTime",  "label": "是否全日制", "type": "boolean" }
        // …
      ]
    }
    // …
  ]
}
```

**类型映射**（前端 type → Pydantic type）：

| 前端 type | Python 类型 | 备注 |
|-----------|-------------|------|
| `string` / `text` | `Optional[str]` | — |
| `number` | `Optional[float]` | 带 `unit` 时 prompt 要求换算 |
| `integer` | `Optional[int]` | — |
| `boolean` | `Optional[bool]` | — |
| `date` | `Optional[str]` | 要求 ISO 格式 YYYY-MM-DD |
| `enum` | `Optional[Literal[...]]` | 限定在 options 范围内 |
| `array` | `Optional[List[子模型]]` | 递归构造子模型 |
| `object` | 嵌套子模型 | 递归构造 |

所有字段均为 `Optional`，默认 `None`，保证文档中没有该信息时不报错。

---

## 6. 接口规范

### POST `/api/prefill/tasks`

**请求**：`multipart/form-data`

| 字段 | 类型 | 说明 |
|------|------|------|
| `file` | File | 待解析文件，支持 pdf/docx/pptx/txt/md/jpg/png/webp |
| `schema` | string (JSON) | `PrefillSchema` 序列化结果 |

**响应**：

```json
{ "task_id": "uuid-string" }
```

### GET `/api/prefill/tasks/{task_id}`

**响应**：

```json
{
  "taskId": "...",
  "status": "pending | running | done | failed",
  "progress": 65,
  "stage": "字段提取中… (8/13)",
  "values": { "projectName": "...", "educations": [...] },
  "error": null
}
```

`values` 的 key 与前端 `DraftState` / `Project` 字段一一对应，可直接回填。

---

## 7. 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LLM_PROVIDER` | `deepseek` | 可选 `deepseek` / `qwen` / `openai` / `claude` |
| `LLM_MODEL` | provider 默认 | 显式指定模型名，如 `deepseek-chat` |
| `DEEPSEEK_API_KEY` | 必填 | DeepSeek API Key |
| `DASHSCOPE_API_KEY` | Qwen 时必填 | 阿里云灵积 API Key |
| `OPENAI_API_KEY` | OpenAI 时必填 | — |
| `ANTHROPIC_API_KEY` | Claude 时必填 | — |
| `MAX_FILE_MB` | `50` | 上传文件大小上限（MB） |
| `PREFILL_CHUNK_SIZE` | `8000` | 单 chunk 字符数（flat 字段分块用） |

---

## 8. 启动方式

```bash
cd services/prefill-agent

# 安装依赖
python -m venv .venv
.venv/Scripts/activate          # Windows
pip install -r requirements.txt

# 配置环境变量（复制并填写 Key）
cp .env.example .env

# 启动服务（开发模式，支持热重载）
uvicorn src.api:app --host 0.0.0.0 --port 8002 --reload
```

前端 Vite dev server 通过 proxy 将 `/api/prefill/*` 转发到 `localhost:8002`，无需额外配置跨域。

---

## 9. 已知限制

| 限制 | 说明 |
|------|------|
| **图片 / 扫描版 PDF 不支持** | DeepSeek Chat 不提供 OCR 能力，图片文件（jpg/png/webp）和扫描版（纯图片）PDF 无法提取文字，前端已限制上传格式为 `.pdf/.docx/.pptx/.txt`；若 PDF 内容为扫描图像，pypdf 提取文本为空，AI 将无法返回有效字段 |
| 上下文长度 | 单 chunk 取前 24 000 字符（3×8000）送给 collection 提取；超长文档的后半段内容不会被抽取 |
| MinerU 依赖 | MinerU 未安装时 fallback 到 pypdf；即使安装了 MinerU，扫描版 PDF 也需要 OCR 模型支持，默认 pipeline 模式（CPU）不包含 OCR，需额外配置 |
| 任务持久化 | 任务状态存储在内存中，服务重启后丢失 |
| 并发限制 | ThreadPoolExecutor 默认 `max_workers=8`，高并发场景下需适当调大或接入任务队列 |
| 教育/工作经历归属 | AI 依赖 description 提示判断主申报人，若文档格式特殊（无明确标注申报人姓名）可能仍会混入团队成员经历 |
