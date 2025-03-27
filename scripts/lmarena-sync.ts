import { expandGlob } from '@std/fs'
import { join } from '@std/path'

type Data = {
  [yyyymmdd: string]: {
    text: Columns // conversations which uses only text
    vision?: Columns // conversations using a vision model
  }
}
type Columns = Record<string, Score>
type Score = {
  [modelID: string]: number // elo score
}

const SCORES_URL =
  'https://raw.githubusercontent.com/nakasyou/lmarena-history/refs/heads/main/output/scores.json'

const data: Data = await fetch(SCORES_URL).then((res) => res.json())

const modelMaps = new Map<string, string>()
for await (const entry of expandGlob('models/*/meta.json')) {
  const meta = JSON.parse(await Deno.readTextFile(entry.path))

  if (!meta.identifiers.lmarena) {
    continue
  }
  modelMaps.set(meta.identifiers.lmarena, entry.path)
}

const modelData: Record<string, {
  [yyyymmdd: string]: {
    [title: `${'text' | 'vision'}_${string}`]: number
  }
}> = {}

const convertYYYYMMDD = (yyyymmdd: string) =>
  `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6)}`

for (const yyyymmdd in data) {
  const col = data[yyyymmdd]
  for (const [title, scores] of Object.entries(col.text)) {
    for (const [model, score] of Object.entries(scores)) {
      if (!modelMaps.has(model)) {
        continue
      }
      modelData[model] ??= {}
      modelData[model][convertYYYYMMDD(yyyymmdd)] ??= {}
      modelData[model][convertYYYYMMDD(yyyymmdd)][`text_${title}`] = score
    }
  }
  for (const [title, scores] of Object.entries(col.vision ?? {})) {
    for (const [model, score] of Object.entries(scores)) {
      if (!modelMaps.has(model)) {
        continue
      }
      modelData[model][convertYYYYMMDD(yyyymmdd)] ??= {}
      modelData[model][convertYYYYMMDD(yyyymmdd)][`vision_${title}`] = score
    }
  }
}

for (const [modelId, metaPath] of modelMaps) {
  if (!modelData[modelId]) {
    continue
  }
  await Deno.writeTextFile(
    join(metaPath, '../bench-lmarena.json'),
    JSON.stringify(
      {
        '$schema': '../../schema/_output/models/bench-lmarena.json',
        scores: modelData[modelId],
      },
      null,
      2,
    ),
  )
}
