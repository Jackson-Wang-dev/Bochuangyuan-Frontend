# Handoff: 博创网 UI Optimization (Dashboard hero + Assessment app)

## Overview

This handoff covers two UI optimization passes for the **Bochuangyuan-Frontend** monorepo (`pnpm + Turborepo`):

1. **`apps/entrepreneur-dashboard`** — Home dashboard hero (top header, AI achievement banner, competition slider).
2. **`apps/assessment`** — Mobile assessment app (Landing, Quiz, Result pages).

No data structures, routing, store logic, or product behavior change. **Visual / UI only.**

## About the Design Files

The two files in `references/` are **design references created in plain HTML + Tailwind CDN + lucide-static**:

- `references/home-hero-optimization.html`
- `references/assessment-app-optimization.html`

They are **prototypes showing intended look** — not production code to copy directly. The task is to recreate the AFTER side of these mockups inside the existing **React + Vite + Tailwind v4 + lucide-react + framer-motion** codebase, reusing the patterns already in `packages/ui` and the existing component structure. Don't rip out the React components and replace them with the static HTML — port the styling and structure into the existing TSX files.

Each reference HTML is split into:

- A **BEFORE** column — a faithful recreation of the current code, included so you can visually diff.
- An **AFTER** column — the proposed visual state.
- A **Change log** section at the bottom with numbered, annotated pins.

## Fidelity

**High-fidelity (hi-fi).** Final colors, typography, spacing, and copy are specified — recreate pixel-close in React. Where the spec calls out exact pixel values (e.g. `text-[34px]`, `rounded-2xl`, `gap-2.5`), match them. Where it calls out tokens (e.g. `brand-blue`), use the tokens declared in `apps/entrepreneur-dashboard/src/index.css` and `apps/assessment/src/index.css`.

---

## Design tokens

### Colors

| Token | Hex | Use |
|---|---|---|
| `brand-blue` | `#0045c4` | Primary brand. Buttons, links, accents, AI rail. (Already in dashboard `index.css`.) |
| `brand-blue-2` | `#003ba8` | Hover state for `brand-blue`. **Add.** |
| `brand-light-blue` | `#eff6ff` | Backgrounds, tint chips. (Already in dashboard `index.css`.) |
| `brand-ink` | `#0a1733` | Deep navy used for the dashboard header and assessment hero. **Add.** |
| `brand-paper` | `#f6f7fb` | Off-white page bg used as alternative to `slate-50`. **Add.** |

**Drop / migrate** in `apps/assessment/src/index.css`:

- Remove `.bg-brand-gradient` (`linear-gradient(135deg, #5b5fed 0%, #8b5cf6 100%)`).
- Remove `.bg-result-gradient` (`linear-gradient(180deg, #5b5fed 0%, #8b5cf6 40%, #f9fafb 100%)`).
- Replace all `#5b5fed`, `#8b5cf6`, `#7c3aed` literals with `brand-blue` / `brand-blue-2` / `brand-ink`.

### Typography

| Role | Stack | Sizes |
|---|---|---|
| Body sans | Inter, "Noto Sans SC", system-ui, sans-serif | 13–15px / 400–600 |
| Display serif (assessment persona + story) | "Source Serif 4", "Noto Serif SC", serif | 22–34px / 500–700 |
| Mono (eyebrows, numbers, counters) | "JetBrains Mono", ui-monospace, monospace | 10–13px / 400–600, `tabular-nums` for any digit run |

**Font loading:** add Google Fonts links in each app's `index.html` for `Inter`, `Noto Sans SC`, `Noto Serif SC` (or `Source Serif 4`), and `JetBrains Mono`. The dashboard already declares `--font-sans: Inter` — extend its `@theme` block to add `--font-serif` and `--font-mono`.

### Radii

Lock to a 5-step scale:

| Tailwind class | Px | Used for |
|---|---|---|
| `rounded-lg` | 8 | Chips, small buttons |
| `rounded-xl` | 12 | Nav buttons, small cards |
| `rounded-2xl` | 16 | Standard cards, large buttons |
| `rounded-3xl` | 24 | Hero / modal / phone-screen cards |
| `rounded-full` | — | Pills, dots, avatars |

