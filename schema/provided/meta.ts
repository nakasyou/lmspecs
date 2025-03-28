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
  features: v.object({
    value: v.object({
      fine_tuning: v.optional(v.boolean()),
      free_plan: v.optional(v.boolean()),
      function_calling: v.optional(v.boolean()),
      json_mode: v.optional(v.boolean()),
      prompt_caching: v.optional(v.boolean()),
      streaming: v.optional(v.boolean()),
    }),
    references: v.array(reference()),
  })
})
