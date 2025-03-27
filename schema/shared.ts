import { object, string } from 'valibot'

export const reference = () =>
  object({
    url: string(),
    retrieved: string(),
  })
