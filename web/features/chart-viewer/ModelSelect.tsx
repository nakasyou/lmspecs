import { For, onMount, Show } from 'solid-js'
import { getLMs, Model } from '../../lib/lmspecs/mod.ts'
import { createSignal } from 'solid-js'
import Fuse from 'fuse.js'
import { createMemo } from 'solid-js'
import { createEffect } from 'solid-js'
import {
  Dialog,
  DialogContent,
  DialogOpener,
} from '../../components/Dialog.tsx'

export default function ModelSelect(props: {
  onChange: (models: Model[]) => void
  value: string[]

  mode: 'model' | 'provided'
}) {
  const [getModels, setModels] = createSignal<Record<string, Model>>()
  const [getSelectedModels, setSelectedModels] = createSignal<Set<string>>(
    new Set(props.value)
  )
  const [getSearchQuery, setSearchQuery] = createSignal('')

  let fuse: Fuse<Model> | null = null
  onMount(async () => {
    const models = await getLMs()
    setModels(models)
    fuse = new Fuse(Object.values(models), {
      keys: ['id', 'name'],
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
      result = new Set(fuse.search(searchQuery).map((m) => m.item.id))
    }
    for (const selected of selectedModels) {
      result.delete(selected)
    }
    return result
  })

  createEffect(() => {
    const selectedModels = getSelectedModels()
    const models = getModels()
    if (!models) {
      return
    }
    props.onChange([...selectedModels].map((id) => models[id]).filter(Boolean))
  })

  return (
    <Dialog>
      <DialogOpener>
        <div class='text-uchu-purple-6 dark:text-uchu-purple-2 font-bold'>
          {props.value.length} Selected
        </div>
      </DialogOpener>
      <DialogContent>
        <div class='flex flex-col h-full min-h-0'>
          <div class='font-bold text-xl'>Select Models</div>
          <div class='flex my-2'>
            <input
              value={getSearchQuery()}
              onInput={(e) => setSearchQuery(e.target.value)}
              placeholder='Search query'
              class='border border-uchu-gray-5 p-1 rounded-full'
            />
          </div>
          <div class='grow flex gap-2 w-full min-h-0'>
            <div class='flex-1 overflow-y-auto'>
              <div class='grid grid-cols-1 sm:grid-cols-2 gap-1'>
                <Show when={getSelectedModels()}>
                  {(models) => (
                    <For each={[...models()]}>
                      {(model) => (
                        <div>
                          <div class='flex items-center gap-1'>
                            <button
                              type='button'
                              onClick={() => {
                                setSelectedModels((cur) => {
                                  const newer = new Set([...cur])
                                  newer.delete(model)
                                  return newer
                                })
                              }}
                              class='i-tabler-circle-minus w-5 h-5 flex-none text-uchu-red-6 hover:text-uchu-red-7 transition-colors'
                            />
                            <div class='flex justify-between items-center gap-2 grow'>
                              <div>{getModels()?.[model]?.name}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  )}
                </Show>
                <Show when={getFilteredModels()}>
                  {(models) => (
                    <For each={[...models()]}>
                      {(modelId) => (
                        <div>
                          <div class='flex items-center gap-1'>
                            <button
                              type='button'
                              onClick={() => {
                                setSelectedModels((cur) =>
                                  new Set([...cur, modelId])
                                )
                              }}
                              class='i-tabler-circle-plus w-5 h-5 flex-none text-uchu-purple-6 dark:text-uchu-purple-2 hover:text-uchu-purple-7 transition-colors'
                            />
                            <div class='flex justify-between items-center gap-2 grow'>
                              <div>{getModels()![modelId].name}</div>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
