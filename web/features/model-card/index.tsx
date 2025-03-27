import { createResource } from 'solid-js'
import { ModelMeta } from '../../lib/lmspecs/types.ts'
import Header from '../header/index.tsx'
import { useParams } from '@solidjs/router'
import { Suspense } from 'solid-js'
import { Show } from 'solid-js'
import { JSX } from 'solid-js'
import { formatTokenUnit } from '../../lib/math.ts'
import { For } from 'solid-js'

const MODEL_INFO = import.meta.glob('../../../models/**/*')
const ASSETS = import.meta.glob('../../../assets/*/*')
const getModelMeta = async (modelId: string): Promise<ModelMeta> => {
  const metaPath = `../../../models/${modelId}/meta.json`
  const mod = await MODEL_INFO[metaPath]() as { default: ModelMeta }

  return mod.default as ModelMeta
}
const getAssetURL = async (assetId: string): Promise<string> => {
  const mod = await ASSETS[`../../../assets/${assetId}`]() as {
    default: string
  }
  return mod.default as string
}

const COMPANY_IMAGES = {
  Google: 'google-icon/image.svg',
} as Record<string, string>

function CreatedBy(props: {
  modelMeta: ModelMeta
}) {
  const [getCreatorImages] = createResource(async () => {
    const imageIds = props.modelMeta.creators.map((creator) =>
      COMPANY_IMAGES[creator]
    ).filter(Boolean)
    const images = await Promise.all(imageIds.map(getAssetURL))
    return images
  })
  return (
    <div class='flex flex-col gap-1'>
      <div class='text-slate-500 text-sm'>Created by</div>
      <Suspense>
        <div class='flex gap-2'>
          <For each={getCreatorImages() ?? []}>
            {(image) => (
              <div>
                <img class='w-8 h-8' src={image} />
              </div>
            )}
          </For>
        </div>
      </Suspense>
    </div>
  )
}
function ModelTitle(props: {
  modelMeta: ModelMeta
}) {
  const [getModelLogo] = createResource(() => {
    const id = props.modelMeta.logos?.[0]
    if (!id) return ''
    return getAssetURL(id)
  })
  return (
    <div class='flex gap-4'>
      <div class='flex flex-col gap-2'>
        <div>
          <Suspense>
            <img
              crossorigin='anonymous'
              src={getModelLogo()}
              class='w-16 h-16'
            />
          </Suspense>
        </div>
        <div>
          <div class='text-lg font-bold'>
            {props.modelMeta.name}
          </div>
          <div class='text-uchu-gray-7 font-mono'>{props.modelMeta.id}</div>
        </div>
      </div>
      <div class='h-12 w-[1px] bg-gray-100 hidden md:block self-center' />
      <div class='flex items-center'>
        <CreatedBy modelMeta={props.modelMeta} />
      </div>
    </div>
  )
}
function ModelSummaryCard(props: {
  title: string
  shortDesc: string
  children: JSX.Element
}) {
  return (
    <div class='flex flex-col gap-2 justify-between items-center grow flex-1 '>
      <div class='text-gray-400 text-center font-bold text-xs'>
        {props.title}
      </div>
      <div>{props.children}</div>
      <div class='text-sm text-uchu-gray-7 text-center'>{props.shortDesc}</div>
    </div>
  )
}
function MultiModalitiesIcons(props: {
  modalities: ModelMeta['multimodalities']['input']
}) {
  return (
    <div class='grid grid-cols-4 justify-center gap-2'>
      <div
        class='w-5 h-5'
        classList={{
          'i-tabler-notes-off bg-gray-500': !props.modalities.includes('text'),
          'i-tabler-notes bg-gray-800': props.modalities.includes('text'),
        }}
      />
      <div
        class='w-5 h-5'
        classList={{
          'i-tabler-photo-off bg-gray-500': !props.modalities.includes('image'),
          'i-tabler-photo bg-gray-800': props.modalities
            .includes('image'),
        }}
      />
      <div
        class='w-5 h-5'
        classList={{
          'i-tabler-music-off bg-gray-500': !props.modalities.includes('audio'),
          'i-tabler-music bg-gray-800': props.modalities.includes('audio'),
        }}
      />
      <div
        class='w-5 h-5'
        classList={{
          'i-tabler-movie-off bg-gray-500': !props.modalities.includes('video'),
          'i-tabler-movie bg-gray-800': props.modalities.includes('video'),
        }}
      />
    </div>
  )
}
function ModelSummary(props: {
  modelMeta: ModelMeta
}) {
  return (
    <div class='border justify-between border-uchu-gray-4 rounded-lg flex gap-2 p-3'>
      <ModelSummaryCard
        title='CONTEXT WINDOW'
        shortDesc={`${props.modelMeta.token_limit.input.toString()} Tokens`}
      >
        <div class='text-lg font-bold text-gray-700'>
          {formatTokenUnit(props.modelMeta.token_limit.input)}
        </div>
      </ModelSummaryCard>
      <div class='h-12 w-[1px] bg-gray-100 hidden md:block self-center' />
      <ModelSummaryCard
        title='LICENSE'
        shortDesc=''
      >
        <div class='text-lg font-bold text-gray-700'>
          {props.modelMeta.license.value}
        </div>
      </ModelSummaryCard>
      <div class='h-12 w-[1px] bg-gray-100 hidden md:block self-center' />
      <ModelSummaryCard
        title='INPUT'
        shortDesc={props.modelMeta.multimodalities.input.join('・')}
      >
        <div class='flex justify-center'>
          <MultiModalitiesIcons
            modalities={props.modelMeta.multimodalities.input}
          />
        </div>
      </ModelSummaryCard>
      <div class='h-12 w-[1px] bg-gray-100 hidden md:block self-center' />
      <ModelSummaryCard
        title='OUTPUT'
        shortDesc={props.modelMeta.multimodalities.output.join('・')}
      >
        <div class='flex justify-center'>
          <MultiModalitiesIcons
            modalities={props.modelMeta.multimodalities.output}
          />
        </div>
      </ModelSummaryCard>
    </div>
  )
}

