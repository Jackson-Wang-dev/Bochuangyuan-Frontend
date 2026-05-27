# 博创园前端 Monorepo

基于 **pnpm + Turborepo** 的多应用前端仓库。

## 应用列表

| 应用 | 目录 | 说明 |
|------|------|------|
| 创业者工作台 | `apps/entrepreneur-dashboard` | 主应用 |
| 管理后台 | `apps/admin-platform` | 平台管理 |
| 组织者门户 | `apps/organizer-portal` | 活动组织者 |
| 专家窗口 | `apps/specialist-window` | 专家入驻 |
| 官网 | `apps/official-site` | 对外官网 |

## 环境要求

- **Node.js** ≥ 20
- **pnpm** ≥ 9（推荐通过 [corepack](https://nodejs.org/api/corepack.html) 安装）

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

## 快速开始

```bash
# 1. 克隆仓库
git clone <repo-url>
cd Bochuangyuan-Frontend

# 2. 安装依赖
pnpm install

# 3. 配置环境变量（必须）
cp apps/entrepreneur-dashboard/.env.example apps/entrepreneur-dashboard/.env
# 编辑 .env，填写真实的后端地址

# 4. 启动开发服务器
pnpm dev:dashboard        # 仅启动创业者工作台（推荐）
pnpm dev                  # 启动所有应用
```

启动后访问 [http://localhost:3000](http://localhost:3000)

## 常用命令

```bash
pnpm dev              # 启动所有应用的开发服务器
pnpm dev:dashboard    # 仅启动 entrepreneur-dashboard
pnpm build            # 构建所有应用
pnpm lint             # 类型检查
pnpm clean            # 清除构建产物
```

## 项目结构

```
bochuangyuan-frontend/
├── apps/                  # 各端应用
│   ├── entrepreneur-dashboard/
│   ├── admin-platform/
│   ├── organizer-portal/
│   ├── specialist-window/
│   └── official-site/
├── packages/              # 共享包
│   ├── ui/                # 公共组件库
│   ├── shared/            # 工具函数
│   ├── types/             # 共享类型
│   ├── api/               # API 封装
│   └── assessment-core/   # 评测核心逻辑
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 环境变量说明

| 变量 | 必填 | 说明 |
|------|------|------|
| `VITE_API_BASE_URL` | ✅ | 后端 REST API 地址 |
| `VITE_WPS_SDK_URL` | ❌ | WPS 在线文档 SDK，不填则文档预览不可用 |

参考 `apps/entrepreneur-dashboard/.env.example`。
