/**!
 * Based on https://github.com/dankerow/chartjs-adapter-intl/blob/d57a433b18945c1b074542df3352c4ae4131e441/src/index.ts
 * 
 * MIT License
 * Copyright (c) 2024 Dan
 */

// @ts-nocheck
import type { TimeUnit } from 'chart.js'
import { _adapters } from 'chart.js'

export const apply = () => {
  const FORMATS = {
    datetime: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    },
    millisecond: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      fractionalSecondDigits: 3,
    },
    second: { hour: 'numeric', minute: 'numeric', second: 'numeric' },
    minute: { hour: 'numeric', minute: 'numeric' },
    hour: { hour: 'numeric' },
    day: { month: 'short', day: 'numeric' },
    week: { year: 'numeric', month: 'short', day: 'numeric' },
    month: { year: 'numeric', month: 'short' },
    quarter: { year: 'numeric', month: 'short' },
    year: { year: 'numeric' },
  }

  _adapters._date.override({
    // @ts-ignore
    formats: () => FORMATS,
    parse: function (value: unknown, _format?: TimeUnit): number | null {
      if (value === null || value === undefined) {
        return null
      }

      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? null : date.getTime()
      }

      return null
    },
    format: function (
      time: number,
      format: Intl.DateTimeFormatOptions,
    ): string {
      const date = new Date(time)
      const locale = this.options?.locale || 'en-US'

      return new Intl.DateTimeFormat(locale, format).format(date)
    },
    add: function (time: number, amount: number, unit: string) {
      const date = new Date(time)

      switch (unit) {
        case 'millisecond': {
          date.setMilliseconds(date.getMilliseconds() + amount)
          break
        }
        case 'second': {
          date.setSeconds(date.getSeconds() + amount)
          break
        }
        case 'minute': {
          date.setMinutes(date.getMinutes() + amount)
          break
        }
        case 'hour': {
          date.setHours(date.getHours() + amount)
          break
        }
        case 'day': {
          date.setDate(date.getDate() + amount)
          break
        }
        case 'week': {
          date.setDate(date.getDate() + amount * 7)
          break
        }
        case 'month': {
          date.setMonth(date.getMonth() + amount)
          break
        }
        case 'quarter': {
          date.setMonth(date.getMonth() + amount * 3)
          break
        }
        case 'year': {
          date.setFullYear(date.getFullYear() + amount)
          break
        }
        default: {
          break
        }
      }

      return date.getTime()
    },
    diff: function (max: number, min: number, unit: TimeUnit) {
      const dateMax = new Date(max)
      const dateMin = new Date(min)
      const diff = dateMax.getTime() - dateMin.getTime()

      switch (unit) {
        case 'millisecond': {
          return diff
        }
        case 'second': {
          return diff / 1000
        }
        case 'minute': {
          return diff / (1000 * 60)
        }
        case 'hour': {
          return diff / (1000 * 60 * 60)
        }
        case 'day': {
          return diff / (1000 * 60 * 60 * 24)
        }
        case 'week': {
          return diff / (1000 * 60 * 60 * 24 * 7)
        }
        case 'month': {
          return (dateMax.getFullYear() - dateMin.getFullYear()) * 12 +
            (dateMax.getMonth() - dateMin.getMonth())
        }
        case 'quarter': {
          return (dateMax.getFullYear() - dateMin.getFullYear()) * 4 +
            Math.floor(dateMax.getMonth() / 3) -
            Math.floor(dateMin.getMonth() / 3)
        }
        case 'year': {
          return dateMax.getFullYear() - dateMin.getFullYear()
        }
        default: {
          return diff
        }
      }
    },
    startOf: function (time: number, unit: TimeUnit | 'isoWeek'): number {
      const date = new Date(time)

      switch (unit) {
        case 'second': {
          date.setMilliseconds(0)
          break
        }
        case 'minute': {
          date.setSeconds(0, 0)
          break
        }
        case 'hour': {
          date.setMinutes(0, 0, 0)
          break
        }
        case 'day': {
          date.setHours(0, 0, 0, 0)
          break
        }
        case 'week': {
          const day = date.getDay()
          const diff = date.getDate() - day + (day === 0 ? -6 : 1)
          date.setDate(diff)
          date.setHours(0, 0, 0, 0)
          break
        }
        case 'isoWeek': {
          const day = date.getDay()
          const diff = date.getDate() - (day === 0 ? 6 : day - 1)
          date.setDate(diff)
          date.setHours(0, 0, 0, 0)
          break
        }
        case 'month': {
          date.setDate(1)
          date.setHours(0, 0, 0, 0)
          break
        }
        case 'quarter': {
          const month = date.getMonth()
          const quarterStartMonth = month - (month % 3)
          date.setMonth(quarterStartMonth, 1)
          date.setHours(0, 0, 0, 0)
          break
        }
        case 'year': {
          date.setMonth(0, 1)
          date.setHours(0, 0, 0, 0)
          break
        }
        default: {
          break
        }
      }

      return date.getTime()
    },
    endOf: function (time: number, unit: TimeUnit | 'isoWeek') {
      const date = new Date(time)

      switch (unit) {
        case 'second': {
          date.setMilliseconds(999)
          break
        }
        case 'minute': {
          date.setSeconds(59, 999)
          break
        }
        case 'hour': {
          date.setMinutes(59, 59, 999)
          break
        }
        case 'day': {
          date.setHours(23, 59, 59, 999)
          break
        }
        case 'week': {
          const day = date.getDay()
          const diff = date.getDate() - day + (day === 0 ? -6 : 1) + 6
          date.setDate(diff)
          date.setHours(23, 59, 59, 999)
          break
        }
        case 'isoWeek': {
          const day = date.getDay()
          const diff = date.getDate() - day + (day === 0 ? -6 : 1) + 6
          date.setDate(diff)
          date.setHours(23, 59, 59, 999)
          break
        }
        case 'month': {
          date.setMonth(date.getMonth() + 1, 0)
          date.setHours(23, 59, 59, 999)
          break
        }
        case 'quarter': {
          const month = date.getMonth()
          const quarterEndMonth = month - (month % 3) + 2
          date.setMonth(quarterEndMonth + 1, 0)
          date.setHours(23, 59, 59, 999)
          break
        }
        case 'year': {
          date.setMonth(11, 31)
          date.setHours(23, 59, 59, 999)
          break
        }
        default: {
          break
        }
      }

      return date.getTime()
    },
  })
}
