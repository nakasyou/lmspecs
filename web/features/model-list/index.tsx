import Header from '../header/index.tsx'
import { listModelIds, loadModel, type Model } from '../../lib/lmspecs/new.ts'
import {
  createMemo,
  createResource,
  createSignal,
  For,
  onMount,
  Show,
  Suspense,
} from 'solid-js'
import ModelCard from './ModelCard.tsx'
import Spinner from '../../components/Spinner.tsx'
import Fuse from 'fuse.js'
import { createEffect } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Select } from '../../components/Select.tsx'
import { Dynamic } from 'solid-js/web'

function FilterCheckBox(props: {
  children: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}) {
  return (
    <label class='flex items-center gap-2'>
      <input
        type='checkbox'
        class='relative bottom-0.5'
        checked={props.checked}
        onChange={(e) => {
          if (props.onChange) {
            props.onChange(e.target.checked)
          }
        }}
      />
      <span class='text-sm text-gray-700 dark:text-gray-300 select-none'>
        {props.children}
      </span>
    </label>
  )
}

type SortMode = 'A_TO_Z' | 'Z_TO_A' | 'NEW_TO_OLD' | 'OLD_TO_NEW' | 'MATCHED'

function SeatchBox(props: {
  onResult: (results: string[]) => void
  exclude?: string[]
}) {
  const [getModels] = createResource(async () => {
    const models = (await Promise.all(
      listModelIds().flatMap((id) => loadModel(id)),
    )).filter((v) => !!v)
    return models
  })
  const [getQuery, setQuery] = createSignal('')
  const [filters, setFilters] = createStore({
    showDepreacted: false,
    showExperimental: true,
    reasoningModelOnly: false,
    openModelOnly: false,
  })
  const [getSortMode, setSortMode] = createSignal<SortMode>('MATCHED')

  let fuse: Fuse<string>
  const [getAdvancedFuse, setAdvancedFuse] = createSignal<Fuse<Model> | null>(
    null,
  )

  onMount(() => {
    fuse = new Fuse(listModelIds())
  })

  createEffect(() => {
    const models = getModels()
    if (!models) {
      return
    }
    setAdvancedFuse(
      new Fuse(models, {
        keys: ['meta.name', 'meta.id', 'meta.creators', 'meta.published_at'],
      }),
    )
  })
  const getExclude = createMemo(() => new Set(props.exclude ?? []))

  const getFilteredModels = createMemo(() => {
    const models = getModels()
    const query = getQuery()
    const sortMode = getSortMode()
    const advancedFuse = getAdvancedFuse()

    if (!models) {
      // fetching data
      // advanced filter is disabled
      if (!query) {
        return listModelIds().filter((id) => !getExclude().has(id))
      }
      return fuse.search(query).map((r) => r.item).filter((id) => !getExclude().has(id))
    }
    if (!advancedFuse) {
      return listModelIds().filter((id) => !getExclude().has(id))
    }
    const filteredModels = new Set(
      models.filter((model) => {
        const state = Object.values(model.meta.states).at(-1) ?? []
        if (!filters.showDepreacted && state.includes('DEPRECATED')) {
          return false
        }
        if (!filters.showExperimental && state.includes('EXPERIMENTAL')) {
          return false
        }
        if (
          filters.reasoningModelOnly &&
          !model.meta.features.value.includes('REASONING')
        ) {
          return false
        }
        if (
          filters.openModelOnly && model.meta.license.value === 'Proprietary'
        ) {
          return false
        }
        return true
      }).map((model) => model.meta.id),
    )

    let result = query === ''
      ? [...models]
      : advancedFuse.search(query).map((r) => r.item)

    if (sortMode === 'A_TO_Z') {
      result = result.sort((a, b) => {
        if (a.meta.name < b.meta.name) {
          return -1
        }
        if (a.meta.name > b.meta.name) {
          return 1
        }
        return 0
      })
    }
    if (sortMode === 'Z_TO_A') {
      result = result.sort((a, b) => {
        if (a.meta.name > b.meta.name) {
          return -1
        }
        if (a.meta.name < b.meta.name) {
          return 1
        }
        return 0
      })
    }
    if (sortMode === 'NEW_TO_OLD') {
      result = result.sort((a, b) => {
        const aDate = new Date(a.meta.published_at.value).getTime()
        const bDate = new Date(b.meta.published_at.value).getTime()
        return bDate - aDate
      })
    }
    if (sortMode === 'OLD_TO_NEW') {
      result = result.sort((a, b) => {
        const aDate = new Date(a.meta.published_at.value).getTime()
        const bDate = new Date(b.meta.published_at.value).getTime()
        return aDate - bDate
      })
    }

    return result.flatMap((r) => {
      if (getExclude().has(r.meta.id)) {
        return []
      }
      if (filteredModels.has(r.meta.id)) {
        return r.meta.id
      }
      return []
    })
  })

  createEffect(() => {
    props.onResult(getFilteredModels())
  })

  return (
    <div class='flex flex-col gap-2'>
      <div class='flex h-auto flex-col xs:h-13 xs:flex-row gap-3 min-w-0'>
        <div class='flex flex-col justify-between grow'>
          <div class='text-xs font-bold text-gray-500 dark:text-gray-300'>
            SEARCH QUERY
          </div>
          <input
            class='border p-1 rounded-lg border-uchu-gray-4 min-w-0'
            placeholder='Search Models'
            value={getQuery()}
            onInput={(e) => setQuery(e.target.value)}
          />
        </div>
        <div class='shrink-0 flex flex-col justify-between'>
          <div class='text-xs font-bold text-gray-500 dark:text-gray-300'>
            SORT BY
          </div>
          <Select
            titles={{
              A_TO_Z: 'A-Z',
              Z_TO_A: 'Z-A',
              NEW_TO_OLD: 'Newest',
              OLD_TO_NEW: 'Oldest',
              MATCHED: 'Relevance',
            }}
            value='MATCHED'
            onChange={(v) => setSortMode(v)}
            class='w-25'
          />
        </div>
      </div>
      <Suspense
        fallback={
          <div class='flex items-center gap-2 h-20'>
            <Spinner class='w-6 h-6' />
            <div>Fetching data for additional filters...</div>
          </div>
        }
      >
        <Show when={getModels()}>
          <div class='grid grid-cols-2 md:grid-cols-4'>
            <FilterCheckBox
              checked={filters.showExperimental}
              onChange={(v) => setFilters('showExperimental', v)}
            >
              Show experimental
            </FilterCheckBox>
            <FilterCheckBox
              checked={filters.showDepreacted}
              onChange={(v) => setFilters('showDepreacted', v)}
            >
              Show depreacted
            </FilterCheckBox>
            <FilterCheckBox
              checked={filters.reasoningModelOnly}
              onChange={(v) => setFilters('reasoningModelOnly', v)}
            >
              Reasoning model only
            </FilterCheckBox>
            <FilterCheckBox
              checked={filters.openModelOnly}
              onChange={(v) => setFilters('openModelOnly', v)}
            >
              Open model only
            </FilterCheckBox>
          </div>
        </Show>
      </Suspense>
    </div>
  )
}
export default function ModelList(props: {
  onClick?: (modelId: string) => void
  exclude?: string[]
}) {
  const [getFilteredModelIds, setFilteredModelIds] = createSignal<string[]>(
    listModelIds(),
  )
  return (
    <>
      <div class='flex flex-col gap-2'>
        <SeatchBox exclude={props.exclude} onResult={setFilteredModelIds} />
        <div class='shrink-0 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3'>
          <For each={getFilteredModelIds()}>
            {(modelId) => (
              <Dynamic onClick={() => props.onClick?.(modelId)} component={props.onClick ? 'button' : 'a'} href={`/model/${modelId}`}>
                <ModelCard id={modelId} />
              </Dynamic>
            )}
          </For>
        </div>
      </div>
    </>
  )
}
