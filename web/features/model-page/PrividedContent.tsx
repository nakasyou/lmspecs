import type { ProviderData, Speed } from './index.tsx'
import { createMemo, For, Show } from 'solid-js'
import type { cond } from '../../../schema/provided/pricing.ts'
import type { InferOutput } from 'valibot'
import { formatter } from './shared.ts'
import { ModelSpec } from './ModelSpec.tsx'
import { AbilityCard } from './AbilityCard.tsx'
import { createResource } from 'solid-js'
import { createSignal } from 'solid-js'
import { onMount } from 'solid-js'
import { createEffect } from 'solid-js'
import { Switch } from 'solid-js'
import { Match } from 'solid-js'

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

const loremipsumTokenized: string[] = [
  'Lorem',
  ' ipsum',
  ' dolor',
  ' sit',
  ' amet',
  ',',
  ' consectetur',
  ' adipiscing',
  ' elit',
  ',',
  ' sed',
  ' do',
  ' eiusmod',
  ' tempor',
  ' incididunt',
  ' ut',
  ' labore',
  ' et',
  ' dolore',
  ' magna',
  ' aliqua',
  '.',
  ' Ut',
  ' enim',
  ' ad',
  ' minim',
  ' veniam',
  ',',
  ' quis',
  ' nost',
  'rud',
  ' exercitation',
  ' ullam',
  'co',
  ' laboris',
  ' nisi',
  ' ut',
  ' aliqu',
  'ip',
  ' ex',
  ' ea',
  ' commodo',
  ' consequat',
  '.',
  ' Duis',
  ' aute',
  ' ir',
  'ure',
  ' dolor',
  ' in',
  ' reprehenderit',
  ' in',
  ' voluptate',
  ' velit',
  ' esse',
  ' c',
  'illum',
  ' dolore',
  ' eu',
  ' fugiat',
  ' nulla',
  ' pariatur',
  '.',
  ' Ex',
  'cepteur',
  ' sint',
  ' occaec',
  'at',
  ' cupid',
  'atat',
  ' non',
  ' pro',
  'ident',
  ',',
  ' sunt',
  ' in',
  ' culpa',
  ' qui',
  ' officia',
  ' deserunt',
  ' moll',
  'it',
  ' anim',
  ' id',
  ' est',
  ' laborum',
  '.',
  ' ',
]

type SpeedLevel = 'SLOW' | 'MEDIUM' | 'FAST' | 'FASTEST'
const calcSpeedLevel = (tps: number): SpeedLevel => {
  if (tps < 50) {
    return 'SLOW'
  }
  if (tps < 100) {
    return 'MEDIUM'
  }
  if (tps < 300) {
    return 'FAST'
  }
  return 'FASTEST'
}

