export const formatTokenUnit = (val: number) => {
  if (val < 1000) {
    return Math.floor(val).toString()
  }
  if (val < 1000000) {
    return Math.floor(val / 100) / 10 + 'k'
  }
  return Math.floor(val / 100000) / 10 + 'M'
}
