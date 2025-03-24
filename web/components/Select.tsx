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
  const [shouldShowUp, setShouldShowUp] = createSignal(false)

  const checkPosition = () => {
    if (!ref) return
    const rect = ref.getBoundingClientRect()
    const listbox = ref.querySelector('[role="listbox"]')
    if (!listbox) return

    const menuHeight = listbox.getBoundingClientRect().height
    const spaceBelow = globalThis.innerHeight - rect.bottom
    const spaceAbove = rect.top

    setShouldShowUp(spaceBelow < menuHeight && spaceAbove > spaceBelow)
  }

  createEffect(() => {
    if (getIsShown()) {
      checkPosition()
      globalThis.addEventListener('scroll', checkPosition, { passive: true })
      globalThis.addEventListener('resize', checkPosition, { passive: true })
    } else {
      globalThis.removeEventListener('scroll', checkPosition)
      globalThis.removeEventListener('resize', checkPosition)
    }
  })

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
    requestAnimationFrame(() => {
      setIsRealShown(true)
      requestAnimationFrame(() => {
        checkPosition()
      })
    })
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
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={getIsRealShown()}
        class='w-full border p-1 rounded-md border-gray-400 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors'
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
          class='absolute transition-all bg-white w-full z-10'
          classList={{
            'opacity-100': getIsRealShown(),
            'opacity-0': !getIsRealShown(),
            'bottom-full mb-2': shouldShowUp(),
            'top-full mt-2': !shouldShowUp(),
            [props.selectClass ?? '']: true
          }}
        >
          <div class='bg-white border border-gray-400 rounded-md shadow-lg' role="listbox">
            <For
              each={Object.entries(props.titles) as [T, string | JSX.Element][]}
            >
              {([id, title]) => (
                <div
                  role="option"
                  aria-selected={getValue() === id}
                  classList={{
                    'bg-uchu-purple-1 hover:bg-uchu-purple-2': getValue() === id,
                  }}
                  class='transition-colors p-1 first:rounded-t-md last:rounded-b-md cursor-pointer hover:bg-gray-100'
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
