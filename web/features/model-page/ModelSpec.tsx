import { For } from 'solid-js'
import { formatter } from './shared.ts'
import CopyButton from '../../components/CopyButton.tsx'
import { Show } from 'solid-js'
import { JSX } from 'solid-js'

export function ModelSpec(props: {
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
            class={'w-6 h-6 bg-slate-800 dark:bg-slate-200 relative bottom-[2px] ' +
              props.iconClass}
          />
          <div class='font-bold text-slate-800 dark:text-slate-200'>{props.key}</div>
        </div>
        <div class='flex gap-1'>
          <div class='text-slate-700 dark:text-slate-300'>{props.children}</div>
          <CopyButton
            content={props.contentToCopy}
            class='w-4 h-4 text-slate-500 dark:text-slate-400'
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

export function SpecReferences(props: {
  references: {
    url: string
    retrieved: string
  }[]
}) {
  return (
    <details>
      <summary class='text-xs text-gray-600 dark:text-gray-400'>
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
