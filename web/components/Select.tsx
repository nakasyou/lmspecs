import type { JSX } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'
import { createEffect } from 'solid-js'

export function Select<T extends string>(props: {
  titles: Record<T, string | JSX.Element>
  value: NoInfer<T>
  class?: string
  selectClass?: string
  onChange?: (v: T) => void
}) {
  const [getIsShown, setIsShown] = createSignal(false)
  const [getIsRealShown, setIsRealShown] = createSignal(false)
  const [getValue, setValue] = createSignal<T>(props.value)
  createEffect(() => setValue(() => props.value))
  createEffect(() => props.onChange?.(getValue()))
  let ref!: HTMLDivElement

  let closeTimeout: number
  const documentClick = (evt: MouseEvent) => {
    if (!ref.contains(evt.target as HTMLElement)) {
      close()
    }
  }
  const open = () => {
    document.addEventListener('click', documentClick)
    clearTimeout(closeTimeout)
    setIsShown(true)
    requestAnimationFrame(() => setIsRealShown(true))
  }
  const close = () => {
    document.removeEventListener('click', documentClick)
    setIsRealShown(false)
    closeTimeout = setTimeout(() => setIsShown(false), 400)
  }
  return (
    <div ref={ref} class={"inline-block relative " + (props.class)}>
      <div
        onClick={() => {
          ;(getIsRealShown() ? close : open)()
        }}
        class='w-full border p-1 rounded-md border-gray-400 flex justify-between items-center'
      >
        <div>{props.titles[getValue()]}</div>
        <div
          class='i-tabler-caret-down-filled w-4 h-4 transition-all'
          classList={{
            '-scale-100': getIsRealShown(),
          }}
        >
        </div>
      </div>
      <Show when={getIsShown()}>
        <div
          class='absolute transition-all bg-white w-full h-full'
          classList={{
            'opacity-100': getIsRealShown(),
            'opacity-0': !getIsRealShown(),
            [props.selectClass ?? '']: true
          }}
        >
          <div class='bg-white border border-gray-400'>
            <For
              each={Object.entries(props.titles) as [T, string | JSX.Element][]}
            >
              {([id, title]) => (
                <div
                  classList={{
                    'bg-uchu-purple-1': getValue() === id,
                  }}
                  class='transition-colors p-1'
                  onClick={() =>
                    getValue() === id ? close() : setValue(() => id)}
                >
                  {title}
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}