const formatter = new Intl.DateTimeFormat('en-us', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
function ModelSpec(props: {
  key: string
  children: JSX.Element
  class?: string
  sources?: string[]
}) {
  return (
    <div class={'flex flex-col' + (props.class ?? '')}>
      <div class='flex justify-between'>
        <div>
          <div class='font-bold text-slate-800'>{props.key}</div>
        </div>
        <div class='text-slate-700'>{props.children}</div>
      </div>
      <Show when={props.sources}>
        <SpecSources sources={props.sources ?? []} />
      </Show>
    </div>
  )
}
function SpecSources(props: {
  sources: string[]
}) {
  return (
    <details>
      <summary class='text-sm text-gray-700'>
        {props.sources.length === 1
          ? '1 source'
          : props.sources.length + ' sources'}
      </summary>
      <ul class='list-disc list-inside ml-1 pl-4 border-l-4 border-uchu-gray-6'>
        <For each={props.sources}>
          {(source) => (
            <li class='text-xs'>
              <a
                href={source}
                target='_blank'
                rel='noreferrer noopener'
                class='text-uchu-blue-5 hover:text-uchu-blue-4'
              >
                {source}
              </a>
            </li>
          )}
        </For>
      </ul>
    </details>
  )
}

function ModelSpecs(props: {
  modelMeta: ModelMeta
}) {
  return (
    <div class='flex flex-col gap-2'>
      <div class='grid grid-cols-2 gap-y-3 gap-x-10'>
        <ModelSpec key='ID'>
          <div class='font-mono'>
            {props.modelMeta.id}
          </div>
        </ModelSpec>
        <ModelSpec key='Model Name'>
          {props.modelMeta.name}
        </ModelSpec>
        <ModelSpec key='Creators'>
          <div class='break-words'>
            {props.modelMeta.creators.join(', ')}
          </div>
        </ModelSpec>
        <ModelSpec
          key='Knowledge Cutoff'
          sources={props.modelMeta.cutoff_date?.sources}
        >
          {props.modelMeta.cutoff_date
            ? formatter.format(new Date(props.modelMeta.cutoff_date.value))
            : 'Unknown'}
        </ModelSpec>
        <ModelSpec
          key='Context Window'
          sources={props.modelMeta.token_limit.sources}
        >
          <div class='break-words'>
            {props.modelMeta.token_limit.input} Tokens
          </div>
        </ModelSpec>
        <Show when={props.modelMeta.token_limit.output}>
          <ModelSpec
            key='Max Output Length'
            sources={props.modelMeta.token_limit.sources}
          >
            <div class='break-words'>
              {props.modelMeta.token_limit.output} Tokens
            </div>
          </ModelSpec>
        </Show>
        <ModelSpec key='Published Date'>
          {formatter.format(new Date(props.modelMeta.published))}
        </ModelSpec>
        <ModelSpec key='Multimodalities'>
          {formatter.format(new Date(props.modelMeta.published))}
        </ModelSpec>
      </div>
    </div>
  )
}

function ModelContent(props: {
  modelMeta: ModelMeta
}) {
  return (
    <div class='flex flex-col gap-4'>
      <ModelTitle modelMeta={props.modelMeta} />
      <ModelSummary modelMeta={props.modelMeta} />
      <ModelSpecs modelMeta={props.modelMeta} />
    </div>
  )
}

export default function ModelCard() {
  const params = useParams()
  const [modelMeta] = createResource(() => getModelMeta(params.modelId))

  return (
    <div>
      <Header sticky />
      <div class='p-8'>
        <Suspense fallback={<div>Loading...</div>}>
          <Show when={modelMeta()}>
            {(modelMeta) => <ModelContent modelMeta={modelMeta()} />}
          </Show>
        </Suspense>
      </div>
    </div>
  )
}
