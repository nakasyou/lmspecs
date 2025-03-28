import './App.css'
import { lazy } from 'solid-js'
import { Route, Router } from '@solidjs/router'

const Home = lazy(() => import('./pages/home/index.tsx'))
const Chart = lazy(() => import('./pages/chart.tsx'))
const Model = lazy(() => import('./pages/model.tsx'))
const ModelList = lazy(() => import('./features/model-list/index.tsx'))

export default function App() {
  return (
    <Router>
      <Route path='/' component={Home} />
      <Route path='/chart' component={Chart} />
      <Route path='/model/:modelId' component={Model} />
      <Route path='/model' component={ModelList} />
    </Router>
  )
}
