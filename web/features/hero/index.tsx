import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-intl'
import { Match, onMount, Show, Switch, createEffect, createSignal, createMemo } from 'solid-js'
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
import ProviderSelect from './ProviderSelect.tsx'
import arrayBuffer_base64 from 'ikox/arraybuffer-base64'
import base64_arrayBuffer from 'ikox/base64-arraybuffer'

type ChartType = 'bar' | 'date' | 'scatter'

interface State {
  models: string[]
  providers: string[]
  yAxis: ValueTypeData
  xAxis: ValueTypeData
  chartType: ChartType
}

async function encodeState (state: State) {
  const json = JSON.stringify(state)
  const jsonStream = new Blob([json], { type: 'application/json' }).stream()
  const compressedStream = jsonStream.pipeThrough(new CompressionStream('gzip'))
  const compressed = await new Response(compressedStream).arrayBuffer()
  const compressedBase64 = arrayBuffer_base64(compressed)
  return compressedBase64
}
async function decodeState (hash: string) {
  const compressed = base64_arrayBuffer(hash)
  const compressedStream = new Blob([compressed], { type: 'application/octet-stream' }).stream()
  const decompressedStream = compressedStream.pipeThrough(new DecompressionStream('gzip'))
  const jsonText = await new Response(decompressedStream).text()
  return JSON.parse(jsonText) as State
}

const getState = (): State => {
  return {
    models: getSelectedModelIds(),
    providers: getSelectedProviderIds(),
    yAxis: getYAxis(),
    xAxis: getXAxis(),
    chartType: getChartType()
  }
}

let initialState: State = {
  models: [],
  providers: [],
  yAxis: ['lmarena', 'text_overall'] as ValueTypeData,
  xAxis: ['lmarena', 'text_overall'] as ValueTypeData,
  chartType: 'date' as const
}
if (location.hash.startsWith('#')) {
  const hash = location.hash.slice(1)
  initialState = await decodeState(hash)
}

const [getSelectedModelIds, setSelectedModelIds] = createSignal<string[]>(initialState.models)
const [getSelectedProviderIds, setSelectedProviderIds] = createSignal<string[]>(initialState.providers)
const [getYAxis, setYAxis] = createSignal<ValueTypeData>(initialState.yAxis)
const [getXAxis, setXAxis] = createSignal<ValueTypeData>(initialState.xAxis)
const [getChartType, setChartType] = createSignal<ChartType>(initialState.chartType)


function getAxisLabel(axis: ValueTypeData): string {
  const [type, value] = axis
  return `${VALUE_TYPES[type].title} - ${
    VALUE_TYPES[type].formatParams(value as never)
  }`
}

function Toolbox(props: {
  getChart: () => LMSpecsChart
}) {
  return (
    <div class="flex gap-2">
      <button
        type='button'
        class='p-1 rounded border w-8 h-8 border-uchu-gray-5 hover:bg-uchu-gray-1'
        title='Download Chart as PNG'
        onClick={() => {
          const a = document.createElement('a')
          a.download = 'chart.png'
          a.href = props.getChart().toBase64Image('image/png')
          a.click()
          a.remove()
        }}
      >
        <div class='w-4 h-4 i-tabler-download' />
      </button>
      <button
        type='button'
        class='p-1 rounded border w-8 h-8 border-uchu-gray-5 hover:bg-uchu-gray-1'
        title='Share Chart'
        onClick={async () => {
          const url = new URL(location.href)
          url.hash = await encodeState(getState())
          const shareData = {
            title: 'LM Specs Chart',
            text: 'Language Model Comparison Chart',
            url: url.toString()
          }

          try {
            if (navigator.share) {
              await navigator.share(shareData)
            } else {
              await navigator.clipboard.writeText(url.toString())
              alert('Copied a link to share.')
            }
          } catch (err) {
            console.error('共有に失敗しました:', err)
          }
        }}
      >
        <div class='w-4 h-4 i-tabler-share' />
      </button>
    </div>
  )
}
function Settings(props: {
  getChart: () => LMSpecsChart
}) {
  const getShouldAskProvider = createMemo(() => {
    const xlabel = getXAxis()?.[0]
    const ylabel = getYAxis()?.[0]

    if (xlabel && VALUE_TYPES[xlabel].isProvidedOnly) {
      return true
    }
    if (ylabel && VALUE_TYPES[ylabel].isProvidedOnly) {
      return true
    }

    return false
  })

  return (
    <div class='w-full ms:w-50 p-2 flex flex-col h-full justify-between'>
      <div>
        <div>
          <div class='font-bold'>Type</div>
          <div class='flex justify-between'>
            <div>
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

            <div class='block sm:hidden'>
              <Toolbox getChart={props.getChart} />
            </div>
          </div>
        </div>
        <div class="flex flex-row sm:flex-col w-full justify-between">
          <div>
            <div class='font-bold'>Models</div>
            <Dialog>
              <DialogOpener>
                <div class='text-uchu-purple-6 font-bold'>
                  {getSelectedModelIds().length} Selected
                </div>
              </DialogOpener>
              <DialogContent>
                <div class='font-bold text-xl'>Select Models</div>
                <ModelSelect
                  onChange={(v) => {
                    setSelectedModelIds(v.map((m) => m.id))
                  }}
                  mode='provided'
                />
              </DialogContent>
            </Dialog>
          </div>
          <Show when={getShouldAskProvider()}>
            <div>
              <div class='font-bold'>Provider</div>
              <ProviderSelect
                onChange={(v) => setSelectedProviderIds([...v])}
              />
            </div>
          </Show>
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
      </div>
      <div class='hidden sm:block'>
        <Toolbox getChart={props.getChart} />
      </div>
    </div>
  )
}
type LMSpecsChart = Chart<'bar' | 'line' | 'scatter', (
  | {
    x: string | number | Date
    y: number
  }
  | number
  | never
)[]>

