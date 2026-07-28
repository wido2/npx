"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { TopMenu } from "@/components/top-menu"
import { UserMenu } from "@/components/user-menu"
import { NotificationBell } from "@/components/notification-bell"
import { ChatBell } from "@/components/chat-bell"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { fetchSetting } from "@/lib/settings-api"
import { useAuth } from "@/lib/auth-context"
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
  ShoppingCartIcon,
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  permission?: string
}

interface NavGroup {
  label: string
  permission?: string
  items: NavItem[]
}

const navStandalone: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
]

const navGroups: NavGroup[] = [
  {
    label: "Master",
    permission: "master.barang.view",
    items: [
      { href: "/barang", label: "Barang", icon: PackageIcon, permission: "master.barang.view" },
      { href: "/vendor", label: "Vendor", icon: Building2Icon, permission: "master.vendor.view" },
      { href: "/karyawan", label: "Karyawan", icon: UserRoundIcon, permission: "master.karyawan.view" },
    ],
  },
  {
    label: "Relasi",
    permission: "master.client.view",
    items: [
      { href: "/client", label: "Client", icon: UsersIcon, permission: "master.client.view" },
      { href: "/project", label: "Project", icon: FolderKanbanIcon, permission: "master.project.view" },
      { href: "/alamat", label: "Alamat", icon: MapPinIcon },
      { href: "/kontak", label: "Kontak", icon: ContactIcon },
    ],
  },
  {
    label: "Transaksi",
    permission: "po.view_all",
    items: [
      { href: "/purchase-order", label: "Purchase Order", icon: FileTextIcon, permission: "po.view_all" },
      { href: "/pengambilan-barang", label: "Pengambilan Barang", icon: PackageOpenIcon, permission: "pb.view_all" },
      { href: "/pembelian-langsung", label: "Pembelian Langsung", icon: ShoppingCartIcon, permission: "pl.view_all" },
    ],
  },
  {
    label: "Inventory",
    permission: "inventory.view",
    items: [
      { href: "/inventory", label: "Inventory", icon: WarehouseIcon, permission: "inventory.view" },
    ],
  },
  {
    label: "Laporan",
    permission: "reports.view",
    items: [
      { href: "/reports", label: "Laporan PO", icon: BarChart3Icon, permission: "reports.view" },
      { href: "/reports/barang", label: "Laporan Barang", icon: PackageIcon },
    ],
  },
  {
    label: "Pengaturan",
    permission: "settings.view",
    items: [
      { href: "/jenis-pajak", label: "Jenis Pajak", icon: PercentIcon },
      { href: "/settings", label: "Settings", icon: Settings2Icon, permission: "settings.view" },
    ],
  },
]

export function SiteHeader() {
  const [companyName, setCompanyName] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const pathname = usePathname()
  const { can } = useAuth()

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

  const filteredStandalone = navStandalone.filter((item) => !item.permission || can(item.permission))

  const filteredGroups = navGroups
    .filter((group) => !group.permission || can(group.permission))
    .map((group) => {
      const filteredItems = group.items.filter((item) => !item.permission || can(item.permission))

      if (group.items.length && (!filteredItems || filteredItems.length === 0)) return null

      return {
        ...group,
        items: filteredItems,
      }
    })
    .filter((group): group is NonNullable<typeof group> => group !== null)

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
            <Tooltip>
              <TooltipTrigger render={<MenuIcon className="size-5" />} />
              <TooltipContent side="bottom">Buka Menu</TooltipContent>
            </Tooltip>
            <span className="sr-only">Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col overflow-hidden">
            <SheetHeader>
              <SheetTitle>{companyName || "Perusahaan"}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
              {filteredStandalone.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger>
                      <Link
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
                    </TooltipTrigger>
                    <TooltipContent side="right">Buka {item.label}</TooltipContent>
                  </Tooltip>
                )
              })}
              <Separator className="my-2" />
              {filteredGroups.map((group) => (
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
                          <Tooltip key={item.href}>
                            <TooltipTrigger>
                              <Link
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
                            </TooltipTrigger>
                            <TooltipContent side="right">Buka {item.label}</TooltipContent>
                          </Tooltip>
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
          <ChatBell />
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
