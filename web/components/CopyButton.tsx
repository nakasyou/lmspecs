import { createSignal } from 'solid-js'

export default function CopyButton (props: {
  content: string
  class?: string
}) {
  const [getIsCompreted, setIsCompreted] = createSignal(false)

  let timeoutId: number | undefined

  return <button onClick={() => {
    navigator.clipboard.writeText(props.content)
      .then(() => {
        clearTimeout(timeoutId)
        setIsCompreted(true)
        timeoutId = setTimeout(() => {
          setIsCompreted(false)
        }, 1000)
      })
  }} class={props.class} type='button' classList={{
    'i-tabler-copy': !getIsCompreted(),
    'i-tabler-check': getIsCompreted(),
    'shrink-0': true
  }}></button>
}