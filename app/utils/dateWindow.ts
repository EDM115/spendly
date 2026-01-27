export function getDateWindow(timeRange: string, anchorDate: string) {
  const [ by, bm, bd ] = (anchorDate || "").split("-")
    .map(Number)

  if (!by || !bm || !bd) {
    return null
  }

  const base = new Date(by, bm - 1, bd)
  let start: Date
  let end: Date

  switch (timeRange) {
    case "day": {
      start = new Date(base.getFullYear(), base.getMonth(), base.getDate())
      end = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1)

      break
    } case "week": {
      const today = new Date(base.getFullYear(), base.getMonth(), base.getDate())
      const diffToMonday = (today.getDay() + 6) % 7

      start = new Date(today)
      start.setDate(today.getDate() - diffToMonday)
      end = new Date(start)
      end.setDate(start.getDate() + 7)

      break
    } case "month": {
      start = new Date(base.getFullYear(), base.getMonth(), 1)
      end = new Date(base.getFullYear(), base.getMonth() + 1, 1)

      break
    } case "year": {
      start = new Date(base.getFullYear(), 0, 1)
      end = new Date(base.getFullYear() + 1, 0, 1)

      break
    } default:
      return null
  }

  const toStr = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1)
    .padStart(2, "0")}-${String(dt.getDate())
    .padStart(2, "0")}`

  return {
    start: toStr(start),
    end: toStr(end),
  }
}
