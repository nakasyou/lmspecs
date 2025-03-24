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
    const providers = getProviders()
    providers && setSelectedProviders(new Set(Object.keys(providers)))
  })

  createEffect(() => {
    props.onChange(getSelectedProviders())
  })

  return (
    <Dialog>
      <DialogOpener class='text-left text-uchu-purple-6 font-bold'>
        <div>Providers</div>
        <div class="text-sm text-uchu-purple-5">({getSelectedProviders().size} selected)</div>
      </DialogOpener>
      <DialogContent>
        <div class='p-3'>
          <div class='text-xl font-bold mb-4'>Provider Selector</div>
          <div class='grid md:grid-cols-2 gap-4'>
            <div class='border border-uchu-gray-5 rounded-md p-3'>
              <div class='font-bold text-lg mb-2'>
                Available Providers
              </div>
              <div class='mb-3'>
                <input
                  value={getSearchQuery()}
                  onInput={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search providers'
                  class='border border-uchu-gray-5 p-2 rounded-md w-full focus:outline-none focus:border-uchu-purple-6 transition-colors'
                />
              </div>
              <div class='space-y-2 max-h-[40vh] overflow-y-auto'>
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
                            class='i-tabler-circle-plus w-5 h-5 text-uchu-purple-6 hover:text-uchu-purple-7 transition-colors'
                          />
                          <div class="text-uchu-gray-9">{getProviders()![providerId].name}</div>
                        </div>
                      )}
                    </For>
                  </Show>
                </Show>
              </div>
            </div>
            <div class='border border-uchu-gray-5 rounded-md p-3'>
              <div class='font-bold text-lg mb-2'>
                Selected Providers ({getSelectedProviders().size})
              </div>
              <div class='space-y-2 max-h-[40vh] overflow-y-auto'>
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
                          class='i-tabler-circle-minus w-5 h-5 flex-none text-uchu-red-6 hover:text-uchu-red-7 transition-colors'
                          />
                        <div class="text-uchu-gray-9">{getProviders()![providerId].name}</div>
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
