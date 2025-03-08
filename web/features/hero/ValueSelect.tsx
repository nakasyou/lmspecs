import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { Dialog, DialogContent, DialogOpener } from '../../components/Dialog.tsx'
import { Select } from '../../components/Select.tsx'
import { createEffect } from 'solid-js'
import { LMArena } from './values/Lmarena.tsx'
import { MMLUPro } from './values/MMLUPro.tsx'

interface ValueType {
  title: string
  description: string
}
const VALUE_TYPES = {
  lmarena: {
    title: 'lmarena.ai score',
    description: 'LMArena.ai is a crowdsourced platform for benchmarking LLMs. It uses side-by-side comparisons and user votes to rank models fairly. With over 240,000 votes in 100 languages, it offers real-time, human-centric evaluations.'
  },
  mmlu_pro: {
    title: 'MMLU Pro',
    description: ''
  }
} as const satisfies Record<string, ValueType>

export type ValueTypeID = keyof typeof VALUE_TYPES
export type ValueTypeData = ['lmarena', string] | ['mmlu_pro', string]

function TypeCard(props: {
  value: ValueType
  onClick?: () => void
  selected: boolean
}) {
  return <div aria-selected={props.selected} class="border border-uchu-gray-5 rounded-md p-1 aria-selected:border-uchu-purple-6 transition-colors" onClick={props.onClick}>
    <div class="font-bold text-lg">{props.value.title}</div>
    <hr class="my-1 border-uchu-gray-5" />
    <div class="text-sm text-uchu-gray-9">{props.value.description}</div>
  </div>
}
function TypeChanger(props: {
  value: keyof typeof VALUE_TYPES
  onChange?: (v: keyof typeof VALUE_TYPES) => void
}) {
  const [getSelected, setSelected] = createSignal(props.value)
  createEffect(() => props.onChange?.(getSelected()))
  return <div class="grid grid-cols-3 gap-2">
    {
      <For each={Object.entries(VALUE_TYPES)}>{([id, data]) => <TypeCard onClick={() => {
        setSelected(id as keyof typeof VALUE_TYPES)
      }} selected={getSelected() === id} value={data} />}</For>
    }
  </div>
}

export default function ValueSelect(props: {
  onChange?: (v: ValueTypeData) => void
}) {
  const [getValueId, setValueId] = createSignal<keyof typeof VALUE_TYPES>('lmarena')
  const [getIsShownTypeChanger, setIsShownTypeChanger] = createSignal(false)
  const [getData, setData] = createSignal<ValueTypeData[1] | null>(null)

  createEffect(() => {
    props.onChange?.([getValueId(), getData()] as ValueTypeData)
  })

  return <Dialog>
    <DialogOpener class="text-left text-uchu-purple-6 font-bold">
      {VALUE_TYPES[getValueId()].title}
    </DialogOpener>
    <DialogContent>
      <div class="w-150 p-3">
        <div class="text-xl font-bold">Axis Selector</div>
        <Show when={!getIsShownTypeChanger()} fallback={
          <div class="flex">
            <TypeChanger value={getValueId()} onChange={(v) => {
              setValueId(v)
              setData(null)
            }} />
            <div class="items-end">
              <button onClick={() => setIsShownTypeChanger(false)} class="bg-uchu-yellow-9 text-white p-1 rounded-md">OK</button>
            </div>
          </div>
        }>
          <div>
            <div class="flex gap-1 items-center">
              <button onClick={() => setIsShownTypeChanger(true)} class="text-uchu-purple-6 font-bold flex items-center gap-1">
                <div>
                  Dataset: {VALUE_TYPES[getValueId()].title}
                </div>
                <div class="i-tabler-transfer w-4 h-4" />
              </button>
            </div>
            <Switch>
              <Match when={getValueId() === 'lmarena'}>
                <div>
                  <div class="font-bold">Data you use:</div>
                  <LMArena onChange={(v) => {
                    setData(v)
                  }} value={getData() as string} />
                </div>
              </Match>
              <Match when={getValueId() === 'mmlu_pro'}>
                <div>
                  <div class="font-bold">category you use:</div>
                  <MMLUPro onChange={(v) => {
                    setData(v)
                  }} value={getData() as string} />
                </div>
              </Match>
            </Switch>
          </div>
        </Show>
      </div>
    </DialogContent>
  </Dialog>
}