**Stop using** the arbitrary `rounded-[1.5rem]`, `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-[3rem]`, `rounded-[3.5rem]` literals scattered through `ArchiveDashboard.tsx`.

### Iconography

All emoji removed from product chrome. Replace with **lucide-react** (already a dependency):

- `📖` → `<BookOpen />`
- `🎯` → `<Radar />`
- `✨` → `<MessageSquareQuote />`
- `📚` → `<BookOpen />` (alt size)
- `🤝` → `<Users />`
- `📋` → `<FileCheck />`
- `🚀` (persona "image") → typographic monogram (first Chinese char of `persona.name` on a brand-blue gradient tile)

Emoji is only acceptable inside user-authored content (e.g. the welcome-back card pulling `persona.imageEmoji` from saved history) — not in default chrome.

### Spacing & shadows

- Card body padding: `p-6` (24px) for hero cards, `p-4` / `p-3.5` for compact cards.
- Standard card shadow: `shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]` — a hairline + a soft cast. Replaces the heavy `shadow-2xl shadow-slate-200/40` used today.
- Active CTA shadow: `shadow-sm` (Tailwind default) only. **Do not** use `shadow-xl` + colored glow combinations.

---

## Part 1 — `apps/entrepreneur-dashboard`

Reference: `references/home-hero-optimization.html` (look at the **AFTER** column).

### 1.1 Header (`src/layouts/DashboardLayout.tsx`)

**Current (lines ~117–149):** a flat saturated `#0045c4` slab with a logo "B" lettermark and a Bell + avatar + chevron.

**Target:**

- Replace the flat blue header with a `brand-ink` background plus a subtle radial brand-blue glow on the left and a faint dotted texture. CSS:
  ```css
  .header-ink {
    background-color: #0a1733;
    background-image:
      radial-gradient(80% 60% at 20% 0%, rgba(0,69,196,0.55) 0%, rgba(10,23,51,0) 60%),
      radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: auto, 24px 24px;
  }
  ```
- Replace the italic-"B" letter block with a real geometric "B" SVG mark (sized 36×36, brand-blue tile, white glyph), plus a bilingual lockup:
  - Top line: `博创网` (text-base, font-bold, tracking-tight)
  - Bottom line: `Bochuang · Doctor venture` (text-[10px], font-medium, tracking-[0.2em], uppercase, white/50)
- Insert a product-level switcher (pill row, right of the logo) with 3 buttons:
  - `创业者工作台` (active state: `bg-white/10`)
  - `官网` (text-white/60)
  - `大赛入口` (text-white/60)
  These are visual tabs — wire them to whatever routing target makes sense; if not yet decided, leave them as `<button>` with no-op `onClick`.
- Add a global ⌘K search affordance on the right side, before the bell:
  ```jsx
  <div className="hidden md:flex items-center gap-2 bg-white/[0.08] border border-white/10 rounded-full px-3.5 py-2 text-xs text-white/70 w-72">
    <Search className="w-3.5 h-3.5" />
    <span>搜索项目、材料、大赛…</span>
    <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 border border-white/5">⌘ K</span>
  </div>
  ```
  Hook it to a real command palette only when one exists; for now it can be a stub button.
- Replace the bare Bell + avatar + chevron with:
  - 9×9 round hover buttons for Bell (with a 1.5px rose-400 dot) and HelpCircle.
  - User block: avatar + name (`陈博士` placeholder, pulled from `userStore` later) + role (`高级合伙人`, white/50), then chevron-down.

### 1.2 Sidebar nav (`src/layouts/DashboardLayout.tsx`, `NavItem` component)

- Change radius: `rounded-lg` → `rounded-xl`.
- Change padding: `px-4 py-3` → `px-3.5 py-2.5`.
- Change weight: active state goes from `font-bold` + `border-r-4` → `font-medium` + `bg-[#0045c4]/8` (no right border).
- Active state: drop the `border-r-4 border-brand-blue`. The tint background alone is enough.
- Icon size: standardize at `w-4 h-4` (down from `w-5 h-5`).
- Remove the "项目模块2" sidebar item's animated amber dot — visual noise.

