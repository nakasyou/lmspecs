export interface Model {
  name: string
  creator: string[]
  id: string
}
export interface Provided {
  model_id: string
  provider: string
}

const MODEL_META_IMPORTS = import.meta.glob('../../../models/*/meta.json')
const PROVIDED_META_IMPORTS = import.meta.glob('../../../provided/*/*/meta.json')

const MODEL_LMARENA_IMPORTS = import.meta.glob(
  '../../../models/*/score-lmarena.json',
)
export const getProvideds = async ()=> {
  const models: {
    [model: string]: {
      [provider: string]: Provided
    }
  } = {}
  await Promise.all(
    Object.values(PROVIDED_META_IMPORTS)
      .map(async (v) => {
        const meta = await v() as Provided
        models[meta.model_id] ??= {}
        models[meta.model_id][meta.provider] = meta
      }),
  )
  return models
}
export const getLMs = async (): Promise<Record<string, Model>> => {
  getProvideds().then(console.log)
  const models = Object.fromEntries(((await Promise.all(
    Object.values(MODEL_META_IMPORTS)
      .map((v) => v()),
  )) as Model[]).map((v) => [v.id, v]))
  return models
}
export interface LMArenaScore {
  scores: {
    [date: string]: {
      [title: string]: number
    }
  }
}
export const getLMArenaScores = async (targetModelIds: string[]): Promise<{
  [model: string]: LMArenaScore | null
}> => {
  const promises: Promise<[string, LMArenaScore | null]>[] = []
  for (const modelId of targetModelIds) {
    const path = `../../../models/${modelId}/score-lmarena.json`
    if (path in MODEL_LMARENA_IMPORTS) {
      promises.push(
        MODEL_LMARENA_IMPORTS[path]().then(
          (m) => [
            modelId,
            (m as { default: LMArenaScore }).default as LMArenaScore,
          ]
        ),
      )
    } else {
      promises.push(Promise.resolve([modelId, null]))
    }
  }
  return Object.fromEntries(await Promise.all(promises))
}

const MODEL_MMLUPRO_IMPORTS = import.meta.glob(
  '../../../models/*/score-mmlu-pro.json',
)
export interface MMLUProScores {
  scores: {
    [date: string]: {
      [title: string]: number
    }
  }
}
export const getMMLUProScores = async (targetModelIds: string[]) => {
  const promises: Promise<[string, MMLUProScores | null]>[] = []
  for (const modelId of targetModelIds) {
    const path = `../../../models/${modelId}/score-mmlu-pro.json`
    if (path in MODEL_MMLUPRO_IMPORTS) {
      promises.push(
        MODEL_MMLUPRO_IMPORTS[path]().then(
          (m) => [
            modelId,
            (m as { default: MMLUProScores }).default as LMArenaScore,
          ]
        ),
      )
    } else {
      promises.push(Promise.resolve([modelId, null]))
    }
  }
  return Object.fromEntries(await Promise.all(promises))
}
