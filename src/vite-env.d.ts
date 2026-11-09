/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Address of the backend API, set in the project root .env (see .env.example)
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