### 1.3 AI achievement banner (`src/components/ArchiveDashboard.tsx`, section "1. Achievement Task Banner")

**Current pain points** (annotated as pins A, B, C in the BEFORE column):

1. Outer halo `<div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-[2rem] opacity-20 blur-2xl">` — **remove entirely.**
2. Gradient text on `「人才大佬」` (`<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">`) — replace with plain `text-slate-900`.
3. The progress line `进度 8/10 ... 再上传 2 份材料即可解锁证书 已达成 ✓` — the `已达成 ✓` contradicts the 8/10. Rewrite.

**Target structure:**

```jsx
<section className="space-y-5">
  <header className="flex items-end justify-between">
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">成就任务中心</h2>
      <p className="text-xs text-slate-500 mt-1">距离下一个里程碑还有 2 步 · 系统会持续陪你完成</p>
    </div>
    <button className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1">
      全部里程碑 <ArrowRight className="w-3.5 h-3.5" />
    </button>
  </header>

  <div className="relative bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between gap-6
                  shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]">
    {/* Left rail accent — replaces the halo */}
    <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#0045c4] rounded-r-full" />

    <div className="flex items-center gap-5 flex-1 min-w-0">
      {/* Icon tile */}
      <div className="relative shrink-0">
        <div className="w-14 h-14 bg-[#0a1733] rounded-2xl flex items-center justify-center text-white">
          <Sparkles className="w-6 h-6" />
        </div>
        <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-0.5 text-[10px] font-semibold bg-[#0045c4] text-white px-1.5 py-0.5 rounded-md shadow-sm">
          <Zap className="w-2.5 h-2.5" />AI
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span className="px-1.5 py-0.5 rounded-md bg-[#0045c4]/8 text-[#0045c4] font-semibold">AI 智慧推荐</span>
          <span>·</span>
          <span>个性化路径</span>
        </div>
        <h3 className="mt-1.5 text-lg font-semibold text-slate-900 truncate">
          距离「人才大佬」称号还差 2 份材料
        </h3>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[280px]">
            <div className="h-full bg-[#0045c4] rounded-full" style={{ width: '80%' }} />
          </div>
          <div className="text-xs text-slate-500">
            <span className="font-mono tabular-nums font-semibold text-slate-900">8</span>
            <span className="text-slate-400">/</span>
            <span className="font-mono tabular-nums">10</span>
            <span className="ml-1">已完成</span>
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-50">
        稍后再说
      </button>
      <button className="flex items-center gap-2 bg-[#0045c4] hover:bg-[#003ba8] text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm">
        同步档案 <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
</section>
```

Keep the existing `framer-motion` entrance animation on the outer card if you like — just drop the `<div>` halo and the gradient text. Two CTAs (稍后再说 + 同步档案) replace the single black uppercase button.

### 1.4 Competition slider (`src/components/ArchiveDashboard.tsx`, section "2. Shrunk Competition Slider Module")

**Section header — rewrite:**

```jsx
<div className="flex items-end justify-between">
  <div>
    <h2 className="text-xl font-semibold tracking-tight text-slate-900">热门征集 · 竞赛前沿</h2>
    <p className="text-xs text-slate-500 mt-1">本月共 12 场 · 报名中 3 场</p>
  </div>
  <div className="flex items-center gap-1">
    <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
      <ChevronLeft className="w-4 h-4" />
    </button>
    <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
</div>
```

- Drop the `text-[10px] font-bold text-slate-400 uppercase tracking-widest` "对接海量资源与高额奖金" subtitle and the all-caps decoration. **Do NOT** add any "AI 已为你匹配 N 场 · 查看匹配理由" line — the user explicitly rejected this in design review.

**Slider card:**

- Container: `rounded-[24px]` → `rounded-2xl`. Height: 220 → 240px.
- Remove the inner `bg-blue-400/5 rounded-full blur-[80px]` blob.
- Replace the left "推荐" caps pill with a soft status chip:
  ```jsx
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium text-xs">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
    报名进行中
  </span>
  ```
  **Do NOT add an "AI 匹配度 94%" chip** — also rejected in review.
