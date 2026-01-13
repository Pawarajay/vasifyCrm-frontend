"use client"
import { useMemo, useState } from "react"
import { useCRM } from "@/contexts/crm-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Users,
  UserPlus,
  TrendingUp,
  IndianRupee,
  CheckSquare,
  AlertTriangle,
  ReceiptIndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react"

const formatDate = (value: unknown) => {
  if (!value) return "—"
  const date = value instanceof Date ? value : new Date(value as string)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

type TimeRange = "7d" | "30d" | "90d"

const getRangeStart = (range: TimeRange) => {
  const now = new Date()
  const d = new Date(now)
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
  d.setDate(d.getDate() - days)
  return d
}

const percentChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function DashboardContent() {
  const { customers, leads, deals, tasks, renewalReminders, invoices } = useCRM()
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  const rangeStart = getRangeStart(timeRange)
  const now = new Date()

  const pendingTasksOnly = tasks.filter((task) => task.status === "pending")

  const stats = useMemo(() => {
    const inRange = (dateValue: unknown) => {
      const d = dateValue instanceof Date ? dateValue : new Date(dateValue as string)
      if (Number.isNaN(d.getTime())) return false
      return d >= rangeStart && d <= now
    }

    // Customers
    const customersCurrent = customers.filter((c) => inRange(c.createdAt)).length
    const customersPrev = customers.filter((c) => {
      const d =
        c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt as string)
      if (Number.isNaN(d.getTime())) return false
      return d < rangeStart
    }).length
    const customersTrend = percentChange(customersCurrent, customersPrev)

    // Leads
    const activeLeads = leads.filter(
      (lead) => !["closed-won", "closed-lost"].includes(lead.status),
    )
    const activeLeadsCurrent = activeLeads.filter((l) => inRange(l.createdAt)).length
    const activeLeadsPrev = activeLeads.filter((l) => {
      const d =
        l.createdAt instanceof Date ? l.createdAt : new Date(l.createdAt as string)
      if (Number.isNaN(d.getTime())) return false
      return d < rangeStart
    }).length
    const leadsTrend = percentChange(activeLeadsCurrent, activeLeadsPrev)

    // Deals
    const openDeals = deals.filter(
      (deal) => !["closed-won", "closed-lost"].includes(deal.stage),
    ).length

    const closedWonDeals = deals.filter((deal) => deal.stage === "closed-won")
    const closedWonCurrent = closedWonDeals.filter((d) =>
      inRange(d.actualCloseDate ?? d.updatedAt ?? d.createdAt),
    )
    const closedWonPrev = closedWonDeals.filter((d) => {
      const source = d.actualCloseDate ?? d.updatedAt ?? d.createdAt
      const dt = source instanceof Date ? source : new Date(source as string)
      if (Number.isNaN(dt.getTime())) return false
      return dt < rangeStart
    })

    const closedWonRevenueCurrent = closedWonCurrent.reduce(
      (sum, d) => sum + (d.value ?? 0),
      0,
    )
    const closedWonRevenuePrev = closedWonPrev.reduce(
      (sum, d) => sum + (d.value ?? 0),
      0,
    )
    const revenueTrend = percentChange(
      closedWonRevenueCurrent,
      closedWonRevenuePrev,
    )

    // Tasks
    const pendingTasks = pendingTasksOnly.length
    const pendingTasksPrev = tasks.filter((t) => {
      if (t.status !== "pending") return false
      const d = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt as string)
      if (Number.isNaN(d.getTime())) return false
      return d < rangeStart
    }).length
    const tasksTrend = percentChange(pendingTasks, pendingTasksPrev)

    // Renewals
    const renewalsDue = renewalReminders.filter((reminder) => {
      const expiry =
        reminder.expiryDate instanceof Date
          ? reminder.expiryDate
          : new Date(reminder.expiryDate as string)
      if (Number.isNaN(expiry.getTime())) return false
      const daysUntilExpiry = Math.ceil(
        (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }).length

    // Invoices
    const invoicesCurrent = (invoices ?? []).filter((inv) => inRange(inv.createdAt))
    const invoicesPrev = (invoices ?? []).filter((inv) => {
      const d =
        inv.createdAt instanceof Date
          ? inv.createdAt
          : new Date(inv.createdAt as string)
      if (Number.isNaN(d.getTime())) return false
      return d < rangeStart
    })

    const totalInvoices = invoices?.length ?? 0

    const invoiceRevenueCurrent = invoicesCurrent.reduce((sum, inv) => {
      const total =
        typeof inv.total === "number" ? inv.total : Number(inv.total ?? 0) || 0
      return sum + total
    }, 0)
    const invoiceRevenuePrev = invoicesPrev.reduce((sum, inv) => {
      const total =
        typeof inv.total === "number" ? inv.total : Number(inv.total ?? 0) || 0
      return sum + total
    }, 0)
    const invoiceTrend = percentChange(invoiceRevenueCurrent, invoiceRevenuePrev)

    const customersTotal = customers.length
    const activeLeadsTotal = activeLeads.length

    return [
      {
        title: "Total Customers",
        value: customersTotal,
        description: "Active customers",
        trend: `${customersTrend >= 0 ? "+" : ""}${customersTrend.toFixed(1)}%`,
        trendUp: customersTrend >= 0,
        icon: Users,
        iconBg: "bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-cyan-500/10",
        iconColor: "text-blue-600 dark:text-blue-400",
        glowColor: "group-hover:shadow-blue-500/20",
      },
      {
        title: "Active Leads",
        value: activeLeadsTotal,
        description: "Potential customers",
        trend: `${leadsTrend >= 0 ? "+" : ""}${leadsTrend.toFixed(1)}%`,
        trendUp: leadsTrend >= 0,
        icon: UserPlus,
        iconBg: "bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-teal-500/10",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        glowColor: "group-hover:shadow-emerald-500/20",
      },
      {
        title: "Total Invoices",
        value: totalInvoices,
        description: "All generated invoices",
        trend: "+0.0%",
        trendUp: true,
        icon: ReceiptIndianRupee,
        iconBg: "bg-gradient-to-br from-violet-500/10 via-violet-400/5 to-purple-500/10",
        iconColor: "text-violet-600 dark:text-violet-400",
        glowColor: "group-hover:shadow-violet-500/20",
      },
      {
        title: "Invoice Revenue",
        value: `₹${invoiceRevenueCurrent.toLocaleString("en-IN")}`,
        description: `Total invoice amount (${timeRange})`,
        trend: `${invoiceTrend >= 0 ? "+" : ""}${invoiceTrend.toFixed(1)}%`,
        trendUp: invoiceTrend >= 0,
        icon: IndianRupee,
        iconBg: "bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10",
        iconColor: "text-amber-600 dark:text-amber-400",
        glowColor: "group-hover:shadow-amber-500/20",
      },
    ]
  }, [
    customers,
    leads,
    deals,
    tasks,
    renewalReminders,
    invoices,
    pendingTasksOnly,
    rangeStart,
    now,
    timeRange,
  ])

  const recentInvoices = useMemo(
    () =>
      (invoices ?? [])
        .slice()
        .sort((a, b) => {
          const da =
            a.createdAt instanceof Date
              ? a.createdAt
              : new Date(a.createdAt as string)
          const db =
            b.createdAt instanceof Date
              ? b.createdAt
              : new Date(b.createdAt as string)
          return db.getTime() - da.getTime()
        })
        .slice(0, 5),
    [invoices],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/10 dark:bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-[1600px]">
        {/* Premium Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
            <div className="space-y-3">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Live Dashboard
                </span>
              </div>

              {/* Main Title */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                  Real-time insights 
                </p>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="inline-flex items-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 shadow-lg shadow-slate-900/5 dark:shadow-none">
              {(["7d", "30d", "90d"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`relative px-4 sm:px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    timeRange === range
                      ? "bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {range === "7d" && "7 Days"}
                  {range === "30d" && "30 Days"}
                  {range === "90d" && "90 Days"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid - Premium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 mb-10 sm:mb-12">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={`group relative overflow-hidden border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-2xl ${stat.glowColor} transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700`}
            >
              {/* Card gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/50 dark:to-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  {/* Icon */}
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.iconBg} group-hover:scale-110 transition-all duration-500 shadow-lg`}
                  >
                    <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                  </div>

                  {/* Trend Badge */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                      stat.trendUp
                        ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50"
                        : "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/50 dark:to-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50"
                    }`}
                  >
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    <span>{stat.trend}</span>
                  </div>
                </div>

                {/* Title */}
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  {stat.title}
                </CardTitle>

                {/* Value */}
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
                  {stat.value}
                </div>
              </CardHeader>

              <CardContent className="pt-0 relative z-10">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
                  {stat.description}
                </p>
              </CardContent>

              {/* Decorative corner accent */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/30 dark:to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          ))}
        </div>

        {/* Activity Section Header */}
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-4 w-4 text-slate-400" />
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            Recent Activity
          </h2>
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-7">
          {/* Recent Customers Card */}
          <Card className="group border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-blue-50/80 via-cyan-50/40 to-transparent dark:from-blue-950/30 dark:via-cyan-950/20 dark:to-transparent pb-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Recent Customers
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                    Latest customer additions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-3">
                {customers.slice(0, 5).map((customer) => (
                  <div
                    key={customer.id}
                    className="group/item flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-blue-50 hover:to-cyan-50/50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/20 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md group-hover/item:shadow-lg group-hover/item:scale-105 transition-all duration-300">
                        <span className="text-base font-bold text-white">
                          {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
                        <div className="absolute inset-1 bg-white dark:bg-slate-900 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {customer.name || "Unnamed customer"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {customer.company || "No company"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {typeof customer.totalValue === "number"
                          ? `₹${customer.totalValue.toLocaleString("en-IN")}`
                          : "—"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Total value</p>
                    </div>
                  </div>
                ))}
                {customers.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner">
                      <Users className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      No customers yet
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Add your first customer to get started
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices Card */}
          <Card className="group border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-transparent dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-transparent pb-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <ReceiptIndianRupee className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Recent Invoices
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                    Latest billing activity
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-3">
                {recentInvoices.map((inv) => {
                  const total =
                    typeof inv.total === "number"
                      ? inv.total
                      : Number(inv.total ?? 0) || 0
                  const statusConfig =
                    inv.status === "paid"
                      ? {
                          bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30",
                          text: "text-emerald-700 dark:text-emerald-400",
                          border: "border-emerald-300/50 dark:border-emerald-800/50",
                        }
                      : inv.status === "overdue"
                        ? {
                            bg: "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/50 dark:to-rose-900/30",
                            text: "text-rose-700 dark:text-rose-400",
                            border: "border-rose-300/50 dark:border-rose-800/50",
                          }
                        : {
                            bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30",
                            text: "text-amber-700 dark:text-amber-400",
                            border: "border-amber-300/50 dark:border-amber-800/50",
                          }

                  return (
                    <div
                      key={inv.id}
                      className="group/item flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-emerald-50 hover:to-teal-50/50 dark:hover:from-emerald-950/30 dark:hover:to-teal-950/20 border border-slate-200/50 dark:border-slate-700/50 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {inv.invoiceNumber}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {inv.customerName || "Unknown customer"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          ₹{total.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(inv.issueDate)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} capitalize flex-shrink-0`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  )
                })}
                {recentInvoices.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner">
                      <ReceiptIndianRupee className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      No invoices yet
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Create your first invoice to see it here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}