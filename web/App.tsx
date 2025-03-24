import { createSignal } from 'solid-js'
import './App.css'
import Hero from './features/hero/index.tsx'
import Description from './features/description/index.tsx'
import Header from './features/header/index.tsx'

export default function App() {
  return (
    <div>
      <Header />
      <Hero />
      <Description />
    </div>
  )
}
