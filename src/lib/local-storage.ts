import { STORAGE_KEY } from "@/lib/constants"
import type { SavedChart } from "@/types/birth"

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

function readStorage(): SavedChart[] {
  if (!isBrowser()) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as SavedChart[]
  } catch {
    return []
  }
}

function writeStorage(charts: SavedChart[]): void {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(charts))
}

export function getCharts(): SavedChart[] {
  return readStorage().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getChartById(id: string): SavedChart | undefined {
  return getCharts().find((chart) => chart.id === id)
}

export function saveChart(
  birthDetails: SavedChart["birthDetails"],
  chartData: SavedChart["chartData"]
): SavedChart {
  const newChart: SavedChart = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    birthDetails,
    chartData,
  }

  const charts = readStorage()
  charts.unshift(newChart)
  writeStorage(charts)
  return newChart
}

export function removeChart(id: string): void {
  const charts = readStorage().filter((chart) => chart.id !== id)
  writeStorage(charts)
}

export function clearCharts(): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(STORAGE_KEY)
}
