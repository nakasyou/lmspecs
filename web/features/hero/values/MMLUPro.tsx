import { createEffect } from 'solid-js'
import { Select } from '../../../components/Select.tsx'

const titles = {
  "overall": "Overall",
  "biology": "Biology",
  "business": "Business",
  "chemistry": "Chemistry",
  "computer science": "Computer science",
  "economics": "Economics",
  "engineering": "Engineering",
  "health": "Health",
  "history": "History",
  "law": "Law",
  "math": "Math",
  "philosophy": "Philosophy",
  "physics": "Physics",
  "psychology": "Psychology",
  "other": "Other"
}

export type Data = keyof typeof titles

export function MMLUPro(props: {
  value?: Data
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
export const initData = (): Data => 'overall'
