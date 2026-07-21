"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { PurchaseOrderOverviewCards } from "@/components/purchase-order-overview-cards"
import { BarangOverviewCards } from "@/components/barang-overview-cards"
import { VendorSummaryCard } from "@/components/widgets/vendor-summary-card"
import { ClientSummaryCard } from "@/components/widgets/client-summary-card"
import { ProjectSummaryCard } from "@/components/widgets/project-summary-card"
import { KaryawanSummaryCard } from "@/components/widgets/karyawan-summary-card"
import { PoStatusChart } from "@/components/widgets/po-status-chart"
import { BarangKategoriChart } from "@/components/widgets/barang-kategori-chart"
import { RecentPoTable } from "@/components/widgets/recent-po-table"
import { RecentPbTable } from "@/components/widgets/recent-pb-table"
import { AgingPoTable } from "@/components/widgets/aging-po-table"
import { TopVendorTable } from "@/components/widgets/top-vendor-table"
import { LowStockTable } from "@/components/widgets/low-stock-table"
import { AktivitasTerbaru } from "@/components/widgets/aktivitas-terbaru"
import { DashboardWidgetConfig } from "@/components/dashboard-widget-config"
import { AVAILABLE_WIDGETS, getEnabledWidgets } from "@/lib/dashboard-config"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Settings2Icon, LoaderIcon } from "lucide-react"

const WIDGET_MAP: Record<string, React.FC> = {
  "vendor-summary": VendorSummaryCard,
  "client-summary": ClientSummaryCard,
  "project-summary": ProjectSummaryCard,
  "karyawan-summary": KaryawanSummaryCard,
  "section-cards": SectionCards,
  "po-overview": PurchaseOrderOverviewCards,
  "barang-overview": BarangOverviewCards,
  "chart-po-harian": ChartAreaInteractive,
  "po-status-chart": PoStatusChart,
  "barang-kategori-chart": BarangKategoriChart,
  "recent-po": RecentPoTable,
  "recent-pb": RecentPbTable,
  "aging-po": AgingPoTable,
  "top-vendor": TopVendorTable,
  "low-stock": LowStockTable,
  "aktivitas-terbaru": AktivitasTerbaru,
}

const GRID_CLASSES: Record<string, string> = {
  stat: "grid grid-cols-2 sm:grid-cols-4 gap-4",
  overview: "grid grid-cols-1 lg:grid-cols-2 gap-4",
  chart: "grid grid-cols-1 lg:grid-cols-3 gap-4",
  table: "grid grid-cols-1 lg:grid-cols-2 gap-4",
  activity: "",
}

export default function Page() {
  const { can } = useAuth()
  const [configOpen, setConfigOpen] = useState(false)
  const [enabled, setEnabled] = useState<string[]>([])

  const refresh = useCallback(() => {
    setEnabled(getEnabledWidgets())
  }, [])

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [refresh])

  const grouped = AVAILABLE_WIDGETS.reduce(
    (acc, w) => {
      if (!enabled.includes(w.id)) return acc
      if (!can(w.permission)) return acc
      const Comp = WIDGET_MAP[w.id]
      if (!Comp) return acc
      if (!acc[w.category]) acc[w.category] = []
      acc[w.category].push({ id: w.id, Comp })
      return acc
    },
    {} as Record<string, { id: string; Comp: React.FC }[]>
  )

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview bisnis dan aktivitas terkini</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)}>
            <Settings2Icon />
            Configure Widgets
          </Button>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <LoaderIcon className="size-8 mb-2 animate-spin" />
            <p>Memuat widget...</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, widgets]) => (
            <div key={category}>
              <div className={GRID_CLASSES[category] || "grid grid-cols-1 gap-4"}>
                {widgets.map(({ id, Comp }) => (
                  <Comp key={id} />
                ))}
              </div>
              {category !== "activity" && widgets.length > 0 && <div className="h-4" />}
            </div>
          ))
        )}

        {grouped.activity?.length > 0 && (
          <div className="max-w-2xl">
            {grouped.activity.map(({ id, Comp }) => (
              <Comp key={id} />
            ))}
          </div>
        )}
      </div>

      <DashboardWidgetConfig open={configOpen} onOpenChange={setConfigOpen} />
    </DashboardLayout>
  )
}
