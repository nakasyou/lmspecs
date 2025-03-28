import type { ProviderData } from './index.tsx'
import { createMemo, For, Show } from 'solid-js'
import type { cond } from '../../../schema/provided/pricing.ts'
import type { InferOutput } from 'valibot'
import { formatter } from './shared.ts'
import { ModelSpec } from './ModelSpec.tsx'
import { AbilityCard } from './AbilityCard.tsx'

function PricingCond(props: {
  cond: InferOutput<typeof cond>
}) {
  const getText = createMemo(() => {
    let text = ''
    if (props.cond.maxInputTokens) {
      text += `Input < ${props.cond.maxInputTokens}`
    }
    if (props.cond.minInputTokens) {
      text += `${props.cond.minInputTokens} < Input`
    }
    return text
  })

  return <span>{getText()}</span>
}

const getAbilityText = (input?: boolean) =>
  input === undefined ? 'Unknown' : input ? 'Supported' : 'Not supported'

export default function ProvidedContent(props: {
  data: ProviderData
}) {
  return (
    <div class='flex flex-col gap-4'>
      <ModelSpec
        key='Provided at'
        iconClass='i-tabler-calendar-bolt'
        references={props.data.meta.provided_at.references}
        contentToCopy={props.data.meta.provided_at.value}
      >
        {formatter.format(new Date(props.data.meta.provided_at.value))}
      </ModelSpec>
      <Show when={Object.values(props.data.pricing?.pricing ?? {}).at(-1)}>
        {(getPricing) => (
          <>
            <div class='h-[1px] w-full bg-gray-200 ' />
            <div>
              <div class='flex flex-col sm:flex-row gap-2'>
                <div class='flex gap-1 w-60'>
                  <div class='w-6 h-6 bg-slate-800 relative bottom-[2px] i-tabler-moneybag' />
                  <div class='font-bold text-slate-800'>Pricing</div>
                </div>
                <div class='grid grid-cols-1 md:grid-cols-2 gap-5 grow'>
                  <Show when={getPricing().value.length === 1}>
                    <div class='hidden md:block' />
                  </Show>
                  <For each={getPricing().value}>
                    {(pricing) => (
                      <div>
                        <Show when={pricing.cond}>
                          {(c) => (
                            <div class='font-bold text-slate-700'>
                              If <PricingCond cond={c()} />
                            </div>
                          )}
                        </Show>

                        <div class='flex gap-4'>
                          <div class='flex flex-col'>
                            <div class='text-sm text-slate-600'>Input</div>
                            <div class='text-lg font-mono font-bold text-slate-700'>
                              ${pricing.input.USD}
                            </div>
                          </div>
                          <Show when={pricing.cachedInput?.USD}>
                            <div class='h-6 w-[1px] bg-gray-300 hidden md:block self-center' />
                            <div class='flex flex-col items-center'>
                              <div class='text-sm text-slate-600'>
                                Cache Read
                              </div>
                              <div class='text-lg font-mono font-bold text-slate-700'>
                                ${pricing.cachedInput?.USD}
                              </div>
                            </div>
                          </Show>
                          <div class='h-6 w-[1px] bg-gray-300 hidden md:block self-center' />
                          <div class='flex flex-col'>
                            <div class='text-sm text-slate-600'>Output</div>
                            <div class='text-lg font-mono font-bold text-slate-700'>
                              ${pricing.output.USD}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </>
        )}
      </Show>
      <div class='h-[1px] w-full bg-gray-200 ' />
      <div class='flex flex-col sm:flex-row gap-2'>
        <div class='flex gap-1 w-60'>
          <div class='w-6 h-6 bg-slate-800 relative bottom-[2px] i-tabler-sparkles' />
          <div class='font-bold text-slate-800'>Features</div>
        </div>
        <div class='grow grid grid-cols-2 gap-2'>
          <AbilityCard
            name='Fine tuning'
            text={getAbilityText(props.data.meta.features.value.fine_tuning)}
            enabled={!!props.data.meta.features.value.fine_tuning}
            onIcon='i-tabler-settings'
            offIcon='i-tabler-settings'
          />
          <AbilityCard
            name='Free plan'
            text={getAbilityText(props.data.meta.features.value.free_plan)}
            enabled={!!props.data.meta.features.value.free_plan}
            onIcon='i-tabler-free-rights'
            offIcon='i-tabler-free-rights'
          />
          <AbilityCard
            name='Function calling'
            text={getAbilityText(
              props.data.meta.features.value.function_calling,
            )}
            enabled={!!props.data.meta.features.value.function_calling}
            onIcon='i-tabler-function'
            offIcon='i-tabler-function-off'
          />
          <AbilityCard
            name='JSON Mode'
            text={getAbilityText(props.data.meta.features.value.json_mode)}
            enabled={!!props.data.meta.features.value.json_mode}
            onIcon='i-tabler-json'
            offIcon='i-tabler-json'
          />
          <AbilityCard
            name='Prompt caching'
            text={getAbilityText(
              props.data.meta.features.value.prompt_caching,
            )}
            enabled={!!props.data.meta.features.value.prompt_caching}
            onIcon='i-tabler-database'
            offIcon='i-tabler-database-off'
          />
          <AbilityCard
            name='Streaming'
            text={getAbilityText(
              props.data.meta.features.value.streaming,
            )}
            enabled={!!props.data.meta.features.value.streaming}
            onIcon='i-tabler-radio'
            offIcon='i-tabler-radio-off'
          />
        </div>
      </div>
    </div>
  )
}
