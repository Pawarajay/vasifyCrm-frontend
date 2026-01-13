

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from 'next/navigation'
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import type { Customer } from "@/types/crm"

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  mode: "add" | "edit"
}

type CustomerFormState = {
  name: string
  email: string
  phone: string
  company: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  status: Customer["status"]
  source: string
  notes: string
  whatsappNumber: string
  totalValue: string
  serviceType: "" | "whatsapp_api" | "website_dev" | "ai_agent"
  onboarding: boolean
  platformFees: boolean
  recharge: boolean
  development: boolean
  supportMaintenance: boolean
  hosting: boolean
  oneTimeCharges: boolean
  monthlyRecurring: boolean
  oneTimePrice: string
  monthlyPrice: string
  manualPrice: string
  defaultTaxRate: string
  defaultDueDays: string
  defaultInvoiceNotes: string
  recurringEnabled: boolean
  recurringInterval: "monthly" | "yearly"
  recurringAmount: string
  recurringService: string
  defaultRenewalStatus: "active" | "expiring" | "expired" | "renewed"
  defaultRenewalReminderDays: string
  defaultRenewalNotes: string
}

const DEFAULT_FORM: CustomerFormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
  status: "prospect",
  source: "",
  notes: "",
  whatsappNumber: "",
  totalValue: "0",
  serviceType: "",
  onboarding: false,
  platformFees: false,
  recharge: false,
  development: false,
  supportMaintenance: false,
  hosting: false,
  oneTimeCharges: true,
  monthlyRecurring: true,
  oneTimePrice: "0",
  monthlyPrice: "0",
  manualPrice: "0",
  defaultTaxRate: "",
  defaultDueDays: "",
  defaultInvoiceNotes: "",
  recurringEnabled: false,
  recurringInterval: "monthly",
  recurringAmount: "",
  recurringService: "",
  defaultRenewalStatus: "active",
  defaultRenewalReminderDays: "",
  defaultRenewalNotes: "",
}

export function CustomerDialog({ open, onOpenChange, customer, mode }: CustomerDialogProps) {
  const { addCustomer, updateCustomer } = useCRM()
  const searchParams = useSearchParams()
  const leadId = searchParams.get('leadId')
  const [formData, setFormData] = useState<CustomerFormState>(DEFAULT_FORM)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFromLead, setIsFromLead] = useState(false)
  const [leadService, setLeadService] = useState('')

  const toNumber = (v: string) => {
    const n = Number(v || 0)
    return Number.isNaN(n) ? 0 : n
  }

  // Fetch lead service when coming from lead page
  useEffect(() => {
    if (leadId && mode === 'add' && open) {
      fetchLeadService(leadId)
    }
  }, [leadId, mode, open])

  const fetchLeadService = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`)
      if (res.ok) {
        const lead = await res.json()
        if (lead.service) {
          const serviceType = lead.service === 'WhatsApp Business API' ? 'whatsapp_api' :
                             lead.service === 'Website Development' ? 'website_dev' :
                             lead.service === 'AI Agent' ? 'ai_agent' : ''
          setLeadService(lead.service)
          setFormData(prev => ({
            ...prev,
            serviceType,
            notes: `[From Lead #${id}] Service: ${lead.service}\n\n` + (prev.notes || '')
          }))
          setIsFromLead(true)
        }
      }
    } catch (err) {
      console.error('Failed to fetch lead service:', err)
    }
  }