export default function Hero() {
  let canvas!: HTMLCanvasElement

  let chart:
    | LMSpecsChart
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
            case 'date': {
              return {
                /*x: {
                  type: 'timeseries',
                }*/
                x: {
                  type: 'time',
                },
              }
            }
            default:
              return undefined
          }
        })(),
        responsive: true,
        maintainAspectRatio: false,
      },
      plugins: [
        {
          id: 'custom_canvas_background_color',
          beforeDraw: (chart) => {
            const ctx = chart.canvas.getContext('2d')!
            ctx.save()
            ctx.globalCompositeOperation = 'destination-over'
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, chart.canvas.width, chart.canvas.height)
            ctx.restore()
          },
        },
      ],
    })
  })

  createEffect(() => {
    const selectedModels = getSelectedModelIds()
    const yAxis = getYAxis()
    const xAxis = getXAxis()
    const chartType = getChartType()
    const selectedProviders = getSelectedProviderIds()

    if (!chart) {
      return
    }

    switch (chartType) {
      case 'scatter': {
        Promise.all([
          VALUE_TYPES[xAxis[0]].getData(
            xAxis[1] as never,
            selectedModels,
            selectedProviders,
          ),
          VALUE_TYPES[yAxis[0]].getData(
            yAxis[1] as never,
            selectedModels,
            selectedProviders,
          ),
        ]).then(([xScores, yScores]) => {
          const result = []
          for (const xId in xScores) {
            for (const yId in yScores) {
              if (
                xId !== yId &&
                !xId.endsWith('/' + yId) &&
                !yId.endsWith('/' + xId)
              ) {
                continue
              }
              const x = xScores[xId].at(-1)?.[1]
              const y = yScores[yId].at(-1)?.[1]
              if (!x || !y) {
                continue
              }
              result.push({
                label: xId.includes('/') ? xId : yId,
                data: [{
                  x,
                  y,
                }],
              })
            }
          }

          chart!.data.datasets = result
          chart?.update()
        })
        break
      }
      case 'bar': {
        VALUE_TYPES[yAxis[0]].getData(
          yAxis[1] as never,
          selectedModels,
          selectedProviders,
        )
          .then((scores) => {
            chart!.data.labels = Object.keys(scores)
            chart!.data.datasets[0].label = getAxisLabel(yAxis)
            chart!.data.datasets[0].data = Object.values(scores).flatMap((
              score,
            ) => (score ? score.at(-1)?.[1] : 0) ?? 0)
            chart?.update()
          })
        break
      }
      case 'date': {
        VALUE_TYPES[yAxis[0]].getData(
          yAxis[1] as never,
          selectedModels,
          selectedProviders,
        )
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
                  stepped: 'before',
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
    <div class='h-dvh flex flex-col sm:flex-row'>
      <div class='grow h-full overflow-hidden p-1'>
        <canvas ref={canvas} />
      </div>
      <div class='h-auto sm:h-full'>
        <Settings getChart={() => chart!} />
      </div>
    </div>
  )
}
