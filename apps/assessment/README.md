# 创业者人格评测 Demo

给 PM 看的前端演示，完整走通「答题 → 雷达图 → 名人画像 → AI 温度报告 → 保存/分享」全链路。

## 启动

```bash
# 在项目根目录
pnpm install
pnpm --filter assessment dev

# 或在 apps/assessment 目录
pnpm dev
```

默认端口 3002（被占用则自动递增）。

## 三条验收路径

### 路径 1：新用户首次测评

1. 打开 `http://localhost:3002`，看到「开始我的创业旅程」按钮
2. 点击按钮 → 进入 `/quiz`，答 10 道故事化场景题
3. 答完最后一题 → 自动跳转 `/result`
4. 依次体验：雷达图动画（1.5s）→ 名人卡片揭晓 → AI 加载动画 → 打字机报告
5. 底部出现「保存图片」和「分享」按钮
6. 点「保存图片」→ 浏览器下载 JPG

### 路径 2：老用户回流

1. 完成路径 1 后，**不清** localStorage，刷新首页
2. 看到「欢迎回来」卡片，显示上次的名人画像
3. 点「查看上次报告」→ 直接展示历史报告（无动画）
4. 顶部导航 → 「我的报告」→ 查看历史列表，可删除

### 路径 3：分享传播

1. 在 Result 页点「分享」→ 弹出 ShareModal（含二维码 + 链接）
2. 复制链接格式：`/report/{uuid}`
3. 新标签页打开 → ReportDetail 页，完整展示报告（无动画）
4. 底部大 CTA「测测你是哪一型创业者？」→ 返回首页 → 进入 Quiz

## 重置数据

浏览器 DevTools → Application → Local Storage → 全部清除，或执行：

```javascript
localStorage.clear()
```

## 项目结构

```
src/
├── pages/          Landing / Quiz / Result / ReportDetail / MyReports
├── components/     RadarChart / PersonaCard / AiReportSection / ...
├── store/          assessmentStore / userStore (Zustand + persist)
├── mock/           questions / personas / aiReports 模板
├── utils/          scoring / personaMatcher / aiReportSimulator / reportExport
└── types/          TypeScript 类型定义
```

## 关键算法位置

| 功能 | 文件 |
|------|------|
| 六维打分 | `src/utils/scoring.ts` |
| 名人匹配 | `src/utils/personaMatcher.ts` |
| AI 报告生成 | `src/utils/aiReportSimulator.ts` |
| 报告导出 JPG | `src/utils/reportExport.ts` |
