export default function AboutCompare() {
  return (
    <div class='flex flex-col gap-2'>
      <div class='font-bold text-2xl'>
        Isn't it tough for models to{' '}
        <span class='text-uchu-purple-5'>gather information?</span>
      </div>
      <div class='text-gray-500 text-sm sm:text-base max-w-200'>
        Gathering information about language models can be challenging because
        the details are often scattered across a developer's website. For
        instance, when trying to find out about a model's knowledge cutoff, you
        might not find it in the official documentation, but it could be tucked
        away in a blog post from the release date. This fragmentation makes it
        tough to get a complete picture of an LLM. However, with LMSpecs, all of
        this information can be comprehensively understood in one place.
      </div>
    </div>
  )
}
