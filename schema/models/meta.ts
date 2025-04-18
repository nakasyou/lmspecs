import * as v from 'valibot'
import { reference, trustability } from '../shared.ts'

export default v.object({
  $schema: v.string(),
  name: v.string(),
  id: v.string(),
  creators: v.array(v.union([
    v.literal('google'),
    v.literal("xai"),
    v.literal("openai"),
    v.literal("deepseek"),
    v.literal('anthropic'),
    v.literal('cohere'),
    v.literal('CohereForAI'),
  ])),
  published_at: v.object({
    value: v.pipe(v.string(), v.regex(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)),
    references: v.array(reference()),
  }),
  states: v.record(
    v.pipe(v.string(), v.regex(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)),
    v.array(v.union([
      v.literal('STABLE'),
      v.literal('DEPRECATED'),
      v.literal('EXPERIMENTAL'),
    ])),
  ),
  prev: v.optional(v.string()),
  identifiers: v.object({
    lmarena: v.optional(v.string()),
  }),
  cutoff_date: v.optional(v.object({
    value: v.pipe(v.string(), v.regex(/^[0-9]{4}-[0-9]{2}(-[0-9]{2})?$/)),
    references: v.array(reference()),
  })),
  token_limit: v.optional(v.object({
    input: v.number(),
    output: v.nullable(v.number()),
    references: v.array(reference()),
  })),
  license: v.object({
    value: v.union([
      v.literal('Proprietary'),
      v.literal('MIT'),
      v.literal('CC-BY-NC-4.0'),
      v.literal('Apache-2.0'),
    ]),
    references: v.array(reference()),
  }),
  links: v.optional(v.object({
    website: v.optional(v.string()),
    github: v.optional(v.string()),
    huggingface: v.optional(v.string()),
  })),
  logos: v.optional(v.array(v.string())),
  multimodalities: v.object({
    input: v.array(v.union([
      v.literal('image'),
      v.literal('text'),
      v.literal('audio'),
      v.literal('video'),
    ])),
    output: v.array(v.union([
      v.literal('text'),
      v.literal('image'),
      v.literal('audio'),
      v.literal('video'),
    ])),
    references: v.array(reference()),
  }),
  model_parameters: v.optional(v.object({
    value: v.number(),
    references: v.array(reference()),
    trustability: trustability(),
  })),
  features: v.object({
    value: v.array(v.union([
      v.literal('REASONING'),
      v.literal('FUNCTION_CALLING'),
    ])),
    references: v.array(reference()),
  }),
})
