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
import pricingSchema, { cond } from '../../../schema/provided/pricing.ts'
import providedMetaSchema from '../../../schema/provided/meta.ts'
import speedSchema from '../../../schema/provided/speed.ts'
import CopyButton from '../../components/CopyButton.tsx'
import { Select } from '../../components/Select.tsx'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { formatter } from './shared.ts'
import { ModelSpec } from './ModelSpec.tsx'
import ProvidedContent from './PrividedContent.tsx'
import { AbilityCard } from './AbilityCard.tsx'
import Spinner from '../../components/Spinner.tsx'
import Title from '../../components/Title.tsx'

export type ModelMeta = InferOutput<typeof modelMetaSchema>
export type ProvidedMeta = InferOutput<typeof providedMetaSchema>
export type Pricing = InferOutput<typeof pricingSchema>
export type Speed = InferOutput<typeof speedSchema>

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
const fetchProviderIds = (modelId: string) => {
  return [
    ...new Set(
      Object.keys(MODEL_INFO).flatMap((path) => {
        if (!path.startsWith(`../../../models/${modelId}/providers`)) {
          return []
        }
        return path.split('/')[6]
      }),
    ),
  ]
}
const fetchProviderMeta = async (
  modelId: string,
  providerId: string,
): Promise<ProvidedMeta> => {
  const metaPath =
    `../../../models/${modelId}/providers/${providerId}/meta.json`
  const mod = await MODEL_INFO[metaPath]() as { default: ProvidedMeta }

  return mod.default
}
const fetchPricing = async (
  modelId: string,
  providerId: string,
): Promise<Pricing | null> => {
  const path = `../../../models/${modelId}/providers/${providerId}/pricing.json`
  if (!(path in MODEL_INFO)) {
    return null
  }
  const mod = await MODEL_INFO[path]() as { default: Pricing }

  return mod.default
}
const fetchSpeed = async (
  modelId: string,
  providerId: string,
): Promise<Speed | null> => {
  const path = `../../../models/${modelId}/providers/${providerId}/speed.json`
  if (!(path in MODEL_INFO)) {
    return null
  }
  const mod = await MODEL_INFO[path]() as { default: Speed }

  return mod.default
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
      <div class='text-slate-500 dark:text-gray-400 text-sm flex gap-1 items-center'>
        <div>Created by</div>
        <CopyButton
          content={JSON.stringify(props.modelMeta.creators)}
          class='w-4 h-4 bg-slate-500 dark:bg-slate-400'
        />
      </div>
      <Suspense>
        <div class='flex gap-2'>
          <For each={getCreatorImages() ?? []}>
            {(image) => (
              <div>
                <img class='w-6 h-6' src={image} />
              </div>
            )}
          </For>
        </div>
      </Suspense>
    </div>
  )
}

