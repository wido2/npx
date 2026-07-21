"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchNotifications, type NotificationItem } from "@/lib/notification-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoaderIcon, BellIcon } from "lucide-react"
import { useRouter } from "next/navigation"

const TYPE_LABELS: Record<string, string> = {
  notification: "Info",
  warning: "Warning",
  alert: "Alert",
}

const TYPE_COLORS: Record<string, string> = {
  notification: "secondary",
  warning: "secondary",
  alert: "destructive",
}

export function AktivitasTerbaru() {
  const { can } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.aktivitas_terbaru")) return
    fetchNotifications()
      .then((res) => setData(res.data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.aktivitas_terbaru")) return null

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => router.push("/settings")}>
        <div className="flex items-center gap-2">
          <BellIcon className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
        </div>
        <CardDescription>Notifikasi dan aktivitas terkini</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada aktivitas terbaru</p>
        ) : (
          <div className="divide-y">
            {data.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${!n.read_at ? "bg-primary/5" : ""}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{n.data.title || n.type}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.data.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge variant={(TYPE_COLORS[n.data.type || n.type] || "secondary") as any} className="shrink-0">
                  {TYPE_LABELS[n.data.type || n.type] || n.type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
