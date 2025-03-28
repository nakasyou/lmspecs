import Header from '../header/index.tsx'
import { Model } from '../../lib/lmspecs/new.ts'
import {
  createMemo,
  createResource,
  createSignal,
  For,
  Show,
  Suspense,
} from 'solid-js'
import ModelCard from './ModelCard.tsx'
import Spinner from '../../components/Spinner.tsx'
import { onMount } from 'solid-js'
import Fuse from 'fuse.js'
import { createEffect } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Select } from '../../components/Select.tsx'

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
      <span class='text-sm text-gray-700 select-none'>{props.children}</span>
    </label>
  )
}

type SortMode = 'A_TO_Z' | 'Z_TO_A' | 'NEW_TO_OLD' | 'OLD_TO_NEW' | 'MATCHED'

function SeatchBox(props: {
  onResult: (results: string[]) => void
}) {
  const [getModels] = createResource(async () => {
    const models = (await Promise.all(
      Model.listModelIds().flatMap((id) => Model.load(id)),
    )).filter((v) => !!v)
    advancedFuse = new Fuse(models, {
      keys: ['meta.name', 'meta.id', 'meta.creators', 'meta.published_at'],
    })
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
  let advancedFuse: Fuse<Model> | null = null
  onMount(() => {
    fuse = new Fuse(Model.listModelIds())
  })

  const getFilteredModels = createMemo(() => {
    const models = getModels()
    const query = getQuery()
    const sortMode = getSortMode()

    if (!models) {
      // fetching data
      // advanced filter is disabled
      if (!query) {
        return Model.listModelIds()
      }
      return fuse.search(query).map((r) => r.item)
    }
    if (!advancedFuse) {
      return []
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

    let result = query === '' ? [...models] : advancedFuse.search(query).map(r => r.item)

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
      <div class='flex gap-3 h-13'>
        <div class="flex flex-col justify-between grow">
          <div class='text-xs font-bold text-gray-500'>SEARCH QUERY</div>
          <input
            class='border p-1 rounded-lg border-uchu-gray-4'
            placeholder='Search Models'
            value={getQuery()}
            onInput={(e) => setQuery(e.target.value)}
          />
        </div>

        <div class='shrink-0 flex flex-col justify-between'>
          <div class='text-xs font-bold text-gray-500'>SORT BY</div>
          <Select
            titles={{
              A_TO_Z: 'name (A-Z)',
              Z_TO_A: 'name (Z-A)',
              NEW_TO_OLD: 'Newest',
              OLD_TO_NEW: 'Oldest',
              MATCHED: 'Relevance',
            }}
            value='MATCHED'
            onChange={(v) => setSortMode(v)}
            class='w-30'
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
export default function ModelList() {
  const [getFilteredModelIds, setFilteredModelIds] = createSignal<string[]>([])
  return (
    <>
      <Header sticky />
      <div class='p-8'>
        <div class='max-w-256 mx-auto flex flex-col gap-2'>
          <div class='text-2xl text-slate-7000 font-bold'>Find models</div>
          <SeatchBox onResult={setFilteredModelIds} />
          <div class='grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3'>
            <For each={getFilteredModelIds()}>
              {(modelId) => (
                <a href={`/model/${modelId}`}>
                  <ModelCard id={modelId} />
                </a>
              )}
            </For>
          </div>
        </div>
      </div>
    </>
  )
}
