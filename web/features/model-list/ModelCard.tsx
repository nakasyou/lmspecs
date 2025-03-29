import { InferOutput } from 'valibot'
import type modelMeta from '../../../schema/models/meta.ts'
import { createResource, Show, Suspense } from 'solid-js'
import { Asset, getModelLogo, loadModel, Model } from '../../lib/lmspecs/new.ts'
import Spinner from '../../components/Spinner.tsx'
import { formatter } from '../model-page/shared.ts'

function Logo(props: {
  model: Model
}) {
  const [getImage] = createResource(async () => {
    const logo = await getModelLogo(props.model)
    if (!logo) {
      return null
    }
    return logo.url
  })
  return (
    <div class='w-full h-full'>
      <Suspense fallback={<Spinner />}>
        <Show when={getImage()}>
          {(im) => (
            <img class='w-full h-full' src={im()} alt={props.model.meta.name} />
          )}
        </Show>
      </Suspense>
    </div>
  )
}
export default function ModelCard(props: {
  id: string
}) {
  const [getModel] = createResource(() => {
    return loadModel(props.id)
  })
  return (
    <div class='border p-2 rounded border-gray-200 dark:border-gray-700 flex flex-col justify-between gap-2 w-full h-full'>
      <Suspense fallback={<Spinner />}>
        <Show when={getModel()}>
          {(getModel) => (
            <>
              <div class='flex items-center gap-2'>
                <div class='w-10 h-10'>
                  <Logo model={getModel()} />
                </div>
                <div>
                  <div class='text-sm font-bold text-slate-700 dark:text-slate-100'>
                    {getModel().meta.name}
                  </div>
                  <div class='text-xs text-slate-700 dark:text-slate-100'>{getModel().meta.id}</div>
                </div>
              </div>
              <div class='flex'>
                <div class='flex items-center gap-1'>
                  <div class='i-tabler-upload w-4 h-4 bg-gray-500 dark:text-slate-300' />
                  <div class="text-sm text-gray-500 dark:text-slate-300">
                    {formatter.format(
                      new Date(getModel().meta.published_at.value),
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Show>
      </Suspense>
    </div>
  )
}
