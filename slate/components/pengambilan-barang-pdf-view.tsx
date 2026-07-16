"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { fetchPengambilanBarangPdf } from "@/lib/pengambilan-barang-api"
import { ArrowLeftIcon, DownloadIcon, LoaderIcon } from "lucide-react"

export function PengambilanBarangPdfView({ pbId }: { pbId: string }) {
  const router = useRouter()
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const blob = await fetchPengambilanBarangPdf(pbId)
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
  }, [pbId])

  function handleDownload() {
    if (!url) return
    const a = document.createElement("a")
    a.href = url
    a.download = `PB-${pbId.slice(0, 8)}.pdf`
    a.click()
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="font-medium">Preview Pengambilan Barang</h1>
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
          <iframe src={url} className="h-full w-full" title="PB PDF Preview" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Gagal memuat PDF
          </div>
        )}
      </div>
    </div>
  )
}
