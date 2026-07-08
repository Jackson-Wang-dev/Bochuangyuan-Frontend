# 官网（official-site）数据库设计文档

> 基于 `apps/official-site` 前端页面、类型定义（`src/types.ts`）与 mock 数据（`src/data/mockSiteData.ts`）整理，仅覆盖官网前端已出现的字段。设计原则：
> - 简单字符串列表（无额外属性、无需筛选）用 JSON 数组列，避免为纯展示型的短文本列表建子表（参赛条件、材料清单、服务列表、标签、趋势点）
> - 有额外属性或需要排序/筛选的，单独建表（里程碑要保序、赛道要支持多选筛选）
> - 每张主表补充 `created_at`/`updated_at` 审计字段

---

## 一、实体关系表

| 实体 | 说明 | 唯一标识 | 关联实体 | 关系类型 |
|---|---|---|---|---|
| 赛事 competitions | 大赛/人才项目基本信息 | `slug` | 详情、里程碑、赛道 | 见下 |
| 赛事详情 competition_details | 详情页长文本字段 | `competition_id` | 赛事 | 1:1 |
| 赛事里程碑 competition_milestones | 赛事进程时间线节点 | `id` | 赛事 | N:1，有序 |
| 赛道字典 tracks | 受控赛道词表 | `name` | 赛事 | N:M（通过 competition_tracks） |
| 资讯 news | 新闻/政策资讯 | `slug` | 资讯分类（枚举） | 1:N |
| 账号 users | 登录账号 | `id`、`username` | 无（报名记录在外部工作台） | — |
| 首页统计 hero_stats | 首页大数字指标 | `label` | 无 | — |
| 生态体系/产品服务 site_features | 首页板块卡片 | `id` | 无 | — |
| 合作伙伴 partners | 首页合作伙伴条 | `id` | 无 | — |
| 导航菜单 nav_items（待确认） | 顶部导航 | `id` | nav_groups | 1:N（待确认是否需要建表） |

---

## 二、赛事相关

### 1. `competitions` 赛事主表

| 字段名 | 数据类型 | 必填 | 主键/唯一/索引 | 默认值 | 外键 | 备注 |
|---|---|---|---|---|---|---|
| id | BIGINT UNSIGNED | 是 | 主键，自增 | — | — | |
| slug | VARCHAR(191) | 是 | 唯一索引 | — | — | 对应前端 `slug`，URL 定位用 |
| name | VARCHAR(255) | 是 | — | — | — | 赛事名称 |
| status | ENUM('报名开放中','项目征集中','报名预热中','即将开放','回顾展示') | 是 | 普通索引 | — | — | 前端已收敛为枚举；后续状态若会新增，建议改成字典表 |
| category | ENUM('创新赛事','人才项目') | 是 | 普通索引 | — | — | 列表页单选筛选条件 |
| time | VARCHAR(50) | 是 | — | — | — | 展示用时间标签（如"2026.07"），非结构化日期 |
| track_description | VARCHAR(255) | 是 | — | — | — | 对应前端 `trackDescription`，方向说明文本 |
| metric | VARCHAR(50) | 是 | — | — | — | 展示"规模"，如"120+" |
| summary | VARCHAR(500) | 是 | — | — | — | 卡片摘要 |
| location | VARCHAR(100) | 是 | 普通索引 | — | — | 举办地点 |
| deadline | DATE | 是 | 普通索引 | — | — | 报名截止日，前端用于倒计时计算 |
| reward | DECIMAL(12,2) UNSIGNED | 是 | — | — | — | 奖金金额，已改数值类型 |
| reward_unit | VARCHAR(20) | 是 | — | — | — | 如"万元" |
| tags | JSON | 是 | — | — | — | 自由标签数组，仅展示，无筛选需求 |
| image | VARCHAR(500) | 是 | — | — | — | 图片 URL |
| created_at | DATETIME | 是 | — | CURRENT_TIMESTAMP | — | |
| updated_at | DATETIME | 是 | — | CURRENT_TIMESTAMP ON UPDATE | — | |

### 2. `tracks` 赛道字典表 + `competition_tracks` 关联表

