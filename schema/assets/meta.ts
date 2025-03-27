import * as v from 'valibot'

export default v.object({
  $schema: v.string(),
  source: v.string(),
  license: v.union([
    v.string('unknown'),
  ]),
})
