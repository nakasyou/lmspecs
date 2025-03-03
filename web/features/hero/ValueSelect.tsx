import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { Dialog, DialogContent, DialogOpener } from '../../components/Dialog.tsx'
import { Select } from '../../components/Select.tsx'
import { createEffect } from 'solid-js'

interface ValueType {
  title: string
  description: string
}
const VALUE_TYPES = {
  lmarena: {
    title: 'lmarena.ai score',
    description: 'LMArena.ai is a crowdsourced platform for benchmarking LLMs. It uses side-by-side comparisons and user votes to rank models fairly. With over 240,000 votes in 100 languages, it offers real-time, human-centric evaluations.'
  },
  mmmu_pro: {
    title: 'MMMU Pro',
    description: 'MMMU-Pro is a tough multimodal benchmark with college-level questions, testing reasoning and knowledge across many fields. It uses 10 answer options, making it harder than most.'
  }
} as const

export type ValueTypeID = keyof typeof VALUE_TYPES
export type ValueTypeData = ['lmarena', string] | ['mmmu_pro']

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

  const [getLMArenaType, setLMArenaType] = createSignal('text_overall')

  createEffect(() => {
    if (getValueId() === 'lmarena') {
      props.onChange?.(['lmarena', getLMArenaType()])
    } else if (getValueId() === 'mmmu_pro') {
      props.onChange?.(['mmmu_pro'])
    }
  })

  return <Dialog>
    <DialogOpener class="text-left text-uchu-purple-6 font-bold">lmarena.ai Score</DialogOpener>
    <DialogContent>
      <div class="w-150 p-3">
        <div class="text-xl font-bold">Axis Selector</div>
        <Show when={!getIsShownTypeChanger()} fallback={
          <div class="flex">
            <TypeChanger value={getValueId()} onChange={(v) => {
              setValueId(v)
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
                  <Select titles={{
                    'text_overall': 'text: Overall',
                    'text_overall_style_control': 'text: Overall (style controlled)',
                    'text_math': 'text: Math',
                    'text_math_style_control': 'text: Math (style controlled)',
                    'text_creative_writing': 'text: Creative Writing',
                    'text_creative_writing_style_control': 'text: Creative Writing (style controlled)',
                    'text_coding': 'text: Coding',
                    'text_coding_style_control': 'text: Coding (style controlled)',
                    'text_if': 'text: If',
                    'text_if_style_control': 'text: If (style controlled)',
                    'text_hard_6': 'text: Hard',
                    'text_hard_6_style_control': 'text: Hard (style controlled)',
                    'text_hard_english_6': 'text: Hard English',
                    'text_multiturn': 'text: Multiturn',
                    'text_multiturn_style_control': 'text: Multiturn (style controlled)',
                    'text_english': 'text: English',
                    'text_chinese': 'text: Chinese',
                    'text_french': 'text: French',
                    'text_german': 'text: German',
                    'text_spanish': 'text: Spanish',
                    'text_russian': 'text: Russian',
                    'text_japanese': 'text: Japanese',
                    'text_korean': 'text: Korean'
                  }} value={getLMArenaType()} onChange={setLMArenaType} class='w-80 h-40' selectClass='h-50 overflow-y-auto' />
                </div>
              </Match>
            </Switch>
          </div>
        </Show>
      </div>
    </DialogContent>
  </Dialog>
}
