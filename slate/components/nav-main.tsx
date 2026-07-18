"use client"

import { useAuth } from "@/lib/auth-context"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
    description?: string
    permission?: string
    isActive?: boolean
    items?: {
      title: string
      url: string
      permission?: string
    }[]
  }[]
}) {
  const { can } = useAuth()

  const filteredItems = items.filter((item) => !item.permission || can(item.permission))

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => {
          const filteredSubItems = item.items?.filter((sub) => !sub.permission || can(sub.permission))
          if (item.items?.length && (!filteredSubItems || filteredSubItems.length === 0)) return null

          return (
            <Collapsible key={item.title} defaultOpen={item.isActive} render={<SidebarMenuItem />}>
              <SidebarMenuButton tooltip={item.title} render={<a href={item.url} />}>
                {item.icon}
                <span className="truncate">{item.title}</span>
                {item.description && (
                  <>
                    <span className="text-muted-foreground">/</span>
                    <span className="truncate text-xs text-muted-foreground">{item.description}</span>
                  </>
                )}
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <SidebarMenuAction
                    render={<CollapsibleTrigger />}
                    className="aria-expanded:rotate-90"
                  >
                    <ChevronRightIcon />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {filteredSubItems?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton render={<a href={subItem.url} />}>
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