- Headline: `text-lg lg:text-xl` → `text-2xl`. Description: `text-[11px]` → `text-sm`. Remove the `pl-3 border-l-2 border-slate-100` decoration on description.
- Bottom info row gains a deadline countdown + reward badge in the row (not in the image overlay):
  ```jsx
  <div className="flex items-center gap-5 text-sm text-slate-500">
    <div className="flex items-center gap-1.5">
      <Calendar className="w-3.5 h-3.5" />
      <span>截止 <span className="font-mono text-slate-700">{deadline}</span> · 还剩 <span className="text-rose-600 font-medium">{daysRemaining} 天</span></span>
    </div>
    <div className="flex items-center gap-1.5">
      <MapPin className="w-3.5 h-3.5" />
      <span>{location}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <Trophy className="w-3.5 h-3.5" />
      <span>奖金池 <span className="font-mono text-slate-700">¥{reward}{rewardUnit}</span></span>
    </div>
  </div>
  ```
  Move the existing reward badge OUT of the absolute-positioned overlay in the image area; the image area no longer needs a reward badge.
- Image side: keep 40% width, but layer two gradients so the headline always has a clean reading band on the left:
  ```jsx
  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/0 to-transparent" />
  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
  ```
- Replace the single small "立即报名" corner button with a CTA pair anchored bottom-right of the image side:
  ```jsx
  <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
    <button className="bg-white/90 hover:bg-white backdrop-blur text-slate-900 text-sm font-medium px-4 py-2.5 rounded-xl">
      查看详情
    </button>
    <button onClick={onRegisterCompetition} className="bg-[#0045c4] hover:bg-[#003ba8] text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-1.5">
      立即报名 <ArrowRight className="w-4 h-4" />
    </button>
  </div>
  ```
- Carousel indicators: pair the dots with a mono counter:
  ```jsx
  <div className="absolute bottom-3 left-7 flex items-center gap-3 z-30">
    <div className="flex gap-1.5">{/* existing dots */}</div>
    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
      {String(currentCompIndex + 1).padStart(2, '0')} / {String(COMPETITIONS.length).padStart(2, '0')}
    </span>
  </div>
  ```

### 1.5 Sidebar — `AI 陪伴已开启` card

**Do NOT add** the "AI 陪伴已开启" companion card to the sidebar that was in an earlier draft. The user explicitly rejected it as redundant in design review.

---

## Part 2 — `apps/assessment`

Reference: `references/assessment-app-optimization.html` (AFTER columns for Landing / Quiz / Result).

This is a mobile-targeted app (`max-w-[768px]`). Visual direction: unify with the main 博创网 brand, kill the purple→indigo gradient, swap emoji for lucide icons, shift the editorial tone from Buzzfeed-quiz to "tool for serious entrepreneurs."

### 2.1 `src/index.css`

Replace the entire file with:

```css
@import "tailwindcss";

@theme {
  --color-brand-blue: #0045c4;
  --color-brand-blue-2: #003ba8;
  --color-brand-ink: #0a1733;
  --color-brand-paper: #f6f7fb;
  --font-sans: "Inter", "Noto Sans SC", system-ui, sans-serif;
  --font-serif: "Source Serif 4", "Noto Serif SC", serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

@layer base {
  * { box-sizing: border-box; }
  body {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f6f7fb;
  }
}

@layer utilities {
  /* Deep ink hero — brand-blue radial glow + dotted grid */
  .ink-blue {
    background-color: #0a1733;
    background-image:
      radial-gradient(80% 60% at 20% 0%, rgba(0,69,196,0.55) 0%, rgba(10,23,51,0) 60%),
      radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: auto, 24px 24px;
  }
}

/* Typewriter cursor — recolor */
.typewriter-cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background-color: #0045c4;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Soft glow — for the result CTA, no longer the purple loading glow */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 69, 196, 0.3); }
  50% { box-shadow: 0 0 20px 4px rgba(0, 69, 196, 0.2); }
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}
```

Also update `index.html` `<head>` to import Google Fonts (Inter, Noto Sans SC, Noto Serif SC, JetBrains Mono).

