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
    <Select
      titles={titles}
      value={props.value ?? 'overall'}
      onChange={(v) => props.onChange(v)}
      class='w-80 h-40'
      selectClass='h-50 overflow-y-auto'
    />
  )
}

const MODEL_MMLUPRO_IMPORTS = import.meta.glob(
  '../../../../models/*/score-mmlu-pro.json',
)
export interface MMLUProScores {
  scores: {
    [date: string]: {
      [title: string]: number
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
    'MMLU Pro is an advanced benchmark for evaluating AI models, featuring challenging questions across 57 subjects, designed to test reasoning, knowledge, and problem-solving beyond standard datasets.',
  Setting: MMLUPro,
  initParams: () => 'overall',
  formatParams: (p) => p,
  getData: async (params, modelIds) => {
    const promises: Promise<
      [modelId: string, [date: string, val: number | null][]]
    >[] = []
    for (const modelId of modelIds) {
      const path = `../../../../models/${modelId}/score-lmarena.json`
      if (path in MODEL_MMLUPRO_IMPORTS) {
        promises.push((async () => {
          const imported = ((await MODEL_MMLUPRO_IMPORTS[path]()) as { default: MMLUProScores }).default

          return [
            modelId,
            Object.entries(imported.scores).map((
              [date, scores],
            ) => [date, scores[params]]),
          ]
        })())
      } else {
        promises.push(Promise.resolve([modelId, []]))
      }
    }
    return Object.fromEntries(await Promise.all(promises))
  },
} satisfies ValueType<MMLUProParams>
