"use client"

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
  PackageOpenIcon,
  WarehouseIcon,
  UserRoundIcon,
  ShieldIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  FilePlusIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface MenuGroup {
  label: string
  icon: React.ElementType
  isDirect?: true
  href?: string
  permission?: string
  items?: { href: string; label: string; icon: React.ElementType; permission?: string }[]
}

const groups: MenuGroup[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
    isDirect: true,
  },
  {
    label: "Master",
    icon: PackageIcon,
    permission: "master.barang.view",
    items: [
      { href: "/barang", label: "Barang", icon: PackageIcon, permission: "master.barang.view" },
      { href: "/vendor", label: "Vendor", icon: Building2Icon, permission: "master.vendor.view" },
      { href: "/karyawan", label: "Karyawan", icon: UserRoundIcon, permission: "master.karyawan.view" },
    ],
  },
  {
    label: "Relasi",
    icon: UsersIcon,
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
    icon: FileTextIcon,
    items: [
      { href: "/permintaan-pembelian", label: "Permintaan Pembelian", icon: FilePlusIcon, permission: "pp.view_all" },
      { href: "/purchase-order", label: "Purchase Order", icon: FileTextIcon, permission: "po.view_all" },
      { href: "/pengambilan-barang", label: "Pengambilan Barang", icon: PackageOpenIcon, permission: "pb.view_all" },
      { href: "/pembelian-langsung", label: "Pembelian Langsung", icon: ShoppingCartIcon, permission: "pl.view_all" },
    ],
  },
  {
    label: "Inventory",
    icon: WarehouseIcon,
    permission: "inventory.view",
    items: [
      { href: "/inventory", label: "Inventory", icon: WarehouseIcon, permission: "inventory.view" },
    ],
  },
  {
    label: "Laporan",
    icon: BarChart3Icon,
    permission: "reports.view",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3Icon, permission: "reports.view" },
      { href: "/pengeluaran-po", label: "Pengeluaran PO", icon: CreditCardIcon, permission: "reports.view" },
      { href: "/laporan-barang", label: "Laporan Barang", icon: PackageIcon, permission: "reports.view" },
    ],
  },
  {
    label: "Pengaturan",
    icon: Settings2Icon,
    permission: "settings.view",
    items: [
      { href: "/jenis-pajak", label: "Jenis Pajak", icon: PercentIcon },
      { href: "/settings/users", label: "User Manager", icon: UsersIcon, permission: "users.view" },
      { href: "/settings/roles", label: "Role Manager", icon: ShieldIcon, permission: "users.manage" },
      { href: "/settings", label: "Settings", icon: Settings2Icon, permission: "settings.view" },
    ],
  },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

export function TopMenu() {
  const pathname = usePathname()
  const { can } = useAuth()

  const filteredGroups = groups.filter((group) => !group.permission || can(group.permission))

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-0.5">
        {filteredGroups.map((group) => {
          if (group.isDirect) {
            const Icon = group.icon
            const active = isActive(pathname, group.href!)
            return (
              <NavigationMenuItem key={group.href}>
                <Tooltip>
                  <TooltipTrigger>
                    <NavigationMenuLink
                      data-active={active}
                      className={cn("gap-1", active && "bg-muted/50")}
                      render={<Link href={group.href!} />}
                    >
                      <Icon className="size-4" />
                      <span>{group.label}</span>
                    </NavigationMenuLink>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Buka {group.label}</TooltipContent>
                </Tooltip>
              </NavigationMenuItem>
            )
          }

          const Icon = group.icon
          const filteredItems = group.items?.filter((item) => !item.permission || can(item.permission))
          if (group.items?.length && (!filteredItems || filteredItems.length === 0)) return null

          const anyChildActive = filteredItems?.some((item) =>
            isActive(pathname, item.href),
          )

          return (
            <NavigationMenuItem key={group.label}>
              <NavigationMenuTrigger
                data-active={anyChildActive}
                  className={cn("gap-1", anyChildActive && "bg-muted/50")}
                >
                  <Icon className="size-4" />
                  <span>{group.label}</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="flex flex-col gap-0.5 p-1.5">
                  {filteredItems?.map((item) => {
                    const ItemIcon = item.icon
                    const active = isActive(pathname, item.href)
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger>
                          <NavigationMenuLink
                            data-active={active}
                            className={cn("w-48 gap-1", active && "bg-muted/50")}
                            render={<Link href={item.href} />}
                          >
                            <ItemIcon className="size-4" />
                            <span>{item.label}</span>
                          </NavigationMenuLink>
                        </TooltipTrigger>
                        <TooltipContent side="right">Buka {item.label}</TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
