import { createEffect } from 'solid-js'
import { Select } from '../../../components/Select.tsx'
import { ValueType } from '../ValueSelect.tsx'

const titles = {
  'overall': 'Overall',
  'biology': 'Biology',
  'business': 'Business',
  'chemistry': 'Chemistry',
  'computer science': 'Computer science',
  'economics': 'Economics',
  'engineering': 'Engineering',
  'health': 'Health',
  'history': 'History',
  'law': 'Law',
  'math': 'Math',
  'philosophy': 'Philosophy',
  'physics': 'Physics',
  'psychology': 'Psychology',
  'other': 'Other',
}

export type MMLUProParams = keyof typeof titles

function MMLUPro(props: {
  value?: MMLUProParams
  onChange(id: keyof typeof titles): void
}) {
  createEffect(() => {
    if (!props.value) {
      props.onChange('overall')
    }
  })
  return (
    <label>
      <div class='font-bold text-lg'>Select a subject:</div>
      <Select
        titles={titles}
        value={props.value ?? 'overall'}
        onChange={(v) => props.onChange(v)}
        class='w-full'
        selectClass='max-h-60 overflow-y-auto'
      />
    </label>
  )
}

const MODEL_MMLUPRO_IMPORTS = import.meta.glob(
  '../../../../models/*/benchmarks.json',
)
export interface Benchmarks {
  mmlu_pro: {
    value: {
      [title: string]: number | null
    }
  }
}
export default {
  title: 'MMLU Pro',
  image: (
    <img
      src='https://avatars.githubusercontent.com/u/144196744?s=100&v=4'
      alt='MMLU Pro'
    />
  ),
  description:
    'Featuring challenging questions across 57 subjects, designed to test reasoning, knowledge, and problem-solving beyond standard datasets.',
  Setting: MMLUPro,
  initParams: () => 'overall',
  formatParams: (p) => p,
  getData: async (params, modelIds) => {
    const promises: Promise<
      [modelId: string, [date: string, val: number | null][]] | null
    >[] = []
    for (const modelId of modelIds) {
      const path = `../../../../models/${modelId}/benchmarks.json`

      if (path in MODEL_MMLUPRO_IMPORTS) {
        promises.push((async () => {
          const imported = ((await MODEL_MMLUPRO_IMPORTS[path]()) as {
            default: Benchmarks
          }).default
          console

          const value = imported.mmlu_pro.value[params]
          if (!value) {
            return null
          }
          return [
            modelId,
            [
              [new Date().toISOString().slice(0, 10), imported.mmlu_pro.value[params]]
            ],
          ]
        })())
      }
    }
    return Object.fromEntries((await Promise.all(promises)).filter((v) => !!v))
  },
} satisfies ValueType<MMLUProParams>
