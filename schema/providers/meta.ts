import { object, string } from 'valibot'

export default object({
  id: string(),
  name: string(),
})
