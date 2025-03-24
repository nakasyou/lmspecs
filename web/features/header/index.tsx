import { createSignal } from 'solid-js'
import { onMount } from 'solid-js'

export default function Header() {
  const [getIsTop, setIsTop] = createSignal(true)

  onMount(() => {
    document.addEventListener('scroll', () => {
      setIsTop(scrollY === 0)
    })
  })

  return <header>
    <div classList={{
      'opacity-0': getIsTop()
    }} class="transition-all fixed top-0 left-0 w-full flex justify-between p-2">
      <div class="font-bold text-lg">LMSpecs</div>
      <div class="grid grid-cols-1">
        <a title="GitHub" href="https://github.com/nakasyou/lmspecs" rel='noopener noreferrer' target='_blank' class="i-tabler-brand-github-filled w-8 h-8"></a>
      </div>
    </div>
  </header>
}
