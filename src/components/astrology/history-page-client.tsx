"use client"

import { History, Sparkles, Upload } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { ChartHistory } from "@/components/astrology/chart-history"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  deleteChart,
  fetchCharts,
  importLocalCharts,
} from "@/lib/charts"
import { clearCharts, getCharts as getLocalCharts } from "@/lib/local-storage"
import type { SavedChart } from "@/types/birth"

export function HistoryPageClient() {
  const [charts, setCharts] = useState<SavedChart[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [hasLocalCharts, setHasLocalCharts] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchCharts()
      setCharts(data)
      setHasLocalCharts(getLocalCharts().length > 0)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load charts"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteChart(id)
        await refresh()
        toast.success("Chart removed from history")
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete chart"
        )
      }
    },
    [refresh]
  )

  const handleImport = useCallback(async () => {
    setImporting(true)
    try {
      const count = await importLocalCharts()
      clearCharts()
      setHasLocalCharts(false)
      await refresh()
      toast.success(`Imported ${count} chart${count === 1 ? "" : "s"} from this browser`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import charts"
      )
    } finally {
      setImporting(false)
    }
  }, [refresh])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Chart History"
        description="Revisit previously generated birth charts saved to your account."
      />

      {hasLocalCharts && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            You have charts saved in this browser from before you signed in.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleImport()}
            disabled={importing}
          >
            <Upload className="size-4" aria-hidden="true" />
            {importing ? "Importing…" : "Import local charts"}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-48 animate-pulse rounded-xl bg-muted"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : charts.length === 0 ? (
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
        <ChartHistory charts={charts} onDelete={(id) => void handleDelete(id)} />
      )}
    </div>
  )
}
