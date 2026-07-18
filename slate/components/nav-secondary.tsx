"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth-context"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
    description?: string
    permission?: string
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { can } = useAuth()

  const filteredItems = items.filter((item) => !item.permission || can(item.permission))

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {filteredItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton size="sm" render={<a href={item.url} />}>
                {item.icon}
                <span className="truncate">{item.title}</span>
                {item.description && (
                  <>
                    <span className="text-muted-foreground">/</span>
                    <span className="truncate text-xs text-muted-foreground">{item.description}</span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}