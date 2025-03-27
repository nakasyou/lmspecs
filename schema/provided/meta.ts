import * as v from 'valibot'
import { reference } from '../shared.ts'

export default v.object({
  provided_at: v.object({
    value: v.pipe(
      v.string(),
      v.regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
    ),
    references: v.array(reference()),
  }),
  token_limit: v.optional(v.object({
    output: v.optional(v.number()),
    references: v.array(reference()),
  })),
})
