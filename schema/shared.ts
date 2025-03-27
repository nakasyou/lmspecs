import { literal, object, string, union } from 'valibot'

export const reference = () =>
  object({
    url: string(),
    retrieved: string(),
  })

export const trustability = () => union([
  literal('OFFICIAL'),
  literal('GUESSED')
])
