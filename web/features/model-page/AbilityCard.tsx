export function AbilityCard(props: {
  onIcon: string
  offIcon: string

  name: string
  text: string
  enabled: boolean
}) {
  return (
    <div
      class='flex items-center gap-2'
      classList={{
        'opacity-70': !props.enabled,
      }}
    >
      <div>
        <div
          class='w-6 h-6 items-center bg-gray-800'
          classList={{
            [props.enabled ? props.onIcon : props.offIcon]: true,
          }}
        />
      </div>
      <div>
        <div class='font-bold text-sm text-gray-800'>{props.name}</div>
        <div class='text-gray-700 text-xs'>{props.text}</div>
      </div>
    </div>
  )
}
