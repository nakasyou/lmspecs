import { defineConfig } from 'vite'
import tailwind from '@tailwindcss/vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [tailwind(), solid()],
})
