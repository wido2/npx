"use client"

import { useRef, useState } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { uploadLogo } from "@/lib/settings-api"
import { toast } from "sonner"

const MAX_SIZE = 3 * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

function storageUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api$/, "")
  return `${base}/storage/${path.replace(/^\//, "")}`
}

export function SettingsLogoUpload({
  logoPath,
  onLogoChange,
}: {
  logoPath: string
  onLogoChange: (path: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return

    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Hanya file gambar yang diizinkan (JPG, PNG, GIF, WEBP, SVG)")
      return
    }

    if (file.size > MAX_SIZE) {
      setError(`Ukuran file maksimal 3MB (file ini ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      return
    }

    setUploading(true)
    try {
      const result = await uploadLogo(file)
      onLogoChange(result.path)
      toast.success("Logo berhasil diupload")
    } catch {
      toast.error("Gagal mengupload logo")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {logoPath ? (
        <Attachment state="done" className="w-full">
          <AttachmentMedia variant="image">
            <img src={storageUrl(logoPath)} alt="Logo" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Logo perusahaan</AttachmentTitle>
            <AttachmentDescription>Klik ganti untuk upload ulang</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-3.5" />
              Ganti
            </AttachmentAction>
            <AttachmentAction
              variant="ghost"
              size="sm"
              onClick={() => onLogoChange("")}
            >
              <X className="size-3.5" />
              Hapus
            </AttachmentAction>
          </AttachmentActions>
          <AttachmentTrigger
            onClick={() => inputRef.current?.click()}
            aria-label="Upload logo"
          />
        </Attachment>
      ) : (
        <Attachment
          state={error ? "error" : uploading ? "uploading" : "idle"}
          className="w-full cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <AttachmentMedia variant="icon">
            {uploading ? (
              <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            ) : (
              <ImageIcon />
            )}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>
              {uploading ? "Mengupload..." : error ? "Gagal upload" : "Upload logo"}
            </AttachmentTitle>
            <AttachmentDescription>
              {error || "Format: JPG, PNG, GIF, WEBP, SVG. Maksimal 3MB"}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
              <Upload className="size-3.5" />
              Pilih file
            </AttachmentAction>
          </AttachmentActions>
          <AttachmentTrigger
            onClick={() => inputRef.current?.click()}
            aria-label="Upload logo"
          />
        </Attachment>
      )}
    </div>
  )
}
