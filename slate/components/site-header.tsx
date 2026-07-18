"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { TopMenu } from "@/components/top-menu"
import { UserMenu } from "@/components/user-menu"
import { NotificationBell } from "@/components/notification-bell"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { fetchSetting } from "@/lib/settings-api"
import {
  LayoutDashboardIcon,
  PackageIcon,
  Building2Icon,
  MapPinIcon,
  ContactIcon,
  PercentIcon,
  UsersIcon,
  FolderKanbanIcon,
  FileTextIcon,
  BarChart3Icon,
  Settings2Icon,
  MenuIcon,
  PackageOpenIcon,
  WarehouseIcon,
  UserRoundIcon,
  ChevronDownIcon,
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navStandalone: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
]

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Master",
    items: [
      { href: "/barang", label: "Barang", icon: PackageIcon },
      { href: "/vendor", label: "Vendor", icon: Building2Icon },
      { href: "/karyawan", label: "Karyawan", icon: UserRoundIcon },
    ],
  },
  {
    label: "Relasi",
    items: [
      { href: "/client", label: "Client", icon: UsersIcon },
      { href: "/project", label: "Project", icon: FolderKanbanIcon },
      { href: "/alamat", label: "Alamat", icon: MapPinIcon },
      { href: "/kontak", label: "Kontak", icon: ContactIcon },
    ],
  },
  {
    label: "Transaksi",
    items: [
      { href: "/purchase-order", label: "Purchase Order", icon: FileTextIcon },
      { href: "/pengambilan-barang", label: "Pengambilan Barang", icon: PackageOpenIcon },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/inventory", label: "Inventory", icon: WarehouseIcon },
    ],
  },
  {
    label: "Laporan",
    items: [
      { href: "/reports", label: "Laporan PO", icon: BarChart3Icon },
      { href: "/reports/barang", label: "Laporan Barang", icon: PackageIcon },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { href: "/jenis-pajak", label: "Jenis Pajak", icon: PercentIcon },
      { href: "/settings", label: "Settings", icon: Settings2Icon },
    ],
  },
]

export function SiteHeader() {
  const [companyName, setCompanyName] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetchSetting("general")
      .then((s) => setCompanyName((s.data?.nama_perusahaan as string) || ""))
      .catch(() => {})
  }, [])

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/")
  }

  function hasActiveItem(items: NavItem[]) {
    return items.some((item) => isActive(item.href))
  }

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-14 w-full items-center gap-2 px-4">
        {/* Mobile hamburger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0" />
            }
          >
            <MenuIcon className="size-5" />
            <span className="sr-only">Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col overflow-hidden">
            <SheetHeader>
              <SheetTitle>{companyName || "Perusahaan"}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
              {navStandalone.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <Separator className="my-2" />
              {navGroups.map((group) => (
                <Collapsible key={group.label} defaultOpen={hasActiveItem(group.items)}>
                  <CollapsibleTrigger
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50"
                  >
                    <span>{group.label}</span>
                    <ChevronDownIcon className="size-3 transition-transform [[data-state=open]>&]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-col gap-0.5 pb-2">
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSheetOpen(false)}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                              active
                                ? "bg-muted font-medium text-foreground"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                          >
                            <Icon className="size-4 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-1 font-semibold">
          <span className="text-sm">{companyName || "Perusahaan"}</span>
        </div>
        <Separator
          orientation="vertical"
          className="mx-2 data-vertical:h-5 data-vertical:self-auto"
        />
        <div className="hidden lg:flex">
          <TopMenu />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