function Speed(props: {
  speed: Speed
}) {
  const getTps = createMemo(() =>
    props.speed.measuredSpeeds.reduce(
      (prev, cur) => cur.result.tps + prev,
      0,
    ) / props.speed.measuredSpeeds.length
  )
  const getSpeedLevel = createMemo(() => calcSpeedLevel(getTps()))

  const [getWritingLorem, setWritingLorem] = createSignal('')
  const [getIsStopped, setIsStopped] = createSignal(false)

  let scrollContainerRef!: HTMLDivElement

  createEffect(() => {
    if (getIsStopped()) {
      return
    }
    setWritingLorem('')
    let i = 0
    const step = async () => {
      setWritingLorem((prev) => prev + loremipsumTokenized[i])
      i++
      scrollContainerRef.scrollTop = scrollContainerRef.scrollHeight

      await new Promise((resolve) => setTimeout(resolve, 1000 / getTps()))
      if (i === loremipsumTokenized.length) {
        setIsStopped(true)
      }
      if (getIsStopped()) {
        return
      }
      step()
    }
    step()
  })

  return (
    <>
      <div class='h-[1px] w-full bg-gray-200 dark:bg-gray-700 ' />
      <div class='flex flex-col sm:flex-row gap-2'>
        <div class='flex gap-1 w-60 shrink-0'>
          <div class='w-6 h-6 bg-slate-800 relative bottom-[2px] i-tabler-bolt' />
          <div class='font-bold text-slate-800'>Speed</div>
        </div>
        <div class='grid grid-cols-2 grow'>
          <div class='flex items-center'>
            <div class='flex flex-col items-center gap-1'>
              <div class='flex'>
                <Switch>
                  <Match when={getSpeedLevel() === 'FASTEST'}>
                    <div class='i-tabler-bolt-filled w-8 h-8' />
                    <div class='i-tabler-bolt-filled w-8 h-8' />
                    <div class='i-tabler-bolt-filled w-8 h-8' />
                    <div class='i-tabler-bolt-filled w-8 h-8' />
                  </Match>
                  <Match when={getSpeedLevel() === 'FAST'}>
                    <div class='i-tabler-bolt-filled w-8 h-8' />
                    <div class='i-tabler-bolt-filled w-8 h-8' />
                    <div class='i-tabler-bolt-filled w-8 h-8' />
                  </Match>
                  <Match when={getSpeedLevel() === 'MEDIUM'}>
                    <div class='i-tabler-bolt-filled w-8 h-8' />
                    <div class='i-tabler-bolt-filled w-8 h-8' />
                  </Match>
                  <Match when={getSpeedLevel() === 'SLOW'}>
                    <div class='i-tabler-bolt-filled w-8 h-8' />
                  </Match>
                </Switch>
              </div>
              <div class='text-slate-700 font-bold text-lg'>
                {getSpeedLevel()}
              </div>
              <div class='text-sm text-slate-600'>≈{getTps()} Tokens/s</div>
            </div>
          </div>
          <div class='flex gap-1'>
            <button
              type='button'
              class='w-6 h-6 p-1 bg-uchu-purple-5 shrink-0'
              onClick={() => setIsStopped((prev) => !prev)}
              classList={{
                'i-tabler-play': getIsStopped(),
                'i-tabler-player-stop': !getIsStopped(),
              }}
              title={getIsStopped() ? 'Stop' : 'Start'}
            />
            <div
              ref={scrollContainerRef}
              class='grow font-mono border p-1 border-gray-200 rounded-md h-60 overflow-y-auto text-slate-500'
            >
              {getWritingLorem()}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
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
            <div class='h-[1px] w-full bg-gray-200 dark:bg-gray-700 ' />
            <div>
              <div class='flex flex-col sm:flex-row gap-2'>
                <div class='flex gap-1 w-60'>
                  <div class='w-6 h-6 bg-slate-800 dark:bg-slate-200 relative bottom-[2px] i-tabler-moneybag' />
                  <div class='font-bold text-slate-800 dark:text-slate-200'>Pricing</div>
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
                            <div class='text-sm text-slate-600 dark:text-slate-200'>Input</div>
                            <div class='text-lg font-mono font-bold text-slate-700 dark:text-slate-300'>
                              ${pricing.input.USD}
                            </div>
                          </div>
                          <Show when={pricing.cachedInput?.USD}>
                            <div class='h-6 w-[1px] bg-gray-300  hidden md:block self-center' />
                            <div class='flex flex-col items-center'>
                              <div class='text-sm text-slate-600 dark:text-slate-200'>
                                Cache Read
                              </div>
                              <div class='text-lg font-mono font-bold text-slate-700 dark:text-slate-300'>
                                ${pricing.cachedInput?.USD}
                              </div>
                            </div>
                          </Show>
                          <div class='h-6 w-[1px] bg-gray-300 hidden md:block self-center' />
                          <div class='flex flex-col'>
                            <div class='text-sm text-slate-600 dark:text-slate-200'>Output</div>
                            <div class='text-lg font-mono font-bold text-slate-700 dark:text-slate-300'>
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
      <div class='h-[1px] w-full bg-gray-200 dark:bg-gray-700 ' />
      <div class='flex flex-col sm:flex-row gap-2'>
        <div class='flex gap-1 w-60'>
          <div class='w-6 h-6 bg-slate-800 dark:bg-slate-200 relative bottom-[2px] i-tabler-sparkles' />
          <div class='font-bold text-slate-800 dark:text-slate-200'>Features</div>
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
      <Show when={props.data.speed}>
        {(getSpeed) => <Speed speed={getSpeed()} />}
      </Show>
    </div>
  )
}
