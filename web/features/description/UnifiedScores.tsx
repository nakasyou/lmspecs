import imageUnifiedLight from '../../assets/unified-light.webp'
import imageUnifiedDark from '../../assets/unified-dark.webp'

export default function UnifiedScores() {
  return (
    <div class='flex items-center justify-end md:items-start flex-col sm:flex-row-reverse gap-1'>
      <div class='flex flex-col gap-2'>
        <div class='font-bold text-2xl'>
          Can a <span class='text-uchu-purple-5'>Single Score</span>{' '}
          Define a Model’s Worth?
        </div>
        <div class='text-gray-500 text-sm sm:text-base max-w-200'>
          When evaluating language models, relying on just one score might not
          tell the whole story. Instead, using a variety of benchmarks—alongside
          factors like cost, speed, and other performance metrics—allows for a
          more comprehensive, multi-dimensional assessment. This approach makes
          it easier to identify the model that best fits your specific product
          needs.
        </div>
      </div>
      <div class='sm:min-w-50 h-40'>
        <img
          src={imageUnifiedLight}
          alt='Unified benchmarks'
          class='w-full h-full block dark:hidden'
        />
        <img
          src={imageUnifiedDark}
          alt='Unified benchmarks'
          class='w-full h-full hidden dark:block'
        />
      </div>
    </div>
  )
}
