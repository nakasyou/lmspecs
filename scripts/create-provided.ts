import { join } from '@std/path'

const meta = {
  $schema: '../../../schema/meta-provided.json',
  model_id: prompt('What model does this provide?'),
  provider: prompt('Who provides this model?'),
  provided_at: prompt('When was the model provided at?'),
}

const dir = `./provided/${
  meta.provider?.toLowerCase().split(' ').join('-')
}/${meta.model_id}`
await Deno.mkdir(dir, {
  recursive: true,
})

await Deno.writeTextFile(join(dir, 'meta.json'), JSON.stringify(meta, null, 2))

await Deno.writeTextFile(
  join(dir, 'pricing.json'),
  JSON.stringify(
    {
      $schema: '../../../schema/pricing.json',
    },
    null,
    2,
  ),
)
