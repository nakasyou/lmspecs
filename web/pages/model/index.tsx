import Title from '../../components/Title.tsx'
import Header from '../../features/header/index.tsx'
import ModelList from '../../features/model-list/index.tsx'

export default function Model() {
  return (
    <>
      <Title>Model list | LMSpecs</Title>
      <Header sticky />
      <div class='max-w-256 mx-auto p-8'>
        <ModelList />
      </div>
    </>
  )
}
