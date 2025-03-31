import { array, object, number, nullable } from 'valibot'
import { reference } from '../shared.ts'

export default object({
  value: object({
    overall: number()
  }),
  references: array(reference())
})
