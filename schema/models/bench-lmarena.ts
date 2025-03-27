import { null_, number, object, optional, record, string, union } from 'valibot'

export default object({
  scores: optional(
    record(
      string(),
      record(
        string(),
        union([number(), null_()]),
      ),
    ),
  ),
})
