import {
  createResource,
  createSignal,
  For,
  onMount,
  Show,
  Suspense,
} from 'solid-js'
import { loadModel, Model } from '../../lib/lmspecs/new.ts'
import Spinner from '../../components/Spinner.tsx'
import ModelCard, { ModelContent } from '../model-page/index.tsx'
import ModelList from '../model-list/index.tsx'
import { createEffect } from 'solid-js'

function ColumnContent(props: {
  model: Model
}) {
  return (
    <div>
      <ModelContent lineup modelMeta={props.model.meta} />
    </div>
  )
}
function Column(props: {
  modelId: string
  onRemove?: () => void
}) {
  const [getModel] = createResource(async () => {
    const model = await loadModel(props.modelId)
    return model
  })
  return (
    <div class='w-64 shrink-0 flex flex-col'>
      <div class='flex justify-center'>
        <button
          type='button'
          title='Remove list from this model'
          class='p-1 w-8 h-8 rounded-full border border-gray-100'
        >
          <div
            onClick={props.onRemove}
            class='i-tabler-trash-x w-full h-full bg-gray-500'
          />
        </button>
      </div>
      <Suspense fallback={<Spinner />}>
        <Show when={getModel()}>
          {(getModel) => <ColumnContent model={getModel()} />}
        </Show>
      </Suspense>
    </div>
  )
}
export default function Lineup() {
  const [getModels, setModels] = createSignal<string[]>([])
  let containerRef!: HTMLDivElement

  onMount(() => {
    if (location.hash.startsWith('#')) {
      const models = location.hash.slice(1).split(',')
      setModels(models)
    }
    // update
    addEventListener('hashchange', () => {
      if (location.hash.startsWith('#')) {
        const models = location.hash.slice(1).split(',')
        setModels(models)
      }
    })
  })
  createEffect(() => {
    location.hash = getModels().join(',')
  })

  return (
    <div class='h-dvh overflow-scroll p-8 max-w-auto' ref={containerRef}>
      <div class='fixed top-0 left-0'>
        <a href='/' class='flex items-center p-2'>
          <span class='i-tabler-chevron-left w-6 h-6 shrink-0 bg-slate-500 dark:bg-slate-300' />
          <div class='text-slate-500 dark:text-slate-300'>Home</div>
        </a>
      </div>
      <div class='flex gap-8 shrink-0'>
        <For each={getModels()}>
          {(modelId) => (
            <Column
              onRemove={() =>
                setModels((prev) => prev.filter((id) => id !== modelId))}
              modelId={modelId}
            />
          )}
        </For>
        <div class='shrink-0 w-[90dvw] flex flex-col gap-2'>
          <div class='text-2xl text-slate-7000 font-bold'>Add a model</div>
          <ModelList
            exclude={getModels()}
            onClick={(modelId) => {
              setModels((prev) => [...prev, modelId])
              requestAnimationFrame(() => {
                containerRef.scrollTo({
                  left: containerRef.scrollWidth,
                  behavior: 'smooth',
                })
              })
            }}
          />
        </div>
      </div>
    </div>
  )
}
