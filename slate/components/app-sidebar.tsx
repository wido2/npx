"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { fetchSetting } from "@/lib/settings-api"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  PackageIcon,
  Settings2Icon,
  LifeBuoyIcon,
  SendIcon,
  TerminalIcon,
  Building2Icon,
  MapPinIcon,
  ContactIcon,
  PercentIcon,
  UsersIcon,
  FolderKanbanIcon,
  FileTextIcon,
  BarChart3Icon,
  PackageOpenIcon,
} from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      description: "Ringkasan",
    },
    {
      title: "Purchase Order",
      url: "/purchase-order",
      icon: <FileTextIcon />,
      description: "Kelola PO",
    },
    {
      title: "Pengambilan Barang",
      url: "/pengambilan-barang",
      icon: <PackageOpenIcon />,
      description: "Goods issue",
    },
    {
      title: "Barang",
      url: "/barang",
      icon: <PackageIcon />,
      description: "Manage your inventory items",
    },
    {
      title: "Vendor",
      url: "/vendor",
      icon: <Building2Icon />,
      description: "Kelola vendor",
    },
    {
      title: "Client",
      url: "/client",
      icon: <UsersIcon />,
      description: "Kelola client",
    },
    {
      title: "Project",
      url: "/project",
      icon: <FolderKanbanIcon />,
      description: "Kelola proyek",
    },
    {
      title: "Jenis Pajak",
      url: "/jenis-pajak",
      icon: <PercentIcon />,
      description: "Kelola pajak",
    },
    {
      title: "Alamat",
      url: "/alamat",
      icon: <MapPinIcon />,
      description: "Kelola alamat",
    },
    {
      title: "Kontak",
      url: "/kontak",
      icon: <ContactIcon />,
      description: "Kelola kontak",
    },
  ],
  navSecondary: [
    {
      title: "Reports",
      url: "/reports",
      icon: <BarChart3Icon />,
      description: "Laporan",
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings2Icon />,
      description: "Pengaturan",
    },
    {
      title: "Support",
      url: "#",
      icon: <LifeBuoyIcon />,
      description: "Bantuan",
    },
    {
      title: "Feedback",
      url: "#",
      icon: <SendIcon />,
      description: "Masukan",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [companyName, setCompanyName] = React.useState("")

  React.useEffect(() => {
    fetchSetting("general")
      .then((s) => setCompanyName((s.data?.nama_perusahaan as string) || ""))
      .catch(() => {})
  }, [])

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TerminalIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{companyName || "Perusahaan"}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
