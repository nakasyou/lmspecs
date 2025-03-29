import Header from '../../features/header/index.tsx'
import ModelCard from '../../features/model-page/index.tsx'

export default function ModelPage() {
  return (
    <>
      <Header sticky />
      <div class='max-w-256 mx-auto p-8'>
        <ModelCard />
      </div>
    </>
  )
}
