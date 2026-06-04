"use client"

import { History, Sparkles } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { ChartHistory } from "@/components/astrology/chart-history"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { ButtonLink } from "@/components/ui/button"
import { getCharts, removeChart } from "@/lib/local-storage"
import type { SavedChart } from "@/types/birth"

export function HistoryPageClient() {
  const [charts, setCharts] = useState<SavedChart[]>([])

  const refresh = useCallback(() => {
    setCharts(getCharts())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleDelete = useCallback(
    (id: string) => {
      removeChart(id)
      refresh()
      toast.success("Chart removed from history")
    },
    [refresh]
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Chart History"
        description="Revisit previously generated birth charts saved in your browser."
      />

      {charts.length === 0 ? (
        <EmptyState
          icon={History}
          title="No charts yet"
          description="Generate your first Vedic birth chart and it will appear here for easy access."
          action={
            <ButtonLink href="/chart">
              <Sparkles className="size-4" aria-hidden="true" />
              Generate Chart
            </ButtonLink>
          }
        />
      ) : (
        <ChartHistory charts={charts} onDelete={handleDelete} />
      )}
    </div>
  )
}
