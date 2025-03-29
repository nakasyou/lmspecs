import { renderToStringAsync } from 'solid-js/web'
import App from './App.tsx'
import { listModelIds } from './lib/lmspecs/new.ts'

export default async function ssr (url: string) {
  const html = await renderToStringAsync(() => <App url={url} />)
  return html
}

export const paths = [
  '/',
  '/chart',
  '/model',
  ...listModelIds().map(id => `/model/${id}`)
]

