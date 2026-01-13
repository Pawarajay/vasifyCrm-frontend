

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
import { Badge } from "@/components/ui/badge"
import { X, UserCheck } from "lucide-react"
import type { Lead, Customer } from "@/types/crm"

interface ConvertLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead | null
}

export function ConvertLeadDialog({
  open,
  onOpenChange,
  lead,
}: ConvertLeadDialogProps) {
  const { convertLead } = useCRM()
  const [formData, setFormData] = useState({
    company: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    status: "active" as Customer["status"],
    source: "",
    notes: "",
    totalValue: "0",
  })
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (lead && open) {
      setFormData({
        company: lead.company || "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        status: "active",
        source: lead.source || "",
        notes: lead.notes || "",
        totalValue:
          typeof lead.estimatedValue === "number"
            ? String(lead.estimatedValue)
            : String(lead.estimatedValue ?? "0"),
      })
      setTags([])
      setNewTag("")
    }
  }, [lead, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lead) return

    const totalValueNumber = formData.totalValue
      ? Number(formData.totalValue)
      : 0

    const customerData = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      whatsappNumber: lead.whatsappNumber,
      assignedTo: lead.assignedTo,
      ...formData,
      totalValue: Number.isNaN(totalValueNumber) ? 0 : totalValueNumber,
      tags,
    }

    setIsSubmitting(true)
    try {
      const ok = await convertLead(lead.id, customerData)
      if (ok) {
        onOpenChange(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    const value = newTag.trim()
    if (value && !tags.includes(value)) {
      setTags((prev) => [...prev, value])
    }
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Convert Lead to Customer
          </DialogTitle>
          <DialogDescription>
            Convert "{lead.name}" from a lead to a customer. This will create a
            new customer record and mark the lead as closed won.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lead Information (Read-only) */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Lead Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                {lead.name}
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                {lead.email}
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {lead.phone}
              </div>
              <div>
                <span className="text-muted-foreground">Estimated Value:</span>{" "}
                {typeof lead.estimatedValue === "number"
                  ? `₹${lead.estimatedValue.toLocaleString()}`
                  : "—"}
              </div>
            </div>
          </div>

          {/* Additional Customer Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Additional Customer Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder={lead.company || "Enter company name"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalValue">Total Value (₹)</Label>
                <Input
                  id="totalValue"
                  type="number"
                  value={formData.totalValue}
                  onChange={(e) =>
                    setFormData({ ...formData, totalValue: e.target.value })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Customer Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Customer["status"]) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
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
                placeholder="Additional notes about this customer..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              Convert to Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
