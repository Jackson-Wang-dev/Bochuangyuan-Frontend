# BP 评审引擎（bp-review-agent）

三视角商业计划书 AI 评审服务，基于 Google ADK + DeepSeek。

## 引擎底座

- **核心框架**：Google ADK（Agent Development Kit）
- **引擎结构**：改编自 [awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) VC 尽调 agent 模块（Apache License 2.0）
- **配置惯例**：借鉴 [rk-vashista/pitch](https://github.com/rk-vashista/pitch) 的外置 YAML 配置方式
- **LLM**：DeepSeek，通过 ADK 的 LiteLLM 集成（`google.adk.models.lite_llm.LiteLlm`）

## 三视角

| 视角 | 角色 | 关注点 |
|------|------|--------|
| 🧠 行业专家 | 资深技术导师 | 技术路线、产品可行性、团队能力 |
| 💰 投资人 | 早期基金合伙人 | 市场规模、单位经济、估值逻辑 |
| 🛡️ 风险顾问 | 商业化落地专家 | 执行/市场/财务/合规风险 |

## 评审模式

- **模式 A**：直接评审（三视角并发）
- **模式 B**：标准评审·含历史修改意见（注入 `knowledge/historical_feedback.md`）
- **对比模式**：A、B 两次评审并发运行

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY
```

### 3. CLI 运行

```bash
# 干跑测试（不需要 API Key）
python -m src.main --file samples/sample_bp.txt --dry-run

# 模式 A
python -m src.main --file your_bp.pdf --mode A

# 模式 B（含历史意见）
python -m src.main --file your_bp.pdf --mode B

# A/B 对比（并发）
python -m src.main --file your_bp.pdf --compare
```

### 4. FastAPI 服务

```bash
uvicorn src.api:app --host 0.0.0.0 --port 8001 --reload
```

API 文档：http://localhost:8001/docs

端点：
- `POST /review` — 上传文件评审
- `POST /compare` — 上传文件 A/B 对比
- `POST /review-text` — 纯文本评审（前端集成推荐）
- `POST /compare-text` — 纯文本 A/B 对比
- `GET /health` — 健康检查

### 5. Docker

```bash
docker build -t bp-review-agent .
docker run -p 8001:8001 -e DEEPSEEK_API_KEY=sk-xxx bp-review-agent
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key（必填） | — |
| `DEEPSEEK_BASE_URL` | API 地址 | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 模型名称 | `deepseek/deepseek-chat` |
| `DRY_RUN` | 设为 `1` 则全局干跑 | `0` |

## 如何扩展

**加新视角** = 在 `config/agents.yaml` 和 `config/tasks.yaml` 各加一个条目，无需改代码。

```yaml
# config/agents.yaml
policy:
  name: 政策合规视角
  emoji: "⚖️"
  role: 政策研究员
  ...
```

**改评审行为** = 直接修改 YAML 配置，重启服务即生效。

**改历史偏好** = 编辑 `knowledge/historical_feedback.md`。

## 支持的文件格式

- PDF（`.pdf`）
- PowerPoint（`.pptx`）
- Word（`.docx`）
- 纯文本（`.txt`）

## 许可证

本服务引擎结构改编自 [awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps)，
遵循 Apache License 2.0。
