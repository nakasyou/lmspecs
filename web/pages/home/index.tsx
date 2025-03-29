import Title from '../../components/Title.tsx'
import Description from '../../features/description/index.tsx'
import Header from '../../features/header/index.tsx'

export default function Home() {
  return (
    <div>
      <Title>LMSpecs - Unified database for language models</Title>
      <Header />
      <Description />
    </div>
  )
}