function Links(props: {
  modelMeta: ModelMeta
}) {
  return (
    <div class='flex flex-col gap-1'>
      <div class='text-slate-500 text-sm flex gap-1 items-center'>
        <div>Links</div>
        <CopyButton
          content={JSON.stringify(props.modelMeta.creators)}
          class='w-4 h-4 bg-slate-500'
        />
      </div>
      <Suspense>
        <div class='flex gap-2'>
          <Show when={props.modelMeta.links?.website}>
            {(link) => (
              <a
                href={link()}
                rel='norefferer noopener'
                target='_blank'
                class='i-tabler-world w-6 h-6 bg-gray-700 hover:bg-gray-600'
              />
            )}
          </Show>
          <Show when={props.modelMeta.links?.github}>
            {(link) => (
              <a
                href={link()}
                rel='norefferer noopener'
                target='_blank'
                class='i-tabler-brand-github w-6 h-6 bg-gray-700 hover:bg-gray-600'
              />
            )}
          </Show>
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
            <div class='text-uchu-gray-7 dark:text-uchu-gray-4 font-mono'>{props.modelMeta.id}</div>
            <CopyButton
              content={props.modelMeta.id}
              class='w-4 h-4 bg-uchu-gray-7'
            />
          </div>
        </div>
      </div>
      <div class='h-12 w-[1px] bg-gray-100 hidden md:block self-center dark:bg-gray-700' />
      <div class='flex items-center'>
        <CreatedBy modelMeta={props.modelMeta} />
      </div>
      <Show when={Object.keys(props.modelMeta.links ?? {}).length > 0}>
        <div class='h-12 w-[1px] bg-gray-100 hidden md:block self-center dark:bg-gray-700' />
        <div class='flex items-center'>
          <Links modelMeta={props.modelMeta} />
        </div>
      </Show>
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
      <div class='text-sm text-uchu-gray-7 dark:text-uchu-gray-6 text-center'>{props.shortDesc}</div>
    </div>
  )
}
function MultiModalitiesIcons(props: {
  modalities: ModelMeta['multimodalities']['input']
}) {
  return (
    <div class='grid grid-cols-4 justify-center gap-2'>
      <div
        class='w-5 h-5 bg-gray-800 dark:bg-gray-200'
        classList={{
          'i-tabler-notes-off opacity-60': !props.modalities.includes('text'),
          'i-tabler-notes': props.modalities.includes('text'),
        }}
      />
      <div
        class='w-5 h-5 bg-gray-800 dark:bg-gray-200'
        classList={{
          'i-tabler-photo-off opacity-60': !props.modalities.includes('image'),
          'i-tabler-photo': props.modalities
            .includes('image'),
        }}
      />
      <div
        class='w-5 h-5 bg-gray-800 dark:bg-gray-200'
        classList={{
          'i-tabler-music-off opacity-60': !props.modalities.includes('audio'),
          'i-tabler-music': props.modalities.includes('audio'),
        }}
      />
      <div
        class='w-5 h-5 bg-gray-800 dark:bg-gray-200'
        classList={{
          'i-tabler-movie-off opacity-60': !props.modalities.includes('video'),
          'i-tabler-movie': props.modalities.includes('video'),
        }}
      />
    </div>
  )
}
function ModelSummary(props: {
  modelMeta: ModelMeta
}) {
  return (
    <div class='border justify-between border-uchu-gray-4 dark:border-uchu-gray-9 rounded-lg flex gap-2 p-3 flex-col sm:flex-row'>
      <div class='flex gap-2 flex-1'>
        <ModelSummaryCard
          title='CONTEXT WINDOW'
          shortDesc={`${props.modelMeta.token_limit?.input.toString()} Tokens`}
        >
          <div class='text-lg font-bold text-gray-700 dark:text-gray-200'>
            {formatTokenUnit(props.modelMeta.token_limit?.input ?? 0)}
          </div>
        </ModelSummaryCard>
        <div class='h-12 w-[1px] bg-gray-100 hidden md:block self-center dark:bg-gray-700' />
        <ModelSummaryCard
          title='LICENSE'
          shortDesc=''
        >
          <div class='text-lg font-bold text-gray-700 dark:text-gray-200'>
            {props.modelMeta.license.value}
          </div>
        </ModelSummaryCard>
      </div>
      <div class='h-[1px] w-full sm:h-12 sm:w-[1px] bg-gray-100 self-center dark:bg-gray-700' />
      <div class='flex gap-2 flex-1'>
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
        <div class='h-12 w-[1px] bg-gray-100 hidden md:block self-center dark:bg-gray-700' />
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
    </div>
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
    <AbilityCard
      onIcon={props.onIcon}
      offIcon={props.offIcon}
      name={props.name}
      text={getText()}
      enabled={getIsOn()}
    />
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
          <div class='h-[1px] w-full md:h-12  md:w-[1px] bg-gray-300 self-center dark:bg-gray-700' />
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
        <div class='h-[1px] w-full bg-gray-200 dark:bg-gray-700 ' />
        <div class='flex gap-4 flex-col md:flex-row'>
          <ModelSpec
            iconClass='i-tabler-copyright'
            key='License'
            references={props.modelMeta.license.references}
            contentToCopy={props.modelMeta.license.value}
          >
            {props.modelMeta.license.value}
          </ModelSpec>
          <div class='h-[1px] w-full md:h-12  md:w-[1px] bg-gray-300 self-center dark:bg-gray-700 ' />
          <ModelSpec
            iconClass='i-tabler-weight'
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
        <div class='h-[1px] w-full bg-gray-200 dark:bg-gray-700 ' />
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
          <div class='h-[1px] w-full md:h-12 md:w-[1px] bg-gray-300 self-center dark:bg-gray-700' />
          <ModelSpec
            iconClass='i-tabler-pencil'
            key='Max Output Length'
            references={props.modelMeta.token_limit?.references}
            contentToCopy={props.modelMeta.token_limit?.output?.toString() ??
              ''}
          >
            <Show
              when={props.modelMeta.token_limit?.output}
              fallback='Unknown or not specified'
            >
              {props.modelMeta.token_limit?.output} Tokens
            </Show>
          </ModelSpec>
        </div>
        <div class='h-[1px] w-full bg-gray-200 dark:bg-gray-700 ' />
        <div class='flex gap-4 flex-col md:flex-row'>
          <div class='flex flex-col sm:flex-row gap-2 flex-1'>
            <div class='flex gap-1 w-60'>
              <div class='w-6 h-6 bg-slate-800 dark:bg-slate-200 relative bottom-[2px] i-tabler-tournament' />
              <div class='font-bold text-slate-800 dark:text-slate-200'>Multimodalities</div>
            </div>
            <div class='grow grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2'>
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
                output={props.modelMeta.multimodalities.output.includes(
                  'image',
                )}
              />
              <MultimodalityCard
                onIcon='i-tabler-music'
                offIcon='i-tabler-music-off'
                name='AUDIO'
                input={props.modelMeta.multimodalities.input.includes('audio')}
                output={props.modelMeta.multimodalities.output.includes(
                  'audio',
                )}
              />
              <MultimodalityCard
                onIcon='i-tabler-movie'
                offIcon='i-tabler-movie-off'
                name='VIDEO'
                input={props.modelMeta.multimodalities.input.includes('video')}
                output={props.modelMeta.multimodalities.output.includes(
                  'video',
                )}
              />
            </div>
          </div>
          <div class='h-[1px] w-full md:h-12 md:w-[1px] bg-gray-300 self-center dark:bg-gray-700' />
          <div class='flex flex-col sm:flex-row gap-2 flex-1'>
            <div class='flex gap-1 w-60'>
              <div class='w-6 h-6 bg-slate-800 dark:bg-slate-200 relative bottom-[2px] i-tabler-sparkles' />
              <div class='font-bold text-slate-800 dark:text-slate-200'>Features</div>
            </div>
            <div class='grow grid grid-cols-1 gap-2'>
              <AbilityCard
                onIcon='i-tabler-brain'
                offIcon='i-tabler-brain'
                name='REASONING'
                enabled={props.modelMeta.features.value.includes('REASONING')}
                text={props.modelMeta.features.value.includes('REASONING')
                  ? 'Supported'
                  : 'Not supported'}
              />
              <AbilityCard
                onIcon='i-tabler-function'
                offIcon='i-tabler-function-off'
                name='NATIVE FUNCTION CALLING'
                enabled={props.modelMeta.features.value.includes(
                  'FUNCTION_CALLING',
                )}
                text={props.modelMeta.features.value.includes(
                    'FUNCTION_CALLING',
                  )
                  ? 'Supported'
                  : 'Not supported'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export interface ProviderData {
  meta: ProvidedMeta
  pricing: Pricing | null
  speed: Speed | null
}

function ProvidedInfo(props: {
  modelMeta: ModelMeta
}) {
  const getProviderIds = createMemo(() => fetchProviderIds(props.modelMeta.id))
  const [getSelectedProvider, setSelectedProvider] = createSignal(
    getProviderIds()[0],
  )
  const [getProviderData, { refetch }] = createResource(
    async () => {
      if (!getSelectedProvider()) {
        return null
      }
      const [meta, pricing, speed] = await Promise.all([
        fetchProviderMeta(props.modelMeta.id, getSelectedProvider()),
        fetchPricing(props.modelMeta.id, getSelectedProvider()),
        fetchSpeed(props.modelMeta.id, getSelectedProvider()),
      ])
      return {
        meta,
        pricing,
        speed,
      }
    },
  )

  createEffect(() => {
    getSelectedProvider()
    refetch()
  })

  return (
    <Show
      when={getSelectedProvider()}
      fallback={
        <div class='flex flex-col gap-2'>
          <div class='h-[1px] w-full bg-gray-200 dark:bg-gray-700 ' />
          <div class='text-slate-600'>
            No providers which can provide this model was found in LMSpecs.
          </div>
        </div>
      }
    >
      <div class='flex flex-col gap-5'>
        <div class='flex gap-2 items-center'>
          <div class='text-lg text-gray-500 dark:text-slate-200 font-bold'>with:</div>
          <Select
            titles={Object.fromEntries(getProviderIds().map((id) => [id, id]))}
            value={getSelectedProvider()}
            onChange={setSelectedProvider}
          />
        </div>
        <Suspense fallback={<Spinner />}>
          <Show
            when={getProviderData()}
          >
            {(data) => <ProvidedContent data={data()} />}
          </Show>
        </Suspense>
      </div>
    </Show>
  )
}

function ModelContent(props: {
  modelMeta: ModelMeta
}) {
  return (
    <div class='max-w-256 mx-auto flex flex-col gap-2'>
      <div>
        <a href="/model" class='text-sm text-slate-500 dark:text-slate-300 flex items-center'>
          <span class='w-4 h-4 i-tabler-chevron-left relative bottom-0.5' />
          Return to list
        </a>
      </div>
      <div class='flex flex-col gap-4'>
        <ModelTitle modelMeta={props.modelMeta} />
        <ModelSummary modelMeta={props.modelMeta} />
        <ModelSpecs modelMeta={props.modelMeta} />
        <ProvidedInfo modelMeta={props.modelMeta} />
      </div>
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
        <Suspense
          fallback={
            <div class='grid h-dvh place-items-center'>
              <Spinner />
            </div>
          }
        >
          <Title>{`${modelMeta()?.name} | LMSpecs`}</Title>
          <Show when={modelMeta()}>
            {(modelMeta) => <ModelContent modelMeta={modelMeta()} />}
          </Show>
        </Suspense>
      </div>
    </div>
  )
}
