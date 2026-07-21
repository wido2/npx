"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchBarangPerKategori, type PerKategoriItem } from "@/lib/report-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { LoaderIcon } from "lucide-react"

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7", "#ec4899", "#14b8a6", "#f97316"]

export function BarangKategoriChart() {
  const { can } = useAuth()
  const [data, setData] = useState<PerKategoriItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.barang_kategori_chart")) return
    fetchBarangPerKategori()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.barang_kategori_chart")) return null

  const chartData = data.map((d) => ({
    name: d.kategori_nama,
    value: d.total_barang,
  }))

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Distribusi Barang per Kategori</CardTitle>
        <CardDescription>Jumlah barang berdasarkan kategori</CardDescription>
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
              <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
