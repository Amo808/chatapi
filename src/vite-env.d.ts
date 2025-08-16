/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_KEY: string
  readonly VITE_DEFAULT_MODEL: string
  readonly VITE_MAX_TOKENS: string
  readonly VITE_TEMPERATURE: string
  readonly VITE_ENABLE_STREAMING: string
  readonly VITE_ENABLE_FILE_UPLOAD: string
  readonly VITE_ENABLE_CHAT_HISTORY: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_DESCRIPTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
