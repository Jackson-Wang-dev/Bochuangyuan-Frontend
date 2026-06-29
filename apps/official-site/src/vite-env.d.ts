/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BC_SITE_API_BASE_URL?: string
  readonly VITE_BC_DASHBOARD_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}