### 2.2 `src/pages/Landing.tsx`

**Remove:**
- The `bg-brand-gradient` hero block.
- The `✦ 创业者人格评测` floating badge.
- The current centered headline with the `<br/>` between `3 分钟` and `发现你的创业者人格`.
- All emoji from the feature cards (📖 🎯 ✨).

**Build (rough JSX structure):**

```jsx
return (
  <div className="min-h-screen flex flex-col">
    {/* Hero — brand-ink */}
    <div className="ink-blue px-6 pt-14 pb-10 text-white relative overflow-hidden">
      {/* Brand row */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-2">
          <BochuangLogo size={24} />
          <span className="text-sm font-semibold tracking-tight">博创园</span>
        </div>
        {isReturning && (
          <button onClick={() => navigate('/my-reports')} className="text-xs text-white/60 hover:text-white flex items-center gap-1">
            我的报告 <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Editorial headline — NO subtitle paragraph */}
      <p className="font-mono text-[11px] text-white/50 tracking-[0.18em] uppercase mb-3">
        Founder · Persona Test · v3
      </p>
      <h1 className="text-[34px] font-bold leading-[1.15] tracking-tight">
        你属于
        <br />
        <span className="text-white">哪一种创业者？</span>
      </h1>
      {/* NOTE: Do NOT add a "10 道情境题，3 分钟…" subtitle here — explicitly rejected in design review. */}

      {/* Stats strip */}
      <div className="grid grid-cols-3 mt-7 border border-white/10 rounded-2xl divide-x divide-white/10 bg-white/5 backdrop-blur-sm">
        <Stat value="12,847" label="已完成" />
        <Stat value="23"     label="人格类型" />
        <Stat value="6"      label="能力维度" />
      </div>

      {/* CTA */}
      <button onClick={handleStartNew} className="w-full mt-5 flex items-center justify-between gap-3 bg-white hover:bg-white/95 text-brand-ink font-semibold py-4 px-5 rounded-2xl shadow-lg shadow-black/20 transition-all active:scale-[0.98]">
        <span className="text-[15px]">开始评测</span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <span>预计 3 分钟</span>
          <ArrowRight className="w-4 h-4 text-brand-blue" />
        </span>
      </button>
    </div>

    {/* Features */}
    <div className="bg-white px-6 pt-7 pb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold text-slate-900">评测包含</h2>
        <span className="font-mono text-[10px] text-slate-400 tracking-wider">03 PARTS</span>
      </div>

      <div className="grid gap-2.5">
        <FeatureCard icon={BookOpen}            title="10 道情境题"   tag="3 MIN"  desc="跟随一位职场人的创业旅程，在关键决策节点做出你的选择。" />
        <FeatureCard icon={Radar}               title="六维能力雷达" tag="DATA"   desc="执行力 · 创新力 · 风险偏好 · 资源整合 · 抗压 · 商业敏锐。" />
        <FeatureCard icon={MessageSquareQuote} title="专属洞察报告" tag="REPORT" desc="一封写给你的、像朋友说话的报告。" />
      </div>

      <p className="mt-7 text-[11px] text-slate-400 text-center font-medium leading-relaxed">
        博创园 · 创业者成长平台<br />
        <span className="text-slate-300">陪你走完从想法到落地的每一步</span>
      </p>
    </div>
  </div>
)
```

`FeatureCard` props: `icon` (lucide component), `title`, `tag` (small mono caps), `desc`. Layout: `rounded-2xl p-3.5 flex items-start gap-3.5 border border-slate-200 hover:border-brand-blue/30`. Icon tile: `w-9 h-9 rounded-xl bg-brand-blue/8 text-brand-blue flex items-center justify-center`.

**`BochuangLogo`** is a small SVG component (40×40 viewBox, brand-blue rounded square with a white "B" geometric glyph) — see the AFTER HTML for the exact path data. Promote it into `packages/ui` since it'll be reused across all 5 apps.