useEffect(() => {
  if (customer && mode === "edit") {
    // ✅ CORRECT SERVICE MAPPING FROM DB
    let serviceType = "";
    let displayServiceName = "";
    
    if (customer.serviceType) {
      // Backend stores serviceType directly
      serviceType = customer.serviceType;
      displayServiceName = customer.serviceType === "whatsapp_api" ? "WhatsApp Business API" :
                          customer.serviceType === "website_dev" ? "Website Development" :
                          customer.serviceType === "ai_agent" ? "AI Agent" : customer.serviceType;
    } else if (customer.service) {
      // Fallback to service name from lead
      serviceType = customer.service === "WhatsApp Business API" ? "whatsapp_api" :
                   customer.service === "Website Development" ? "website_dev" :
                   customer.service === "AI Agent" ? "ai_agent" : "";
      displayServiceName = customer.service;
    }
    
    setFormData({
      ...DEFAULT_FORM,
      name: customer.name ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      company: customer.company ?? "",
      address: customer.address ?? "",
      city: customer.city ?? "",
      state: customer.state ?? "",
      zipCode: customer.zipCode ?? "",
      country: customer.country ?? "India",
      status: customer.status ?? "prospect",
      source: customer.source ?? "",
      notes: customer.notes ?? "",
      whatsappNumber: customer.whatsappNumber ?? "",
      totalValue: typeof customer.totalValue === "number" ? String(customer.totalValue) : (customer.totalValue as any) ?? "0",
      serviceType: serviceType as any, // ✅ CORRECT serviceType
      defaultTaxRate: customer.defaultTaxRate != null ? String(customer.defaultTaxRate) : "",
      defaultDueDays: customer.defaultDueDays != null ? String(customer.defaultDueDays) : "",
      defaultInvoiceNotes: customer.defaultInvoiceNotes ?? "",
      recurringEnabled: !!customer.recurringEnabled,
      recurringInterval: customer.recurringInterval ?? "monthly",
      recurringAmount: customer.recurringAmount != null ? String(customer.recurringAmount) : "",
      recurringService: customer.recurringService ?? "",
      defaultRenewalStatus: customer.defaultRenewalStatus ?? "active",
      defaultRenewalReminderDays: customer.defaultRenewalReminderDays != null ? String(customer.defaultRenewalReminderDays) : "",
      defaultRenewalNotes: customer.defaultRenewalNotes ?? "",
    });
    setTags(Array.isArray(customer.tags) ? customer.tags : []);
    
    // ✅ ONLY lock if service exists (lead-originated customers)
    if (serviceType || customer.service) {
      setIsFromLead(true);
      setLeadService(displayServiceName);
    } else {
      setIsFromLead(false);
      setLeadService("");
    }
  } else {
    setFormData(DEFAULT_FORM);
    setTags([]);
    setIsFromLead(!!leadId); // New customers from lead
    if (!leadId) setLeadService('');
  }
  setNewTag("");
  setError(null);
}, [customer, mode, open, leadId]);

  useEffect(() => {
    // Calculate total if either serviceType is set OR it's from a lead
    if (!formData.serviceType && !isFromLead) return
    const total = toNumber(formData.oneTimePrice) + toNumber(formData.monthlyPrice) + toNumber(formData.manualPrice)
    setFormData((prev) => ({ ...prev, totalValue: String(total) }))
  }, [formData.serviceType, formData.oneTimePrice, formData.monthlyPrice, formData.manualPrice, isFromLead])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!formData.name.trim()) return setError("Name is required.")
    if (!formData.email.trim()) return setError("Email is required.")
    if (!formData.phone.trim()) return setError("Phone is required.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setError("Enter a valid email address.")

    const totalValueNumber = Number(formData.totalValue || 0)
    if (Number.isNaN(totalValueNumber) || totalValueNumber < 0) return setError("Total value must be valid.")

    const serviceName =
      formData.serviceType === "whatsapp_api" ? "WhatsApp Business API" :
      formData.serviceType === "website_dev" ? "Website Development" :
      formData.serviceType === "ai_agent" ? "AI Agent" : ""

    let serviceDetails = ""
    if (formData.serviceType) {
      const selectedItems: string[] = []
      if (formData.serviceType === "whatsapp_api") {
        if (formData.onboarding) selectedItems.push("Onboarding")
        if (formData.platformFees) selectedItems.push("Platform Fees")
        if (formData.recharge) selectedItems.push("Recharge")
      } else {
        if (formData.development) selectedItems.push("Development")
        if (formData.supportMaintenance) selectedItems.push("Support & Maintenance")
        if (formData.hosting) selectedItems.push("Hosting")
      }

      serviceDetails = `Service: ${serviceName}
Selected items: ${selectedItems.join(", ") || "None"}
One-time: ₹${formData.oneTimePrice}
Monthly: ₹${formData.monthlyPrice}
Manual: ₹${formData.manualPrice}`
    }

    const appendedNotes = (formData.notes ? formData.notes.trim() + "\n\n" : "") +
      `[Auto summary]
Customer: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Company: ${formData.company || "N/A"}
Status: ${formData.status}
Source: ${formData.source || "N/A"}
Total value: ₹${totalValueNumber}` + (serviceDetails ? "\n\n" + serviceDetails : "")

    const customerData: Omit<Customer, "id"> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
      status: formData.status,
      source: formData.source,
      assignedTo: customer?.assignedTo ?? "",
      notes: appendedNotes,
      whatsappNumber: formData.whatsappNumber,
      totalValue: totalValueNumber,
      tags,
      lastContactDate: customer?.lastContactDate,
      serviceType: formData.serviceType || undefined,
      service: serviceName || undefined as any,
      defaultTaxRate: formData.defaultTaxRate ? Number(formData.defaultTaxRate) : undefined,
      defaultDueDays: formData.defaultDueDays ? Number(formData.defaultDueDays) : undefined,
      defaultInvoiceNotes: formData.defaultInvoiceNotes || undefined,
      recurringEnabled: formData.recurringEnabled,
      recurringInterval: formData.recurringInterval,
      recurringAmount: formData.recurringAmount ? Number(formData.recurringAmount) : undefined,
      recurringService: formData.recurringService || undefined,
      defaultRenewalStatus: formData.defaultRenewalStatus,
      defaultRenewalReminderDays: formData.defaultRenewalReminderDays ? Number(formData.defaultRenewalReminderDays) : undefined,
      defaultRenewalNotes: formData.defaultRenewalNotes || undefined,
      createdAt: customer?.createdAt ?? new Date(),
      updatedAt: new Date(),
      ...(leadId && { leadId }) // Pass leadId to backend
    }

    setIsSubmitting(true)
    try {
      const success = mode === "add" ? await addCustomer(customerData as any) : customer ? await updateCustomer(customer.id, customerData as any) : false
      if (success) {
        onOpenChange(false)
        setFormData(DEFAULT_FORM)
        setTags([])
        setNewTag("")
        setIsFromLead(false)
      } else {
        setError("Failed to save customer.")
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to save customer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTagHandler = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
    }
    setNewTag("")
  }

  const handleServiceChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const newValue = e.target.value as "" | "whatsapp_api" | "website_dev" | "ai_agent"
    setFormData((prev) => ({
      ...prev,
      serviceType: newValue,
      oneTimeCharges: newValue ? true : prev.oneTimeCharges,
      monthlyRecurring: newValue ? true : prev.monthlyRecurring,
    }))
  }

