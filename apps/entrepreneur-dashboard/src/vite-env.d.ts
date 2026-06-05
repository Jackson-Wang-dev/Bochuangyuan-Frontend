/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WPS_SDK_URL: string
  // AI service configuration (§3.3 按需触发)
  readonly VITE_AI_PROVIDER: string
  readonly VITE_AI_API_KEY: string
  readonly VITE_AI_BASE_URL: string
  readonly VITE_AI_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
