import { createEffect } from 'solid-js'
import { Select } from '../../../components/Select.tsx'
import { ValueType } from '../ValueSelect.tsx'

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
    <div>
    </div>
  )
}

const MODEL_PRICING_IMPORTS = import.meta.glob(
  '../../../../provided/*/*/pricing.json',
)

const formatTokenUnit = (val: number) => {
  if (val < 1000) {
    return Math.floor(val).toString()
  }
  if (val < 1000000) {
    return Math.floor(val / 1000) + 'k'
  }
  return Math.floor(val / 100000) / 10 + 'M'
}

interface Price {
  cost: {
    USD: number
  }
  cond?: {
    maxInputTokens?: number
    minInputTokens?: number
  }
}

export interface Pricing {
  pricing: {
    [date: string]: {
      input: Price[]
      cachedInput: Price[]
      output: Price[]
    }
  }
}

const calculateCost = (prices: Price[], opts: {
  inputTokens: number
}) => {
  for (const price of prices) {
    if (!price.cond) {
      return price.cost
    }
    if (
      price.cond.maxInputTokens && opts.inputTokens > price.cond.maxInputTokens
    ) {
      continue
    }
    if (
      price.cond.minInputTokens && opts.inputTokens < price.cond.minInputTokens
    ) {
      continue
    }
    return price.cost
  }
  throw new Error('No price found')
}

export default {
  title: 'Pricing',
  image: <div class='i-tabler-coin w-full h-full' />,
  description: 'Prices for some APIs.',
  Setting,
  initParams: () => ({
    inputTokens: 32,
    cachedInputTokens: 0,
    outputTokens: 32,
  }),
  formatParams: ({ inputTokens, cachedInputTokens, outputTokens }) =>
    `I${formatTokenUnit(inputTokens)}:C${formatTokenUnit(cachedInputTokens)}:O${formatTokenUnit(outputTokens)}`,
  getData: async (params, modelIds, providerIds) => {
    const promises: Promise<
      [modelId: string, [date: string, val: number | null][]]
    >[] = []
    for (const providerId of providerIds) {
      for (const modelId of modelIds) {
        const path =
          `../../../../provided/${providerId}/${modelId}/pricing.json`
        if (path in MODEL_PRICING_IMPORTS) {
          promises.push((async () => {
            const imported =
              ((await MODEL_PRICING_IMPORTS[path]()) as { default: Pricing })
                .default
            let last = 0
            const value: [string, number | null][] = Object.entries(imported.pricing).map((
              [date, pricings],
            ) => {
              const inputCost = pricings.input ? calculateCost(pricings.input, {
                inputTokens: params.inputTokens,
              }).USD * params.inputTokens / 1000000 : 0
              const cachedInputCost = pricings.cachedInput ? calculateCost(pricings.cachedInput, {
                inputTokens: params.inputTokens,
              }).USD * params.cachedInputTokens / 1000000 : 0
              const outputCost = pricings.output ? calculateCost(pricings.output, {
                inputTokens: params.inputTokens,
              }).USD * params.outputTokens / 1000000 : 0
              last = inputCost + cachedInputCost + outputCost
              return [
                date,
                last
              ]
            })
            return [
              `${providerId}/${modelId}`,
              [...value, [new Date().toISOString().slice(0, 10), last]]
            ]
          })())
        }
      }
    }
    return Object.fromEntries(await Promise.all(promises))
  },
  isProvidedOnly: true,
} satisfies ValueType<PricingParams>
