import { Chart, registerables } from 'chart.js'
import { Match, onMount, Show, Switch } from 'solid-js'
import { Select } from '../../components/Select.tsx'
import {
  Dialog,
  DialogContent,
  DialogOpener,
} from '../../components/Dialog.tsx'
import ModelSelect from './ModelSelect.tsx'
import {
  getLMArenaScores,
  getMMLUProScores,
  type Model,
} from '../../lib/lmspecs/mod.ts'
import ValueSelect, {
  VALUE_TYPES,
  ValueType,
  ValueTypeData,
} from './ValueSelect.tsx'
import { createEffect } from 'solid-js'
import { createSignal } from 'solid-js'

const [getSelectedModels, setSelectedModels] = createSignal<Model[]>([])
const [getYAxis, setYAxis] = createSignal<ValueTypeData>([
  'lmarena',
  'text_overall',
])
const [getXAxis, setXAxis] = createSignal<ValueTypeData>([
  'lmarena',
  'text_overall',
])
const [getChartType, setChartType] = createSignal<'bar' | 'date' | 'scatter'>(
  'date',
)

function getAxisLabel(axis: ValueTypeData): string {
  const [type, value] = axis
  return `${VALUE_TYPES[type].title} - ${
    VALUE_TYPES[type].formatParams(value as never)
  }`
}

function Settings() {
  return (
    <div class='w-50 p-2 flex flex-col gap-2'>
      <div>
        <div class='font-bold'>Type</div>
        <Select
          titles={{
            bar: (
              <div class='flex items-center gap-1'>
                <div class='i-tabler-chart-bar w-4 h-4' />Bar
              </div>
            ),
            date: (
              <div class='flex items-center gap-1'>
                <div class='i-tabler-chart-line w-4 h-4' />Date
              </div>
            ),
            scatter: (
              <div class='flex items-center gap-1'>
                <div class='i-tabler-chart-dots w-4 h-4' />Scatter
              </div>
            ),
          }}
          value={getChartType()}
          class='w-full'
          onChange={(v) => setChartType(v)}
        />
      </div>
      <div>
        <div class='font-bold'>Models</div>
        <Dialog>
          <DialogOpener>
            <div class='text-uchu-purple-6 font-bold'>
              {getSelectedModels().length} Selected
            </div>
          </DialogOpener>
          <DialogContent>
            <div class='font-bold text-xl'>Select Models</div>
            <ModelSelect
              onChange={(v) => {
                setSelectedModels(v)
              }}
              mode='provided'
            />
          </DialogContent>
        </Dialog>
      </div>
      <Show when={getChartType() === 'scatter'}>
        <div>
          <div class='font-bold'>X Axis</div>
          <ValueSelect value={getXAxis()} onChange={setXAxis} />
        </div>
      </Show>
      <div>
        <div class='font-bold'>Y Axis</div>
        <ValueSelect value={getYAxis()} onChange={setYAxis} />
      </div>
    </div>
  )
}

export default function Hero() {
  let canvas!: HTMLCanvasElement

  let chart:
    | Chart<'bar' | 'line' | 'scatter', (
      | {
        x: string | number
        y: number
      }
      | number
      | never
    )[]>
    | null = null

  onMount(() => {
    Chart.register(...registerables)
  })

  createEffect(() => {
    const chartType = getChartType()
    const xAxis = getXAxis()
    const yAxis = getYAxis()

    chart?.destroy()
    chart = new Chart(canvas, {
      type: (() => {
        switch (chartType) {
          case 'bar':
            return 'bar'
          case 'scatter':
            return 'scatter'
          default:
            return 'line'
        }
      })(),
      data: {
        labels: [],
        datasets: [
          {
            label: 'Score',
            data: [],
          },
        ],
      },
      options: {
        scales: (() => {
          switch (chartType) {
            case 'scatter':
              return {
                x: {
                  type: 'linear',
                  position: 'bottom',
                  title: {
                    display: true,
                    text: getAxisLabel(xAxis),
                  },
                },
                y: {
                  type: 'linear',
                  title: {
                    display: true,
                    text: getAxisLabel(yAxis),
                  },
                },
              }
            default:
              return undefined
          }
        })(),
      },
    })
  })

  createEffect(() => {
    const selectedModels = getSelectedModels()
    const yAxis = getYAxis()
    const xAxis = getXAxis()
    const chartType = getChartType()

    if (!chart) {
      return
    }

    switch (chartType) {
      case 'scatter': {
        const ids = selectedModels.map((m) => m.id)
        Promise.all([
          VALUE_TYPES[xAxis[0]].getData(xAxis[1] as never, ids),
          VALUE_TYPES[yAxis[0]].getData(yAxis[1] as never, ids),
        ]).then(([xScores, yScores]) => {
          chart!.data.datasets = ids.flatMap((id) => {
            const x = xScores[id].at(-1)?.[1]
            const y = yScores[id].at(-1)?.[1]
            if (!x || !y) {
              return []
            }
            return {
              label: id,
              data: [{
                x,
                y
              }]
            }
          })
          chart?.update()
        })
        break
      }
      case 'bar': {
        const ids = selectedModels.map((m) => m.id)
        VALUE_TYPES[yAxis[0]].getData(yAxis[1] as never, ids)
          .then((scores) => {
            chart!.data.labels = ids
            chart!.data.datasets[0].data = Object.values(scores).flatMap((
              score,
            ) => (score ? score.at(-1)?.[1] : 0) ?? 0)
            chart?.update()
          })
        break
      }
      case 'date': {
        const ids = selectedModels.map((m) => m.id)
        VALUE_TYPES[yAxis[0]].getData(yAxis[1] as never, ids)
          .then((scores) => {
            let labels: string[] = []
            for (const modelId in scores) {
              const dates = scores[modelId]
              if (labels.length < dates.length) {
                labels = dates.map((d) => d[0])
              }
            }
            chart!.data.datasets = Object.entries(scores).map(
              ([model, scores]) => {
                return {
                  label: model,
                  data: scores
                    ? scores
                      .flatMap(([date, score]) => {
                        return score
                          ? {
                            x: date,
                            y: score,
                          }
                          : []
                      })
                    : [],
                }
              },
            )
            chart!.data.labels = [...labels]
            chart?.update()
          })
        break
      }
    }
  })

  return (
    <div class='h-dvh flex'>
      <div class='grow h-full'>
        <canvas ref={canvas} />
      </div>
      <div>
        <Settings />
      </div>
    </div>
  )
}
