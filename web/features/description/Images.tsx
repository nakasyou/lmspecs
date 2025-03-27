import imageScreenshotChart from '../../assets/screenshot-chart.webp'
import imageGemini2ExpCarbon from '../../assets/gemini-2.0-exp-carbon.webp'
import imageModelDirs from '../../assets/model-dirs.webp'

export default function Images() {
  return (
    <div class=''>
      <div class="bg-slate-200 p-3 h-70">
        <div class="overflow-x-hidden w-full h-full flex gap-2">
        <img class="rounded-md" src={imageModelDirs} alt='A lot of directories which mean Language Model on GitHub.' />
          <img class="rounded-md bg-white object-contain" src={imageScreenshotChart} alt='Chart that compares language models with cost/lmarena score.' />
          <img class="rounded-md" src={imageGemini2ExpCarbon} alt='A JSON code that shows data of gemini-2.0-flash-exp.' />
        </div>
      </div>
    </div>
  )
}
