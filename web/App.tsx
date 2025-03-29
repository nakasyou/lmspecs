import './App.css'
import { lazy } from 'solid-js'
import { Route, Router } from '@solidjs/router'
import { Suspense } from 'solid-js'

const Home = lazy(() => import('./pages/home/index.tsx'))
const Chart = lazy(() => import('./pages/chart.tsx'))
const Model = lazy(() => import('./pages/model/model-page.tsx'))
const ModelList = lazy(() => import('./pages/model/index.tsx'))

export default function App(props: {
  url?: string
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Router url={props.url}>
        <Route path='/' component={Home} />
        <Route path='/chart' component={Chart} />
        <Route path='/model/:modelId' component={Model} />
        <Route path='/model' component={ModelList} />
      </Router>
    </Suspense>
  )
}
