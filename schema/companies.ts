import { object, string } from 'valibot'

export default object({
  name: string(),
  icon: string(),
})
