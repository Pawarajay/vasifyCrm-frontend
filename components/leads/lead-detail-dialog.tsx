
"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Building,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Clock,
  UserCheck,
  UserCircle,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Lead } from "@/types/crm"

interface LeadDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead | null
  onCallLead?: (lead: Lead) => void
  onEmailLead?: (lead: Lead) => void
  onWhatsAppLead?: (lead: Lead) => void
  onScheduleMeeting?: (lead: Lead) => void
  onCreateDeal?: (lead: Lead) => void
  onConvertLead?: (lead: Lead) => void
}

const formatDate = (value: unknown) => {
  if (!value) return "—"
  const date = value instanceof Date ? value : new Date(value as string)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function LeadDetailDialog({
  open,
  onOpenChange,
  lead,
  onCallLead,
  onEmailLead,
  onWhatsAppLead,
  onScheduleMeeting,
  onCreateDeal,
  onConvertLead,
}: LeadDetailDialogProps) {
  const { tasks, updateLead, users, currentUser } = useCRM()

  const [statusValue, setStatusValue] = useState<Lead["status"]>("new")

  useEffect(() => {
    if (lead) {
      setStatusValue(lead.status)
    }
  }, [lead])

  if (!lead) return null

  const getUserName = (userId: string | number | undefined) => {
    if (!userId) return "Unknown"
    const user = users.find((u) => String(u.id) === String(userId))
    return user?.name || "Unknown"
  }

  const leadTasks = tasks.filter(
    (task) => task.relatedTo.type === "lead" && task.relatedTo.id === lead.id,
  )

  const getStatusBadge = (status: Lead["status"]) => {
    const variants: Record<Lead["status"], string> = {
      new: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      contacted: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      qualified: "bg-green-100 text-green-800 hover:bg-green-100",
      proposal: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      negotiation: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      "closed-won": "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      "closed-lost": "bg-red-100 text-red-800 hover:bg-red-100",
    }
    return variants[status] ?? variants.new
  }

  const getPriorityBadge = (priority: Lead["priority"]) => {
    const variants: Record<Lead["priority"], string> = {
      low: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      high: "bg-red-100 text-red-800 hover:bg-red-100",
    }
    return variants[priority] ?? variants.medium
  }

  const canConvert = statusValue === "closed-won"

  const handleStatusChange = async (value: Lead["status"]) => {
    setStatusValue(value)
    await updateLead(lead.id, { status: value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-lg font-medium text-primary">
                {lead.name?.charAt(0) ?? "L"}
              </span>
            </div>
            <span className="truncate">{lead.name}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Complete lead profile and activity overview
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
          {/* Lead Information */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="h-4 w-4" />
                  Lead Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Full Name
                    </div>
                    <div className="text-sm sm:text-base break-words">{lead.name}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                      Status
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Select
                        value={statusValue}
                        onValueChange={(value) =>
                          handleStatusChange(value as Lead["status"])
                        }
                      >
                        <SelectTrigger className="h-8 w-full sm:w-[180px] text-xs sm:text-sm">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="closed-won">Closed Won</SelectItem>
                          <SelectItem value="closed-lost">Closed Lost</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge className={`${getStatusBadge(statusValue)} text-xs whitespace-nowrap`}>
                        {statusValue.replace("-", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Email
                      </div>
                      <div className="text-xs sm:text-sm break-all">{lead.email || "No email"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Phone
                      </div>
                      <div className="text-xs sm:text-sm break-all">{lead.phone || "No phone"}</div>
                    </div>
                  </div>
                </div>

                {lead.whatsappNumber && (
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                        WhatsApp
                      </div>
                      <div className="text-xs sm:text-sm text-green-600 break-all">
                        {lead.whatsappNumber}
                      </div>
                    </div>
                  </div>
                )}

                {lead.company && (
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Company
                      </div>
                      <div className="text-xs sm:text-sm break-words">{lead.company}</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Source
                    </div>
                    <div className="text-xs sm:text-sm capitalize break-words">
                      {lead.source?.replace("-", " ") || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                      Priority
                    </div>
                    <Badge className={`${getPriorityBadge(lead.priority)} text-xs`}>
                      {lead.priority}
                    </Badge>
                  </div>
                </div>

                {/* Service & Created By */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Service
                    </div>
                    <div className="text-xs sm:text-sm capitalize break-words">
                      {(lead as any).service
                        ? String((lead as any).service).replace(/-/g, " ")
                        : "—"}
                    </div>
                  </div>

                  {currentUser?.role === "admin" && (
                    <div className="flex items-start gap-2">
                      <UserCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Created By
                        </div>
                        <div className="text-xs sm:text-sm font-medium break-words">
                          {getUserName(lead.createdBy)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {lead.notes && (
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                      Notes
                    </div>
                    <div className="text-xs sm:text-sm bg-muted p-3 rounded-md break-words">
                      {lead.notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Latest interactions and updates</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-4">
                  {leadTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-md"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          task.priority === "high"
                            ? "bg-red-500"
                            : task.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium break-words">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {task.type} • Due: {formatDate(task.dueDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {leadTasks.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4 sm:space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Estimated Value
                    </div>
                    <div className="text-base sm:text-lg font-bold break-words">
                      {typeof lead.estimatedValue === "number"
                        ? `₹${lead.estimatedValue.toLocaleString()}`
                        : "—"}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Created
                    </div>
                    <div className="text-xs sm:text-sm break-words">{formatDate(lead.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Expected Close
                    </div>
                    <div className="text-xs sm:text-sm break-words">
                      {lead.expectedCloseDate
                        ? formatDate(lead.expectedCloseDate)
                        : "Not set"}
                    </div>
                  </div>
                </div>

                {currentUser?.role === "admin" && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <UserCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Lead Owner
                        </div>
                        <div className="text-xs sm:text-sm font-medium break-words">
                          {getUserName(lead.createdBy)}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Lead Progress */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Lead Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3">
                  {["new", "contacted", "qualified", "proposal", "negotiation"].map(
                    (status, index) => {
                      const isActive = statusValue === status
                      const order = [
                        "new",
                        "contacted",
                        "qualified",
                        "proposal",
                        "negotiation",
                      ]
                      const isPassed = order.indexOf(statusValue) > index

                      return (
                        <div key={status} className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              isActive
                                ? "bg-primary"
                                : isPassed
                                ? "bg-green-500"
                                : "bg-muted"
                            }`}
                          />
                          <span
                            className={`text-xs sm:text-sm capitalize break-words ${
                              isActive
                                ? "font-medium text-primary"
                                : isPassed
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {status.replace("-", " ")}
                          </span>
                        </div>
                      )
                    },
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => onCallLead?.(lead)}
                >
                  <Phone className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Call Lead</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => onEmailLead?.(lead)}
                >
                  <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Send Email</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => onWhatsAppLead?.(lead)}
                >
                  <MessageSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">WhatsApp Message</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => onScheduleMeeting?.(lead)}
                >
                  <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Schedule Meeting</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => onCreateDeal?.(lead)}
                >
                  <TrendingUp className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Create Deal</span>
                </Button>

                <Button
                  variant={canConvert ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9"
                  disabled={!canConvert}
                  onClick={() => canConvert && onConvertLead?.(lead)}
                >
                  <UserCheck className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Convert to Customer</span>
                </Button>

                {!canConvert && (
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 px-1">
                    Change status to{" "}
                    <span className="font-medium">Closed Won</span> above to
                    enable conversion to customer.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}