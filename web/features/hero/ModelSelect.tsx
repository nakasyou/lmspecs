import { For, onMount, Show } from 'solid-js'
import { getLMs, Model } from '../../lib/lmspecs/mod.ts'
import { createSignal } from 'solid-js'
import Fuse from 'fuse.js'
import { createMemo } from 'solid-js'
import { createEffect } from 'solid-js'

export default function ModelSelect(props: {
  onChange: (models: Model[]) => void
}) {
  const [getModels, setModels] = createSignal<Record<string, Model>>()
  const [getSelectedModels, setSelectedModels] = createSignal<Set<string>>(
    new Set(),
  )
  const [getSearchQuery, setSearchQuery] = createSignal('')

  let fuse: Fuse<Model> | null = null
  onMount(async () => {
    const models = await getLMs()
    setModels(models)
    fuse = new Fuse(Object.values(models), {
      keys: ['id', 'name']
    })
  })
  const getFilteredModels = createMemo(() => {
    const selectedModels = getSelectedModels()
    const searchQuery = getSearchQuery()

    if (!getModels()) {
      return null
    }
    let result = new Set(Object.keys(getModels()!))
    if (fuse && searchQuery) {
      result = new Set(fuse.search(searchQuery).map(m => m.item.id))
    }
    for (const selected of selectedModels) {
      result.delete(selected)
    }
    return result
  })

  createEffect(() => {
    props.onChange([...getSelectedModels()].map(id => getModels()![id]))
  })

  return (
    <div class='flex gap-2 max-h-dvh h-100'>
      <div class="w-150">
        <div class="flex my-2">
          <input value={getSearchQuery()} onInput={(e) => setSearchQuery(e.target.value)} placeholder='Search query' class="border border-uchu-gray-5 p-1 rounded-full" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <Show when={getFilteredModels()}>{models => <For each={[...models()]}>{modelId => <div class="flex items-center gap-1">
            <button type="button" onClick={() => {
              setSelectedModels((cur) => new Set([...cur, modelId]))
            }} class='i-tabler-circle-plus w-5 h-5' />
            <div>{getModels()![modelId].name}</div>
          </div>}</For>}</Show>
        </div>
      </div>
      <div>
        <div class='font-bold'>
          Selected Models ({getSelectedModels().size})
        </div>
        <div class="w-70">
          <Show when={getSelectedModels()}>
            {(models) => (
              <For each={[...models()]}>
                {(model) => (
                  <div class='flex items-center gap-2'>
                    <button type='button' onClick={() => {
                      setSelectedModels((cur) => {
                        const newer = new Set([...cur])
                        newer.delete(model)
                        return newer
                      })
                    }} class='i-tabler-circle-minus w-5 h-5 flex-none' />
                    <div class='flex justify-between items-center gap-2 grow'>
                      <div>{getModels()![model].name}</div>
                      <div class='text-sm text-uchu-gray-8'>
                        {getModels()![model].creator.join('/')}
                      </div>
                    </div>
                  </div>
                )}
              </For>
            )}
          </Show>
        </div>
      </div>
    </div>
  )
}