赛道用于列表页多选筛选（`selectedTracks`），受控词表（AI/互联网/电商/新能源/生物医疗/社会公益），做成字典表 + 关联表便于索引筛选。

**`tracks`**

| 字段名 | 数据类型 | 必填 | 主键/唯一 | 备注 |
|---|---|---|---|---|
| id | INT UNSIGNED | 是 | 主键，自增 | |
| name | VARCHAR(50) | 是 | 唯一 | 当前 6 个固定值 |

**`competition_tracks`**

| 字段名 | 数据类型 | 必填 | 主键/唯一/索引 | 外键 |
|---|---|---|---|---|
| competition_id | BIGINT UNSIGNED | 是 | 联合主键 | → `competitions.id` |
| track_id | INT UNSIGNED | 是 | 联合主键，索引 | → `tracks.id` |

### 3. `competition_details` 赛事详情表（与 `competitions` 1:1）

| 字段名 | 数据类型 | 必填 | 主键/唯一/索引 | 外键 | 备注 |
|---|---|---|---|---|---|
| competition_id | BIGINT UNSIGNED | 是 | 主键 = 外键 | → `competitions.id` | 1:1，详情页专属长文本单独拆表，避免列表查询带上大字段 |
| intro | TEXT | 是 | — | — | 前端按 `\n` 拆分段落展示 |
| objective | VARCHAR(500) | 是 | — | — | 引用/高亮文本 |
| eligibility | JSON | 是 | — | — | 参赛条件条目数组 |
| materials | JSON | 是 | — | — | 材料清单条目数组 |
| services | JSON | 是 | — | — | 服务条目数组 |

### 4. `competition_milestones` 赛事里程碑表（与 `competitions` 1:N）

| 字段名 | 数据类型 | 必填 | 主键/唯一/索引 | 外键 | 备注 |
|---|---|---|---|---|---|
| id | BIGINT UNSIGNED | 是 | 主键，自增 | — | |
| competition_id | BIGINT UNSIGNED | 是 | 索引 | → `competitions.id` | |
| sort_order | INT | 是 | 与 competition_id 联合索引 | — | 对应前端新增的 `order` 字段，显式排序 |
| title | VARCHAR(100) | 是 | — | — | 里程碑标题 |
| milestone_date | VARCHAR(20) | 是 | — | — | 前端目前是"2026.06.28"这类非标准格式，非严格 DATE 类型，建议后端统一成 DATE 后再存（见问题清单） |
| detail | VARCHAR(500) | 是 | — | — | 说明文本 |

---

## 三、资讯

### 5. `news` 资讯表

| 字段名 | 数据类型 | 必填 | 主键/唯一/索引 | 默认值 | 备注 |
|---|---|---|---|---|---|
| id | BIGINT UNSIGNED | 是 | 主键，自增 | — | |
| slug | VARCHAR(191) | 是 | 唯一索引 | — | |
| type | ENUM('政策信息','赛事动态','科创消息','网站动态','园区合作','人才计划') | 是 | 普通索引 | — | 分类筛选条件；已收敛为枚举 |
| title | VARCHAR(255) | 是 | — | — | |
| published_at | DATE | 是 | 索引（排序用） | — | 对应前端 `date`，已改为含年份的完整日期；前端展示时再格式化成 `MM.DD` |
| summary | VARCHAR(500) | 是 | — | — | |
| author | VARCHAR(100) | 是 | — | — | |
| body | JSON | 是 | — | — | 正文段落数组 |
| created_at | DATETIME | 是 | — | CURRENT_TIMESTAMP | |
| updated_at | DATETIME | 是 | — | CURRENT_TIMESTAMP ON UPDATE | |

---

## 四、账号

### 6. `users` 账号表（对应共享包 `BackendUser`/`RegisterDto`）

| 字段名 | 数据类型 | 必填 | 主键/唯一/索引 | 默认值 | 备注 |
|---|---|---|---|---|---|
| id | BIGINT UNSIGNED | 是 | 主键，自增 | — | |
| username | VARCHAR(50) | 是 | 唯一索引 | — | 登录凭证之一 |
| password_hash | VARCHAR(255) | 是 | — | — | 前端只传明文 `password`，DB 只存哈希 |
| email | VARCHAR(255) | 是 | 建议唯一（待确认） | — | 前端登录弹窗未展示，但注册接口需要 |
| role | VARCHAR(50) | 是 | 索引 | 待确认 | 具体取值范围前端未暴露，仅用于展示"xxx账号" |
| is_active | BOOLEAN | 是 | — | TRUE | 账号状态字段 |
| created_at | DATETIME | 是 | — | CURRENT_TIMESTAMP | |

