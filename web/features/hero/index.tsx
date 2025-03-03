import { Chart, registerables } from 'chart.js'
import { onMount } from 'solid-js'
import { Select } from '../../components/Select.tsx'
import {
  Dialog,
  DialogContent,
  DialogOpener,
} from '../../components/Dialog.tsx'
import ModelSelect from './ModelSelect.tsx'
import { createStore } from 'solid-js/store'
import { getLMArenaScores, type Model } from '../../lib/lmspecs/mod.ts'
import ValueSelect, { ValueTypeData } from './ValueSelect.tsx'
import { createEffect } from 'solid-js'
import { createSignal } from 'solid-js'

const [getSelectedModels, setSelectedModels] = createSignal<Model[]>([])
const [getYAxis, setYAxis] = createSignal<ValueTypeData>(['lmarena', 'text_overview'])

function Settings() {
  return (
    <div class='w-30 p-2 flex flex-col gap-2'>
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
          value='bar'
          class='w-full'
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

  let chart: Chart | null = null
  onMount(() => {
    Chart.register(...registerables)
    chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'lmarena.ai (text_overall)',
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
    if (chart) {
      switch (yAxis[0]) {
        case 'lmarena': {
          const ids = selectedModels.map(m => m.id)
          getLMArenaScores(selectedModels.map(m => m.id)).then(scores => {
            chart!.data.labels = selectedModels.map(m => m.id)
            chart!.data.datasets[0].data = Object.values(scores).map(score => score ? Object.values(score.scores).at(-1)![yAxis[1]] : 0)
            chart?.update()
          })
          break
        }
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
