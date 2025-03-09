import { Chart, registerables } from 'chart.js'
import { onMount } from 'solid-js'
import { Select } from '../../components/Select.tsx'
import {
  Dialog,
  DialogContent,
  DialogOpener,
} from '../../components/Dialog.tsx'
import ModelSelect from './ModelSelect.tsx'
import { getLMArenaScores, getMMLUProScores, type Model } from '../../lib/lmspecs/mod.ts'
import ValueSelect, { ValueTypeData } from './ValueSelect.tsx'
import { createEffect } from 'solid-js'
import { createSignal } from 'solid-js'

const [getSelectedModels, setSelectedModels] = createSignal<Model[]>([])
const [getYAxis, setYAxis] = createSignal<ValueTypeData>(['lmarena', 'text_overall'])
const [getChartType, setChartType] = createSignal<'bar' | 'date'>('date')

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
            <div class='text-uchu-purple-6 font-bold'>{getSelectedModels().length} Selected</div>
          </DialogOpener>
          <DialogContent>
            <div class='font-bold text-xl'>Select Models</div>
            <ModelSelect onChange={(v) => {
              setSelectedModels(v)
            }} />
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <div class='font-bold'>Y Axis</div>
        <ValueSelect onChange={setYAxis} />
      </div>
    </div>
  )
}
export default function Hero() {
  let canvas!: HTMLCanvasElement

  let chart: Chart<'bar' | 'line', ({
    x: string
    y: number
  } | number | never)[]> | null = null
  onMount(() => {
    Chart.register(...registerables)
  })

  createEffect(() => {
    const chartType = getChartType()
    chart?.destroy()
    chart = new Chart(canvas, {
      type: chartType === 'bar' ? 'bar' : 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Score',
            data: []
          }
        ]
      },
      options: {
      },
    })
  })

  createEffect(() => {
    const selectedModels = getSelectedModels()
    const yAxis = getYAxis()
    const chartType = getChartType()

    if (!chart) {
      return
    }
    switch (chartType) {
      case 'bar': {
        switch (yAxis[0]) {
          case 'lmarena': {
            const ids = selectedModels.map(m => m.id)
            getLMArenaScores(ids).then(scores => {
              chart!.data.labels = ids
              chart!.data.datasets[0].data = Object.values(scores).map(score => score ? Object.values(score.scores).at(-1)![yAxis[1]] : 0)
            })
            break
          }
          case 'mmlu_pro': {
            const ids = selectedModels.map(m => m.id)
            getMMLUProScores(ids).then(scores => {
              chart!.data.labels = ids
              chart!.data.datasets[0].data = Object.values(scores).map(score => score ? Object.values(score.scores).at(-1)![yAxis[1]] : 0)
            })
            break
          }
        }
        chart?.update()
        break
      }
      case 'date': {
        switch (yAxis[0]) {
          case 'lmarena':
          case 'mmlu_pro': {
            const ids = selectedModels.map(m => m.id)
            ;(yAxis[0] === 'lmarena' ? getLMArenaScores : getMMLUProScores)(ids).then(scores => {
              let labels: string[] = []
              for (const modelId in scores) {
                const dates = Object.keys(scores[modelId]?.scores ?? {})
                if (labels.length < dates.length) {
                  labels = dates
                }
              }
              chart!.data.datasets = Object.entries(scores).map(([model, scores]) => {
                return {
                  label: model,
                  data: scores ? Object.entries(scores.scores)
                    .map(([date, score], i) => {
                      return {
                        x: date,
                        y: score ? score[yAxis[1]] : 0
                      }
                    }) : []
                }
              })
              chart!.data.labels = [...labels]
              console.log(chart?.data.datasets)
              chart?.update()
            })
            break
          }
        }
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
