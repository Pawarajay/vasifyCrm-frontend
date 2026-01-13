

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useCRM } from "@/contexts/crm-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Lead } from "@/types/crm"

interface LeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead | null
  mode: "add" | "edit"
}

type LeadFormState = {
  name: string
  email: string
  phone: string
  company: string
  source: Lead["source"]
  status: Lead["status"]
  priority: Lead["priority"]
  assignedTo: string
  estimatedValue: string
  notes: string
  whatsappNumber: string
}

const DEFAULT_FORM: LeadFormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  source: "website",
  status: "new",
  priority: "medium",
  assignedTo: "",
  estimatedValue: "0",
  notes: "",
  whatsappNumber: "",
}

const SERVICE_OPTIONS = [
  { value: "whatsapp-business-api", label: "WhatsApp Business API" },
  { value: "website-development", label: "Website development" },
  { value: "ai-agent", label: "AI agent" },
  { value: "other", label: "Other" },
] as const

type ServiceValue = (typeof SERVICE_OPTIONS)[number]["value"]

export function LeadDialog({ open, onOpenChange, lead, mode }: LeadDialogProps) {
  const { addLead, updateLead } = useCRM()
  const [formData, setFormData] = useState<LeadFormState>(DEFAULT_FORM)
  const [expectedCloseDate, setExpectedCloseDate] = useState<Date | undefined>(
    undefined,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<ServiceValue[]>([])

  useEffect(() => {
    if (lead && mode === "edit") {
      setFormData({
        name: lead.name ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        company: lead.company ?? "",
        source: lead.source ?? "website",
        status: lead.status ?? "new",
        priority: lead.priority ?? "medium",
        assignedTo: lead.assignedTo ?? "",
        estimatedValue:
          typeof lead.estimatedValue === "number"
            ? String(lead.estimatedValue)
            : String(lead.estimatedValue ?? "0"),
        notes: lead.notes ?? "",
        whatsappNumber: lead.whatsappNumber ?? "",
      })
      setExpectedCloseDate(
        lead.expectedCloseDate instanceof Date
          ? lead.expectedCloseDate
          : lead.expectedCloseDate
          ? new Date(lead.expectedCloseDate as unknown as string)
          : undefined,
      )

      const existingService = (lead as any).service as
        | ServiceValue
        | undefined
      setSelectedServices(existingService ? [existingService] : [])
    } else {
      setFormData(DEFAULT_FORM)
      setExpectedCloseDate(undefined)
      setSelectedServices([])
    }
    setError(null)
  }, [lead, mode, open])

  const toggleService = (value: ServiceValue) => {
    setSelectedServices((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const name = formData.name.trim()
    const email = formData.email.trim()
    const phone = formData.phone.trim()

    if (!name || !email || !phone) {
      setError("Name, email, and phone are required.")
      return
    }

    const estimatedValueNumber = formData.estimatedValue
      ? Number(formData.estimatedValue)
      : 0
    if (Number.isNaN(estimatedValueNumber) || estimatedValueNumber < 0) {
      setError("Estimated value must be a valid non-negative number.")
      return
    }

    if (mode === "add" && selectedServices.length === 0) {
      setError("Please select at least one service.")
      return
    }

    const baseLeadData = {
      ...formData,
      name,
      email,
      phone,
      estimatedValue: estimatedValueNumber,
      expectedCloseDate,
    }

    setIsSubmitting(true)
    try {
      let ok = false

      if (mode === "add") {
        for (const service of selectedServices) {
          const payload = {
            ...baseLeadData,
            service,
          } as any

          const created = await addLead(payload)
          if (!created) {
            ok = false
            break
          }
          ok = true
        }
      } else if (lead) {
        const payload = {
          ...baseLeadData,
          service: selectedServices[0],
        } as any
        ok = await updateLead(lead.id, payload)
      }

      if (ok) {
        onOpenChange(false)
      } else {
        setError("Failed to save lead. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Lead" : "Edit Lead"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new lead to your sales pipeline."
              : "Update lead information and status."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={(e) =>
                  setFormData({ ...formData, whatsappNumber: e.target.value })
                }
                placeholder="Same as phone if applicable"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value (₹) *</Label>
              <Input
                id="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedValue: e.target.value,
                  })
                }
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Lead Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value: Lead["source"]) =>
                  setFormData({ ...formData, source: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="cold-call">Cold Call</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Lead["status"]) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed-won">Closed Win</SelectItem>
                  <SelectItem value="closed-lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Lead["priority"]) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service (multi-select) */}
          <div className="space-y-2">
            <Label>Service {mode === "add" && "*"}</Label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((option) => {
                const selected = selectedServices.includes(option.value)
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleService(option.value)}
                  >
                    {option.label}
                  </Button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Selecting multiple services will create one lead for each service
              when adding.
            </p>
          </div>

          {/* Expected Close Date */}
          <div className="space-y-2">
            <Label>Expected Close Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expectedCloseDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedCloseDate
                    ? format(expectedCloseDate, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expectedCloseDate}
                  onSelect={setExpectedCloseDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              placeholder="Additional notes about this lead..."
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === "add" ? "Add Lead(s)" : "Update Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
