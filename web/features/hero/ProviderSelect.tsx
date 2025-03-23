import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  onMount,
  Show,
} from 'solid-js'
import Fuse from 'fuse.js'
import {
  Dialog,
  DialogContent,
  DialogOpener,
} from '../../components/Dialog.tsx'

const PROVIDER_IMPORTS = import.meta.glob('../../../provided/*/meta.json')

interface Provider {
  id: string
  name: string
}
export default function ProviderSelect(props: {
  onChange: (providers: Set<string>) => void
}) {
  const [getProviders] = createResource(async () => {
    const providers: Record<string, Provider> = Object.fromEntries(
      await Promise.all(
        Object.values(PROVIDER_IMPORTS).map(async (importit) => {
          const provider = (await importit() as { default: Provider }).default
          return [provider.id, provider]
        }),
      ),
    )
    return providers
  })
  const [getSelectedProviders, setSelectedProviders] = createSignal<
    Set<string>
  >(new Set())
  const [getSearchQuery, setSearchQuery] = createSignal('')
  const getAvailableProviders = createMemo(() => {
    const selectedProviders = getSelectedProviders()
    if (!getProviders()) {
      return [] as string[]
    }
    let result: string[] = Object.keys(getProviders()!)
    const searchQuery = getSearchQuery().trim()
    if (searchQuery !== '') {
      const fuse = new Fuse(Object.values(getProviders()!), {
        keys: ['id', 'name'],
      })
      result = fuse.search(searchQuery).map((m) => m.item.id)
    }
    return result.filter((providerId) => !selectedProviders.has(providerId))
  })

  createEffect(() => {
    props.onChange(getSelectedProviders())
  })

  return (
    <Dialog>
      <DialogOpener class='text-left text-uchu-purple-6 font-bold'>
        {getSelectedProviders().size} selected
      </DialogOpener>
      <DialogContent>
        <div class='max-w-screen max-h-screen h-60 w-96'>
          <div class='flex gap-4'>
            <div class='w-1/2 h-full'>
              <div class='font-bold mb-2'>
                Available Providers
              </div>
              <div class='flex my-2'>
                <input
                  value={getSearchQuery()}
                  onInput={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search providers'
                  class='border border-uchu-gray-5 p-1 rounded-full w-full'
                />
              </div>
              <div class='grid grid-cols-1 gap-2 overflow-y-auto'>
                <Show
                  when={!getProviders.loading}
                  fallback={<div>Loading...</div>}
                >
                  <Show when={getAvailableProviders().length > 0} fallback='All providers selected'>
                    <For each={getAvailableProviders()}>
                      {(providerId: string) => (
                        <div class='flex items-center gap-1'>
                          <button
                            type='button'
                            onClick={() => {
                              setSelectedProviders((cur) =>
                                new Set([...cur, providerId])
                              )
                            }}
                            class='i-tabler-circle-plus w-5 h-5'
                          />
                          <div>{getProviders()![providerId].name}</div>
                        </div>
                      )}
                    </For>
                  </Show>
                </Show>
              </div>
            </div>
            <div class='w-1/2'>
              <div class='font-bold'>
                Selected Providers ({getSelectedProviders().size})
              </div>
              <div class='grid grid-cols-1 gap-2 overflow-y-auto'>
                <Show when={getSelectedProviders().size > 0} fallback='No providers selected'>
                  <For each={[...getSelectedProviders()]}>
                    {(providerId: string) => (
                      <div class='flex items-center gap-2'>
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedProviders((cur) => {
                              const newer = new Set([...cur])
                              newer.delete(providerId)
                              return newer
                            })
                          }}
                          class='i-tabler-circle-minus w-5 h-5 flex-none'
                        />
                        <div>{getProviders()![providerId].name}</div>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
