
"use client"

import { useMemo } from "react"
import { useCRM } from "@/contexts/crm-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  MessageSquare,
  FileText,
  TrendingUp,
  X,
} from "lucide-react"
import type { Customer } from "@/types/crm"

interface CustomerDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onCallCustomer?: (customer: Customer) => void
  onEmailCustomer?: (customer: Customer) => void
  onWhatsAppCustomer?: (customer: Customer) => void
  onScheduleMeeting?: (customer: Customer) => void
}

export function CustomerDetailDialog({
  open,
  onOpenChange,
  customer,
  onCallCustomer,
  onEmailCustomer,
  onWhatsAppCustomer,
  onScheduleMeeting,
}: CustomerDetailDialogProps) {
  const { deals = [], invoices = [], tasks = [] } = useCRM()

  // Always define hooks; guard inside them
  const customerDeals = useMemo(
    () => (customer ? deals.filter((deal) => deal.customerId === customer.id) : []),
    [deals, customer],
  )

  const customerInvoices = useMemo(
    () => (customer ? invoices.filter((invoice) => invoice.customerId === customer.id) : []),
    [invoices, customer],
  )

  const customerTasks = useMemo(
    () =>
      customer
        ? tasks.filter(
            (task) =>
              task.relatedTo?.type === "customer" && task.relatedTo?.id === customer.id,
          )
        : [],
    [tasks, customer],
  )

  const getStatusBadge = (status: Customer["status"]) => {
    const variants: Record<string, string> = {
      active:
        "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
      inactive:
        "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
      prospect:
        "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    }
    return variants[status] || variants.active
  }

  const createdAtLabel =
    customer && customer.createdAt instanceof Date
      ? customer.createdAt.toLocaleDateString()
      : customer && customer.createdAt
      ? String(customer.createdAt)
      : "—"

  const lastContactLabel =
    customer && customer.lastContactDate instanceof Date
      ? customer.lastContactDate.toLocaleDateString()
      : customer && customer.lastContactDate
      ? String(customer.lastContactDate)
      : "Never"

  const renderServices = () => {
    if (!customer) return "—"
    if (Array.isArray((customer as any).services) && (customer as any).services.length > 0) {
      return (customer as any).services.join(", ")
    }
    if ((customer as any).service) {
      return (customer as any).service
    }
    return "—"
  }

  // After hooks: guard against missing customer
  if (!customer) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>No customer selected</DialogTitle>
            <DialogDescription>Select a customer to view details.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-full sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[1600px] h-[100vh] sm:h-[98vh] max-h-[100vh] sm:max-h-[98vh] p-0 gap-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 border-b shrink-0 bg-background">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <span className="text-base sm:text-lg md:text-xl font-semibold text-primary">
                  {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl truncate">
                  {customer.name || "Unnamed customer"}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Complete customer profile and activity overview
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6">
          <div className="py-3 sm:py-4 md:py-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Main Content - Left Column */}
              <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                {/* Customer Information Card */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {/* Name and Status Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Full Name</div>
                        <div className="text-sm sm:text-base font-medium break-words">
                          {customer.name || "—"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Status</div>
                        <Badge className={getStatusBadge(customer.status)}>
                          {customer.status ?? "active"}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="text-xs font-medium text-muted-foreground">Email</div>
                          <div className="text-sm break-all">{customer.email || "—"}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="text-xs font-medium text-muted-foreground">Phone</div>
                          <div className="text-sm">{customer.phone || "—"}</div>
                        </div>
                      </div>
                    </div>

                    {customer.whatsappNumber && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-2 sm:gap-3">
                          <MessageSquare className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">
                              WhatsApp
                            </div>
                            <div className="text-sm text-green-600">
                              {customer.whatsappNumber}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Services */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Services</div>
                        <div className="text-sm break-words">{renderServices()}</div>
                      </div>
                    </div>

                    {(customer.company || (customer as any).industry) && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Building className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">
                              Company
                            </div>
                            <div className="text-sm break-words">
                              {customer.company || "—"}
                              {(customer as any).industry
                                ? ` • ${(customer as any).industry}`
                                : ""}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {(customer.address ||
                      customer.city ||
                      customer.state ||
                      customer.zipCode ||
                      customer.country) && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-2 sm:gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">
                              Address
                            </div>
                            <div className="text-sm space-y-0.5 break-words">
                              {customer.address && <div>{customer.address}</div>}
                              {(customer.city || customer.state || customer.zipCode) && (
                                <div>
                                  {[customer.city, customer.state, customer.zipCode]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              )}
                              {customer.country && <div>{customer.country}</div>}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {Array.isArray(customer.tags) && customer.tags.length > 0 && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">Tags</div>
                            <div className="flex flex-wrap gap-1.5">
                              {customer.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {customer.notes && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground">Notes</div>
                          <div className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap break-words">
                            {customer.notes}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base md:text-lg">
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Latest interactions and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 sm:space-y-3">
                      {customerTasks.slice(0, 5).map((task) => {
                        const dueLabel =
                          task.dueDate instanceof Date
                            ? task.dueDate.toLocaleDateString()
                            : task.dueDate
                            ? String(task.dueDate)
                            : "No due date"

                        const color =
                          task.priority === "high"
                            ? "bg-red-500"
                            : task.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"

                        return (
                          <div
                            key={task.id}
                            className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                          >
                            <div className={`w-2 h-2 rounded-full ${color} shrink-0 mt-1.5`} />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs sm:text-sm font-medium break-words">
                                {task.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {task.type} • Due: {dueLabel}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {customerTasks.length === 0 && (
                        <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
                          No recent activity
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Right Column */}
              <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                {/* Key Metrics Card */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          Total Value
                        </div>
                        <div className="text-base sm:text-lg md:text-xl font-bold text-green-600 truncate">
                          {typeof customer.totalValue === "number"
                            ? `₹${customer.totalValue.toLocaleString()}`
                            : "—"}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-2 sm:gap-3">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          Customer Since
                        </div>
                        <div className="text-sm">{createdAtLabel}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          Last Contact
                        </div>
                        <div className="text-sm">{lastContactLabel}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Records Card */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base">Related Records</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-xs sm:text-sm">Deals</span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">
                        {customerDeals.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-xs sm:text-sm">Invoices</span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">
                        {customerInvoices.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <span className="text-xs sm:text-sm">Tasks</span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">
                        {customerTasks.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9"
                      onClick={() => {
                        if (onCallCustomer) onCallCustomer(customer)
                      }}
                      disabled={!customer.phone}
                    >
                      <Phone className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Call Customer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9"
                      onClick={() => {
                        if (onEmailCustomer) onEmailCustomer(customer)
                      }}
                      disabled={!customer.email}
                    >
                      <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Send Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9"
                      onClick={() => {
                        if (onWhatsAppCustomer) onWhatsAppCustomer(customer)
                      }}
                      disabled={!customer.whatsappNumber && !customer.phone}
                    >
                      <MessageSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      WhatsApp Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9"
                      onClick={() => {
                        if (onScheduleMeeting) onScheduleMeeting(customer)
                      }}
                    >
                      <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Schedule Meeting
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

