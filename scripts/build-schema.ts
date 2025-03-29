import { toJsonSchema } from '@valibot/to-json-schema'
import * as v from 'valibot'
import * as path from '@std/path'

import assetsMeta from '../schema/assets/meta.ts'
import modelsMeta from '../schema/models/meta.ts'
import providedMeta from '../schema/provided/meta.ts'
import providerMeta from '../schema/providers/meta.ts'
import providedPricing from '../schema/provided/pricing.ts'
import modelBenchLmarena from '../schema/models/bench-lmarena.ts'
import providedSpeed from '../schema/provided/speed.ts'
import companies from '../schema/companies.ts'
import modelBenchMMLUPro from '../schema/models/bench-mmlu-pro.ts'

const map: [
  string,
  v.ObjectSchema<v.ObjectEntries, v.ErrorMessage<v.ObjectIssue> | undefined>,
][] = [
  ['assets/meta.json', assetsMeta],
  ['models/meta.json', modelsMeta],
  ['provided/meta.json', providedMeta],
  ['providers/meta.json', providerMeta],
  ['provided/pricing.json', providedPricing],
  ['models/bench-lmarena.json', modelBenchLmarena],
  ['provided/speed.json', providedSpeed],
  ['companies.json', companies],
  ['models/bench-mmlu-pro.json', modelBenchMMLUPro],
]

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