const renderServiceSelector = () => (
  <div className="space-y-2">
    <Label>Service</Label>
    <select 
      className="border rounded px-3 py-2 text-sm w-full"
      value={formData.serviceType} 
      onChange={handleServiceChange}
      disabled={isFromLead} // ✅ ONLY lock lead-originated customers
      style={isFromLead ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
    >
      <option value="">Select service</option>
      <option value="whatsapp_api">WhatsApp Business API</option>
      <option value="website_dev">Website Development</option>
      <option value="ai_agent">AI Agent</option>
    </select>
    {isFromLead && leadService && (
      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border flex items-center gap-2">
         Service locked from lead: <strong>{leadService}</strong>
        {leadId && <span className="text-xs">(#{leadId})</span>}
      </div>
    )}
  </div>
);


  const renderServiceFields = () => {
    if (!formData.serviceType && !isFromLead) return null

    if (formData.serviceType === "whatsapp_api" || isFromLead) {
      return (
        <div className="border rounded-lg p-4 bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="flex justify-between items-center pb-3 border-b-2 mb-4">
            <h3 className="font-semibold">
              {isFromLead && !formData.serviceType ? leadService : "WhatsApp Business API"}
            </h3>
            <span className="text-sm text-muted-foreground">Pricing</span>
          </div>
          
          {/* ROW 1: Onboarding - One-time */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
              <span>Onboarding</span>
            </div>
            <div className="bg-white rounded p-3 border-l-4 border-blue-500">
              <Label className="text-xs text-gray-600">One-time (₹)</Label>
              <Input 
                type="number" 
                min="0" 
                value={formData.oneTimePrice} 
                onChange={(e) => setFormData({ ...formData, oneTimePrice: e.target.value })} 
                className="font-semibold mt-1" 
              />
            </div>
          </div>

          {/* ROW 2: Platform Fees - Monthly */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
              <span>Platform Fees</span>
            </div>
            <div className="bg-white rounded p-3 border-l-4 border-green-500">
              <Label className="text-xs text-gray-600">Monthly (₹)</Label>
              <Input 
                type="number" 
                min="0" 
                value={formData.monthlyPrice} 
                onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })} 
                className="font-semibold mt-1" 
              />
            </div>
          </div>

          {/* ROW 3: Recharge - Manual */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
              <span>Recharge</span>
            </div>
            <div className="bg-white rounded p-3 border-l-4 border-purple-500">
              <Label className="text-xs text-gray-600">Manual (₹)</Label>
              <Input 
                type="number" 
                min="0" 
                value={formData.manualPrice} 
                onChange={(e) => setFormData({ ...formData, manualPrice: e.target.value })} 
                className="font-semibold mt-1" 
              />
            </div>
          </div>

          {/* TOTAL VALUE */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Total Value</span>
              <span className="text-xl font-bold">₹{toNumber(formData.totalValue)}</span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="border rounded-lg p-4 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="flex justify-between items-center pb-3 border-b-2 mb-4">
          <h3 className="font-semibold">{formData.serviceType === "website_dev" ? "Website Development" : "AI Agent"}</h3>
          <span className="text-sm text-muted-foreground">Pricing</span>
        </div>
        
        {/* ROW 1: Development - One-time */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
            <span>Development</span>
          </div>
          <div className="bg-white rounded p-3 border-l-4 border-blue-500">
            <Label className="text-xs text-gray-600">One-time (₹)</Label>
            <Input 
              type="number" 
              min="0" 
              value={formData.oneTimePrice} 
              onChange={(e) => setFormData({ ...formData, oneTimePrice: e.target.value })} 
              className="font-semibold mt-1" 
            />
          </div>
        </div>

        {/* ROW 2: Support & Maintenance - Monthly */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
            <span>Support & Maintenance</span>
          </div>
          <div className="bg-white rounded p-3 border-l-4 border-green-500">
            <Label className="text-xs text-gray-600">Monthly (₹)</Label>
            <Input 
              type="number" 
              min="0" 
              value={formData.monthlyPrice} 
              onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })} 
              className="font-semibold mt-1" 
            />
          </div>
        </div>

        {/* ROW 3: Hosting - Manual */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
            <span>Hosting</span>
          </div>
          <div className="bg-white rounded p-3 border-l-4 border-purple-500">
            <Label className="text-xs text-gray-600">Manual (₹)</Label>
            <Input 
              type="number" 
              min="0" 
              value={formData.manualPrice} 
              onChange={(e) => setFormData({ ...formData, manualPrice: e.target.value })} 
              className="font-semibold mt-1" 
            />
          </div>
        </div>

        {/* TOTAL VALUE */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Total Value</span>
            <span className="text-xl font-bold">₹{toNumber(formData.totalValue)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Customer" : "Edit Customer"}</DialogTitle>
          <DialogDescription>{mode === "add" ? "Add a new customer to your CRM system." : "Update customer information."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <Input id="whatsappNumber" type="tel" value={formData.whatsappNumber} onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalValue">Total Value (₹)</Label>
              <Input id="totalValue" type="number" value={formData.totalValue} onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })} min="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" />
            <Input id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="State" />
            <Input id="zipCode" value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} placeholder="ZIP" />
          </div>
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>Status</Label>
    <select className="border rounded px-3 py-2 text-sm w-full" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Customer["status"] })}>
      <option value="prospect">Prospect</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>
  <div className="space-y-2">
    <Label htmlFor="source">Source</Label>
    <Input id="source" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
  </div>
</div>

{renderServiceSelector()}

{(isFromLead || formData.serviceType) && renderServiceFields()}

          
          <div className="border rounded-md p-3 space-y-3">
            <p className="text-sm font-semibold">Invoice Defaults</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Tax Rate (%)</Label>
                <Input type="number" min="0" value={formData.defaultTaxRate} onChange={(e) => setFormData({ ...formData, defaultTaxRate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Due Days</Label>
                <Input type="number" min="0" value={formData.defaultDueDays} onChange={(e) => setFormData({ ...formData, defaultDueDays: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Invoice Notes</Label>
                <Input value={formData.defaultInvoiceNotes} onChange={(e) => setFormData({ ...formData, defaultInvoiceNotes: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="border rounded-md p-3 space-y-3">
            <p className="text-sm font-semibold">Recurring / Subscription</p>
            <div className="flex items-center gap-2">
              <Checkbox id="recurringEnabled" checked={formData.recurringEnabled} onCheckedChange={(checked) => setFormData({ ...formData, recurringEnabled: checked as boolean })} />
              <label htmlFor="recurringEnabled" className="text-sm font-medium cursor-pointer">Enable recurring billing</label>
            </div>
            {formData.recurringEnabled && (
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="space-y-1">
                  <Label>Interval</Label>
                  <select className="border rounded px-3 py-2 text-sm w-full" value={formData.recurringInterval} onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value as "monthly" | "yearly" })}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Amount (₹)</Label>
                  <Input type="number" min="0" value={formData.recurringAmount} onChange={(e) => setFormData({ ...formData, recurringAmount: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Service Name</Label>
                  <Input value={formData.recurringService} onChange={(e) => setFormData({ ...formData, recurringService: e.target.value })} />
                </div>
              </div>
            )}
          </div>
          <div className="border rounded-md p-3 space-y-3">
            <p className="text-sm font-semibold">Renewal Defaults</p>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label>Status</Label>
                <select className="border rounded px-3 py-2 text-sm w-full" value={formData.defaultRenewalStatus} onChange={(e) => setFormData({ ...formData, defaultRenewalStatus: e.target.value as CustomerFormState["defaultRenewalStatus"] })}>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring</option>
                  <option value="expired">Expired</option>
                  <option value="renewed">Renewed</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Reminder Days</Label>
                <Input type="number" min="0" value={formData.defaultRenewalReminderDays} onChange={(e) => setFormData({ ...formData, defaultRenewalReminderDays: e.target.value })} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Renewal Notes</Label>
                <Input value={formData.defaultRenewalNotes} onChange={(e) => setFormData({ ...formData, defaultRenewalNotes: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setTags(tags.filter((t) => t !== tag))} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} />
              <Button type="button" variant="outline" onClick={addTagHandler}>Add</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          {error && <p className="text-sm text-destructive border border-destructive/30 rounded p-2">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (mode === "add" ? "Adding..." : "Updating...") : (mode === "add" ? "Add Customer" : "Update Customer")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


//testing 30-12-2025



// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { useSearchParams } from "next/navigation"
// import { useCRM } from "@/contexts/crm-context"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Badge } from "@/components/ui/badge"
// import { Checkbox } from "@/components/ui/checkbox"
// import { X } from "lucide-react"
// import type { Customer } from "@/types/crm"

// interface CustomerDialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   customer: Customer | null
//   mode: "add" | "edit"
// }

// type CustomerFormState = {
//   name: string
//   email: string
//   phone: string
//   company: string
//   address: string
//   city: string
//   state: string
//   zipCode: string
//   country: string
//   status: Customer["status"]
//   source: string
//   notes: string
//   whatsappNumber: string
//   totalValue: string
//   serviceType: "" | "whatsapp_api" | "website_dev" | "ai_agent"
//   onboarding: boolean
//   platformFees: boolean
//   recharge: boolean
//   development: boolean
//   supportMaintenance: boolean
//   hosting: boolean
//   oneTimeCharges: boolean
//   monthlyRecurring: boolean
//   oneTimePrice: string
//   monthlyPrice: string
//   manualPrice: string
//   defaultTaxRate: string
//   defaultDueDays: string
//   defaultInvoiceNotes: string
//   recurringEnabled: boolean
//   recurringInterval: "monthly" | "yearly"
//   recurringAmount: string
//   recurringService: string
//   defaultRenewalStatus: "active" | "expiring" | "expired" | "renewed"
//   defaultRenewalReminderDays: string
//   defaultRenewalNotes: string
// }

// const DEFAULT_FORM: CustomerFormState = {
//   name: "",
//   email: "",
//   phone: "",
//   company: "",
//   address: "",
//   city: "",
//   state: "",
//   zipCode: "",
//   country: "India",
//   status: "prospect",
//   source: "",
//   notes: "",
//   whatsappNumber: "",
//   totalValue: "0",
//   serviceType: "",
//   onboarding: false,
//   platformFees: false,
//   recharge: false,
//   development: false,
//   supportMaintenance: false,
//   hosting: false,
//   oneTimeCharges: true,
//   monthlyRecurring: true,
//   oneTimePrice: "0",
//   monthlyPrice: "0",
//   manualPrice: "0",
//   defaultTaxRate: "",
//   defaultDueDays: "",
//   defaultInvoiceNotes: "",
//   recurringEnabled: false,
//   recurringInterval: "monthly",
//   recurringAmount: "",
//   recurringService: "",
//   defaultRenewalStatus: "active",
//   defaultRenewalReminderDays: "",
//   defaultRenewalNotes: "",
// }

// export function CustomerDialog({ open, onOpenChange, customer, mode }: CustomerDialogProps) {
//   const { addCustomer, updateCustomer } = useCRM()
//   const searchParams = useSearchParams()
//   const leadId = searchParams.get("leadId")

//   const [formData, setFormData] = useState<CustomerFormState>(DEFAULT_FORM)
//   const [tags, setTags] = useState<string[]>([])
//   const [newTag, setNewTag] = useState("")
//   const [error, setError] = useState<string | null>(null)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isFromLead, setIsFromLead] = useState(false)
//   const [leadService, setLeadService] = useState("")

//   const toNumber = (v: string) => {
//     const n = Number(v || 0)
//     return Number.isNaN(n) ? 0 : n
//   }

//   // Fetch lead service when coming from lead page
//   useEffect(() => {
//     if (leadId && mode === "add" && open) {
//       fetchLeadService(leadId)
//     }
//   }, [leadId, mode, open])

//   const fetchLeadService = async (id: string) => {
//     try {
//       const res = await fetch(`/api/leads/${id}`)
//       if (res.ok) {
//         const lead = await res.json()
//         if (lead.service) {
//           const serviceType =
//             lead.service === "WhatsApp Business API"
//               ? "whatsapp_api"
//               : lead.service === "Website Development"
//               ? "website_dev"
//               : lead.service === "AI Agent"
//               ? "ai_agent"
//               : ""
//           setLeadService(lead.service)
//           setFormData((prev) => ({
//             ...prev,
//             serviceType,
//             notes: `[From Lead #${id}] Service: ${lead.service}\n\n` + (prev.notes || ""),
//           }))
//           setIsFromLead(true)
//         }
//       }
//     } catch (err) {
//       console.error("Failed to fetch lead service:", err)
//     }
//   }

//   // Load customer in edit mode
//   useEffect(() => {
//     if (customer && mode === "edit") {
//       let serviceType = ""
//       let displayServiceName = ""

//       if ((customer as any).serviceType) {
//         serviceType = (customer as any).serviceType
//         displayServiceName =
//           serviceType === "whatsapp_api"
//             ? "WhatsApp Business API"
//             : serviceType === "website_dev"
//             ? "Website Development"
//             : serviceType === "ai_agent"
//             ? "AI Agent"
//             : serviceType
//       } else if ((customer as any).service) {
//         const svc = (customer as any).service as string
//         serviceType =
//           svc === "WhatsApp Business API"
//             ? "whatsapp_api"
//             : svc === "Website Development"
//             ? "website_dev"
//             : svc === "AI Agent"
//             ? "ai_agent"
//             : ""
//         displayServiceName = svc
//       }

//       setFormData({
//         ...DEFAULT_FORM,
//         name: customer.name ?? "",
//         email: customer.email ?? "",
//         phone: customer.phone ?? "",
//         company: customer.company ?? "",
//         address: customer.address ?? "",
//         city: customer.city ?? "",
//         state: customer.state ?? "",
//         zipCode: (customer as any).zipCode ?? (customer as any).zip_code ?? "",
//         country: customer.country ?? "India",
//         status: customer.status ?? "prospect",
//         source: customer.source ?? "",
//         notes: customer.notes ?? "",
//         whatsappNumber: (customer as any).whatsappNumber ?? (customer as any).whatsapp_number ?? "",
//         totalValue:
//           typeof customer.totalValue === "number"
//             ? String(customer.totalValue)
//             : ((customer as any).total_value as any) ?? "0",
//         serviceType: serviceType as any,
//         defaultTaxRate:
//           (customer as any).defaultTaxRate != null
//             ? String((customer as any).defaultTaxRate)
//             : (customer as any).default_tax_rate != null
//             ? String((customer as any).default_tax_rate)
//             : "",
//         defaultDueDays:
//           (customer as any).defaultDueDays != null
//             ? String((customer as any).defaultDueDays)
//             : (customer as any).default_due_days != null
//             ? String((customer as any).default_due_days)
//             : "",
//         defaultInvoiceNotes:
//           (customer as any).defaultInvoiceNotes ??
//           (customer as any).default_invoice_notes ??
//           "",
//         recurringEnabled: !!((customer as any).recurringEnabled ?? (customer as any).recurring_enabled),
//         recurringInterval:
//           ((customer as any).recurringInterval ??
//             (customer as any).recurring_interval) || "monthly",
//         recurringAmount:
//           (customer as any).recurringAmount != null
//             ? String((customer as any).recurringAmount)
//             : (customer as any).recurring_amount != null
//             ? String((customer as any).recurring_amount)
//             : "",
//         recurringService:
//           (customer as any).recurringService ??
//           (customer as any).recurring_service ??
//           "",
//         defaultRenewalStatus:
//           (customer as any).defaultRenewalStatus ??
//           (customer as any).default_renewal_status ??
//           "active",
//         defaultRenewalReminderDays:
//           (customer as any).defaultRenewalReminderDays != null
//             ? String((customer as any).defaultRenewalReminderDays)
//             : (customer as any).default_renewal_reminder_days != null
//             ? String((customer as any).default_renewal_reminder_days)
//             : "",
//         defaultRenewalNotes:
//           (customer as any).defaultRenewalNotes ??
//           (customer as any).default_renewal_notes ??
//           "",
//       })
//       setTags(Array.isArray((customer as any).tags) ? ((customer as any).tags as string[]) : [])

//       if (serviceType || (customer as any).service) {
//         setIsFromLead(true)
//         setLeadService(displayServiceName)
//       } else {
//         setIsFromLead(false)
//         setLeadService("")
//       }
//     } else {
//       setFormData(DEFAULT_FORM)
//       setTags([])
//       setIsFromLead(!!leadId)
//       if (!leadId) setLeadService("")
//     }
//     setNewTag("")
//     setError(null)
//   }, [customer, mode, open, leadId])

//   // Auto total from pricing
//   useEffect(() => {
//     if (!formData.serviceType && !isFromLead) return
//     const total =
//       toNumber(formData.oneTimePrice) +
//       toNumber(formData.monthlyPrice) +
//       toNumber(formData.manualPrice)
//     setFormData((prev) => ({ ...prev, totalValue: String(total) }))
//   }, [
//     formData.serviceType,
//     formData.oneTimePrice,
//     formData.monthlyPrice,
//     formData.manualPrice,
//     isFromLead,
//   ])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     if (!formData.name.trim()) return setError("Name is required.")
//     if (!formData.email.trim()) return setError("Email is required.")
//     if (!formData.phone.trim()) return setError("Phone is required.")
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
//       return setError("Enter a valid email address.")

//     const totalValueNumber = Number(formData.totalValue || 0)
//     if (Number.isNaN(totalValueNumber) || totalValueNumber < 0)
//       return setError("Total value must be valid.")

//     const serviceName =
//       formData.serviceType === "whatsapp_api"
//         ? "WhatsApp Business API"
//         : formData.serviceType === "website_dev"
//         ? "Website Development"
//         : formData.serviceType === "ai_agent"
//         ? "AI Agent"
//         : ""

//     let serviceDetails = ""
//     if (formData.serviceType) {
//       const selectedItems: string[] = []
//       if (formData.serviceType === "whatsapp_api") {
//         selectedItems.push("Onboarding", "Platform Fees", "Recharge")
//       } else {
//         selectedItems.push("Development", "Support & Maintenance", "Hosting")
//       }

//       serviceDetails = `Service: ${serviceName}
// Selected items: ${selectedItems.join(", ")}
// One-time: ₹${formData.oneTimePrice}
// Monthly: ₹${formData.monthlyPrice}
// Manual: ₹${formData.manualPrice}`
//     }

//     const appendedNotes =
//       (formData.notes ? formData.notes.trim() + "\n\n" : "") +
//       `[Auto summary]
// Customer: ${formData.name}
// Email: ${formData.email}
// Phone: ${formData.phone}
// Company: ${formData.company || "N/A"}
// Status: ${formData.status}
// Source: ${formData.source || "N/A"}
// Total value: ₹${totalValueNumber}` +
//       (serviceDetails ? "\n\n" + serviceDetails : "")

//     const customerData: Omit<Customer, "id"> = {
//       name: formData.name,
//       email: formData.email,
//       phone: formData.phone,
//       company: formData.company,
//       address: formData.address,
//       city: formData.city,
//       state: formData.state,
//       zipCode: formData.zipCode,
//       country: formData.country,
//       status: formData.status,
//       source: formData.source,
//       assignedTo: customer?.assignedTo ?? "",
//       notes: appendedNotes,
//       whatsappNumber: formData.whatsappNumber,
//       totalValue: totalValueNumber,
//       tags,
//       lastContactDate: customer?.lastContactDate,
//       serviceType: formData.serviceType || undefined,
//       service: serviceName || (leadService || undefined),
//       defaultTaxRate: formData.defaultTaxRate
//         ? Number(formData.defaultTaxRate)
//         : undefined,
//       defaultDueDays: formData.defaultDueDays
//         ? Number(formData.defaultDueDays)
//         : undefined,
//       defaultInvoiceNotes: formData.defaultInvoiceNotes || undefined,
//       recurringEnabled: formData.recurringEnabled,
//       recurringInterval: formData.recurringInterval,
//       recurringAmount: formData.recurringAmount
//         ? Number(formData.recurringAmount)
//         : undefined,
//       recurringService: formData.recurringService || undefined,
//       defaultRenewalStatus: formData.defaultRenewalStatus,
//       defaultRenewalReminderDays: formData.defaultRenewalReminderDays
//         ? Number(formData.defaultRenewalReminderDays)
//         : undefined,
//       defaultRenewalNotes: formData.defaultRenewalNotes || undefined,
//       createdAt: customer?.createdAt ?? new Date(),
//       updatedAt: new Date(),
//       ...(leadId && { leadId }),
//     }

//     setIsSubmitting(true)
//     try {
//       // expect addCustomer/updateCustomer to return { success, message, invoice? }
//       const response =
//         mode === "add"
//           ? await addCustomer(customerData as any)
//           : customer
//           ? await updateCustomer(customer.id, customerData as any)
//           : null

//       if (response && (response as any).success !== false) {
//         onOpenChange(false)
//         setFormData(DEFAULT_FORM)
//         setTags([])
//         setNewTag("")
//         setIsFromLead(false)
//         setLeadService("")
//         // if you use a toast library, you can use:
//         // toast.success(response.invoice ? `Customer saved · Invoice ${response.invoice.invoiceNumber} created` : "Customer saved")
//       } else {
//         setError(
//           (response as any)?.error || "Failed to save customer."
//         )
//       }
//     } catch (err: any) {
//       setError(err?.message ?? "Failed to save customer.")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const addTagHandler = () => {
//     if (newTag.trim() && !tags.includes(newTag.trim())) {
//       setTags([...tags, newTag.trim()])
//     }
//     setNewTag("")
//   }

//   const handleServiceChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
//     const newValue = e.target.value as
//       | ""
//       | "whatsapp_api"
//       | "website_dev"
//       | "ai_agent"
//     setFormData((prev) => ({
//       ...prev,
//       serviceType: newValue,
//       oneTimeCharges: newValue ? true : prev.oneTimeCharges,
//       monthlyRecurring: newValue ? true : prev.monthlyRecurring,
//     }))
//   }

//   const renderServiceSelector = () => (
//     <div className="space-y-2">
//       <Label>Service</Label>
//       <select
//         className="border rounded px-3 py-2 text-sm w-full"
//         value={formData.serviceType}
//         onChange={handleServiceChange}
//         disabled={isFromLead}
//         style={
//           isFromLead
//             ? { backgroundColor: "#f3f4f6", cursor: "not-allowed" }
//             : {}
//         }
//       >
//         <option value="">Select service</option>
//         <option value="whatsapp_api">WhatsApp Business API</option>
//         <option value="website_dev">Website Development</option>
//         <option value="ai_agent">AI Agent</option>
//       </select>
//       {isFromLead && leadService && (
//         <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border flex items-center gap-2">
//           Service locked from lead: <strong>{leadService}</strong>
//           {leadId && <span className="text-xs">(#{leadId})</span>}
//         </div>
//       )}
//     </div>
//   )

//   const renderServiceFields = () => {
//     if (!formData.serviceType && !isFromLead) return null

//     if (formData.serviceType === "whatsapp_api" || isFromLead) {
//       return (
//         <div className="border rounded-lg p-4 bg-gradient-to-br from-slate-50 to-gray-100">
//           <div className="flex justify-between items-center pb-3 border-b-2 mb-4">
//             <h3 className="font-semibold">
//               {isFromLead && !formData.serviceType
//                 ? leadService
//                 : "WhatsApp Business API"}
//             </h3>
//             <span className="text-sm text-muted-foreground">Pricing</span>
//           </div>

//           {/* ROW 1: Onboarding - One-time */}
//           <div className="grid grid-cols-2 gap-4 mb-3">
//             <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
//               <span>Onboarding</span>
//             </div>
//             <div className="bg-white rounded p-3 border-l-4 border-blue-500">
//               <Label className="text-xs text-gray-600">One-time (₹)</Label>
//               <Input
//                 type="number"
//                 min="0"
//                 value={formData.oneTimePrice}
//                 onChange={(e) =>
//                   setFormData({ ...formData, oneTimePrice: e.target.value })
//                 }
//                 className="font-semibold mt-1"
//               />
//             </div>
//           </div>

//           {/* ROW 2: Platform Fees - Monthly */}
//           <div className="grid grid-cols-2 gap-4 mb-3">
//             <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
//               <span>Platform Fees</span>
//             </div>
//             <div className="bg-white rounded p-3 border-l-4 border-green-500">
//               <Label className="text-xs text-gray-600">Monthly (₹)</Label>
//               <Input
//                 type="number"
//                 min="0"
//                 value={formData.monthlyPrice}
//                 onChange={(e) =>
//                   setFormData({ ...formData, monthlyPrice: e.target.value })
//                 }
//                 className="font-semibold mt-1"
//               />
//             </div>
//           </div>

//           {/* ROW 3: Recharge - Manual */}
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
//               <span>Recharge</span>
//             </div>
//             <div className="bg-white rounded p-3 border-l-4 border-purple-500">
//               <Label className="text-xs text-gray-600">Manual (₹)</Label>
//               <Input
//                 type="number"
//                 min="0"
//                 value={formData.manualPrice}
//                 onChange={(e) =>
//                   setFormData({ ...formData, manualPrice: e.target.value })
//                 }
//                 className="font-semibold mt-1"
//               />
//             </div>
//           </div>

//           {/* TOTAL VALUE */}
//           <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded p-4">
//             <div className="flex justify-between items-center">
//               <span className="text-sm font-semibold">Total Value</span>
//               <span className="text-xl font-bold">
//                 ₹{toNumber(formData.totalValue)}
//               </span>
//             </div>
//           </div>
//         </div>
//       )
//     }

//     // Website / AI Agent
//     return (
//       <div className="border rounded-lg p-4 bg-gradient-to-br from-slate-50 to-gray-100">
//         <div className="flex justify-between items-center pb-3 border-b-2 mb-4">
//           <h3 className="font-semibold">
//             {formData.serviceType === "website_dev"
//               ? "Website Development"
//               : "AI Agent"}
//           </h3>
//           <span className="text-sm text-muted-foreground">Pricing</span>
//         </div>

//         {/* ROW 1: Development - One-time */}
//         <div className="grid grid-cols-2 gap-4 mb-3">
//           <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
//             <span>Development</span>
//           </div>
//           <div className="bg-white rounded p-3 border-l-4 border-blue-500">
//             <Label className="text-xs text-gray-600">One-time (₹)</Label>
//             <Input
//               type="number"
//               min="0"
//               value={formData.oneTimePrice}
//               onChange={(e) =>
//                 setFormData({ ...formData, oneTimePrice: e.target.value })
//               }
//               className="font-semibold mt-1"
//             />
//           </div>
//         </div>

//         {/* ROW 2: Support & Maintenance - Monthly */}
//         <div className="grid grid-cols-2 gap-4 mb-3">
//           <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
//             <span>Support & Maintenance</span>
//           </div>
//           <div className="bg-white rounded p-3 border-l-4 border-green-500">
//             <Label className="text-xs text-gray-600">Monthly (₹)</Label>
//             <Input
//               type="number"
//               min="0"
//               value={formData.monthlyPrice}
//               onChange={(e) =>
//                 setFormData({ ...formData, monthlyPrice: e.target.value })
//               }
//               className="font-semibold mt-1"
//             />
//           </div>
//         </div>

//         {/* ROW 3: Hosting - Manual */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div className="bg-white rounded p-2.5 border border-gray-200 text-sm flex items-center">
//             <span>Hosting</span>
//           </div>
//           <div className="bg-white rounded p-3 border-l-4 border-purple-500">
//             <Label className="text-xs text-gray-600">Manual (₹)</Label>
//             <Input
//               type="number"
//               min="0"
//               value={formData.manualPrice}
//               onChange={(e) =>
//                 setFormData({ ...formData, manualPrice: e.target.value })
//               }
//               className="font-semibold mt-1"
//             />
//           </div>
//         </div>

//         {/* TOTAL VALUE */}
//         <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded p-4">
//           <div className="flex justify-between items-center">
//             <span className="text-sm font-semibold">Total Value</span>
//             <span className="text-xl font-bold">
//               ₹{toNumber(formData.totalValue)}
//             </span>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {mode === "add" ? "Add New Customer" : "Edit Customer"}
//           </DialogTitle>
//           <DialogDescription>
//             {mode === "add"
//               ? "Add a new customer to your CRM system."
//               : "Update customer information."}
//           </DialogDescription>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="name">Full Name *</Label>
//               <Input
//                 id="name"
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="email">Email *</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData({ ...formData, email: e.target.value })
//                 }
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="phone">Phone *</Label>
//               <Input
//                 id="phone"
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(e) =>
//                   setFormData({ ...formData, phone: e.target.value })
//                 }
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
//               <Input
//                 id="whatsappNumber"
//                 type="tel"
//                 value={formData.whatsappNumber}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     whatsappNumber: e.target.value,
//                   })
//                 }
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="company">Company</Label>
//               <Input
//                 id="company"
//                 value={formData.company}
//                 onChange={(e) =>
//                   setFormData({ ...formData, company: e.target.value })
//                 }
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="totalValue">Total Value (₹)</Label>
//               <Input
//                 id="totalValue"
//                 type="number"
//                 value={formData.totalValue}
//                 onChange={(e) =>
//                   setFormData({ ...formData, totalValue: e.target.value })
//                 }
//                 min="0"
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="address">Address</Label>
//             <Input
//               id="address"
//               value={formData.address}
//               onChange={(e) =>
//                 setFormData({ ...formData, address: e.target.value })
//               }
//             />
//           </div>

//           <div className="grid grid-cols-3 gap-4">
//             <Input
//               id="city"
//               value={formData.city}
//               onChange={(e) =>
//                 setFormData({ ...formData, city: e.target.value })
//               }
//               placeholder="City"
//             />
//             <Input
//               id="state"
//               value={formData.state}
//               onChange={(e) =>
//                 setFormData({ ...formData, state: e.target.value })
//               }
//               placeholder="State"
//             />
//             <Input
//               id="zipCode"
//               value={formData.zipCode}
//               onChange={(e) =>
//                 setFormData({ ...formData, zipCode: e.target.value })
//               }
//               placeholder="ZIP"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label>Status</Label>
//               <select
//                 className="border rounded px-3 py-2 text-sm w-full"
//                 value={formData.status}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     status: e.target.value as Customer["status"],
//                   })
//                 }
//               >
//                 <option value="prospect">Prospect</option>
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//               </select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="source">Source</Label>
//               <Input
//                 id="source"
//                 value={formData.source}
//                 onChange={(e) =>
//                   setFormData({ ...formData, source: e.target.value })
//                 }
//               />
//             </div>
//           </div>

//           {renderServiceSelector()}
//           {(isFromLead || formData.serviceType) && renderServiceFields()}

//           <div className="border rounded-md p-3 space-y-3">
//             <p className="text-sm font-semibold">Invoice Defaults</p>
//             <div className="grid grid-cols-3 gap-4">
//               <div className="space-y-1">
//                 <Label>Tax Rate (%)</Label>
//                 <Input
//                   type="number"
//                   min="0"
//                   value={formData.defaultTaxRate}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       defaultTaxRate: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//               <div className="space-y-1">
//                 <Label>Due Days</Label>
//                 <Input
//                   type="number"
//                   min="0"
//                   value={formData.defaultDueDays}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       defaultDueDays: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//               <div className="space-y-1">
//                 <Label>Invoice Notes</Label>
//                 <Input
//                   value={formData.defaultInvoiceNotes}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       defaultInvoiceNotes: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="border rounded-md p-3 space-y-3">
//             <p className="text-sm font-semibold">Recurring / Subscription</p>
//             <div className="flex items-center gap-2">
//               <Checkbox
//                 id="recurringEnabled"
//                 checked={formData.recurringEnabled}
//                 onCheckedChange={(checked) =>
//                   setFormData({
//                     ...formData,
//                     recurringEnabled: checked as boolean,
//                   })
//                 }
//               />
//               <label
//                 htmlFor="recurringEnabled"
//                 className="text-sm font-medium cursor-pointer"
//               >
//                 Enable recurring billing
//               </label>
//             </div>
//             {formData.recurringEnabled && (
//               <div className="grid grid-cols-3 gap-4 mt-2">
//                 <div className="space-y-1">
//                   <Label>Interval</Label>
//                   <select
//                     className="border rounded px-3 py-2 text-sm w-full"
//                     value={formData.recurringInterval}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         recurringInterval: e.target.value as
//                           | "monthly"
//                           | "yearly",
//                       })
//                     }
//                   >
//                     <option value="monthly">Monthly</option>
//                     <option value="yearly">Yearly</option>
//                   </select>
//                 </div>
//                 <div className="space-y-1">
//                   <Label>Amount (₹)</Label>
//                   <Input
//                     type="number"
//                     min="0"
//                     value={formData.recurringAmount}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         recurringAmount: e.target.value,
//                       })
//                     }
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <Label>Service Name</Label>
//                   <Input
//                     value={formData.recurringService}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         recurringService: e.target.value,
//                       })
//                     }
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="border rounded-md p-3 space-y-3">
//             <p className="text-sm font-semibold">Renewal Defaults</p>
//             <div className="grid grid-cols-4 gap-4">
//               <div className="space-y-1">
//                 <Label>Status</Label>
//                 <select
//                   className="border rounded px-3 py-2 text-sm w-full"
//                   value={formData.defaultRenewalStatus}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       defaultRenewalStatus:
//                         e.target.value as CustomerFormState["defaultRenewalStatus"],
//                     })
//                   }
//                 >
//                   <option value="active">Active</option>
//                   <option value="expiring">Expiring</option>
//                   <option value="expired">Expired</option>
//                   <option value="renewed">Renewed</option>
//                 </select>
//               </div>
//               <div className="space-y-1">
//                 <Label>Reminder Days</Label>
//                 <Input
//                   type="number"
//                   min="0"
//                   value={formData.defaultRenewalReminderDays}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       defaultRenewalReminderDays: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//               <div className="space-y-1 col-span-2">
//                 <Label>Renewal Notes</Label>
//                 <Input
//                   value={formData.defaultRenewalNotes}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       defaultRenewalNotes: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label>Tags</Label>
//             <div className="flex flex-wrap gap-2 mb-2">
//               {tags.map((tag) => (
//                 <Badge
//                   key={tag}
//                   variant="secondary"
//                   className="flex items-center gap-1"
//                 >
//                   {tag}
//                   <X
//                     className="h-3 w-3 cursor-pointer"
//                     onClick={() =>
//                       setTags(tags.filter((t) => t !== tag))
//                     }
//                   />
//                 </Badge>
//               ))}
//             </div>
//             <div className="flex gap-2">
//               <Input
//                 value={newTag}
//                 onChange={(e) => setNewTag(e.target.value)}
//               />
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={addTagHandler}
//               >
//                 Add
//               </Button>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="notes">Notes</Label>
//             <Textarea
//               id="notes"
//               value={formData.notes}
//               onChange={(e) =>
//                 setFormData({ ...formData, notes: e.target.value })
//               }
//             />
//           </div>

//           {error && (
//             <p className="text-sm text-destructive border border-destructive/30 rounded p-2">
//               {error}
//             </p>
//           )}

//           <DialogFooter>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={isSubmitting}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isSubmitting}>
//               {isSubmitting
//                 ? mode === "add"
//                   ? "Adding..."
//                   : "Updating..."
//                 : mode === "add"
//                 ? "Add Customer"
//                 : "Update Customer"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }
