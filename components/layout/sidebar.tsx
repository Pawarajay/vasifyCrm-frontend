
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  // TrendingUp, // Deals - commented out
  FileText,
  BarChart3,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Leads", href: "/leads", icon: UserPlus },
  // { name: "Deals", href: "/deals", icon: TrendingUp }, // Projects, Tasks & WhatsApp - commented out
  // { name: "Tasks", href: "/tasks", icon: CheckSquare }, // Projects, Tasks & WhatsApp - commented out
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Renewals", href: "/renewals", icon: RefreshCw },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  // { name: "WhatsApp Automation", href: "/whatsapp", icon: MessageSquare }, // Projects, Tasks & WhatsApp - commented out
  // { name: "Projects", href: "/projects", icon: Briefcase }, // Projects, Tasks & WhatsApp - commented out
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-lg">VasifyTech CRM</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed ? "px-2" : "px-3",
                    isActive && "bg-secondary text-secondary-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      collapsed ? "mr-0" : "mr-3",
                    )}
                  />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            )
          })}

          {/* Admin-only Users link */}
          {isAdmin && (
            <Link href="/admin/users">
              <Button
                variant={pathname === "/admin/users" ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start mt-4",
                  collapsed ? "px-2" : "px-3",
                  pathname === "/admin/users" &&
                    "bg-secondary text-secondary-foreground",
                )}
              >
                <Users
                  className={cn(
                    "h-4 w-4",
                    collapsed ? "mr-0" : "mr-3",
                  )}
                />
                {!collapsed && <span>Users</span>}
              </Button>
            </Link>
          )}
        </nav>
      </ScrollArea>
    </div>
  )
}
