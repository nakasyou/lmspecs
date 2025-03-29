import { array, object, number, nullable } from 'valibot'
import { reference } from '../shared.ts'

export default object({
  value: object({
    overall: number(),
    biology: nullable(number()),
    business: nullable(number()),
    chemistry: nullable(number()),
    computer_science: nullable(number()),
    economics: nullable(number()),
    engineering: nullable(number()),
    health: nullable(number()),
    history: nullable(number()),
    law: nullable(number()),
    math: nullable(number()),
    philosophy: nullable(number()),
    physics: nullable(number()),
    psychology: nullable(number()),
    other: nullable(number())
  }),
  references: array(reference())
})
