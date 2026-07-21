"use client"

import { use, useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PembelianLangsungWizard } from "@/components/pembelian-langsung-wizard"
import { fetchPembelianLangsung, type PembelianLangsung } from "@/lib/pembelian-langsung-api"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function EditPembelianLangsungPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<PembelianLangsung | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPembelianLangsung(id)
      .then(setData)
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Edit Pembelian Langsung</h1>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <PembelianLangsungWizard editData={data} />
        )}
      </div>
    </DashboardLayout>
  )
}
