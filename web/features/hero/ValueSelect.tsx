import {
  createEffect,
  createMemo,
  createSignal,
  For,
  JSX,
  Match,
  Show,
  Switch,
} from 'solid-js'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogOpener,
} from '../../components/Dialog.tsx'
import { Dynamic } from 'solid-js/web'

import lmarena, { LMArenaParams } from './values/Lmarena.tsx'
import mmlu_pro, { MMLUProParams } from './values/MMLUPro.tsx'
import pricing, { PricingParams } from './values/Pricing.tsx'

type GetValueFromKey<T extends [unknown, unknown], K> = T extends [K, infer V]
  ? V
  : never

export type SettingComponent<Params> = (props: {
  value: Params
  onChange: (v: Params) => void
}) => JSX.Element

export interface ValueType<Params> {
  title: string
  image: JSX.Element
  description: string
  isProvidedOnly?: boolean

  /** Init Params */
  initParams: () => Params

  /** format params */
  formatParams: (data: Params) => string

  Setting: SettingComponent<Params>

  getData: (
    params: Params,
    modelIds: string[],
    providerIds: string[],
  ) => Promise<{
    [modelId: string]: [date: string, data: number | null][]
  }>
}

export const VALUE_TYPES: {
  [K in ValueTypeData[0]]: ValueType<GetValueFromKey<ValueTypeData, K>>
} = {
  pricing,
  lmarena,
  mmlu_pro,
}

export type ValueTypeData = ['lmarena', LMArenaParams] | [
  'mmlu_pro',
  MMLUProParams,
] | ['pricing', PricingParams]

function TypeCard(props: {
  value: ValueType<unknown>
  onClick?: () => void
  selected: boolean
}) {
  return (
    <div
      aria-selected={props.selected}
      class='border border-uchu-gray-5 rounded-md p-1 aria-selected:border-uchu-purple-6 transition-colors'
      onClick={props.onClick}
    >
      <div class='flex justify-between'>
        <div class='font-bold text-lg'>{props.value.title}</div>
        <div class='w-8 h-8'>
          {props.value.image}
        </div>
      </div>
      <hr class='my-1 border-uchu-gray-5' />
      <div class='text-sm text-uchu-gray-9'>{props.value.description}</div>
    </div>
  )
}
function TypeChanger(props: {
  value: ValueTypeData[0]
  onChange?: (v: ValueTypeData) => void
}) {
  const [getSelected, setSelected] = createSignal(props.value)
  createEffect(() => {
    const selected = getSelected()
    props.onChange?.(
      [selected, VALUE_TYPES[selected].initParams()] as ValueTypeData,
    )
  })

  return (
    <div class='overflow-y-auto grow grid grid-cols-2 sm:grid-cols-3 gap-2'>
      {
        <For each={Object.entries(VALUE_TYPES)}>
          {([id, data]) => (
            <TypeCard
              onClick={() => {
                setSelected(id as keyof typeof VALUE_TYPES)
              }}
              selected={getSelected() === id}
              value={data as ValueType<unknown>}
            />
          )}
        </For>
      }
    </div>
  )
}

export default function ValueSelect(props: {
  value?: ValueTypeData
  onChange?: (v: ValueTypeData) => void
}) {
  const [getIsShownTypeChanger, setIsShownTypeChanger] = createSignal(false)
  const [getType, setType] = createSignal<ValueTypeData>(
    props.value ?? [
      'lmarena',
      'text_overall',
    ],
  )

  createEffect(() => {
    props.onChange?.(getType())
  })

  const SettingsComponent = createMemo(() => {
    return VALUE_TYPES[getType()[0]].Setting
  })

  return (
    <Dialog>
      <DialogOpener class='text-left text-uchu-purple-6 font-bold'>
        <div>{VALUE_TYPES[getType()[0]].title}</div>
        <div class='text-sm text-uchu-purple-5'>
          ({VALUE_TYPES[getType()[0]].formatParams(getType()[1] as never)})
        </div>
      </DialogOpener>
      <DialogContent>
        <div class='p-3 h-full'>
          <Show
            when={!getIsShownTypeChanger()}
            fallback={
              <div class='flex flex-col gap-1 h-full'>
                <div class='flex items-center justify-between'>
                  <div class='font-bold text-lg'>Select Dataset:</div>
                  <div class='items-end'>
                    <button
                      type='button'
                      onClick={() => setIsShownTypeChanger(false)}
                      class='bg-uchu-yellow-9 text-white p-1 rounded-md'
                    >
                      OK
                    </button>
                  </div>
                </div>
                <TypeChanger
                  value={getType()[0]}
                  onChange={(v) => {
                    setType(v)
                  }}
                />
              </div>
            }
          >
            <div class='h-full flex flex-col'>
              <div>
                <div class='flex gap-1 items-center justify-between'>
                  <button
                    type='button'
                    onClick={() => setIsShownTypeChanger(true)}
                    class='text-uchu-purple-6 font-bold flex items-center gap-1 text-xl'
                  >
                    <div>
                      Dataset: {VALUE_TYPES[getType()[0]].title}
                    </div>
                    <div class='i-tabler-transfer w-4 h-4' />
                  </button>
                  <DialogCloseButton class='i-tabler-x w-6 h-6' />
                </div>
                <hr class='my-1 text-uchu-gray-3' />
              </div>
              <div class='grow'>
                <Dynamic
                  component={SettingsComponent()}
                  value={getType()[1] as any}
                  onChange={(v: unknown) => {
                    setType((c) => [c[0], v as never])
                  }}
                />
              </div>
            </div>
          </Show>
        </div>
      </DialogContent>
    </Dialog>
  )
}
