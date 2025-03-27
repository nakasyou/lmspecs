import { createSignal } from 'solid-js'
import { onMount } from 'solid-js'

export default function Header(props: {
  sticky?: boolean
}) {
  return (
    <header>
      <div class='transition-all top-0 left-0 w-full flex justify-between p-2' classList={{
        'fixed': !props.sticky,
        'sticky': props.sticky,
      }}>
        <a href='/'>
          <div class='font-bold text-lg'>LMSpecs</div>
        </a>
        <div class='grid grid-cols-1'>
          <a
            title='GitHub'
            href='https://github.com/nakasyou/lmspecs'
            rel='noopener noreferrer'
            target='_blank'
            class='i-tabler-brand-github-filled w-8 h-8'
          >
          </a>
        </div>
      </div>
    </header>
  )
}
