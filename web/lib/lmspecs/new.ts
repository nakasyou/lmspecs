import { type InferOutput, parse } from 'valibot'
import modelMeta from '../../../schema/models/meta.ts'

const MODEL_JSONS = import.meta.glob('../../../models/**/*.json')
const ASSETS = import.meta.glob('../../../assets/*/*')

export type ModelMeta = InferOutput<typeof modelMeta>

export interface Asset {
  url: string
}
export async function loadAsset(id: string): Promise<Asset | null> {
  const path = `../../../assets/${id}`
  if (!(path in ASSETS)) {
    return null
  }
  return {
    url: (await ASSETS[path]() as { default: string }).default,
  }
}

export interface Model {
  meta: ModelMeta
}
export const getModelLogo = (model: Model) => {
  const logo = model.meta.logos?.[0]
  if (!logo) {
    return
  }
  return loadAsset(logo)
}
export const listModelIds = () => {
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
export async function loadModel(id: string): Promise<Model | null> {
  const path = `../../../models/${id}/meta.json`
  if (!(path in MODEL_JSONS)) {
    return null
  }
  const loaded = await MODEL_JSONS[path]() as { default: unknown }
  const parsed = parse(
    modelMeta,
    (loaded as { default: unknown }).default,
  )
  return {
    meta: parsed,
  }
}
