export interface ModelMeta {
  name: string
  id: string
  logos?: string[]
  multimodalities: {
    input: ('image' | 'text' | 'audio' | 'video')[]
    output: ('image' | 'text' | 'audio' | 'video')[]
    sources: string[]
  }
  token_limit: {
    input: number
    output?: number
    sources: string[]
  }
  license: {
    value: string
  }
  creators: string[]
  cutoff_date?: {
    value: string
    sources: string[]
  }
  published: string
}
