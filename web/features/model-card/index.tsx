import { createResource } from 'solid-js'
import Header from '../header/index.tsx'
import { useParams } from '@solidjs/router'
import { Suspense } from 'solid-js'
import { Show } from 'solid-js'
import { JSX } from 'solid-js'
import { formatTokenUnit } from '../../lib/math.ts'
import { For } from 'solid-js'
import { InferOutput } from 'valibot'
import modelMetaSchema from '../../../schema/models/meta.ts'
import CopyButton from '../../components/CopyButton.tsx'
import { createMemo } from 'solid-js'

type ModelMeta = InferOutput<typeof modelMetaSchema>

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
      <div class='text-slate-500 text-sm flex gap-1 items-center'>
        <div>Created by</div>
        <CopyButton
          content={JSON.stringify(props.modelMeta.creators)}
          class='w-4 h-4 bg-slate-500'
        />
      </div>
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
    <div class='flex gap-4 flex-col sm:flex-row'>
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
          <div class='flex gap-2 items-center justify-start'>
            <div class='text-lg font-bold'>{props.modelMeta.name}</div>
            <CopyButton content={props.modelMeta.name} class='w-5 h-5' />
          </div>
          <div class='flex gap-1 items-center'>
            <div class='text-uchu-gray-7 font-mono'>{props.modelMeta.id}</div>
            <CopyButton
              content={props.modelMeta.id}
              class='w-4 h-4 bg-uchu-gray-7'
            />
          </div>
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
        shortDesc={`${props.modelMeta.token_limit?.input.toString()} Tokens`}
      >
        <div class='text-lg font-bold text-gray-700'>
          {formatTokenUnit(props.modelMeta.token_limit?.input ?? 0)}
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
  references?: {
    url: string
    retrieved: string
  }[]
  iconClass: string
  contentToCopy: string
}) {
  return (
    <div class={'flex flex-col flex-1 ' + (props.class ?? '')}>
      <div class='flex justify-between flex-col sm:flex-row gap-1'>
        <div class='flex gap-1 items-center'>
          <div
            class={'w-6 h-6 bg-slate-800 relative bottom-[2px] ' +
              props.iconClass}
          />
          <div class='font-bold text-slate-800'>{props.key}</div>
        </div>
        <div class='flex gap-1'>
          <div class='text-slate-700'>{props.children}</div>
          <CopyButton
            content={props.contentToCopy}
            class='w-4 h-4 text-slate-500'
          />
        </div>
      </div>
      <div class=''>
        <Show when={props.references}>
          <SpecReferences references={props.references ?? []} />
        </Show>
      </div>
    </div>
  )
}
function SpecReferences(props: {
  references: {
    url: string
    retrieved: string
  }[]
}) {
  return (
    <details>
      <summary class='text-xs text-gray-600'>
        {props.references.length === 1
          ? '1 reference'
          : props.references.length + ' references'}
      </summary>
      <ul class='list-disc list-inside ml-1 pl-4 border-l-4 border-uchu-gray-6'>
        <For each={props.references}>
          {(reference) => (
            <li class='text-xs'>
              <a
                href={reference.url}
                target='_blank'
                rel='noreferrer noopener'
                class='text-uchu-blue-5 hover:text-uchu-blue-4'
              >
                {reference.url}{' '}
                ({formatter.format(new Date(reference.retrieved))})
              </a>
            </li>
          )}
        </For>
      </ul>
    </details>
  )
}
function MultimodalityCard(props: {
  onIcon: string
  offIcon: string

  name: string
  input: boolean
  output: boolean
}) {
  const getText = createMemo(() => {
    if (props.input && props.output) {
      return 'Input and output'
    }
    if (props.input) {
      return 'Input only'
    }
    if (props.output) {
      return 'Output only'
    }
    return 'Not supported'
  })
  const getIsOn = createMemo(() => props.input || props.output)
  return (
    <div
      class='flex items-center gap-2'
      classList={{
        'opacity-70': !getIsOn(),
      }}
    >
      <div>
        <div
          class='w-6 h-6 items-center bg-gray-800'
          classList={{
            [props.offIcon]: !getIsOn(),
            [props.onIcon]: getIsOn(),
          }}
        />
      </div>
      <div>
        <div class='font-bold text-sm text-gray-800'>{props.name}</div>
        <div class='text-gray-700 text-xs'>{getText()}</div>
      </div>
    </div>
  )
}
function ModelSpecs(props: {
  modelMeta: ModelMeta
}) {
  return (
    <div class='flex flex-col gap-2'>
      <div class='flex flex-col gap-4'>
        <div class='flex gap-4 flex-col md:flex-row'>
          <ModelSpec
            key='Published Date'
            iconClass='i-tabler-calendar-bolt'
            references={props.modelMeta.published_at?.references}
            contentToCopy={props.modelMeta.published_at.value}
          >
            {formatter.format(new Date(props.modelMeta.published_at.value))}
          </ModelSpec>
          <div class='h-[1px] w-full md:h-12  md:w-[1px] bg-gray-300 self-center' />
          <ModelSpec
            key='Knowledge Cutoff'
            iconClass='i-tabler-database-off'
            references={props.modelMeta.cutoff_date?.references}
            contentToCopy={props.modelMeta.cutoff_date?.value ?? ''}
          >
            {props.modelMeta.cutoff_date
              ? formatter.format(new Date(props.modelMeta.cutoff_date.value))
              : 'Unknown'}
          </ModelSpec>
        </div>
        <div class='h-[1px] w-full bg-gray-200 ' />
        <div class='flex gap-4 flex-col md:flex-row'>
          <ModelSpec
            iconClass='i-tabler-copyright'
            key='License'
            references={props.modelMeta.license.references}
            contentToCopy={props.modelMeta.license.value}
          >
            {props.modelMeta.license.value}
          </ModelSpec>
          <div class='h-[1px] w-full md:h-12  md:w-[1px] bg-gray-300 self-center' />
          <ModelSpec
            iconClass='i-tabler-pencil'
            key='Model Size'
            references={props.modelMeta.model_parameters?.references ?? []}
            contentToCopy={props.modelMeta.model_parameters?.value.toString() ??
              'Unknown'}
          >
            <Show when={props.modelMeta.model_parameters} fallback='Unknown'>
              {(getParams) => (
                <div>
                  <span>{formatTokenUnit(getParams().value)}</span>
                  <Show when={getParams().trustability === 'GUESSED'}>
                    ?
                  </Show>
                </div>
              )}
            </Show>
          </ModelSpec>
        </div>
        <div class='h-[1px] w-full bg-gray-200 ' />
        <div class='flex gap-4 flex-col md:flex-row'>
          <ModelSpec
            iconClass='i-tabler-book'
            key='Context Window'
            references={props.modelMeta.token_limit?.references}
            contentToCopy={props.modelMeta.token_limit?.input.toString() ?? ''}
          >
            <div class='break-words'>
              {props.modelMeta.token_limit?.input} Tokens
            </div>
          </ModelSpec>
          <div class='h-[1px] w-full md:h-12  md:w-[1px] bg-gray-300 self-center' />
          <ModelSpec
            iconClass='i-tabler-pencil'
            key='Max Output Length'
            references={props.modelMeta.token_limit?.references}
            contentToCopy={props.modelMeta.token_limit?.output?.toString() ??
              ''}
          >
            <Show when={props.modelMeta.token_limit?.output} fallback='Unknown or not specified'>
              {props.modelMeta.token_limit?.output} Tokens
            </Show>
          </ModelSpec>
        </div>
        <div class='h-[1px] w-full bg-gray-200 ' />
        <div class='flex flex-col sm:flex-row gap-2'>
          <div class='flex gap-1 w-60'>
            <div class='w-6 h-6 bg-slate-800 relative bottom-[2px] i-tabler-tournament' />
            <div class='font-bold text-slate-800'>Multimodalities</div>
          </div>
          <div class='grow grid grid-cols-2 gap-2'>
            <MultimodalityCard
              onIcon='i-tabler-notes'
              offIcon='i-tabler-notes-off'
              name='TEXT'
              input={props.modelMeta.multimodalities.input.includes('text')}
              output={props.modelMeta.multimodalities.output.includes('text')}
            />
            <MultimodalityCard
              onIcon='i-tabler-photo'
              offIcon='i-tabler-photo-off'
              name='IMAGE'
              input={props.modelMeta.multimodalities.input.includes('image')}
              output={props.modelMeta.multimodalities.output.includes('image')}
            />
            <MultimodalityCard
              onIcon='i-tabler-music'
              offIcon='i-tabler-music-off'
              name='AUDIO'
              input={props.modelMeta.multimodalities.input.includes('audio')}
              output={props.modelMeta.multimodalities.output.includes('audio')}
            />
            <MultimodalityCard
              onIcon='i-tabler-movie'
              offIcon='i-tabler-movie-off'
              name='VIDEO'
              input={props.modelMeta.multimodalities.input.includes('video')}
              output={props.modelMeta.multimodalities.output.includes('video')}
            />
          </div>
        </div>
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
