export default function Hero() {
  return (
    <div class='flex items-center flex-col md:flex-row'>
      <div class='flex flex-col gap-5 max-h-dvh h-120 sm:h-100 justify-end'>
        <div class='text-slate-950 text-left max-w-5xl font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight dark:text-white'>
          Unified database for Language Models:{' '}
          <span class='text-uchu-purple-5'>LMSpecs</span>
        </div>
        <div class='text-gray-500 dark:text-slate-300'>
          LMSpecs is a language model with a database of{' '}
          <span class='text-uchu-purple-5 font-bold '>3+</span>{' '}
          integrated benchmarks/scores, providing a versatile framework to
          evaluate its language understanding, generation, and reasoning across
          diverse tasks, aiding researchers in optimizing it{' '}
          <span class='text-uchu-purple-5 font-bold'>
            for real-world use
          </span>.
        </div>
        <div class='flex items-center gap-2 flex-wrap justify-start'>
          <a
            href='/chart'
            class='flex items-center px-4 h-12 rounded-full bg-uchu-purple-5 hover:bg-uchu-purple-4 text-white font-bold'
          >
            Open chart viewer
          </a>
          <a
            href='/model'
            class='flex items-center border border-gray-300 px-4 h-12 hover:bg-gray-50 text-gray-700 rounded-full'
          >
            Search models
          </a>
        </div>
      </div>
    </div>
  )
}
