import './App.css'
import { lazy } from 'solid-js'
import { Route, Router } from '@solidjs/router'
import { Suspense } from 'solid-js'
import Spinner from './components/Spinner.tsx'
import { JSX } from 'solid-js'

const Home = lazy(() => import('./pages/home/index.tsx'))
const Chart = lazy(() => import('./pages/chart.tsx'))
const Model = lazy(() => import('./pages/model/model-page.tsx'))
const ModelList = lazy(() => import('./pages/model/index.tsx'))

function wrapPageForLoading(Component: () => JSX.Element) {
  return () => {
    return <Suspense fallback={<div class='h-dvh grid place-items-center'><Spinner /></div>}>
      <Component />
    </Suspense>
  }
}
export default function App(props: {
  url?: string
}) {
  return (
    <Router url={props.url}>
      <Route path='/' component={wrapPageForLoading(Home)} />
      <Route path='/chart' component={wrapPageForLoading(Chart)} />
      <Route path='/model/:modelId' component={wrapPageForLoading(Model)} />
      <Route path='/model' component={wrapPageForLoading(ModelList)} />
    </Router>
  )
}
