import { ValueType } from '../ValueSelect.tsx'
import { InferOutput } from 'valibot'
import mmmuProIcon from '../../../../assets/mmmu-pro-icon/image.png'
import benchMmmuPro from '../../../../schema/models/bench-mmmu-pro.ts'

export type MMMUProParams = undefined

function Setting(props: {
  value?: MMMUProParams
  onChange(id: MMMUProParams): void
}) {
  return (
    <>
    </>
  )
}

const IMPORTS = import.meta.glob(
  '../../../../models/*/bench-mmmu-pro.json',
)

export type BenchMMMUPro = InferOutput<typeof benchMmmuPro>

export default {
  title: "MMMU Pro",
  image: (
    <img
      src={mmmuProIcon}
      alt="MMMU Pro"
    />
  ),
  description:
    'MMMU-Pro is an enhanced MMMU benchmark that tests multimodal AI models\' reasoning with a three-step process and vision-only inputs. It reveals lower performance, with accuracies from 16.8% to 26.9%.',
  Setting,
  initParams: () => undefined,
  formatParams: (p) => 'overall',
  getData: async (params, modelIds) => {
    const promises: Promise<
      [modelId: string, [date: string, val: number | null][]] | null
    >[] = []
    for (const modelId of modelIds) {
      const path = `../../../../models/${modelId}/bench-mmmu-pro.json`

      if (path in IMPORTS) {
        promises.push((async () => {
          const imported = ((await IMPORTS[path]()) as {
            default: BenchMMMUPro
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
} satisfies ValueType<MMMUProParams>
