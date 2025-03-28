import { array, number, object, optional, record, string } from 'valibot'
import { reference } from '../shared.ts'

const price = object({
  USD: number(), // Price in USD
})

export const cond = object({
  maxInputTokens: optional(number()),
  minInputTokens: optional(number()),
})
const cost = object({
  cond: optional(cond),
  input: price,
  cachedInput: optional(price),
  output: price,
})

export default object({
  $schema: optional(string()),
  pricing: optional(
    record(
      string(),
      object({
        value: array(cost),
        references: array(reference()),
      }),
    ),
  ),
})
