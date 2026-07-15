"use client"

import { useEffect, useState } from "react"
import { TopMenu } from "@/components/top-menu"
import { UserMenu } from "@/components/user-menu"
import { Separator } from "@/components/ui/separator"
import { fetchSetting } from "@/lib/settings-api"

export function SiteHeader() {
  const [companyName, setCompanyName] = useState("")

  useEffect(() => {
    fetchSetting("general")
      .then((s) => setCompanyName((s.data?.nama_perusahaan as string) || ""))
      .catch(() => {})
  }, [])

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-14 w-full items-center gap-2 px-4">
        <div className="flex items-center gap-1 font-semibold">
          <span className="text-sm">{companyName || "Perusahaan"}</span>
        </div>
        <Separator
          orientation="vertical"
          className="mx-2 data-vertical:h-5 data-vertical:self-auto"
        />
        <TopMenu />
        <div className="ml-auto">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
