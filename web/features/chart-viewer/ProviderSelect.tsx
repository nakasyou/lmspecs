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

const PROVIDER_IMPORTS = import.meta.glob('../../../providers/*/meta.json')

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
    return result
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
      <DialogOpener class='text-left text-uchu-purple-6 dark:text-uchu-purple-2 font-bold'>
        <div>Providers</div>
        <div class='text-sm text-uchu-purple-5 dark:text-uchu-purple-3'>
          ({getSelectedProviders().size} selected)
        </div>
      </DialogOpener>
      <DialogContent>
        <div class='flex flex-col max-h-full h-full'>
          <div class='text-xl font-bold mb-4'>Select providers</div>
          <input
            value={getSearchQuery()}
            onInput={(e) => setSearchQuery(e.target.value)}
            placeholder='Search providers'
            class='border border-uchu-gray-5 p-2 rounded-md w-full focus:outline-none focus:border-uchu-purple-6 transition-colors'
          />
          <div class='grow'>
            <For each={getAvailableProviders()}>
              {(providerId) => (
                <div class='flex items-center gap-1'>
                  <button type="button" class="w-6 h-6" onClick={() => {
                    setSelectedProviders(cur => {
                      const providers = new Set([...cur])
                      if (providers.has(providerId)) {
                        providers.delete(providerId)
                      } else {
                        providers.add(providerId)
                      }
                      console.log(providers)
                      return providers
                    })
                  }} classList={{
                    'i-tabler-check bg-uchu-purple-6': getSelectedProviders().has(providerId),
                    'i-tabler-minus bg-uchu-red-6': !getSelectedProviders().has(providerId),
                  }}></button>
                  <div>{providerId}</div>
                </div>
              )}
            </For>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
