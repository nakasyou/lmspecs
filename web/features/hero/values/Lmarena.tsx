import { createEffect } from 'solid-js'
import { Select } from '../../../components/Select.tsx'

const titles = {
  'text_overall': 'text: Overall',
  'text_overall_style_control': 'text: Overall (style controlled)',
  'text_math': 'text: Math',
  'text_math_style_control': 'text: Math (style controlled)',
  'text_creative_writing': 'text: Creative Writing',
  'text_creative_writing_style_control':
    'text: Creative Writing (style controlled)',
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
  'text_korean': 'text: Korean',
  'vision_creative_writing': 'vision: Creative Writing',
  'vision_creative_writing_style_control':
    'vision: Creative Writing (style controlled)',
  'vision_overall_style_control': 'vision: Overall (style controlled)',
  'vision_overall': 'vision: Overall',
  'vision_coding': 'vision: Coding',
  'vision_coding_style_control': 'vision: Coding (style controlled)',
  'vision_if': 'vision: If',
  'vision_math': 'vision: Math',
  'vision_hard_6_style_control': 'vision: Hard (style controlled)',
  'vision_hard_6': 'vision: Hard',
  'vision_hard_english_6': 'vision: Hard English',
  'vision_english': 'vision: English',
  'vision_chinese': 'vision: Chinese',
  'vision_multiturn': 'vision: Multiturn',
  'vision_long_user': 'vision: Long User',
  'vision_german': 'vision: German',
  'vision_french': 'vision: French',
  'vision_spanish': 'vision: Spanish',
  'vision_russian': 'vision: Russian',
  'vision_japanese': 'vision: Japanese',
  'vision_korean': 'vision: Korean',
  'vision_no_tie': 'vision: No Tie',
  'vision_no_short': 'vision: No Short',
  'vision_no_refusal': 'vision: No Refusal',
}

export type Data = keyof typeof titles

export function LMArena(props: {
  value?: Data
  onChange(id: keyof typeof titles): void
}) {
  createEffect(() => {
    if (!props.value) {
      props.onChange('text_overall')
    }
  })
  return (
    <Select
      titles={titles}
      value={props.value ?? 'text_overall'}
      onChange={(v) => props.onChange(v)}
      class='w-80 h-40'
      selectClass='h-50 overflow-y-auto'
    />
  )
}
export const initData = (): Data => 'text_overall'
