import { ValueType } from '../ValueSelect.tsx'
import { InferOutput } from 'valibot'
import benchHle from '../../../../schema/models/bench-hle.ts'
import hleLogo from '../../../../assets/hle-icon/image.svg'

export type HLEParams = undefined

function Setting(props: {
  value?: HLEParams
  onChange(id: HLEParams): void
}) {
  return (
    <>
    </>
  )
}

const IMPORTS = import.meta.glob(
  '../../../../models/*/bench-hle.json',
)

export type BenchHLE = InferOutput<typeof benchHle>

export default {
  title: "Humanity's Last Exam",
  image: (
    <img
      src={hleLogo}
      alt="Humanity's Last Exam"
    />
  ),
  description:
    'Featuring challenging questions across 57 subjects, designed to test reasoning, knowledge, and problem-solving beyond standard datasets.',
  Setting,
  initParams: () => undefined,
  formatParams: (p) => 'overall',
  getData: async (params, modelIds) => {
    const promises: Promise<
      [modelId: string, [date: string, val: number | null][]] | null
    >[] = []
    for (const modelId of modelIds) {
      const path = `../../../../models/${modelId}/bench-hle.json`

      if (path in IMPORTS) {
        promises.push((async () => {
          const imported = ((await IMPORTS[path]()) as {
            default: BenchHLE
          }).default

          return [
            modelId,
            [
              [
                new Date().toISOString().slice(0, 10),
                imported.value.overall
              ],
            ],
          ]
        })())
      }
    }
    return Object.fromEntries((await Promise.all(promises)).filter((v) => !!v))
  },
} satisfies ValueType<HLEParams>
