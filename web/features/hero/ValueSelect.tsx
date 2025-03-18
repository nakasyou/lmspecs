import { createSignal, For, JSX, Match, Show, Switch } from 'solid-js'
import {
  Dialog,
  DialogContent,
  DialogOpener,
} from '../../components/Dialog.tsx'
import { createEffect } from 'solid-js'
import { LMArena, type Data as LMArenaData, initData as initLmarenaData } from './values/Lmarena.tsx'
import { MMLUPro, type Data as MMLUProData, initData as initMMLUProData } from './values/MMLUPro.tsx'
import lmarena from '../../assets/brand-images/lmarena.jpg'

type GetValueFromKey<T extends [unknown, unknown], K> = T extends [K, infer V] ? V : never

export interface ValueType<T extends ValueTypeData[0] = ValueTypeData[0]> {
  title: string
  image: JSX.Element
  description: string
  initData: () => GetValueFromKey<ValueTypeData, T>
  formatData: (data: GetValueFromKey<ValueTypeData, T>) => string
}

export const VALUE_TYPES: {
  [key in ValueTypeData[0]]: ValueType<key>
} = {
  lmarena: {
    title: 'Chatbot Arena',
    image: <img src={lmarena} alt='Chatbot Arena' />,
    description:
      'Chatbot Arena is a crowdsourced platform for benchmarking LLMs. It uses side-by-side comparisons and user votes to rank models fairly. With over 240,000 votes in 100 languages, it offers real-time, human-centric evaluations.',
    initData: initLmarenaData,
    formatData: (data) => data
  },
  mmlu_pro: {
    title: 'MMLU Pro',
    image: (
      <img
        src='https://avatars.githubusercontent.com/u/144196744?s=100&v=4'
        alt='MMLU Pro'
      />
    ),
    description:
      'MMLU Pro is an advanced benchmark for evaluating AI models, featuring challenging questions across 57 subjects, designed to test reasoning, knowledge, and problem-solving beyond standard datasets.',
    initData: initMMLUProData,
    formatData: (data) => data
  },
}

export type ValueTypeData = ['lmarena', LMArenaData] | ['mmlu_pro', MMLUProData]

function TypeCard(props: {
  value: ValueType
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
    props.onChange?.([selected, VALUE_TYPES[selected].initData()] as ValueTypeData)
  })

  return (
    <div class='grid grid-cols-3 gap-2'>
      {
        <For each={Object.entries(VALUE_TYPES)}>
          {([id, data]) => (
            <TypeCard
              onClick={() => {
                setSelected(id as keyof typeof VALUE_TYPES)
              }}
              selected={getSelected() === id}
              value={data as ValueType}
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
  const [getType, setType] = createSignal<ValueTypeData>(props.value ?? [
    'lmarena',
    'text_overall',
  ])

  createEffect(() => {
    props.onChange?.(getType())
  })

  return (
    <Dialog>
      <DialogOpener class='text-left text-uchu-purple-6 font-bold'>
        <div>{VALUE_TYPES[getType()[0]].title}</div>
        <div class="text-sm text-uchu-purple-5">({VALUE_TYPES[getType()[0]].formatData(getType()[1] as never)})</div>
      </DialogOpener>
      <DialogContent>
        <div class='w-150 p-3'>
          <div class='text-xl font-bold'>Axis Selector</div>
          <Show
            when={!getIsShownTypeChanger()}
            fallback={
              <div class='flex'>
                <TypeChanger
                  value={getType()[0]}
                  onChange={(v) => {
                    setType(v)
                  }}
                />
                <div class='items-end'>
                  <button
                    type="button"
                    onClick={() => setIsShownTypeChanger(false)}
                    class='bg-uchu-yellow-9 text-white p-1 rounded-md'
                  >
                    OK
                  </button>
                </div>
              </div>
            }
          >
            <div>
              <div class='flex gap-1 items-center'>
                <button
                  type='button'
                  onClick={() => setIsShownTypeChanger(true)}
                  class='text-uchu-purple-6 font-bold flex items-center gap-1'
                >
                  <div>
                    Dataset: {VALUE_TYPES[getType()[0]].title}
                  </div>
                  <div class='i-tabler-transfer w-4 h-4' />
                </button>
              </div>
              <Switch>
                <Match when={getType()[0] === 'lmarena'}>
                  <div>
                    <div class='font-bold'>Data you use:</div>
                    <LMArena
                      onChange={(v) => {
                        setType(['lmarena', v])
                      }}
                      value={getType()[1] as LMArenaData}
                    />
                  </div>
                </Match>
                <Match when={getType()[0] === 'mmlu_pro'}>
                  <div>
                    <div class='font-bold'>category you use:</div>
                    <MMLUPro
                      onChange={v => {
                        setType(['mmlu_pro', v])
                      }}
                      value={getType()[1] as MMLUProData}
                    />
                  </div>
                </Match>
              </Switch>
            </div>
          </Show>
        </div>
      </DialogContent>
    </Dialog>
  )
}
