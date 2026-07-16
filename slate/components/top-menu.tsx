"use client"

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

interface MenuGroup {
  label: string
  icon: React.ElementType
  isDirect?: true
  href?: string
  items?: { href: string; label: string; icon: React.ElementType }[]
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
    items: [
      { href: "/barang", label: "Barang", icon: PackageIcon },
      { href: "/vendor", label: "Vendor", icon: Building2Icon },
      { href: "/karyawan", label: "Karyawan", icon: UserRoundIcon },
    ],
  },
  {
    label: "Relasi",
    icon: UsersIcon,
    items: [
      { href: "/client", label: "Client", icon: UsersIcon },
      { href: "/project", label: "Project", icon: FolderKanbanIcon },
      { href: "/alamat", label: "Alamat", icon: MapPinIcon },
      { href: "/kontak", label: "Kontak", icon: ContactIcon },
    ],
  },
  {
    label: "Transaksi",
    icon: FileTextIcon,
    items: [
      { href: "/purchase-order", label: "Purchase Order", icon: FileTextIcon },
      { href: "/pengambilan-barang", label: "Pengambilan Barang", icon: PackageOpenIcon },
    ],
  },
  {
    label: "Inventory",
    icon: WarehouseIcon,
    items: [
      { href: "/inventory", label: "Inventory", icon: WarehouseIcon },
    ],
  },
  {
    label: "Laporan",
    icon: BarChart3Icon,
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3Icon },
    ],
  },
  {
    label: "Pengaturan",
    icon: Settings2Icon,
    items: [
      { href: "/jenis-pajak", label: "Jenis Pajak", icon: PercentIcon },
      { href: "/settings", label: "Settings", icon: Settings2Icon },
    ],
  },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

export function TopMenu() {
  const pathname = usePathname()

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-0.5">
        {groups.map((group) => {
          if (group.isDirect) {
            const Icon = group.icon
            const active = isActive(pathname, group.href!)
            return (
              <NavigationMenuItem key={group.href}>
                <NavigationMenuLink
                  data-active={active}
                  className={cn("gap-1", active && "bg-muted/50")}
                  render={<Link href={group.href!} />}
                >
                  <Icon className="size-4" />
                  <span>{group.label}</span>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }
          const Icon = group.icon
          const anyChildActive = group.items!.some((item) =>
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
                  {group.items!.map((item) => {
                    const ItemIcon = item.icon
                    const active = isActive(pathname, item.href)
                    return (
                      <NavigationMenuLink
                        key={item.href}
                        data-active={active}
                        className={cn("w-48 gap-1", active && "bg-muted/50")}
                        render={<Link href={item.href} />}
                      >
                        <ItemIcon className="size-4" />
                        <span>{item.label}</span>
                      </NavigationMenuLink>
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