**Returning user state** (when `isReturning && lastReport?.matchedPersona`): preserve the current behavior (the "欢迎回来" card and the two-CTA stack — `查看上次报告` + `重新测试`) but restyle to match the new ink + brand-blue theme: card becomes `bg-white/10 border border-white/15` with `text-white`, primary CTA stays white-on-ink, secondary CTA becomes `bg-white/10` outlined.

### 2.3 `src/pages/Quiz.tsx`

**Remove:**
- The `bg-gradient-to-b from-[#5b5fed] to-[#7c3aed]` wrapper.
- The current `<ProgressBar>` with raw fraction + percentage.

**Build:**

- Page background: `bg-brand-paper` (`#f6f7fb`). Status bar treatment: dark icons on light bg.
- Top sticky bar (white, `border-b border-slate-100`):
  - Left: `<X />` close button (round, `w-8 h-8 hover:bg-slate-50`) — wire to existing nav-away logic.
  - Center: stacked
    - `font-mono tabular-nums text-[13px] font-semibold text-slate-900` showing `{padStart(currentIndex+1, 2, '0')} / {padStart(total, 2, '0')}`.
    - `text-[10px] text-slate-400 tracking-wider uppercase` showing the current `sceneTitle`.
  - Right: `<Bookmark />` placeholder button (no-op).
  - Below: a 10-segment progress row (`flex gap-1`, each segment `h-1 flex-1 rounded-full`; lit segments `bg-brand-blue`, unlit `bg-slate-200`). Adapt for `questions.length` dynamically.
