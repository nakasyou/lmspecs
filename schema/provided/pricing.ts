import { array, number, object, optional, record, string } from 'valibot'
import { reference } from '../shared.ts'

const price = object({
  USD: number(), // Price in USD
})

const cost = object({
  cond: optional(
    object({
      maxInputTokens: optional(number()),
      minInputTokens: optional(number()),
    }),
  ),
  cost: price,
})

export default object({
  $schema: optional(string()),
  pricing: optional(
    record(
      string(),
      object({
        input: optional(array(cost)),
        output: optional(array(cost)),
        cachedInput: optional(array(cost)),
        references: array(reference()),
      }),
    ),
  ),
})
