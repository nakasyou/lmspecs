/// <reference types="npm:vite/client" />
/// <reference types="npm:vite/types/importMeta" />
declare global {
  interface ImportMeta {
    env: {
      [k: string]: string
      DEV: string
    }
    glob: import('vite/types/importGlob').ImportGlobFunction
  }
}

export {}
