import { array, number, object, optional, string } from 'valibot'

export default object({
  measuredSpeeds: array(object({
    result: object({
      tps: number(),
      ttft: optional(number()),
    }),
    env: object({
      inputToken: number(),
      outputToken: number(),
      date: string(),
    }),
  })),
})
