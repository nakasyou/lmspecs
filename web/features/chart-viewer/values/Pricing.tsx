import { createEffect } from 'solid-js'
import { ValueType } from '../ValueSelect.tsx'
import { formatTokenUnit } from '../../../lib/math.ts'
import type pricingSchema from '../../../../schema/provided/pricing.ts'
import { InferOutput } from 'valibot'

type Pricing = InferOutput<typeof pricingSchema>

export type PricingParams = {
  inputTokens: number
  cachedInputTokens: number
  outputTokens: number
}

function Setting(props: {
  value?: PricingParams
  onChange(params: PricingParams): void
}) {
  createEffect(() => {
    if (!props.value) {
      props.onChange({
        inputTokens: 32,
        cachedInputTokens: 0,
        outputTokens: 32,
      })
    }
  })
  return (
    <div class='grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-items-center h-full'>
      <label>
        <div class='font-bold'>Input Tokens</div>
        <input
          type='number'
          value={props.value?.inputTokens ?? 32}
          onInput={(e) => {
            props.onChange({
              ...props.value!,
              inputTokens: parseInt(e.target.value),
            })
          }}
          class='border border-uchu-gray-5 p-1 rounded-full'
        />
      </label>
      <label>
        <div class='font-bold'>Cached Input Tokens</div>
        <input
          type='number'
          value={props.value?.cachedInputTokens ?? 0}
          onInput={(e) => {
            props.onChange({
              ...props.value!,
              cachedInputTokens: parseInt(e.target.value),
            })
          }}
          class='border border-uchu-gray-5 p-1 rounded-full'
        />
      </label>
      <label>
        <div class='font-bold'>Output Tokens</div>
        <input
          type='number'
          value={props.value?.outputTokens ?? 32}
          onInput={(e) => {
            props.onChange({
              ...props.value!,
              outputTokens: parseInt(e.target.value),
            })
          }}
          class='border border-uchu-gray-5 p-1 rounded-full'
        />
      </label>
    </div>
  )
}

const MODEL_PRICING_IMPORTS = import.meta.glob(
  '../../../../models/*/providers/*/pricing.json',
)

export default {
  title: 'Pricing',
  image: <div class='i-tabler-coin w-full h-full' />,
  description:
    'Prices for some APIs. The dataset is made using official websites.',
  Setting,
  initParams: () => ({
    inputTokens: 32,
    cachedInputTokens: 0,
    outputTokens: 32,
  }),
  formatParams: ({ inputTokens, cachedInputTokens, outputTokens }) =>
    `I${formatTokenUnit(inputTokens)}:C${formatTokenUnit(cachedInputTokens)}:O${
      formatTokenUnit(outputTokens)
    }`,
  getData: async (params, modelIds, providerIds) => {
    const promises: Promise<
      [modelId: string, [date: string, val: number | null][]]
    >[] = []
    for (const providerId of providerIds) {
      for (const modelId of modelIds) {
        const path =
          `../../../../models/${modelId}/providers/${providerId}/pricing.json`
        if (path in MODEL_PRICING_IMPORTS) {
          promises.push((async () => {
            const imported =
              ((await MODEL_PRICING_IMPORTS[path]()) as { default: Pricing })
                .default
            if (!imported.pricing) {
              return [
                `${providerId}/${modelId}`,
                []
              ]
            }
            let last = 0
            const value: [string, number | null][] = Object.entries(
              imported.pricing,
            ).map((
              [date, pricings],
            ) => {
              for (const pricing of pricings.value) {
                if (!pricing.cond || (
                  (pricing.cond.maxInputTokens ? pricing.cond.maxInputTokens > params.inputTokens : true) && 
                  (pricing.cond.minInputTokens ? pricing.cond.minInputTokens < params.inputTokens : true)
                )) {
                  last = 0
                  last += pricing.input.USD * params.inputTokens
                  last += (pricing.cachedInput?.USD ?? pricing.input.USD) * params.cachedInputTokens
                  last += pricing.output.USD * params.outputTokens
                  return [
                    date,
                    last,
                  ]
                }
              }
              throw new Error('No pricing found')
            })
            return [
              `${providerId}/${modelId}`,
              [...value, [new Date().toISOString().slice(0, 10), last]],
            ]
          })())
        }
      }
    }
    return Object.fromEntries(await Promise.all(promises))
  },
  isProvidedOnly: true,
  isStepwise: true,
} satisfies ValueType<PricingParams>
