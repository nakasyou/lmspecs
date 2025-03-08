import { $ } from '@david/dax'
import { exists, expandGlob } from '@std/fs'
import { join } from '@std/path'

await Deno.mkdir('tmp', { recursive: true })

if (!await exists('tmp/mmlu_pro_leaderboard_submission')) {
  await $`git clone https://huggingface.co/datasets/TIGER-Lab/mmlu_pro_leaderboard_submission tmp/mmlu_pro_leaderboard_submission`
}

const output = await $`git log main --date-order --format=%H%n%cI`.cwd('tmp/mmlu_pro_leaderboard_submission').text()

const outputLines = output.split('\n')

let data: {
  [yyyymmdd: string]: {
    [modelID: string]: {
      [title: string]: number
    }
  }
} = {}

if (await exists('tmp/mmlu-pro-cached.json')) {
  data = JSON.parse(await Deno.readTextFile('tmp/mmlu-pro-cached.json'))
} else {
  for (let i = 0; i < outputLines.length; i += 2) {
    const hash = outputLines[i]
    const date = new Date(outputLines[i + 1])
  
    await $`git checkout ${hash}`.cwd('tmp/mmlu_pro_leaderboard_submission')
    const resultPath = `./tmp/mmlu_pro_leaderboard_submission/results.csv`
    if (!await exists(resultPath)) {
      continue
    }
    const csv = await Deno.readTextFile(resultPath)
    if (csv.startsWith('PK')) {
      // Excel
      continue
    }
  
    const lines = csv.replaceAll('\r', '').split('\n')
    const headers = lines[0].split(',')
    const modelIdx = 0
    const overallIdx = headers.indexOf('Overall')
  
    const thisData = Object.fromEntries(lines.slice(1).map(line => {
      const cols = line.split(',')
      const modelId = cols[modelIdx]
      const scores = Object.fromEntries(cols.slice(overallIdx).map((score, i) => {
        const header = headers[overallIdx + i]
        return [header ? header.toLowerCase() : undefined, parseFloat(score)]
      }))
      return [modelId, scores]
    }))
  
    data[date.toISOString().slice(0, 10)] = thisData
  }
  
  const modelMaps = new Map<string, string>()
  for await (const entry of expandGlob('models/*/meta.json')) {
    const meta = JSON.parse(await Deno.readTextFile(entry.path))
    if (!meta.lmarena_id) {
      continue
    }
    modelMaps.set(meta.lmarena_id, entry.path)
  }
  
  await Deno.writeTextFile(
    './tmp/mmlu-pro-cached.json', 
    JSON.stringify(data, null, 2)
  )
}

for await (const entry of expandGlob('models/*/meta.json')) {
  const meta = JSON.parse(await Deno.readTextFile(entry.path))
  if (!meta.mmlu_pro_ids) {
    continue
  }
  const scoreData: {
    [yyyymmdd: string]: {
      [title: string]: number
    }
  } = {}

  for (const [date, models] of Object.entries(data)) {
    for (const id of meta.mmlu_pro_ids) {
      if (id in models) {
        scoreData[date] = models[id]
        break
      }
    }
  }

  await Deno.writeTextFile(
    join(entry.path, '../score-mmlu-pro.json'),
    JSON.stringify(
      {
        '$schema': '../../schema/score.json',
        scores: scoreData,
      },
      null,
      2,
    ),
  )
}
