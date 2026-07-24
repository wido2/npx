"use client"

export interface WidgetDef {
  id: string
  title: string
  description: string
  permission: string
  category: "stat" | "overview" | "chart" | "table" | "activity"
  defaultEnabled: boolean
}

export const AVAILABLE_WIDGETS: WidgetDef[] = [
  // Stat Cards
  { id: "vendor-summary", title: "Ringkasan Vendor", description: "Total vendor aktif", permission: "widget.vendor_summary", category: "stat", defaultEnabled: true },
  { id: "client-summary", title: "Ringkasan Client", description: "Total client aktif", permission: "widget.client_summary", category: "stat", defaultEnabled: true },
  { id: "project-summary", title: "Ringkasan Project", description: "Total project aktif/selesai", permission: "widget.project_summary", category: "stat", defaultEnabled: true },
  { id: "karyawan-summary", title: "Ringkasan Karyawan", description: "Total karyawan aktif", permission: "widget.karyawan_summary", category: "stat", defaultEnabled: true },

  // Overview
  { id: "po-overview", title: "Overview PO", description: "Ringkasan status Purchase Order", permission: "widget.po_overview", category: "overview", defaultEnabled: true },
  { id: "barang-overview", title: "Overview Barang", description: "Ringkasan stok barang", permission: "widget.barang_overview", category: "overview", defaultEnabled: true },

  // Charts
  { id: "chart-po-harian", title: "Grafik PO per Hari", description: "Nilai PO harian (disetujui vs pending)", permission: "widget.chart_area_interactive", category: "chart", defaultEnabled: true },

  // Tables
  { id: "recent-po", title: "PO Terbaru", description: "5 Purchase Order terbaru", permission: "widget.recent_po", category: "table", defaultEnabled: true },
  { id: "recent-harga-update", title: "Harga Terupdate", description: "5 Harga Update terakhir", permission: "widget.recent_harga_update", category: "table", defaultEnabled: true },
  { id: "recent-pb", title: "PB Terbaru", description: "5 Pengambilan Barang terbaru", permission: "widget.recent_pb", category: "table", defaultEnabled: true },
  { id: "aging-po", title: "Aging PO", description: "PO pending paling lama", permission: "widget.aging_po", category: "table", defaultEnabled: true },
  { id: "top-vendor", title: "Top Vendor by Nilai PO", description: "Vendor dengan nilai PO tertinggi", permission: "widget.top_vendor", category: "table", defaultEnabled: true },
  { id: "low-stock", title: "Stok Menipis", description: "Barang dengan stok rendah", permission: "widget.low_stock", category: "table", defaultEnabled: true },

  // Activity
  { id: "aktivitas-terbaru", title: "Aktivitas Terbaru", description: "Notifikasi dan aktivitas terbaru", permission: "widget.aktivitas_terbaru", category: "activity", defaultEnabled: true },
]

const STORAGE_KEY = "dashboard_widgets_enabled"

export function getEnabledWidgets(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return AVAILABLE_WIDGETS.map((w) => w.id)
    return JSON.parse(raw) as string[]
  } catch {
    return AVAILABLE_WIDGETS.map((w) => w.id)
  }
}

export function setEnabledWidgets(ids: string[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {}
}

export function toggleWidget(id: string, enabled: boolean): void {
  const current = getEnabledWidgets()
  if (enabled && !current.includes(id)) {
    setEnabledWidgets([...current, id])
  } else if (!enabled) {
    setEnabledWidgets(current.filter((w) => w !== id))
  }
}
