/* @refresh reload */
import { render } from 'solid-js/web'
import App from './App.tsx'
import { hydrate } from 'solid-js/web'

const root = document.getElementById('root')

if (import.meta.env.DEV) {
  render(() => <App />, root!)
} else {
  // hydrate
  hydrate(() => <App />, root!)
}
