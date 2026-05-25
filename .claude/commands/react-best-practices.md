# React Best Practices

Source: https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices
Version: 1.0.0 (Vercel Engineering, January 2026)

Apply these rules when writing or reviewing React code in this project.

## CRITICAL: Eliminate Waterfalls

- Start independent async operations in parallel with `Promise.all()`, never `await` sequentially when calls are independent.
- In components, fire parallel fetches before first render using parallel store actions or SWR/React Query with independent keys.
- Never chain: `const a = await fetchA(); const b = await fetchB(a_unrelated);` — if B doesn't depend on A, fetch both at once.

## CRITICAL: Bundle Size

- **No barrel file imports** from large libraries. Import directly:
  ```ts
  // BAD
  import { User, Bell, Settings } from 'lucide-react'
  // Acceptable for lucide-react because Vite tree-shakes it, but avoid for @mui/material etc.
  ```
- **Route-level code splitting** — all page components must be loaded with `React.lazy`:
  ```ts
  const ProjectEditor = React.lazy(() => import('./pages/project/editor'))
  ```
- Keep `main.tsx` and `router.tsx` thin — no business logic.

## HIGH: Re-render Optimization

- **Never define components inside other components** — causes remount on every parent render.
- **Zustand slice pattern** — subscribe to only the slice you need, not the whole store:
  ```ts
  // BAD: const { files, pickFile, isOpen } = useMaterialStore()
  // GOOD:
  const files = useMaterialStore(s => s.files)
  const pickFile = useMaterialStore(s => s.pickFile)
  ```
- Avoid `useMemo` for primitive computations (string concat, simple math). Use it only for expensive derived arrays/objects.
- Stabilize callbacks with `useCallback` only when passing to memoized children.

## HIGH: Server / API

- Never store request-scoped data in module-level variables (causes cross-user data leaks).
- All API functions in `src/api/` must be pure async functions — no side effects beyond the network call.
- AI-related calls go exclusively through `src/api/ai.ts` — no direct AI SDK calls in components or stores.

## MEDIUM: Rendering Performance

- Use `key` props that are stable IDs, never array indices for reorderable lists.
- Prefer CSS transitions over JS-driven frame loops for animations.
- For lists >100 items, use windowing (react-virtual or similar).

## Pattern: File Picker (materialStore)

The `pickFile()` action uses a promise-based modal pattern — it returns a Promise that resolves when the user selects a file. This avoids prop-drilling callbacks:

```ts
// In any component:
const file = await useMaterialStore.getState().pickFile()
if (file) { /* use file */ }
```
