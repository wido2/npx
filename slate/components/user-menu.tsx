"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout as apiLogout, getToken } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import {
  UserIcon,
  KeyIcon,
  LogOutIcon,
  CogIcon,
} from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export function UserMenu() {
  const router = useRouter()
  const { user, logoutUser, can } = useAuth()

  async function handleLogout() {
    const token = getToken()
    if (token) {
      try {
        await apiLogout(token)
      } catch {
        // ignore
      }
    }
    logoutUser()
    router.push("/")
  }

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger render={<DropdownMenuTrigger className="h-8 w-8 cursor-pointer rounded-full outline-none" />}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="bottom">Menu Pengguna</TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <div className="flex flex-col gap-1 px-2 py-1.5">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          <div className="flex gap-1 flex-wrap mt-0.5">
            {user.roles.map((r) => (
              <span key={r} className="text-[10px] uppercase tracking-wide font-semibold text-primary">{r}</span>
            ))}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/change-password")}>
            <KeyIcon className="mr-2 h-4 w-4" />
            Change Password
          </DropdownMenuItem>
          {can("settings.view") && (
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <CogIcon className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOutIcon className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
