"use client"

import { AVAILABLE_WIDGETS, getEnabledWidgets, setEnabledWidgets, type WidgetDef } from "@/lib/dashboard-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { EyeIcon, EyeOffIcon, LayersIcon } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  stat: "Stat Cards",
  overview: "Overview",
  chart: "Charts",
  table: "Tables",
  activity: "Activity",
}

const CATEGORY_ORDER = ["stat", "overview", "chart", "table", "activity"]

export function DashboardWidgetConfig({ open, onOpenChange }: Props) {
  const { can } = useAuth()
  const [enabled, setEnabled] = useState<string[]>([])

  useEffect(() => {
    if (open) setEnabled(getEnabledWidgets())
  }, [open])

  function toggle(id: string) {
    setEnabled((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    )
  }

  function isVisible(w: WidgetDef) {
    return can(w.permission)
  }

  function handleSave() {
    setEnabledWidgets(enabled)
    onOpenChange(false)
    window.dispatchEvent(new Event("storage"))
  }

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      acc[cat] = AVAILABLE_WIDGETS.filter((w) => w.category === cat && isVisible(w))
      return acc
    },
    {} as Record<string, WidgetDef[]>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <LayersIcon className="size-4" /> Konfigurasi Widget
          </SheetTitle>
          <SheetDescription>Pilih widget yang ingin ditampilkan di dashboard</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {CATEGORY_ORDER.map((cat) => {
            const widgets = grouped[cat]
            if (!widgets.length) return null
            const allOn = widgets.every((w) => enabled.includes(w.id))
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {CATEGORY_LABELS[cat]}
                  </h3>
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                    <Checkbox
                      className="size-3.5"
                      checked={allOn}
                      onCheckedChange={(v) => {
                        if (v) {
                          setEnabled((prev) => [...new Set([...prev, ...widgets.map((w) => w.id)])])
                        } else {
                          setEnabled((prev) => prev.filter((id) => !widgets.some((w) => w.id === id)))
                        }
                      }}
                    />
                    Semua
                  </label>
                </div>
                <div className="space-y-2">
                  {widgets.map((w) => {
                    const active = enabled.includes(w.id)
                    return (
                      <label
                        key={w.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                          active ? "border-primary/30 bg-primary/5" : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          checked={active}
                          onCheckedChange={() => toggle(w.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{w.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{w.description}</p>
                        </div>
                        {active ? (
                          <EyeIcon className="size-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <EyeOffIcon className="size-4 shrink-0 text-muted-foreground" />
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