Token（`access_token`/`refresh_token`）属于会话凭证，不建议落业务表，走 Redis/JWT 常规方案即可。

---

## 五、首页展示类数据

### 7. `hero_stats` 首页统计指标表

| 字段名 | 数据类型 | 必填 | 主键/唯一/索引 | 备注 |
|---|---|---|---|---|
| id | INT UNSIGNED | 是 | 主键，自增 | |
| label | VARCHAR(50) | 是 | 唯一 | 如"注册企业" |
| display_value | VARCHAR(20) | 是 | — | 已格式化展示值，如"4000+"（非纯数字） |
| trend_points | JSON | 是 | — | 迷你趋势条数据点数组，来源待确认（见问题清单） |
| sort_order | INT | 是 | — | 首页展示顺序 |

### 8. `site_features` 生态体系/产品服务表

| 字段名 | 数据类型 | 必填 | 主键/唯一/索引 | 备注 |
|---|---|---|---|---|
| id | INT UNSIGNED | 是 | 主键，自增 | |
| group | ENUM('ecosystem','product') | 是 | 索引 | 区分"生态体系"板块和"服务产品"板块 |
| icon | VARCHAR(50) | 是 | — | 需对应前端 `iconMap` 中的图标名（受限词表） |
| title | VARCHAR(100) | 是 | — | |
| desc | VARCHAR(255) | 是 | — | |
| sort_order | INT | 是 | — | |

### 9. `partners` 合作伙伴表

| 字段名 | 数据类型 | 必填 | 主键/唯一/索引 | 备注 |
|---|---|---|---|---|
| id | INT UNSIGNED | 是 | 主键，自增 | |
| name | VARCHAR(100) | 是 | 唯一 | |
| tag | VARCHAR(50) | 是 | — | 分类标签，暂无枚举定义 |
| logo | VARCHAR(500) | 否 | — | 前端类型已加为可选字段，当前无实际数据 |
| sort_order | INT | 是 | — | |

### 10.（待确认是否需要）`nav_items` / `nav_groups` 导航菜单

导航菜单目前更像前端静态配置，是否需要后台可配置尚未决定，暂不建议现在建表，若确认要做，结构大致为 `nav_items(id, label, href, sort_order)` → 1:N → `nav_groups(id, nav_item_id, title, sort_order)` → 1:N → `nav_group_items(id, nav_group_id, label, href, desc, sort_order)`，仅供预留参考。

---

## 六、表间关系一览

| 主表 | 从表 | 关系 |
|---|---|---|
| competitions | competition_details | 1:1 |
| competitions | competition_milestones | 1:N（`sort_order` 保序） |
| competitions | competition_tracks → tracks | N:M |
| competitions | （tags 内嵌 JSON，非独立表） | — |
| news | — | 无子表，`body` 内嵌 JSON |
| users | — | 与赛事/资讯目前无关联（报名记录在外部工作台系统） |

---

## 七、需要产品确认的问题

1. `competition_milestones.milestone_date` 目前只能照抄前端非标准的"2026.06.28"格式存成字符串，若要用标准 `DATE` 类型，需要先把前端 mock 数据格式统一。
2. `users.role` 的具体取值范围、`users.email` 是否要求唯一。
3. `hero_stats.trend_points` 的数据来源（人工维护 or 实时聚合）。
4. `site_features`、`partners`、导航菜单是否需要做成运营可配置内容。
5. 赛事/资讯列表接口是否需要服务端分页与筛选（目前分类、赛道筛选均在前端内存里完成）。
6. 手机验证码、微信登录是否为真实需求（当前仅 UI 占位，未接入接口）。
7. 注册 / 刷新 token / 登出 / `portal/me` 接口官网未调用，是否需要接入。
8. 报名记录相关实体（报名跳转到外部创业者工作台，数据结构需向该系统单独确认）。
