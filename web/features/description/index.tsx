import AboutCompare from './AboutCompare.tsx'
import Hero from './Hero.tsx'
import Images from './Images.tsx'
import UnifiedScores from './UnifiedScores.tsx'

export default function Description() {
  return (
    <div class='p-8 flex flex-col gap-10'>
      <Hero />
      <Images />
      <AboutCompare />
      <UnifiedScores />
    </div>
  )
}
