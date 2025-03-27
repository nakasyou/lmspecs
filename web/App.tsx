import './App.css'
import { lazy } from 'solid-js'
import { Router, Route } from '@solidjs/router'
import Model from './pages/model.tsx'

const Home = lazy(() => import('./pages/home/index.tsx'));
const Chart = lazy(() => import('./pages/chart.tsx'));

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/chart" component={Chart} />
      <Route path="/model/:modelId" component={Model} />
    </Router>
  )
}
