"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchPOPerStatus, type PerStatusItem } from "@/lib/report-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { LoaderIcon } from "lucide-react"

const COLORS: Record<string, string> = {
  draft: "#6b7280",
  dikirim: "#3b82f6",
  disetujui: "#22c55e",
  diterima: "#16a34a",
  diterima_sebagian: "#eab308",
  dibatalkan: "#ef4444",
}

const LABELS: Record<string, string> = {
  draft: "Draft",
  dikirim: "Dikirim",
  disetujui: "Disetujui",
  diterima: "Diterima",
  diterima_sebagian: "Diterima Sebagian",
  dibatalkan: "Dibatalkan",
}

export function PoStatusChart() {
  const { can } = useAuth()
  const [data, setData] = useState<PerStatusItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.po_status_chart")) return
    fetchPOPerStatus()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.po_status_chart")) return null

  const chartData = data.map((d) => ({
    name: LABELS[d.status] || d.status,
    value: d.total,
    total_nilai: d.total_nilai,
  }))

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Distribusi PO per Status</CardTitle>
        <CardDescription>Jumlah PO berdasarkan status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Tidak ada data</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[data[index]?.status] || "#6b7280"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
