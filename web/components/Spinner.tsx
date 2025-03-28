export default function Spinner(props: {
  class?: string
}) {
  return (
    <div class='flex justify-center' aria-label='loading...' classList={{
      [props.class ?? 'w-10 h-10']: true,
    }}>
      <div class='animate-spin h-full w-full border-4 border-uchu-purple-4 rounded-full border-t-transparent' />
    </div>
  )
}
