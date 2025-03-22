import { createEffect } from 'solid-js'
import { Select } from '../../../components/Select.tsx'

export type Data = {
  inputToken: number
  outputToken: number
}

export function Pricing(props: {
  value?: Data
  onChange(data: Data): void
}) {
  createEffect(() => {
    if (!props.value) {
      props.onChange({
        inputToken: 32,
        outputToken: 32,
      })
    }
  })
  return (
    <div>
      aa
    </div>
  )
}
export const initData = (): Data => {
  return {
    inputToken: 32,
    outputToken: 32,
  }
}
