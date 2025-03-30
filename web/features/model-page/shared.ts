import { createContext } from 'solid-js'
import { SetStoreFunction, Store } from 'solid-js/store'

export interface ModelPageStore {
  lineup: boolean
  setPricingCondLength?: (len: number) => void
}
export const formatter = new Intl.DateTimeFormat('en-us', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
export const MODEL_PAGE_CONTEXT = createContext<
  [Store<ModelPageStore>, SetStoreFunction<ModelPageStore>]
>()
