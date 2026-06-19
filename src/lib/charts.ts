import { createClient } from "@/lib/supabase/client"
import { getCharts as getLocalCharts } from "@/lib/local-storage"
import type { BirthDetails, SavedChart, StoredChartData } from "@/types/birth"
import type { ChartRow, Json } from "@/types/database"

function rowToSavedChart(row: ChartRow): SavedChart {
  return {
    id: row.id,
    createdAt: row.created_at,
    birthDetails: {
      name: row.name,
      date: row.birth_date,
      time: row.birth_time,
      place: row.birth_place,
    },
    chartData: row.chart_data,
  }
}

export async function fetchCharts(): Promise<SavedChart[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("charts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data as ChartRow[]).map(rowToSavedChart)
}

export async function fetchChartById(id: string): Promise<SavedChart | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("charts")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? rowToSavedChart(data as ChartRow) : null
}

export async function saveChartToDb(
  birthDetails: BirthDetails,
  chartData: StoredChartData
): Promise<SavedChart> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("charts")
    .insert({
      user_id: user.id,
      name: birthDetails.name,
      birth_date: birthDetails.date,
      birth_time: birthDetails.time,
      birth_place: birthDetails.place,
      chart_data: chartData as unknown as Json,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToSavedChart(data as ChartRow)
}

export async function deleteChart(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("charts").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function importLocalCharts(): Promise<number> {
  const local = getLocalCharts()
  if (local.length === 0) return 0

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const rows = local.map((chart) => ({
    user_id: user.id,
    name: chart.birthDetails.name,
    birth_date: chart.birthDetails.date,
    birth_time: chart.birthDetails.time,
    birth_place: chart.birthDetails.place,
    chart_data: chart.chartData as unknown as Json,
    created_at: chart.createdAt,
  }))

  const { error } = await supabase.from("charts").insert(rows)
  if (error) throw new Error(error.message)

  return local.length
}
