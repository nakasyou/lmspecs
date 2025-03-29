import * as path from '@std/path'
import { existsSync } from '@std/fs/exists'
import { generateHydrationScript } from 'solid-js/web'

const TITLE_REGEX = /(?<=\<title[^>]*>).*?(?=<\/title>)/
export default async function ssg() {
  const ssrPath = ['./dist/server/ssr.mjs'][0]
  const { default: ssr, paths } = await import(ssrPath)

  if (!existsSync('dist/client/_index_tmpl.html')) {
    await Deno.rename('dist/client/index.html', 'dist/client/_index_tmpl.html')
  }
  const tmpl = (await Deno.readTextFile('dist/client/_index_tmpl.html'))
    .replace('</title>', `</title>${generateHydrationScript()}`)

  for (const urlPath of paths) {
    const hydratable: string = await ssr(urlPath)
    const filePath = path.join('dist/client', urlPath, 'index.html')

    const html = tmpl
      .replace('<div id="root"></div>', `<div id="root">${hydratable}</div>`)
      .replace('{{ title }}', hydratable.match(TITLE_REGEX)?.[0] ?? '')

    await Deno.mkdir(path.dirname(filePath), { recursive: true })
    await Deno.writeTextFile(filePath, html)
  }
}
