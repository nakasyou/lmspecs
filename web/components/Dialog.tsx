import { createContext, type JSX, Show } from 'solid-js'
import { useContext } from 'solid-js'
import { createStore, type SetStoreFunction, type Store } from 'solid-js/store'
import { createSignal } from 'solid-js'

interface DialogData {
  opener?: JSX.Element
  content?: JSX.Element
  open: () => void
  close: () => void
}
const context = createContext<
  [Store<DialogData>, SetStoreFunction<DialogData>]
>()

export function DialogContent(props: {
  children: JSX.Element | JSX.Element[]
}) {
  const [_getStore, setStore] = useContext(context)!
  setStore('content', props.children)
  return null
}
export function DialogOpener(
  props: {
    children: JSX.Element | JSX.Element[]
  } & JSX.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const [store, setStore] = useContext(context)!
  setStore(
    'opener',
    <button
      type="button"
      {...props}
      onClick={() => {
        store.open()
      }}
    >
      {props.children}
    </button>,
  )
  return null
}
export function DialogCloseButton(
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const [store] = useContext(context)!
  return <button type="button" {...props} onClick={() => store.close()}></button>
}

export function Dialog(props: {
  children: JSX.Element[] | JSX.Element
}) {
  const open = () => {
    setIsShown(true)
    requestAnimationFrame(() => setIsRealShown(true))
  }
  const close = () => {
    setIsRealShown(false)
    setTimeout(() => setIsShown(false), 500)
  }
  const data = createStore<DialogData>({
    open() {
      open()
    },
    close() {
      close()
    },
  })
  const [getIsShown, setIsShown] = createSignal(false)
  const [getIsRealShown, setIsRealShown] = createSignal(false)

  return (
    <context.Provider value={data}>
      {props.children}
      {data[0].opener}
      <Show when={getIsShown()}>
        <dialog
          class='fixed w-full h-dvh top-0 left-0 grid place-items-center transition-colors'
          classList={{
            'bg-black/50': getIsRealShown(),
            'bg-transparent': !getIsRealShown(),
          }}
          onClick={(evt) => {
            if (evt.target === evt.currentTarget) {
              close()
            }
          }}
        >
          <div
            class='w-3xl max-w-[90dvw] h-96 max-h-[95dvh] bg-white p-2 border border-gray-300 rounded-md transition-transform'
            classList={{
              'scale-100': getIsRealShown(),
              'scale-0': !getIsRealShown(),
            }}
          >
            {data[0].content}
          </div>
        </dialog>
      </Show>
    </context.Provider>
  )
}
