import { toJsonSchema } from '@valibot/to-json-schema'
import * as v from 'valibot'
import * as path from '@std/path'

import { expandGlob } from '@std/fs/expand-glob'

const map: [
  string,
  v.ObjectSchema<v.ObjectEntries, v.ErrorMessage<v.ObjectIssue> | undefined>,
][] = []
for await (const entry of expandGlob('./schema/**/*.ts', {
  exclude: ['./schema/shared.ts', './schema/_output/**'],
})) {
  const jsonPath = path.relative('./schema', entry.path).replace('.ts', '.json')
  const schema = (await import('file://' + entry.path)).default
  map.push([jsonPath, schema])
}

for (const [output, schema] of map) {
  const target = path.join('schema/_output', output)
  Deno.mkdir(path.dirname(target), { recursive: true })
    .then(() =>
      Deno.writeTextFile(
        target,
        JSON.stringify(
          toJsonSchema(schema, {
            errorMode: 'warn',
          }),
          null,
          2,
        ),
      )
    )
}