- Story scene — `<StoryScene>` rewritten (see 2.5).
- Options — `<OptionCard>` rewritten (see 2.6).
- Bottom whisper (matches the brand's `陪伴` voice):
  ```jsx
  <div className="px-5 pb-8 flex items-center gap-2 text-[11px] text-slate-400">
    <Info className="w-3 h-3" />
    <span>没有标准答案 — 你的选择会指向不同人格</span>
  </div>
  ```

**Name-input final screen** (the `showNameInput` block): swap the purple gradient for the same `.ink-blue` treatment. The white primary CTA stays white-on-ink with `text-brand-blue`.

### 2.4 `src/pages/Result.tsx`

- Remove the `.bg-result-gradient` header.
- New header: `.ink-blue` block, fixed top area with back button (left), `font-mono` report number eyebrow (center: `Report · #{paddedId}`), more-horizontal (right). Below that, the **persona reveal**: monogram tile (80×80, `rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-2`, white serif character, large; `persona.name.charAt(0)`) alongside persona name (`text-3xl font-bold tracking-tight`) + a `Trailblazer · 23 类人格 · No. 04`-style English-bilingual line in `text-white/65`.
  - **NOTE**: monograms must work for all 23 personas — render `persona.name.charAt(0)`. If a particular persona name doesn't start with a single legible glyph, we'll iterate; flag it during implementation.
- Rarity chip: top-right, `bg-amber-400/15 border border-amber-400/30 text-amber-300` with a `w-1.5 h-1.5 rounded-full bg-amber-400` dot and the existing `稀有 / 少见 / 主流` label + `仅 {percent}%`.
- Keyword quote: render in `font-serif italic` with a `border-l-2 border-brand-blue pl-4` rule. Drop the existing `text-[#5b5fed]` styling.
- Description card: white card with `border border-slate-200 shadow-sm`, sits half-overlapping the ink header (`-mt-3`).
- Radar card — see 2.7.
- Continue-exploring cards: replace emoji (📚 🤝 📋) with lucide icons (`BookOpen`, `Users`, `FileCheck`). Same `bg-white rounded-2xl p-4 flex items-center gap-3` layout but icon tile `w-10 h-10 rounded-xl bg-brand-blue/8 text-brand-blue`.
- Sticky bottom: keep two-button layout. `分享` becomes `border border-slate-200 text-slate-700` (drop `border-2 border-[#5b5fed]`). `保存图片` is solid `bg-brand-blue hover:bg-brand-blue-2`.

### 2.5 `src/components/StoryScene.tsx`

Replace internals:

```jsx
return (
  <div className="px-5 pt-6">
    <p className="font-mono text-[10px] text-brand-blue tracking-[0.18em] uppercase mb-2">
      Scene · {String(sequence).padStart(2, '0')}
    </p>
    <h2 className="font-serif text-[22px] font-semibold text-slate-900 leading-[1.35] tracking-tight">
      {sceneDescription}
    </h2>
    <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/8 text-brand-blue text-[12px] font-medium">
      <MessageCircle className="w-3.5 h-3.5" />
      {questionText}
    </div>
  </div>
)
```

Drop the old `第 N 关` pill, the `bg-gradient-to-br from-gray-50 to-blue-50/30` card, and the separate question heading. The serif heading carries both scene and emotional tone.

### 2.6 `src/components/OptionCard.tsx`

Each option gets an **A/B/C/D mono badge** (use letter from option index: `String.fromCharCode(65 + index)`).

```jsx
<button onClick={...} disabled={...}
  className={cn(
    "w-full text-left bg-white rounded-2xl p-4 border flex items-start gap-3 transition-colors",
    selected
      ? "border-2 border-brand-blue shadow-sm shadow-brand-blue/10"
      : "border-slate-200 hover:border-brand-blue/40"
  )}>
  <span className={cn(
    "w-6 h-6 rounded-full text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5",
    selected ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"
  )}>
    {String.fromCharCode(65 + index)}
  </span>
  <p className={cn(
    "text-[13.5px] leading-relaxed flex-1",
    selected ? "text-slate-900 font-medium" : "text-slate-800"
  )}>{option.text}</p>
  {selected && <Check className="w-4 h-4 text-brand-blue mt-0.5" />}
</button>
```

You'll need to pass `index` from `Quiz.tsx` (current code maps over `currentQuestion.options` without an index — add it).

### 2.7 `src/components/RadarChart.tsx` + the score list section in `Result.tsx`

- Stroke / fill colors: `#5b5fed` → `#0045c4`. Vertex dots: small `r=3` circles in brand-blue at each polygon point.
- Score list: replace the 2×N grid of gray pill rows with a single-column ranked bar list:
  ```jsx
  <div className="space-y-2 mt-3">
    {sortedScores.map((s, i) => (
      <div key={s.code} className="grid grid-cols-[16px_1fr_32px] items-center gap-2 text-[12px]">
        <span className={cn(
          "font-mono font-semibold",
          i < 2 ? "text-brand-blue" : "text-slate-400"
        )}>{String(s.rank).padStart(2, '0')}</span>
        <div>
          <div className="flex justify-between mb-0.5">
            <span className="font-medium text-slate-700">{s.name}</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full"
                 style={{ width: `${s.normalizedScore}%`, backgroundColor: i < 2 ? '#0045c4' : i < 4 ? 'rgba(0,69,196,0.8)' : 'rgba(0,69,196,0.6)' }} />
          </div>
        </div>
        <span className={cn(
          "font-mono tabular-nums font-semibold text-right",
          i < 4 ? "text-slate-700" : "text-slate-500"
        )}>{s.normalizedScore}</span>
      </div>
    ))}
  </div>
  ```
- Drop the `bg-gray-50 py-1.5 px-2 rounded-xl` row treatment.

### 2.8 `src/components/PersonaCard.tsx`

This is referenced from `Result.tsx`. With the redesign moving the persona reveal into the result header, `PersonaCard` can be slimmed:

- Remove the 6xl `{persona.imageEmoji}` block.
- Add a monogram tile that renders `persona.name.charAt(0)` in serif on a brand-blue gradient.
- Rarity chip: keep, but use the new amber-on-ink styling when displayed inside the ink header, OR brand-blue tinted when displayed inside a white card. Add a `variant: 'ink' | 'paper'` prop.
- Keyword: `font-serif italic` with brand-blue left rule.

### 2.9 `src/components/ProgressBar.tsx`

Replace internals with the 10-segment row described in §2.3. Drop the percentage text and fraction; the new top bar in `Quiz.tsx` carries that.

---

## Cross-cutting rules to enforce while implementing

1. **Never reintroduce** these gradients anywhere in the assessment app: `#5b5fed → #8b5cf6`, `#5b5fed → #7c3aed`, `#5b5fed → #8b5cf6 → #f9fafb`, or any `from-blue-500 via-indigo-500 to-purple-500` halo.
2. **Never put gradient text** (`bg-clip-text bg-gradient-to-r ...`) on any heading. Use solid `text-slate-900` or `text-brand-blue`.
3. **No emoji in default chrome** — lucide-react only. Emoji is permitted only for user-authored persona content already in store.
4. **No AI-narrating copy.** Do NOT add text like "AI 已为你匹配 4 场", "AI 匹配度 94%", "AI 陪伴已开启", or the rejected subtitle "10 道情境题，3 分钟，给你一份不冷冰冰的画像…". The brand is built on companionship (陪伴), not on flexing the AI.
5. **Body text floor: 13px** (`text-[13px]`). Reserve `text-[10px]` / `text-[11px]` for mono eyebrows, counters, and footnotes.
6. **Weight semantics:** display headlines `font-bold` (700) or `font-semibold` (600); body emphasis `font-medium` (500); body regular 400. Stop using `font-black` (900) on tiny labels.
7. **Radius scale:** only `rounded-lg / xl / 2xl / 3xl / full`. Delete the `rounded-[Xrem]` arbitrary values from `ArchiveDashboard.tsx`.
8. **`tabular-nums` + `font-mono`** for every counter / progress fraction / report number / score / date.

---

## Verification checklist (run after implementation)

For **`apps/entrepreneur-dashboard`**:

- [ ] Header background is `brand-ink` with brand-blue radial glow; no flat `#0045c4` slab.
- [ ] Logo is the geometric SVG B mark, not the italic letter; bilingual lockup visible.
- [ ] Product switcher pills visible in header (`创业者工作台 / 官网 / 大赛入口`).
- [ ] Global ⌘K search bar in header.
- [ ] Sidebar nav items: `rounded-xl`, `font-medium`, no right-border on active.
- [ ] AI achievement banner has NO outer halo glow, NO gradient text on `「人才大佬」`, fraction `8 / 10 已完成` uses `font-mono tabular-nums`.
- [ ] Competition slider header reads `本月共 12 场 · 报名中 3 场` — no AI-matching language.
- [ ] Competition slider card is `rounded-2xl`, 240px tall, with status chip + carousel counter `01 / 03`.

For **`apps/assessment`**:

- [ ] Landing hero is `.ink-blue` (deep ink + brand-blue glow), not purple gradient.
- [ ] Landing has NO subtitle paragraph below "哪一种创业者？" headline.
- [ ] Stats strip shows `12,847 / 23 / 6` with `font-mono tabular-nums`.
- [ ] Feature cards use lucide icons (`BookOpen / Radar / MessageSquareQuote`), no emoji.
- [ ] Quiz background is `bg-brand-paper`, not purple gradient. 10-segment progress row at top.
- [ ] Story scene rendered in `font-serif` heading style.
- [ ] Options have A/B/C/D mono badges. Selected state: brand-blue badge + check icon.
- [ ] Result persona reveal uses a brand-blue monogram tile, not a 🚀 emoji.
- [ ] Radar polygon fill / stroke is brand-blue (`#0045c4`), not purple.
- [ ] Score list is a single column with `01–06` mono ranks and right-aligned tabular numbers.
- [ ] Continue-exploring cards use lucide icons, not emoji.
- [ ] No `bg-clip-text bg-gradient-to-r` anywhere in the assessment app source.

---

## Files

- `references/home-hero-optimization.html` — annotated before/after for the entrepreneur-dashboard hero.
- `references/assessment-app-optimization.html` — annotated before/after for the assessment app (Landing / Quiz / Result).

Open both in a browser; the change-log section at the bottom of each file describes every pinned change in plain language.

## Out of scope

- `apps/organizer-portal`, `apps/specialist-window`, `apps/admin-platform`, `apps/official-site` — not yet redesigned.
- Backend / store / scoring logic — untouched.
- New product flows — none. Visual + copy only.

If you hit a question the spec doesn't answer (e.g. a persona name that breaks the monogram, a competition data shape that doesn't have `daysRemaining`), prefer the **principle** stated in §"Cross-cutting rules" over guessing. When in doubt, leave the existing behavior and flag for review.
