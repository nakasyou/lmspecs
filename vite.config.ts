import { defineConfig, PluginOption, Plugin } from 'vite'
import tailwind from '@tailwindcss/vite'
import solid from 'vite-plugin-solid'
import ssg from './scripts/ssg.ts'

const clientSolid = solid({ solid: { hydratable: true } }) as Plugin
clientSolid.applyToEnvironment = (environment) => environment.name === 'client'
const ssrSolid = solid({ solid: { generate: 'ssr', hydratable: true } }) as Plugin
ssrSolid.applyToEnvironment = (environment) => environment.name === 'ssr'

export default defineConfig({
  plugins: [tailwind() as PluginOption, clientSolid, ssrSolid],
  builder: {
    async buildApp(builder) {
      await builder.build(builder.environments.client)
      await builder.build(builder.environments.ssr)
      await ssg()
    },
  },
  build: {
    outDir: 'dist/client',
    minify: false,
    sourcemap: 'inline'
  },
  environments: {
    ssr: {
      build: {
        outDir: 'dist/server',
        rollupOptions: {
          input: 'web/ssr.tsx',
        },
      },
    },
  },
})
