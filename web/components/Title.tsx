import { createEffect } from 'solid-js'

export default function Title (props: {
  children: string
}) {
  createEffect(() => {
    document.title = props.children
  })
  return <title>{props.children}</title>
}