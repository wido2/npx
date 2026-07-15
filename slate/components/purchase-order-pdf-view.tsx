"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { fetchPurchaseOrderPdf } from "@/lib/purchase-order-api"
import { fetchSetting } from "@/lib/settings-api"
import { ArrowLeftIcon, DownloadIcon, LoaderIcon } from "lucide-react"

export function PurchaseOrderPdfView({ poId }: { poId: string }) {
  const router = useRouter()
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const pdfSetting = await fetchSetting("pdf_report")
        const data = pdfSetting.data as Record<string, unknown>
        const useClientCode = !!(data as { rahasiakan_client?: boolean }).rahasiakan_client
        const blob = await fetchPurchaseOrderPdf(poId, { useClientCode })
        if (!cancelled) {
          setUrl(URL.createObjectURL(blob))
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          toast.error("Gagal memuat PDF")
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [poId])

  function handleDownload() {
    if (!url) return
    const a = document.createElement("a")
    a.href = url
    a.download = `PO-${poId.slice(0, 8)}.pdf`
    a.click()
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="font-medium">Preview Purchase Order</h1>
        <Button onClick={handleDownload} disabled={!url}>
          <DownloadIcon />
          Download PDF
        </Button>
      </header>
      <div className="flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <LoaderIcon className="mr-2 size-5 animate-spin" />
            Memuat PDF...
          </div>
        ) : url ? (
          <iframe src={url} className="h-full w-full" title="PO PDF Preview" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Gagal memuat PDF
          </div>
        )}
      </div>
    </div>
  )
}
