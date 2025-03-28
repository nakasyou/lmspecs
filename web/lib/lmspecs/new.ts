import { type InferOutput, parse } from 'valibot'
import modelMeta from '../../../schema/models/meta.ts'

const MODEL_JSONS = import.meta.glob('../../../models/**/*.json')
const ASSETS = import.meta.glob('../../../assets/*/*')

export type ModelMeta = InferOutput<typeof modelMeta>

export class Asset {
  readonly url: string
  constructor(url: string) {
    this.url = url
  }
  static async load(id: string) {
    const path = `../../../assets/${id}`
    if (!(path in ASSETS)) {
      return null
    }
    return new Asset((await ASSETS[path]() as { default: string }).default)
  }
}
export class Model {
  readonly meta: ModelMeta
  constructor(meta: ModelMeta) {
    this.meta = meta
  }
  getLogo() {
    const logo = this.meta.logos?.[0]
    if (!logo) {
      return
    }
    return Asset.load(logo)
  }
  static listModelIds() {
    const result: string[] = []
    for (const [path] of Object.entries(MODEL_JSONS)) {
      if (!path.startsWith('../../../models/')) {
        continue
      }
      const segs = path.split('/')
      if (segs.length !== 6) {
        continue
      }
      if (segs[5] !== 'meta.json') {
        continue
      }
      const modelName = segs[4]
      result.push(modelName)
    }
    return result
  }
  static async load(id: string) {
    const path = `../../../models/${id}/meta.json`
    if (!(path in MODEL_JSONS)) {
      return null
    }
    const loaded = await MODEL_JSONS[path]() as { default: unknown }
    const parsed = parse(
      modelMeta,
      (loaded as { default: unknown }).default,
    )
    return new Model(parsed)
  }
}
