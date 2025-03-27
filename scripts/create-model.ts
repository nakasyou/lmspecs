const modelID = Deno.args[0]

const json = {
  $schema: '../../schema/_output/models/meta.json',
  id: modelID,
  name: modelID.split('-').map((m) => m[0].toUpperCase() + m.slice(1)).join(
    ' ',
  ),
  creator: [],
  published: '',
  states: {},
  lmarena_id: modelID,
  cutoff_date: {},
  token_limit: {},
}

await Deno.mkdir(`./models/${modelID}`)

await Deno.writeTextFile(
  `./models/${modelID}/meta.json`,
  JSON.stringify(json, null, 2),
)
