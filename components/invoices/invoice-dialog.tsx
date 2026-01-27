

// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { useCRM } from "@/contexts/crm-context"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import type { Invoice } from "@/types/crm"

// interface InvoiceDialogProps {
//   invoice: Invoice | null
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

// type InvoiceFormState = {
//   customerId: string
//   customerName: string
//   invoiceNumber: string
//   issueDate: string
//   dueDate: string
//   status: Invoice["status"]
//   subtotal: number
//   gstRate: number
//   notes: string
//   service: string
//   amount: string
// }

// const addMonths = (date: Date, months: number) => {
//   const d = new Date(date)
//   const day = d.getDate()
//   d.setMonth(d.getMonth() + months)
//   if (d.getDate() < day) {
//     d.setDate(0)
//   }
//   return d
// }

// const formatCurrency = (value: number) =>
//   `₹${value.toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`

// export function InvoiceDialog({ invoice, open, onOpenChange }: InvoiceDialogProps) {
//   const { customers, addInvoice, updateInvoice } = useCRM()
//   const [formData, setFormData] = useState<InvoiceFormState>({
//     customerId: "",
//     customerName: "",
//     invoiceNumber: "",
//     issueDate: "",
//     dueDate: "",
//     status: "draft",
//     subtotal: 0,
//     gstRate: 18,
//     notes: "",
//     service: "",
//     amount: "",
//   })
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const recalcSubtotalFromAmount = (amountStr: string) => {
//     const value = Number.parseFloat(amountStr || "0")
//     const safe = Number.isNaN(value) ? 0 : value
//     setFormData((prev) => ({
//       ...prev,
//       subtotal: safe,
//     }))
//   }

//   useEffect(() => {
//     const today = new Date()
//     const defaultDue = addMonths(today, 1)

//     if (invoice) {
//       const issue = invoice.issueDate ? new Date(invoice.issueDate) : today
//       const due = invoice.dueDate ? new Date(invoice.dueDate) : defaultDue

//       const subtotal =
//         typeof invoice.amount === "number"
//           ? invoice.amount
//           : Number(invoice.amount ?? 0) || 0

//       const firstItem = invoice.items && invoice.items[0]
//       const service = firstItem?.description ?? (invoice as any).service ?? ""
//       const amount = firstItem?.amount ?? subtotal

//       setFormData({
//         customerId: invoice.customerId,
//         customerName: invoice.customerName,
//         invoiceNumber: invoice.invoiceNumber,
//         issueDate: issue.toISOString().split("T")[0],
//         dueDate: due.toISOString().split("T")[0],
//         status: invoice.status,
//         subtotal,
//         gstRate: 18,
//         notes: invoice.notes || "",
//         service: service,
//         amount: amount ? String(amount) : "",
//       })
//     } else {
//       const issueStr = today.toISOString().split("T")[0]
//       const dueStr = defaultDue.toISOString().split("T")[0]

//       setFormData({
//         customerId: "",
//         customerName: "",
//         invoiceNumber: `INV-${Date.now()}`,
//         issueDate: issueStr,
//         dueDate: dueStr,
//         status: "draft",
//         subtotal: 0,
//         gstRate: 18,
//         notes: "",
//         service: "",
//         amount: "",
//       })
//     }
//     setError(null)
//   }, [invoice, open])

//   const handleCustomerChange = (customerId: string) => {
//     const customer = customers.find((c) => c.id === customerId)
//     if (!customer) return

//     console.log("Selected customer:", customer)

//     setFormData((prev) => {
//       const issue = prev.issueDate ? new Date(prev.issueDate) : new Date()

//       // Calculate due date from customer's default due days
//       let nextDueDate = prev.dueDate
//       if (customer.defaultDueDays != null && customer.defaultDueDays > 0) {
//         const due = new Date(issue)
//         due.setDate(due.getDate() + customer.defaultDueDays)
//         nextDueDate = due.toISOString().split("T")[0]
//       }

//       // Get customer's default invoice notes
//       const nextNotes = customer.defaultInvoiceNotes || prev.notes

//       // AUTO-POPULATE SERVICE AND PRICING FROM CUSTOMER DATA
//       let serviceName = ""
//       let serviceAmount = 0

//       // Get service name from customer
//       const customerServiceType = (customer as any).serviceType || (customer as any).service
//       if (customerServiceType === "whatsapp_api") {
//         serviceName = "WhatsApp Business API"
//       } else if (customerServiceType === "website_dev") {
//         serviceName = "Website Development"
//       } else if (customerServiceType === "ai_agent") {
//         serviceName = "AI Agent"
//       } else if ((customer as any).service) {
//         serviceName = (customer as any).service
//       }

//       // Calculate total service amount from customer pricing
//       // Check if customer has pricing data stored
//       const oneTime = Number((customer as any).oneTimePrice || 0)
//       const monthly = Number((customer as any).monthlyPrice || 0)
//       const manual = Number((customer as any).manualPrice || 0)
      
//       console.log("Customer pricing - OneTime:", oneTime, "Monthly:", monthly, "Manual:", manual)
      
//       // Total charges = sum of all pricing
//       serviceAmount = oneTime + monthly + manual

//       // If no pricing data from those fields, try totalValue or recurringAmount
//       if (serviceAmount === 0) {
//         if (customer.totalValue) {
//           serviceAmount = Number(customer.totalValue)
//           console.log("Using totalValue:", serviceAmount)
//         } else if (customer.recurringEnabled && customer.recurringAmount) {
//           serviceAmount = Number(customer.recurringAmount)
//           console.log("Using recurringAmount:", serviceAmount)
//         }
//       }

//       console.log("Final service amount:", serviceAmount)

//       // Build service description with breakdown
//       let fullServiceDescription = serviceName
//       if (oneTime > 0 || monthly > 0 || manual > 0) {
//         const breakdown: string[] = []
//         if (oneTime > 0) breakdown.push(`One-time: ₹${oneTime}`)
//         if (monthly > 0) breakdown.push(`Monthly: ₹${monthly}`)
//         if (manual > 0) breakdown.push(`Manual: ₹${manual}`)
//         if (breakdown.length > 0) {
//           fullServiceDescription += ` (${breakdown.join(", ")})`
//         }
//       }

//       const updated = {
//         ...prev,
//         customerId,
//         customerName: customer.name || "",
//         dueDate: nextDueDate,
//         notes: nextNotes,
//         service: fullServiceDescription || prev.service,
//         amount: serviceAmount > 0 ? String(serviceAmount) : prev.amount,
//         subtotal: serviceAmount > 0 ? serviceAmount : prev.subtotal,
//       }

//       console.log("Updated form data:", updated)
//       return updated
//     })
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     if (!formData.customerId) {
//       setError("Customer is required.")
//       return
//     }

//     if (!formData.invoiceNumber.trim()) {
//       setError("Invoice number is required.")
//       return
//     }

//     if (!formData.issueDate || !formData.dueDate) {
//       setError("Issue date and due date are required.")
//       return
//     }

//     if (!formData.service.trim()) {
//       setError("Service / description is required.")
//       return
//     }

//     const amountNumber = formData.amount ? Number.parseFloat(formData.amount) : 0

//     if (Number.isNaN(amountNumber) || amountNumber <= 0) {
//       setError("Amount must be a positive number.")
//       return
//     }

//     const issueDateISO = new Date(formData.issueDate).toISOString()
//     const dueDateISO = new Date(formData.dueDate).toISOString()

//     const subtotal = amountNumber
//     const gstRate = formData.gstRate ?? 18
//     const gstAmount = (subtotal * gstRate) / 100
//     const totalWithGst = subtotal + gstAmount

//     const item = {
//       description: formData.service.trim(),
//       quantity: 1,
//       rate: subtotal,
//       amount: subtotal,
//     }

//     const apiPayload = {
//       customerId: formData.customerId,
//       amount: subtotal,
//       tax: gstRate,
//       total: totalWithGst,
//       status: formData.status,
//       issueDate: issueDateISO,
//       dueDate: dueDateISO,
//       items: [item],
//       notes: formData.notes.trim(),
//       gstAmount,
//     }

//     const invoiceData: Omit<Invoice, "id"> = {
//       customerId: formData.customerId,
//       customerName: formData.customerName,
//       invoiceNumber: formData.invoiceNumber.trim(),
//       issueDate: issueDateISO,
//       dueDate: dueDateISO,
//       status: formData.status,
//       amount: subtotal,
//       tax: gstRate,
//       discount: 0,
//       notes: formData.notes.trim(),
//       items: [item],
//     }

//     setIsSubmitting(true)
//     try {
//       if (invoice) {
//         await updateInvoice(invoice.id, invoiceData as any, apiPayload as any)
//       } else {
//         await addInvoice(invoiceData as any, apiPayload as any)
//       }
//       onOpenChange(false)
//     } catch (err: any) {
//       setError(err?.message || "Failed to save invoice")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const gstAmount = (formData.subtotal * (formData.gstRate ?? 18)) / 100
//   const totalWithGst = formData.subtotal + gstAmount

//   const selectedCustomer = formData.customerId
//     ? customers.find((c) => c.id === formData.customerId)
//     : null

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {invoice ? "Edit Invoice" : "Create New Invoice"}
//           </DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="customer">Customer *</Label>
//               <Select
//                 value={formData.customerId}
//                 onValueChange={handleCustomerChange}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select customer" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {customers.map((customer) => (
//                     <SelectItem key={customer.id} value={customer.id}>
//                       {customer.name} {customer.company ? `(${customer.company})` : ""}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="invoiceNumber">Invoice Number *</Label>
//               <Input
//                 id="invoiceNumber"
//                 value={formData.invoiceNumber}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     invoiceNumber: e.target.value,
//                   }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="issueDate">Issue Date *</Label>
//               <Input
//                 id="issueDate"
//                 type="date"
//                 value={formData.issueDate}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, issueDate: e.target.value }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="dueDate">Due Date *</Label>
//               <Input
//                 id="dueDate"
//                 type="date"
//                 value={formData.dueDate}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="status">Status</Label>
//               <Select
//                 value={formData.status}
//                 onValueChange={(value: Invoice["status"]) =>
//                   setFormData((prev) => ({ ...prev, status: value }))
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="draft">Draft</SelectItem>
//                   <SelectItem value="sent">Sent</SelectItem>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="paid">Paid</SelectItem>
//                   <SelectItem value="overdue">Overdue</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Customer Info Display */}
//             {selectedCustomer && (
//               <div className="md:col-span-2 text-sm border rounded-md p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
//                 <h4 className="font-semibold mb-2 text-indigo-900">Customer Details</h4>
//                 <div className="grid grid-cols-2 gap-3 text-xs">
//                   <div>
//                     <span className="font-medium text-gray-600">Name:</span>{" "}
//                     <span className="text-gray-900">{selectedCustomer.name}</span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Email:</span>{" "}
//                     <span className="text-gray-900">{selectedCustomer.email}</span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Phone:</span>{" "}
//                     <span className="text-gray-900">{selectedCustomer.phone}</span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Company:</span>{" "}
//                     <span className="text-gray-900">{selectedCustomer.company || "—"}</span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Service:</span>{" "}
//                     <span className="text-gray-900">
//                       {(selectedCustomer as any).serviceType === "whatsapp_api" 
//                         ? "WhatsApp Business API"
//                         : (selectedCustomer as any).serviceType === "website_dev"
//                         ? "Website Development"
//                         : (selectedCustomer as any).serviceType === "ai_agent"
//                         ? "AI Agent"
//                         : (selectedCustomer as any).service || "—"}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Total Value:</span>{" "}
//                     <span className="text-gray-900 font-semibold">
//                       ₹{Number(selectedCustomer.totalValue || 0).toLocaleString("en-IN")}
//                     </span>
//                   </div>
//                 </div>
                
//                 {/* DEBUG: Show pricing breakdown */}
//                 <div className="mt-3 pt-3 border-t border-indigo-200">
//                   <p className="text-xs font-semibold text-indigo-700 mb-1">Pricing Breakdown:</p>
//                   <div className="grid grid-cols-3 gap-2 text-xs">
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">One-time:</span>{" "}
//                       <span className="font-semibold">₹{(selectedCustomer as any).oneTimePrice || 0}</span>
//                     </div>
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">Monthly:</span>{" "}
//                       <span className="font-semibold">₹{(selectedCustomer as any).monthlyPrice || 0}</span>
//                     </div>
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">Manual:</span>{" "}
//                       <span className="font-semibold">₹{(selectedCustomer as any).manualPrice || 0}</span>
//                     </div>
//                   </div>
//                   {/* <p className="text-xs text-gray-500 mt-2">
//                     If all show ₹0, the customer pricing data is not stored in the database.
//                   </p> */}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Service Details */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Service Details</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="service">Service / Description *</Label>
//                 <Input
//                   id="service"
//                   value={formData.service}
//                   onChange={(e) =>
//                     setFormData((prev) => ({ ...prev, service: e.target.value }))
//                   }
//                   placeholder="Service description (auto-filled from customer)"
//                   required
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   This field is automatically populated from the customer's service selection
//                 </p>
//               </div>
//               <div className="space-y-2 max-w-xs">
//                 <Label htmlFor="planAmount">Total Charges (₹) *</Label>
//                 <Input
//                   id="planAmount"
//                   type="number"
//                   step="0.01"
//                   value={formData.amount}
//                   onChange={(e) => {
//                     const value = e.target.value
//                     setFormData((prev) => ({ ...prev, amount: value }))
//                     recalcSubtotalFromAmount(value)
//                   }}
//                   placeholder="0.00"
//                   required
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   Auto-filled from customer's pricing (One-time + Monthly + Manual)
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Invoice Summary with GST */}
//           <Card className="border-2 border-indigo-200">
//             <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
//               <CardTitle className="text-indigo-900">Invoice Summary</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3 pt-6">
//               <div className="flex justify-between text-base">
//                 <span className="font-medium">Total amount (before GST):</span>
//                 <span className="font-semibold">{formatCurrency(formData.subtotal)}</span>
//               </div>
//               <div className="flex justify-between text-base text-orange-700">
//                 <span className="font-medium">
//                   GST: {formData.gstRate}% (on total amount)
//                 </span>
//                 <span className="font-semibold">{formatCurrency(gstAmount)}</span>
//               </div>
//               <div className="border-t-2 border-indigo-200 pt-3 mt-2"></div>
//               <div className="flex justify-between text-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4">
//                 <span className="font-bold">
//                   Total Payable Amount (with GST):
//                 </span>
//                 <span className="font-bold text-xl">
//                   {formatCurrency(totalWithGst)}
//                 </span>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Notes */}
//           <div className="space-y-2">
//             <Label htmlFor="notes">Additional Notes</Label>
//             <Textarea
//               id="notes"
//               value={formData.notes}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, notes: e.target.value }))
//               }
//               placeholder="Additional notes (auto-filled from customer defaults)..."
//               rows={3}
//             />
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded p-3">
//               <p className="text-sm text-red-600" role="alert">
//                 {error}
//               </p>
//             </div>
//           )}

//           <div className="flex justify-end space-x-2 pt-4">
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
//                 ? "Saving..." 
//                 : invoice 
//                 ? "Update Invoice" 
//                 : "Create Invoice"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

//testing
//15-01-2026



// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { useCRM } from "@/contexts/crm-context"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import type { Invoice } from "@/types/crm"

// interface InvoiceDialogProps {
//   invoice: Invoice | null
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

// type LineItemForm = {
//   description: string
//   quantity: number
//   rate: number
//   amount: number
// }

// type InvoiceFormState = {
//   customerId: string
//   customerName: string
//   invoiceNumber: string
//   issueDate: string
//   dueDate: string
//   status: Invoice["status"]
//   subtotal: number
//   gstRate: number
//   notes: string
//   service: string
//   amount: string
//   items: LineItemForm[]
// }

// const addMonths = (date: Date, months: number) => {
//   const d = new Date(date)
//   const day = d.getDate()
//   d.setMonth(d.getMonth() + months)
//   if (d.getDate() < day) {
//     d.setDate(0)
//   }
//   return d
// }

// const formatCurrency = (value: number) =>
//   `₹${value.toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`

// export function InvoiceDialog({ invoice, open, onOpenChange }: InvoiceDialogProps) {
//   const { customers, addInvoice, updateInvoice } = useCRM()
//   const [formData, setFormData] = useState<InvoiceFormState>({
//     customerId: "",
//     customerName: "",
//     invoiceNumber: "",
//     issueDate: "",
//     dueDate: "",
//     status: "draft",
//     subtotal: 0,
//     gstRate: 18,
//     notes: "",
//     service: "",
//     amount: "",
//     items: [],
//   })
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const recalcSubtotalFromAmount = (amountStr: string) => {
//     const value = Number.parseFloat(amountStr || "0")
//     const safe = Number.isNaN(value) ? 0 : value
//     setFormData((prev) => ({
//       ...prev,
//       subtotal: safe,
//       // keep items in sync to a single-line invoice when user edits total directly
//       items:
//         safe > 0
//           ? [
//               {
//                 description: prev.service || "Service",
//                 quantity: 1,
//                 rate: safe,
//                 amount: safe,
//               },
//             ]
//           : prev.items,
//     }))
//   }

//   const recalcSubtotalFromItems = (items: LineItemForm[]) => {
//     const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
//     setFormData((prev) => ({
//       ...prev,
//       items,
//       subtotal,
//       amount: subtotal ? String(subtotal) : prev.amount,
//     }))
//   }

//   const handleAddItem = () => {
//     const nextItems = [
//       ...formData.items,
//       { description: "", quantity: 1, rate: 0, amount: 0 },
//     ]
//     recalcSubtotalFromItems(nextItems)
//   }

//   const handleItemChange = (
//     index: number,
//     field: keyof LineItemForm,
//     value: string,
//   ) => {
//     const nextItems = formData.items.map((item, i) => {
//       if (i !== index) return item
//       const updated: LineItemForm = { ...item }
//       if (field === "description") {
//         updated.description = value
//       } else if (field === "quantity") {
//         const qty = Number(value || 0)
//         updated.quantity = qty
//         updated.amount = qty * updated.rate
//       } else if (field === "rate") {
//         const rate = Number(value || 0)
//         updated.rate = rate
//         updated.amount = updated.quantity * rate
//       } else if (field === "amount") {
//         const amt = Number(value || 0)
//         updated.amount = amt
//       }
//       return updated
//     })
//     recalcSubtotalFromItems(nextItems)
//   }

//   useEffect(() => {
//     const today = new Date()
//     const defaultDue = addMonths(today, 1)

//     if (invoice) {
//       const issue = invoice.issueDate ? new Date(invoice.issueDate) : today
//       const due = invoice.dueDate ? new Date(invoice.dueDate) : defaultDue

//       const subtotal =
//         typeof invoice.amount === "number"
//           ? invoice.amount
//           : Number(invoice.amount ?? 0) || 0

//       const firstItem = invoice.items && invoice.items[0]
//       const service = firstItem?.description ?? (invoice as any).service ?? ""
//       const amount = firstItem?.amount ?? subtotal

//       const items: LineItemForm[] =
//         invoice.items && invoice.items.length > 0
//           ? invoice.items.map((it) => ({
//               description: it.description,
//               quantity: it.quantity ?? 1,
//               rate:
//                 typeof it.rate === "number"
//                   ? it.rate
//                   : Number(it.rate ?? 0) || 0,
//               amount:
//                 typeof it.amount === "number"
//                   ? it.amount
//                   : Number(it.amount ?? 0) || 0,
//             }))
//           : service || amount
//           ? [
//               {
//                 description: service || "Service",
//                 quantity: 1,
//                 rate: typeof amount === "number" ? amount : Number(amount) || 0,
//                 amount:
//                   typeof amount === "number" ? amount : Number(amount) || 0,
//               },
//             ]
//           : []

//       const subtotalFromItems =
//         items.length > 0
//           ? items.reduce((sum, it) => sum + (it.amount || 0), 0)
//           : subtotal

//       setFormData({
//         customerId: invoice.customerId,
//         customerName: invoice.customerName,
//         invoiceNumber: invoice.invoiceNumber,
//         issueDate: issue.toISOString().split("T")[0],
//         dueDate: due.toISOString().split("T")[0],
//         status: invoice.status,
//         subtotal: subtotalFromItems,
//         gstRate: 18,
//         notes: invoice.notes || "",
//         service: service,
//         amount: amount ? String(amount) : "",
//         items,
//       })
//     } else {
//       const issueStr = today.toISOString().split("T")[0]
//       const dueStr = defaultDue.toISOString().split("T")[0]

//       setFormData({
//         customerId: "",
//         customerName: "",
//         invoiceNumber: `INV-${Date.now()}`,
//         issueDate: issueStr,
//         dueDate: dueStr,
//         status: "draft",
//         subtotal: 0,
//         gstRate: 18,
//         notes: "",
//         service: "",
//         amount: "",
//         items: [],
//       })
//     }
//     setError(null)
//   }, [invoice, open])

//   const handleCustomerChange = (customerId: string) => {
//     const customer = customers.find((c) => c.id === customerId)
//     if (!customer) return

//     setFormData((prev) => {
//       const issue = prev.issueDate ? new Date(prev.issueDate) : new Date()

//       let nextDueDate = prev.dueDate
//       if (customer.defaultDueDays != null && customer.defaultDueDays > 0) {
//         const due = new Date(issue)
//         due.setDate(due.getDate() + customer.defaultDueDays)
//         nextDueDate = due.toISOString().split("T")[0]
//       }

//       const nextNotes = customer.defaultInvoiceNotes || prev.notes

//       let serviceName = ""
//       const customerServiceType =
//         (customer as any).serviceType || (customer as any).service
//       if (customerServiceType === "whatsapp_api") {
//         serviceName = "WhatsApp Business API"
//       } else if (customerServiceType === "website_dev") {
//         serviceName = "Website Development"
//       } else if (customerServiceType === "ai_agent") {
//         serviceName = "AI Agent"
//       } else if ((customer as any).service) {
//         serviceName = (customer as any).service
//       }

//       const oneTime = Number((customer as any).oneTimePrice || 0)
//       const monthly = Number((customer as any).monthlyPrice || 0)
//       const manual = Number((customer as any).manualPrice || 0)

//       let serviceAmount = oneTime + monthly + manual

//       if (serviceAmount === 0) {
//         if (customer.totalValue) {
//           serviceAmount = Number(customer.totalValue)
//         } else if (customer.recurringEnabled && customer.recurringAmount) {
//           serviceAmount = Number(customer.recurringAmount)
//         }
//       }

//       let fullServiceDescription = serviceName
//       if (oneTime > 0 || monthly > 0 || manual > 0) {
//         const breakdown: string[] = []
//         if (oneTime > 0) breakdown.push(`One-time: ₹${oneTime}`)
//         if (monthly > 0) breakdown.push(`Monthly: ₹${monthly}`)
//         if (manual > 0) breakdown.push(`Manual: ₹${manual}`)
//         if (breakdown.length > 0) {
//           fullServiceDescription += ` (${breakdown.join(", ")})`
//         }
//       }

//       const updatedItems: LineItemForm[] =
//         serviceAmount > 0 || fullServiceDescription
//           ? [
//               {
//                 description:
//                   fullServiceDescription || prev.service || "Service",
//                 quantity: 1,
//                 rate: serviceAmount || serviceAmount === 0 ? serviceAmount : Number(prev.amount || 0),
//                 amount: serviceAmount || serviceAmount === 0 ? serviceAmount : Number(prev.amount || 0),
//               },
//             ]
//           : prev.items || []

//       const subtotalFromItems = updatedItems.reduce(
//         (sum, it) => sum + (it.amount || 0),
//         0,
//       )

//       const updated = {
//         ...prev,
//         customerId,
//         customerName: customer.name || "",
//         dueDate: nextDueDate,
//         notes: nextNotes,
//         service: fullServiceDescription || prev.service,
//         amount: subtotalFromItems ? String(subtotalFromItems) : prev.amount,
//         subtotal: subtotalFromItems || prev.subtotal,
//         items: updatedItems,
//       }

//       return updated
//     })
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     if (!formData.customerId) {
//       setError("Customer is required.")
//       return
//     }

//     if (!formData.invoiceNumber.trim()) {
//       setError("Invoice number is required.")
//       return
//     }

//     if (!formData.issueDate || !formData.dueDate) {
//       setError("Issue date and due date are required.")
//       return
//     }

//     if (formData.items.length === 0 && !formData.service.trim()) {
//       setError("At least one service / description is required.")
//       return
//     }

//     const amountNumber = formData.subtotal || (formData.amount ? Number.parseFloat(formData.amount) : 0)

//     if (Number.isNaN(amountNumber) || amountNumber <= 0) {
//       setError("Amount must be a positive number.")
//       return
//     }

//     const issueDateISO = new Date(formData.issueDate).toISOString()
//     const dueDateISO = new Date(formData.dueDate).toISOString()

//     const subtotal = amountNumber
//     const gstRate = formData.gstRate ?? 18
//     const gstAmount = (subtotal * gstRate) / 100
//     const totalWithGst = subtotal + gstAmount

//     const itemsPayload =
//       formData.items.length > 0
//         ? formData.items.map((it) => ({
//             description: it.description.trim() || "Service",
//             quantity: it.quantity || 1,
//             rate: it.rate,
//             amount: it.amount,
//           }))
//         : [
//             {
//               description: formData.service.trim(),
//               quantity: 1,
//               rate: subtotal,
//               amount: subtotal,
//             },
//           ]

//     const apiPayload = {
//       customerId: formData.customerId,
//       amount: subtotal,
//       tax: gstRate,
//       total: totalWithGst,
//       status: formData.status,
//       issueDate: issueDateISO,
//       dueDate: dueDateISO,
//       items: itemsPayload,
//       notes: formData.notes.trim(),
//       gstAmount,
//     }

//     const invoiceData: Omit<Invoice, "id"> = {
//       customerId: formData.customerId,
//       customerName: formData.customerName,
//       invoiceNumber: formData.invoiceNumber.trim(),
//       issueDate: issueDateISO,
//       dueDate: dueDateISO,
//       status: formData.status,
//       amount: subtotal,
//       tax: gstRate,
//       discount: 0,
//       notes: formData.notes.trim(),
//       items: itemsPayload,
//     }

//     setIsSubmitting(true)
//     try {
//       if (invoice) {
//         await updateInvoice(invoice.id, invoiceData as any, apiPayload as any)
//       } else {
//         await addInvoice(invoiceData as any, apiPayload as any)
//       }
//       onOpenChange(false)
//     } catch (err: any) {
//       setError(err?.message || "Failed to save invoice")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const gstAmount = (formData.subtotal * (formData.gstRate ?? 18)) / 100
//   const totalWithGst = formData.subtotal + gstAmount

//   const selectedCustomer = formData.customerId
//     ? customers.find((c) => c.id === formData.customerId)
//     : null

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {invoice ? "Edit Invoice" : "Create New Invoice"}
//           </DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="customer">Customer *</Label>
//               <Select
//                 value={formData.customerId}
//                 onValueChange={handleCustomerChange}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select customer" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {customers.map((customer) => (
//                     <SelectItem key={customer.id} value={customer.id}>
//                       {customer.name}{" "}
//                       {customer.company ? `(${customer.company})` : ""}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="invoiceNumber">Invoice Number *</Label>
//               <Input
//                 id="invoiceNumber"
//                 value={formData.invoiceNumber}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     invoiceNumber: e.target.value,
//                   }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="issueDate">Issue Date *</Label>
//               <Input
//                 id="issueDate"
//                 type="date"
//                 value={formData.issueDate}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     issueDate: e.target.value,
//                   }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="dueDate">Due Date *</Label>
//               <Input
//                 id="dueDate"
//                 type="date"
//                 value={formData.dueDate}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="status">Status</Label>
//               <Select
//                 value={formData.status}
//                 onValueChange={(value: Invoice["status"]) =>
//                   setFormData((prev) => ({ ...prev, status: value }))
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="draft">Draft</SelectItem>
//                   <SelectItem value="sent">Sent</SelectItem>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="paid">Paid</SelectItem>
//                   <SelectItem value="overdue">Overdue</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Customer Info Display */}
//             {selectedCustomer && (
//               <div className="md:col-span-2 text-sm border rounded-md p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
//                 <h4 className="font-semibold mb-2 text-indigo-900">
//                   Customer Details
//                 </h4>
//                 <div className="grid grid-cols-2 gap-3 text-xs">
//                   <div>
//                     <span className="font-medium text-gray-600">Name:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.name}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Email:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.email}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Phone:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.phone}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Company:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.company || "—"}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Service:</span>{" "}
//                     <span className="text-gray-900">
//                       {(selectedCustomer as any).serviceType ===
//                       "whatsapp_api"
//                         ? "WhatsApp Business API"
//                         : (selectedCustomer as any).serviceType ===
//                           "website_dev"
//                         ? "Website Development"
//                         : (selectedCustomer as any).serviceType === "ai_agent"
//                         ? "AI Agent"
//                         : (selectedCustomer as any).service || "—"}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">
//                       Total Value:
//                     </span>{" "}
//                     <span className="text-gray-900 font-semibold">
//                       ₹
//                       {Number(
//                         selectedCustomer.totalValue || 0,
//                       ).toLocaleString("en-IN")}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mt-3 pt-3 border-t border-indigo-200">
//                   <p className="text-xs font-semibold text-indigo-700 mb-1">
//                     Pricing Breakdown:
//                   </p>
//                   <div className="grid grid-cols-3 gap-2 text-xs">
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">One-time:</span>{" "}
//                       <span className="font-semibold">
//                         ₹{(selectedCustomer as any).oneTimePrice || 0}
//                       </span>
//                     </div>
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">Monthly:</span>{" "}
//                       <span className="font-semibold">
//                         ₹{(selectedCustomer as any).monthlyPrice || 0}
//                       </span>
//                     </div>
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">Manual:</span>{" "}
//                       <span className="font-semibold">
//                         ₹{(selectedCustomer as any).manualPrice || 0}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Service Details */}
//           <Card>
//             <CardHeader className="flex items-center justify-between">
//               <CardTitle>Service Details</CardTitle>
//               <Button
//                 type="button"
//                 size="sm"
//                 variant="outline"
//                 onClick={handleAddItem}
//               >
//                 + Add service
//               </Button>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {formData.items.map((item, index) => (
//                 <div
//                   key={index}
//                   className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border rounded-md p-3"
//                 >
//                   <div className="md:col-span-2 space-y-1">
//                     <Label>Service / Description *</Label>
//                     <Input
//                       value={item.description}
//                       onChange={(e) =>
//                         handleItemChange(index, "description", e.target.value)
//                       }
//                       placeholder="Service description"
//                     />
//                   </div>
//                   <div className="space-y-1">
//                     <Label>Quantity</Label>
//                     <Input
//                       type="number"
//                       min={1}
//                       value={item.quantity}
//                       onChange={(e) =>
//                         handleItemChange(index, "quantity", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div className="space-y-1">
//                     <Label>Rate (₹)</Label>
//                     <Input
//                       type="number"
//                       step="0.01"
//                       value={item.rate}
//                       onChange={(e) =>
//                         handleItemChange(index, "rate", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div className="space-y-1 md:col-span-4 flex justify-between text-sm font-medium">
//                     <span>Line total:</span>
//                     <span>{formatCurrency(item.amount || 0)}</span>
//                   </div>
//                 </div>
//               ))}

//               <div className="space-y-2 max-w-xs">
//                 <Label htmlFor="planAmount">Total Charges (₹) *</Label>
//                 <Input
//                   id="planAmount"
//                   type="number"
//                   step="0.01"
//                   value={formData.amount}
//                   onChange={(e) => {
//                     const value = e.target.value
//                     setFormData((prev) => ({ ...prev, amount: value }))
//                     recalcSubtotalFromAmount(value)
//                   }}
//                   placeholder="0.00"
//                   required
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   Auto-filled from customer's pricing (One-time + Monthly +
//                   Manual) or override manually.
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Invoice Summary with GST */}
//           <Card className="border-2 border-indigo-200">
//             <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
//               <CardTitle className="text-indigo-900">
//                 Invoice Summary
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3 pt-6">
//               <div className="flex justify-between text-base">
//                 <span className="font-medium">
//                   Total amount (before GST):
//                 </span>
//                 <span className="font-semibold">
//                   {formatCurrency(formData.subtotal)}
//                 </span>
//               </div>
//               <div className="flex justify-between text-base text-orange-700">
//                 <span className="font-medium">
//                   GST: {formData.gstRate}% (on total amount)
//                 </span>
//                 <span className="font-semibold">
//                   {formatCurrency(gstAmount)}
//                 </span>
//               </div>
//               <div className="border-t-2 border-indigo-200 pt-3 mt-2" />
//               <div className="flex justify-between text-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4">
//                 <span className="font-bold">
//                   Total Payable Amount (with GST):
//                 </span>
//                 <span className="font-bold text-xl">
//                   {formatCurrency(totalWithGst)}
//                 </span>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Notes */}
//           <div className="space-y-2">
//             <Label htmlFor="notes">Additional Notes</Label>
//             <Textarea
//               id="notes"
//               value={formData.notes}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, notes: e.target.value }))
//               }
//               placeholder="Additional notes (auto-filled from customer defaults)..."
//               rows={3}
//             />
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded p-3">
//               <p className="text-sm text-red-600" role="alert">
//                 {error}
//               </p>
//             </div>
//           )}

//           <div className="flex justify-end space-x-2 pt-4">
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
//                 ? "Saving..."
//                 : invoice
//                 ? "Update Invoice"
//                 : "Create Invoice"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

//testing 3 


// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { useCRM } from "@/contexts/crm-context"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import type { Invoice } from "@/types/crm"

// interface InvoiceDialogProps {
//   invoice: Invoice | null
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

// type LineItemForm = {
//   description: string
//   quantity: number
//   rate: number
//   amount: number
//   // new: fare breakdown for this item
//   breakdown?: { label: string; amount: number }[]
// }

// type InvoiceFormState = {
//   customerId: string
//   customerName: string
//   invoiceNumber: string
//   issueDate: string
//   dueDate: string
//   status: Invoice["status"]
//   subtotal: number
//   gstRate: number
//   notes: string
//   service: string
//   amount: string
//   items: LineItemForm[]
// }

// const addMonths = (date: Date, months: number) => {
//   const d = new Date(date)
//   const day = d.getDate()
//   d.setMonth(d.getMonth() + months)
//   if (d.getDate() < day) {
//     d.setDate(0)
//   }
//   return d
// }

// const formatCurrency = (value: number) =>
//   `₹${value.toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`

// export function InvoiceDialog({ invoice, open, onOpenChange }: InvoiceDialogProps) {
//   const { customers, addInvoice, updateInvoice } = useCRM()
//   const [formData, setFormData] = useState<InvoiceFormState>({
//     customerId: "",
//     customerName: "",
//     invoiceNumber: "",
//     issueDate: "",
//     dueDate: "",
//     status: "draft",
//     subtotal: 0,
//     gstRate: 18,
//     notes: "",
//     service: "",
//     amount: "",
//     items: [],
//   })
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const recalcSubtotalFromAmount = (amountStr: string) => {
//     const value = Number.parseFloat(amountStr || "0")
//     const safe = Number.isNaN(value) ? 0 : value
//     setFormData((prev) => ({
//       ...prev,
//       subtotal: safe,
//       // keep items in sync to a single-line invoice when user edits total directly
//       items:
//         safe > 0
//           ? [
//               {
//                 description: prev.service || "Service",
//                 quantity: 1,
//                 rate: safe,
//                 amount: safe,
//                 breakdown: prev.items[0]?.breakdown,
//               },
//             ]
//           : prev.items,
//     }))
//   }

//   const recalcSubtotalFromItems = (items: LineItemForm[]) => {
//     const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
//     setFormData((prev) => ({
//       ...prev,
//       items,
//       subtotal,
//       amount: subtotal ? String(subtotal) : prev.amount,
//     }))
//   }

//   const handleAddItem = () => {
//     const nextItems: LineItemForm[] = [
//       ...formData.items,
//       { description: "", quantity: 1, rate: 0, amount: 0, breakdown: [] },
//     ]
//     recalcSubtotalFromItems(nextItems)
//   }

//   const handleItemChange = (
//     index: number,
//     field: keyof LineItemForm,
//     value: string,
//   ) => {
//     const nextItems = formData.items.map((item, i) => {
//       if (i !== index) return item
//       const updated: LineItemForm = { ...item }
//       if (field === "description") {
//         updated.description = value
//       } else if (field === "quantity") {
//         const qty = Number(value || 0)
//         updated.quantity = qty
//         updated.amount = qty * updated.rate
//       } else if (field === "rate") {
//         const rate = Number(value || 0)
//         updated.rate = rate
//         updated.amount = updated.quantity * rate
//       } else if (field === "amount") {
//         const amt = Number(value || 0)
//         updated.amount = amt
//       }
//       return updated
//     })
//     recalcSubtotalFromItems(nextItems)
//   }

//   useEffect(() => {
//     const today = new Date()
//     const defaultDue = addMonths(today, 1)

//     if (invoice) {
//       const issue = invoice.issueDate ? new Date(invoice.issueDate) : today
//       const due = invoice.dueDate ? new Date(invoice.dueDate) : defaultDue

//       const subtotal =
//         typeof invoice.amount === "number"
//           ? invoice.amount
//           : Number(invoice.amount ?? 0) || 0

//       const firstItem = invoice.items && invoice.items[0]
//       const service = firstItem?.description ?? (invoice as any).service ?? ""
//       const amount = firstItem?.amount ?? subtotal

//       const items: LineItemForm[] =
//         invoice.items && invoice.items.length > 0
//           ? invoice.items.map((it: any) => {
//               let parsedBreakdown: { label: string; amount: number }[] | undefined
//               if (it.breakdown) {
//                 try {
//                   parsedBreakdown =
//                     typeof it.breakdown === "string"
//                       ? JSON.parse(it.breakdown)
//                       : it.breakdown
//                 } catch {
//                   parsedBreakdown = undefined
//                 }
//               }
//               return {
//                 description: it.description,
//                 quantity: it.quantity ?? 1,
//                 rate:
//                   typeof it.rate === "number"
//                     ? it.rate
//                     : Number(it.rate ?? 0) || 0,
//                 amount:
//                   typeof it.amount === "number"
//                     ? it.amount
//                     : Number(it.amount ?? 0) || 0,
//                 breakdown: parsedBreakdown,
//               }
//             })
//           : service || amount
//           ? [
//               {
//                 description: service || "Service",
//                 quantity: 1,
//                 rate:
//                   typeof amount === "number" ? amount : Number(amount) || 0,
//                 amount:
//                   typeof amount === "number" ? amount : Number(amount) || 0,
//                 breakdown: [],
//               },
//             ]
//           : []

//       const subtotalFromItems =
//         items.length > 0
//           ? items.reduce((sum, it) => sum + (it.amount || 0), 0)
//           : subtotal

//       setFormData({
//         customerId: invoice.customerId,
//         customerName: invoice.customerName,
//         invoiceNumber: invoice.invoiceNumber,
//         issueDate: issue.toISOString().split("T")[0],
//         dueDate: due.toISOString().split("T")[0],
//         status: invoice.status,
//         subtotal: subtotalFromItems,
//         gstRate: 18,
//         notes: invoice.notes || "",
//         service: service,
//         amount: amount ? String(amount) : "",
//         items,
//       })
//     } else {
//       const issueStr = today.toISOString().split("T")[0]
//       const dueStr = defaultDue.toISOString().split("T")[0]

//       setFormData({
//         customerId: "",
//         customerName: "",
//         invoiceNumber: `INV-${Date.now()}`,
//         issueDate: issueStr,
//         dueDate: dueStr,
//         status: "draft",
//         subtotal: 0,
//         gstRate: 18,
//         notes: "",
//         service: "",
//         amount: "",
//         items: [],
//       })
//     }
//     setError(null)
//   }, [invoice, open])

 
//   const handleCustomerChange = (customerId: string) => {
//   const customer = customers.find((c) => c.id === customerId)
//   if (!customer) return

//   setFormData((prev) => {
//     const issue = prev.issueDate ? new Date(prev.issueDate) : new Date()

//     let nextDueDate = prev.dueDate
//     if (customer.defaultDueDays != null && customer.defaultDueDays > 0) {
//       const due = new Date(issue)
//       due.setDate(due.getDate() + customer.defaultDueDays)
//       nextDueDate = due.toISOString().split("T")[0]
//     }

//     const nextNotes = customer.defaultInvoiceNotes || prev.notes

//     // Base service name
//     let serviceName = ""
//     const customerServiceType =
//       (customer as any).serviceType || (customer as any).service
//     if (customerServiceType === "whatsapp_api") {
//       serviceName = "WhatsApp Business API"
//     } else if (customerServiceType === "website_dev") {
//       serviceName = "Website Development"
//     } else if (customerServiceType === "ai_agent") {
//       serviceName = "AI Agent"
//     } else if ((customer as any).service) {
//       serviceName = (customer as any).service
//     }

//     const oneTime = Number((customer as any).oneTimePrice || 0)
//     const monthly = Number((customer as any).monthlyPrice || 0)
//     const manual = Number((customer as any).manualPrice || 0)

//     let serviceAmount = oneTime + monthly + manual

//     if (serviceAmount === 0) {
//       if (customer.totalValue) {
//         serviceAmount = Number(customer.totalValue)
//       } else if (customer.recurringEnabled && customer.recurringAmount) {
//         serviceAmount = Number(customer.recurringAmount)
//       }
//     }

//     // --- SERVICE-SPECIFIC BREAKDOWN MAPPING ---

//     type BreakdownItem = { label: string; amount: number }
//     const breakdown: BreakdownItem[] = []

//     if (customerServiceType === "whatsapp_api") {
//       // Map existing buckets into WhatsApp-specific categories
//       if (oneTime > 0) breakdown.push({ label: "Onboarding", amount: oneTime })
//       if (monthly > 0) breakdown.push({ label: "Recharge", amount: monthly })
//       if (manual > 0) breakdown.push({ label: "Maintenance", amount: manual })
//     } else if (customerServiceType === "website_dev") {
//       // Website-specific breakdown
//       if (oneTime > 0) breakdown.push({ label: "Development", amount: oneTime })
//       if (monthly > 0) breakdown.push({ label: "Hosting", amount: monthly })
//       if (manual > 0) breakdown.push({ label: "Maintenance", amount: manual })
//     } else if (customerServiceType === "ai_agent") {
//       // AI-agent specific breakdown
//       if (oneTime > 0) breakdown.push({ label: "Development", amount: oneTime })
//       if (monthly > 0) breakdown.push({ label: "Hosting", amount: monthly })
//       if (manual > 0) breakdown.push({ label: "Maintenance", amount: manual })
//     } else {
//       // Generic fallback: keep old labels
//       if (oneTime > 0) breakdown.push({ label: "One-time", amount: oneTime })
//       if (monthly > 0) breakdown.push({ label: "Monthly", amount: monthly })
//       if (manual > 0) breakdown.push({ label: "Manual", amount: manual })
//     }

//     let fullServiceDescription = serviceName
//     if (breakdown.length > 0) {
//       const readable = breakdown
//         .map((b) => `${b.label}: ₹${b.amount}`)
//         .join(", ")
//       fullServiceDescription = `${serviceName} (${readable})`
//     }

//     const mainAmount =
//       serviceAmount || serviceAmount === 0
//         ? serviceAmount
//         : Number(prev.amount || 0)

//     const updatedItems: LineItemForm[] =
//       mainAmount > 0 || fullServiceDescription
//         ? [
//             {
//               description: fullServiceDescription || prev.service || "Service",
//               quantity: 1,
//               rate: mainAmount,
//               amount: mainAmount,
//               breakdown: breakdown.length > 0 ? breakdown : undefined,
//             },
//           ]
//         : prev.items || []

//     const subtotalFromItems = updatedItems.reduce(
//       (sum, it) => sum + (it.amount || 0),
//       0,
//     )

//     const updated: InvoiceFormState = {
//       ...prev,
//       customerId,
//       customerName: customer.name || "",
//       dueDate: nextDueDate,
//       notes: nextNotes,
//       service: fullServiceDescription || prev.service,
//       amount: subtotalFromItems ? String(subtotalFromItems) : prev.amount,
//       subtotal: subtotalFromItems || prev.subtotal,
//       items: updatedItems,
//     }

//     return updated
//   })
// }

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setError(null);

//   if (!formData.customerId) {
//     setError("Customer is required.");
//     return;
//   }

//   if (!formData.invoiceNumber.trim()) {
//     setError("Invoice number is required.");
//     return;
//   }

//   if (!formData.issueDate || !formData.dueDate) {
//     setError("Issue date and due date are required.");
//     return;
//   }

//   if (formData.items.length === 0 && !formData.service.trim()) {
//     setError("At least one service / description is required.");
//     return;
//   }

//   const amountNumber =
//     formData.subtotal ||
//     (formData.amount ? Number.parseFloat(formData.amount) : 0);

//   if (Number.isNaN(amountNumber) || amountNumber <= 0) {
//     setError("Amount must be a positive number.");
//     return;
//   }

//   // use plain YYYY-MM-DD from inputs (compatible with backend DATE + toSqlDate)
//   const issueDateSql = formData.issueDate; // e.g. "2026-01-17"
//   const dueDateSql = formData.dueDate;     // e.g. "2026-02-17"

//   const subtotal = amountNumber;
//   const gstRate = formData.gstRate ?? 18;
//   const gstAmount = (subtotal * gstRate) / 100;
//   const totalWithGst = subtotal + gstAmount;

//   const itemsPayload =
//     formData.items.length > 0
//       ? formData.items.map((it) => ({
//           description: it.description.trim() || "Service",
//           // quantity: it.quantity || 1,
//           rate: it.rate,
//           amount: it.amount,
//           breakdown:
//             it.breakdown && it.breakdown.length > 0 ? it.breakdown : undefined,
//         }))
//       : [
//           {
//             description: formData.service.trim() || "Service",
//             quantity: 1,
//             rate: subtotal,
//             amount: subtotal,
//             breakdown: undefined,
//           },
//         ];

//   const apiPayload = {
//     customerId: formData.customerId,
//     amount: subtotal,
//     tax: gstRate,
//     total: totalWithGst,
//     status: formData.status,
//     issueDate: issueDateSql,
//     dueDate: dueDateSql,
//     items: itemsPayload,
//     notes: formData.notes.trim(),
//     gstAmount,
//   };

//   const invoiceData: Omit<Invoice, "id"> = {
//     customerId: formData.customerId,
//     customerName: formData.customerName,
//     invoiceNumber: formData.invoiceNumber.trim(),
//     issueDate: issueDateSql,
//     dueDate: dueDateSql,
//     status: formData.status,
//     amount: subtotal,
//     tax: gstRate,
//     discount: 0,
//     notes: formData.notes.trim(),
//     items: itemsPayload as any,
//   };

//   setIsSubmitting(true);
//   try {
//     if (invoice) {
//       await updateInvoice(invoice.id, invoiceData as any, apiPayload as any);
//     } else {
//       await addInvoice(invoiceData as any, apiPayload as any);
//     }
//     onOpenChange(false);
//   } catch (err: any) {
//     setError(err?.message || "Failed to save invoice");
//   } finally {
//     setIsSubmitting(false);
//   }
// };


//   const gstAmount = (formData.subtotal * (formData.gstRate ?? 18)) / 100
//   const totalWithGst = formData.subtotal + gstAmount

//   const selectedCustomer = formData.customerId
//     ? customers.find((c) => c.id === formData.customerId)
//     : null

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {invoice ? "Edit Invoice" : "Create New Invoice"}
//           </DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="customer">Customer *</Label>
//               <Select
//                 value={formData.customerId}
//                 onValueChange={handleCustomerChange}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select customer" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {customers.map((customer) => (
//                     <SelectItem key={customer.id} value={customer.id}>
//                       {customer.name}{" "}
//                       {customer.company ? `(${customer.company})` : ""}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="invoiceNumber">Invoice Number *</Label>
//               <Input
//                 id="invoiceNumber"
//                 value={formData.invoiceNumber}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     invoiceNumber: e.target.value,
//                   }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="issueDate">Issue Date *</Label>
//               <Input
//                 id="issueDate"
//                 type="date"
//                 value={formData.issueDate}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     issueDate: e.target.value,
//                   }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="dueDate">Due Date *</Label>
//               <Input
//                 id="dueDate"
//                 type="date"
//                 value={formData.dueDate}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="status">Status</Label>
//             <Select
//   value={formData.status}
//   onValueChange={(value: Invoice["status"]) =>
//     setFormData((prev) => ({ ...prev, status: value }))
//   }
// >
//   <SelectTrigger>
//     <SelectValue />
//   </SelectTrigger>
//   <SelectContent>
//     <SelectItem value="draft">Draft</SelectItem>
//     <SelectItem value="sent">Sent</SelectItem>
//     <SelectItem value="paid">Paid</SelectItem>
//     <SelectItem value="overdue">Overdue</SelectItem>
//     <SelectItem value="cancelled">Cancelled</SelectItem>
//   </SelectContent>
// </Select>

//             </div>

//             {/* Customer Info Display */}
//             {selectedCustomer && (
//               <div className="md:col-span-2 text-sm border rounded-md p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
//                 <h4 className="font-semibold mb-2 text-indigo-900">
//                   Customer Details
//                 </h4>
//                 <div className="grid grid-cols-2 gap-3 text-xs">
//                   <div>
//                     <span className="font-medium text-gray-600">Name:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.name}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Email:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.email}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Phone:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.phone}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Company:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.company || "—"}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Service:</span>{" "}
//                     <span className="text-gray-900">
//                       {(selectedCustomer as any).serviceType ===
//                       "whatsapp_api"
//                         ? "WhatsApp Business API"
//                         : (selectedCustomer as any).serviceType ===
//                           "website_dev"
//                         ? "Website Development"
//                         : (selectedCustomer as any).serviceType === "ai_agent"
//                         ? "AI Agent"
//                         : (selectedCustomer as any).service || "—"}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">
//                       Total Value:
//                     </span>{" "}
//                     <span className="text-gray-900 font-semibold">
//                       ₹
//                       {Number(
//                         selectedCustomer.totalValue || 0,
//                       ).toLocaleString("en-IN")}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mt-3 pt-3 border-t border-indigo-200">
//                   <p className="text-xs font-semibold text-indigo-700 mb-1">
//                     Pricing Breakdown:
//                   </p>
//                   <div className="grid grid-cols-3 gap-2 text-xs">
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">One-time:</span>{" "}
//                       <span className="font-semibold">
//                         ₹{(selectedCustomer as any).oneTimePrice || 0}
//                       </span>
//                     </div>
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">Monthly:</span>{" "}
//                       <span className="font-semibold">
//                         ₹{(selectedCustomer as any).monthlyPrice || 0}
//                       </span>
//                     </div>
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">Manual:</span>{" "}
//                       <span className="font-semibold">
//                         ₹{(selectedCustomer as any).manualPrice || 0}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Service Details */}
//           <Card>
//             <CardHeader className="flex items-center justify-between">
//               <CardTitle>Service Details</CardTitle>
//               <Button
//                 type="button"
//                 size="sm"
//                 variant="outline"
//                 onClick={handleAddItem}
//               >
//                 + Add service
//               </Button>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {formData.items.map((item, index) => (
//                 <div
//                   key={index}
//                   className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border rounded-md p-3"
//                 >
//                   <div className="md:col-span-2 space-y-1">
//                     <Label>Service / Description *</Label>
//                     <Input
//                       value={item.description}
//                       onChange={(e) =>
//                         handleItemChange(index, "description", e.target.value)
//                       }
//                       placeholder="Service description"
//                     />
//                   </div>
//                   {/* <div className="space-y-1">
//                     <Label>Quantity</Label>
//                     <Input
//                       type="number"
//                       min={1}
//                       value={item.quantity}
//                       onChange={(e) =>
//                         handleItemChange(index, "quantity", e.target.value)
//                       }
//                     />
//                   </div> */}
//                   <div className="space-y-1">
//                     <Label>Rate (₹)</Label>
//                     <Input
//                       type="number"
//                       step="0.01"
//                       value={item.rate}
//                       onChange={(e) =>
//                         handleItemChange(index, "rate", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div className="space-y-1 md:col-span-4 flex justify-between text-sm font-medium">
//                     <span>Line total:</span>
//                     <span>{formatCurrency(item.amount || 0)}</span>
//                   </div>
//                 </div>
//               ))}

//               <div className="space-y-2 max-w-xs">
//                 <Label htmlFor="planAmount">Total Charges (₹) *</Label>
//                 <Input
//                   id="planAmount"
//                   type="number"
//                   step="0.01"
//                   value={formData.amount}
//                   onChange={(e) => {
//                     const value = e.target.value
//                     setFormData((prev) => ({ ...prev, amount: value }))
//                     recalcSubtotalFromAmount(value)
//                   }}
//                   placeholder="0.00"
//                   required
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   Auto-filled from customer's pricing (One-time + Monthly +
//                   Manual) or override manually.
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Invoice Summary with GST */}
//           <Card className="border-2 border-indigo-200">
//             <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
//               <CardTitle className="text-indigo-900">
//                 Invoice Summary
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3 pt-6">
//               <div className="flex justify-between text-base">
//                 <span className="font-medium">
//                   Total amount (before GST):
//                 </span>
//                 <span className="font-semibold">
//                   {formatCurrency(formData.subtotal)}
//                 </span>
//               </div>
//               <div className="flex justify-between text-base text-orange-700">
//                 <span className="font-medium">
//                   GST: {formData.gstRate}% (on total amount)
//                 </span>
//                 <span className="font-semibold">
//                   {formatCurrency(gstAmount)}
//                 </span>
//               </div>
//               <div className="border-t-2 border-indigo-200 pt-3 mt-2" />
//               <div className="flex justify-between text-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4">
//                 <span className="font-bold">
//                   Total Payable Amount (with GST):
//                 </span>
//                 <span className="font-bold text-xl">
//                   {formatCurrency(totalWithGst)}
//                 </span>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Notes */}
//           <div className="space-y-2">
//             <Label htmlFor="notes">Additional Notes</Label>
//             <Textarea
//               id="notes"
//               value={formData.notes}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, notes: e.target.value }))
//               }
//               placeholder="Additional notes (auto-filled from customer defaults)..."
//               rows={3}
//             />
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded p-3">
//               <p className="text-sm text-red-600" role="alert">
//                 {error}
//               </p>
//             </div>
//           )}

//           <div className="flex justify-end space-x-2 pt-4">
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
//                 ? "Saving..."
//                 : invoice
//                 ? "Update Invoice"
//                 : "Create Invoice"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

//testing (18-01-2026)


// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { useCRM } from "@/contexts/crm-context"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import type { Invoice } from "@/types/crm"

// interface InvoiceDialogProps {
//   invoice: Invoice | null
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

// type LineItemForm = {
//   description: string
//   quantity: number
//   rate: number
//   amount: number
//   breakdown?: { label: string; amount: number }[]
// }

// type InvoiceFormState = {
//   customerId: string
//   customerName: string
//   invoiceNumber: string
//   issueDate: string
//   dueDate: string
//   status: Invoice["status"]
//   subtotal: number
//   gstRate: number
//   notes: string
//   service: string
//   amount: string
//   items: LineItemForm[]
// }

// const addMonths = (date: Date, months: number) => {
//   const d = new Date(date)
//   const day = d.getDate()
//   d.setMonth(d.getMonth() + months)
//   if (d.getDate() < day) {
//     d.setDate(0)
//   }
//   return d
// }

// const formatCurrency = (value: number) =>
//   `₹${value.toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`

// export function InvoiceDialog({ invoice, open, onOpenChange }: InvoiceDialogProps) {
//   const { customers, addInvoice, updateInvoice } = useCRM()
//   const [formData, setFormData] = useState<InvoiceFormState>({
//     customerId: "",
//     customerName: "",
//     invoiceNumber: "",
//     issueDate: "",
//     dueDate: "",
//     status: "draft",
//     subtotal: 0,
//     gstRate: 18,
//     notes: "",
//     service: "",
//     amount: "",
//     items: [],
//   })
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const recalcSubtotalFromAmount = (amountStr: string) => {
//     const value = Number.parseFloat(amountStr || "0")
//     const safe = Number.isNaN(value) ? 0 : value
//     setFormData((prev) => ({
//       ...prev,
//       subtotal: safe,
//       items:
//         safe > 0
//           ? [
//               {
//                 description: prev.service || "Service",
//                 quantity: 1,
//                 rate: safe,
//                 amount: safe,
//                 breakdown: prev.items[0]?.breakdown,
//               },
//             ]
//           : prev.items,
//     }))
//   }

//   const recalcSubtotalFromItems = (items: LineItemForm[]) => {
//     const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
//     setFormData((prev) => ({
//       ...prev,
//       items,
//       subtotal,
//       amount: subtotal ? String(subtotal) : prev.amount,
//     }))
//   }

//   const handleAddItem = () => {
//     const nextItems: LineItemForm[] = [
//       ...formData.items,
//       { description: "", quantity: 1, rate: 0, amount: 0, breakdown: [] },
//     ]
//     recalcSubtotalFromItems(nextItems)
//   }

//   const handleItemChange = (
//     index: number,
//     field: keyof LineItemForm,
//     value: string,
//   ) => {
//     const nextItems = formData.items.map((item, i) => {
//       if (i !== index) return item
//       const updated: LineItemForm = { ...item }
//       if (field === "description") {
//         updated.description = value
//       } else if (field === "quantity") {
//         const qty = Number(value || 0)
//         updated.quantity = qty
//         updated.amount = qty * updated.rate
//       } else if (field === "rate") {
//         const rate = Number(value || 0)
//         updated.rate = rate
//         updated.amount = updated.quantity * rate
//       } else if (field === "amount") {
//         const amt = Number(value || 0)
//         updated.amount = amt
//       }
//       return updated
//     })
//     recalcSubtotalFromItems(nextItems)
//   }

//   useEffect(() => {
//     const today = new Date()
//     const defaultDue = addMonths(today, 1)

//     if (invoice) {
//       const issue = invoice.issueDate ? new Date(invoice.issueDate) : today
//       const due = invoice.dueDate ? new Date(invoice.dueDate) : defaultDue

//       const subtotal =
//         typeof invoice.amount === "number"
//           ? invoice.amount
//           : Number(invoice.amount ?? 0) || 0

//       const firstItem = invoice.items && invoice.items[0]
//       const service = firstItem?.description ?? (invoice as any).service ?? ""
//       const amount = firstItem?.amount ?? subtotal

//       const items: LineItemForm[] =
//         invoice.items && invoice.items.length > 0
//           ? invoice.items.map((it: any) => {
//               let parsedBreakdown: { label: string; amount: number }[] | undefined
//               if (it.breakdown) {
//                 try {
//                   parsedBreakdown =
//                     typeof it.breakdown === "string"
//                       ? JSON.parse(it.breakdown)
//                       : it.breakdown
//                 } catch {
//                   parsedBreakdown = undefined
//                 }
//               }
//               return {
//                 description: it.description,
//                 quantity: it.quantity ?? 1,
//                 rate:
//                   typeof it.rate === "number"
//                     ? it.rate
//                     : Number(it.rate ?? 0) || 0,
//                 amount:
//                   typeof it.amount === "number"
//                     ? it.amount
//                     : Number(it.amount ?? 0) || 0,
//                 breakdown: parsedBreakdown,
//               }
//             })
//           : service || amount
//           ? [
//               {
//                 description: service || "Service",
//                 quantity: 1,
//                 rate:
//                   typeof amount === "number" ? amount : Number(amount) || 0,
//                 amount:
//                   typeof amount === "number" ? amount : Number(amount) || 0,
//                 breakdown: [],
//               },
//             ]
//           : []

//       const subtotalFromItems =
//         items.length > 0
//           ? items.reduce((sum, it) => sum + (it.amount || 0), 0)
//           : subtotal

//       setFormData({
//         customerId: invoice.customerId,
//         customerName: invoice.customerName,
//         invoiceNumber: invoice.invoiceNumber,
//         issueDate: issue.toISOString().split("T")[0],
//         dueDate: due.toISOString().split("T")[0],
//         status: invoice.status,
//         subtotal: subtotalFromItems,
//         gstRate: 18,
//         notes: invoice.notes || "",
//         service: service,
//         amount: amount ? String(amount) : "",
//         items,
//       })
//     } else {
//       const issueStr = today.toISOString().split("T")[0]
//       const dueStr = defaultDue.toISOString().split("T")[0]

//       setFormData({
//         customerId: "",
//         customerName: "",
//         invoiceNumber: `INV-${Date.now()}`,
//         issueDate: issueStr,
//         dueDate: dueStr,
//         status: "draft",
//         subtotal: 0,
//         gstRate: 18,
//         notes: "",
//         service: "",
//         amount: "",
//         items: [],
//       })
//     }
//     setError(null)
//   }, [invoice, open])

//   const handleCustomerChange = (customerId: string) => {
//     const customer = customers.find((c) => c.id === customerId)
//     if (!customer) return

//     setFormData((prev) => {
//       const issue = prev.issueDate ? new Date(prev.issueDate) : new Date()

//       let nextDueDate = prev.dueDate
//       if (customer.defaultDueDays != null && customer.defaultDueDays > 0) {
//         const due = new Date(issue)
//         due.setDate(due.getDate() + customer.defaultDueDays)
//         nextDueDate = due.toISOString().split("T")[0]
//       }

//       const nextNotes = customer.defaultInvoiceNotes || prev.notes

//       let serviceName = ""
//       const customerServiceType =
//         (customer as any).serviceType || (customer as any).service
//       if (customerServiceType === "whatsapp_api") {
//         serviceName = "WhatsApp Business API"
//       } else if (customerServiceType === "website_dev") {
//         serviceName = "Website Development"
//       } else if (customerServiceType === "ai_agent") {
//         serviceName = "AI Agent"
//       } else if ((customer as any).service) {
//         serviceName = (customer as any).service
//       }

//       const oneTime = Number((customer as any).oneTimePrice || 0)
//       const monthly = Number((customer as any).monthlyPrice || 0)
//       const manual = Number((customer as any).manualPrice || 0)

//       let serviceAmount = oneTime + monthly + manual

//       if (serviceAmount === 0) {
//         if (customer.totalValue) {
//           serviceAmount = Number(customer.totalValue)
//         } else if (customer.recurringEnabled && customer.recurringAmount) {
//           serviceAmount = Number(customer.recurringAmount)
//         }
//       }

//       type BreakdownItem = { label: string; amount: number }
//       const breakdown: BreakdownItem[] = []

//       if (customerServiceType === "whatsapp_api") {
//         if (oneTime > 0) breakdown.push({ label: "Onboarding", amount: oneTime })
//         if (monthly > 0) breakdown.push({ label: "Recharge", amount: monthly })
//         if (manual > 0) breakdown.push({ label: "Maintenance", amount: manual })
//       } else if (customerServiceType === "website_dev") {
//         if (oneTime > 0) breakdown.push({ label: "Development", amount: oneTime })
//         if (monthly > 0) breakdown.push({ label: "Hosting", amount: monthly })
//         if (manual > 0) breakdown.push({ label: "Maintenance", amount: manual })
//       } else if (customerServiceType === "ai_agent") {
//         if (oneTime > 0) breakdown.push({ label: "Development", amount: oneTime })
//         if (monthly > 0) breakdown.push({ label: "Hosting", amount: monthly })
//         if (manual > 0) breakdown.push({ label: "Maintenance", amount: manual })
//       } else {
//         if (oneTime > 0) breakdown.push({ label: "One-time", amount: oneTime })
//         if (monthly > 0) breakdown.push({ label: "Monthly", amount: monthly })
//         if (manual > 0) breakdown.push({ label: "Manual", amount: manual })
//       }

//       let fullServiceDescription = serviceName
//       if (breakdown.length > 0) {
//         const readable = breakdown
//           .map((b) => `${b.label}: ₹${b.amount}`)
//           .join(", ")
//         fullServiceDescription = `${serviceName} (${readable})`
//       }

//       const mainAmount =
//         serviceAmount || serviceAmount === 0
//           ? serviceAmount
//           : Number(prev.amount || 0)

//       const updatedItems: LineItemForm[] =
//         mainAmount > 0 || fullServiceDescription
//           ? [
//               {
//                 description: fullServiceDescription || prev.service || "Service",
//                 quantity: 1,
//                 rate: mainAmount,
//                 amount: mainAmount,
//                 breakdown: breakdown.length > 0 ? breakdown : undefined,
//               },
//             ]
//           : prev.items || []

//       const subtotalFromItems = updatedItems.reduce(
//         (sum, it) => sum + (it.amount || 0),
//         0,
//       )

//       const updated: InvoiceFormState = {
//         ...prev,
//         customerId,
//         customerName: customer.name || "",
//         dueDate: nextDueDate,
//         notes: nextNotes,
//         service: fullServiceDescription || prev.service,
//         amount: subtotalFromItems ? String(subtotalFromItems) : prev.amount,
//         subtotal: subtotalFromItems || prev.subtotal,
//         items: updatedItems,
//       }

//       return updated
//     })
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     if (!formData.customerId) {
//       setError("Customer is required.")
//       return
//     }

//     if (!formData.invoiceNumber.trim()) {
//       setError("Invoice number is required.")
//       return
//     }

//     if (!formData.issueDate || !formData.dueDate) {
//       setError("Issue date and due date are required.")
//       return
//     }

//     if (formData.items.length === 0 && !formData.service.trim()) {
//       setError("At least one service / description is required.")
//       return
//     }

//     const amountNumber =
//       formData.subtotal ||
//       (formData.amount ? Number.parseFloat(formData.amount) : 0)

//     if (Number.isNaN(amountNumber) || amountNumber <= 0) {
//       setError("Amount must be a positive number.")
//       return
//     }

//     const issueDateSql = formData.issueDate
//     const dueDateSql = formData.dueDate

//     const subtotal = amountNumber
//     const gstRate = formData.gstRate ?? 18
//     const gstAmount = (subtotal * gstRate) / 100
//     const totalWithGst = subtotal + gstAmount

//     const itemsPayload =
//       formData.items.length > 0
//         ? formData.items.map((it) => ({
//             description: it.description.trim() || "Service",
//             quantity: it.quantity || 1,
//             rate: it.rate,
//             amount: it.amount,
//             breakdown:
//               it.breakdown && it.breakdown.length > 0 ? it.breakdown : undefined,
//           }))
//         : [
//             {
//               description: formData.service.trim() || "Service",
//               quantity: 1,
//               rate: subtotal,
//               amount: subtotal,
//               breakdown: undefined,
//             },
//           ]

//     const apiPayload = {
//       customerId: formData.customerId,
//       amount: subtotal,
//       tax: gstRate,
//       total: totalWithGst,
//       status: formData.status,
//       issueDate: issueDateSql,
//       dueDate: dueDateSql,
//       items: itemsPayload,
//       notes: formData.notes.trim(),
//       gstAmount,
//     }

//     const invoiceData: Omit<Invoice, "id"> = {
//       customerId: formData.customerId,
//       customerName: formData.customerName,
//       invoiceNumber: formData.invoiceNumber.trim(),
//       issueDate: issueDateSql,
//       dueDate: dueDateSql,
//       status: formData.status,
//       amount: subtotal,
//       tax: gstRate,
//       discount: 0,
//       notes: formData.notes.trim(),
//       items: itemsPayload as any,
//     }

//     setIsSubmitting(true)
//     try {
//       if (invoice) {
//         await updateInvoice(invoice.id, invoiceData as any, apiPayload as any)
//       } else {
//         await addInvoice(invoiceData as any, apiPayload as any)
//       }
//       onOpenChange(false)
//     } catch (err: any) {
//       setError(err?.message || "Failed to save invoice")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const gstAmount = (formData.subtotal * (formData.gstRate ?? 18)) / 100
//   const totalWithGst = formData.subtotal + gstAmount

//   const selectedCustomer = formData.customerId
//     ? customers.find((c) => c.id === formData.customerId)
//     : null

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {invoice ? "Edit Invoice" : "Create New Invoice"}
//           </DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="customer">Customer *</Label>
//               <Select
//                 value={formData.customerId}
//                 onValueChange={handleCustomerChange}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select customer" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {customers.map((customer) => (
//                     <SelectItem key={customer.id} value={customer.id}>
//                       {customer.name}{" "}
//                       {customer.company ? `(${customer.company})` : ""}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="invoiceNumber">Invoice Number *</Label>
//               <Input
//                 id="invoiceNumber"
//                 value={formData.invoiceNumber}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     invoiceNumber: e.target.value,
//                   }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="issueDate">Issue Date *</Label>
//               <Input
//                 id="issueDate"
//                 type="date"
//                 value={formData.issueDate}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     issueDate: e.target.value,
//                   }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="dueDate">Due Date *</Label>
//               <Input
//                 id="dueDate"
//                 type="date"
//                 value={formData.dueDate}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
//                 }
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="status">Status</Label>
//               <Select
//                 value={formData.status}
//                 onValueChange={(value: Invoice["status"]) =>
//                   setFormData((prev) => ({ ...prev, status: value }))
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="draft">Draft</SelectItem>
//                   <SelectItem value="sent">Sent</SelectItem>
//                   <SelectItem value="paid">Paid</SelectItem>
//                   <SelectItem value="overdue">Overdue</SelectItem>
//                   <SelectItem value="cancelled">Cancelled</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Customer Info Display */}
//             {selectedCustomer && (
//               <div className="md:col-span-2 text-sm border rounded-md p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
//                 <h4 className="font-semibold mb-2 text-indigo-900">
//                   Customer Details
//                 </h4>
//                 <div className="grid grid-cols-2 gap-3 text-xs">
//                   <div>
//                     <span className="font-medium text-gray-600">Name:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.name}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Email:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.email}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Phone:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.phone}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Company:</span>{" "}
//                     <span className="text-gray-900">
//                       {selectedCustomer.company || "—"}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Service:</span>{" "}
//                     <span className="text-gray-900">
//                       {(selectedCustomer as any).serviceType ===
//                       "whatsapp_api"
//                         ? "WhatsApp Business API"
//                         : (selectedCustomer as any).serviceType ===
//                           "website_dev"
//                         ? "Website Development"
//                         : (selectedCustomer as any).serviceType === "ai_agent"
//                         ? "AI Agent"
//                         : (selectedCustomer as any).service || "—"}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">
//                       Total Value:
//                     </span>{" "}
//                     <span className="text-gray-900 font-semibold">
//                       ₹
//                       {Number(
//                         selectedCustomer.totalValue || 0,
//                       ).toLocaleString("en-IN")}
//                     </span>
//                   </div>
//                 </div>

//                 {/* <div className="mt-3 pt-3 border-t border-indigo-200">
//                   <p className="text-xs font-semibold text-indigo-700 mb-1">
//                     Pricing Breakdown:
//                   </p>
//                   <div className="grid grid-cols-3 gap-2 text-xs">
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">One-time:</span>{" "}
//                       <span className="font-semibold">
//                         ₹{(selectedCustomer as any).oneTimePrice || 0}
//                       </span>
//                     </div>
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">Monthly:</span>{" "}
//                       <span className="font-semibold">
//                         ₹{(selectedCustomer as any).monthlyPrice || 0}
//                       </span>
//                     </div>
//                     <div className="bg-white rounded px-2 py-1">
//                       <span className="text-gray-600">Manual:</span>{" "}
//                       <span className="font-semibold">
//                         ₹{(selectedCustomer as any).manualPrice || 0}
//                       </span>
//                     </div>
//                   </div>
//                 </div> */}
//               </div>
//             )}
//           </div>

//           {/* Service Details */}
//           <Card>
//             <CardHeader className="flex items-center justify-between">
//               <CardTitle>Service Details</CardTitle>
//               <Button
//                 type="button"
//                 size="sm"
//                 variant="outline"
//                 onClick={handleAddItem}
//               >
//                 + Add service
//               </Button>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {formData.items.map((item, index) => (
//                 <div
//                   key={index}
//                   className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border rounded-md p-3"
//                 >
//                   <div className="md:col-span-2 space-y-1">
//                     <Label>Service / Description *</Label>
//                     <Input
//                       value={item.description}
//                       onChange={(e) =>
//                         handleItemChange(index, "description", e.target.value)
//                       }
//                       placeholder="Service description"
//                     />
//                   </div>
//                   <div className="space-y-1">
//                     <Label>Rate (₹)</Label>
//                     <Input
//                       type="number"
//                       step="0.01"
//                       value={item.rate}
//                       onChange={(e) =>
//                         handleItemChange(index, "rate", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div className="space-y-1 md:col-span-4 flex justify-between text-sm font-medium">
//                     <span>Line total:</span>
//                     <span>{formatCurrency(item.amount || 0)}</span>
//                   </div>

//                   {item.breakdown && item.breakdown.length > 0 && (
//                     <div className="md:col-span-4 mt-2 text-xs text-gray-600 border-t pt-2">
//                       <div className="font-semibold mb-1">
//                         Pricing breakdown
//                       </div>
//                       <div className="space-y-1">
//                         {item.breakdown.map((b, i) => (
//                           <div key={i} className="flex justify-between">
//                             <span>• {b.label}</span>
//                             <span>{formatCurrency(b.amount || 0)}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}

//               <div className="space-y-2 max-w-xs">
//                 <Label htmlFor="planAmount">Total Charges (₹) *</Label>
//                 <Input
//                   id="planAmount"
//                   type="number"
//                   step="0.01"
//                   value={formData.amount}
//                   onChange={(e) => {
//                     const value = e.target.value
//                     setFormData((prev) => ({ ...prev, amount: value }))
//                     recalcSubtotalFromAmount(value)
//                   }}
//                   placeholder="0.00"
//                   required
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   Auto-filled from customer's pricing (One-time + Monthly +
//                   Manual) or override manually.
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Invoice Summary with GST */}
//           <Card className="border-2 border-indigo-200">
//             <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
//               <CardTitle className="text-indigo-900">
//                 Invoice Summary
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3 pt-6">
//               <div className="flex justify-between text-base">
//                 <span className="font-medium">
//                   Total amount (before GST):
//                 </span>
//                 <span className="font-semibold">
//                   {formatCurrency(formData.subtotal)}
//                 </span>
//               </div>
//               <div className="flex justify-between text-base text-orange-700">
//                 <span className="font-medium">
//                   GST: {formData.gstRate}% (on total amount)
//                 </span>
//                 <span className="font-semibold">
//                   {formatCurrency(gstAmount)}
//                 </span>
//               </div>
//               <div className="border-t-2 border-indigo-200 pt-3 mt-2" />
//               <div className="flex justify-between text-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4">
//                 <span className="font-bold">
//                   Total Payable Amount (with GST):
//                 </span>
//                 <span className="font-bold text-xl">
//                   {formatCurrency(totalWithGst)}
//                 </span>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Notes */}
//           <div className="space-y-2">
//             <Label htmlFor="notes">Additional Notes</Label>
//             <Textarea
//               id="notes"
//               value={formData.notes}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, notes: e.target.value }))
//               }
//               placeholder="Additional notes (auto-filled from customer defaults)..."
//               rows={3}
//             />
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded p-3">
//               <p className="text-sm text-red-600" role="alert">
//                 {error}
//               </p>
//             </div>
//           )}

//           <div className="flex justify-end space-x-2 pt-4">
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
//                 ? "Saving..."
//                 : invoice
//                 ? "Update Invoice"
//                 : "Create Invoice"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }


//testing (27-1-2026)



"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useCRM } from "@/contexts/crm-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Invoice } from "@/types/crm"

interface InvoiceDialogProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type LineItemForm = {
  description: string
  quantity: number
  rate: number
  amount: number
  breakdown?: { label: string; amount: number }[]
}

type InvoiceFormState = {
  customerId: string
  customerName: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  status: Invoice["status"]
  subtotal: number
  gstRate: number
  notes: string
  service: string
  amount: string
  items: LineItemForm[]
}

const addMonths = (date: Date, months: number) => {
  const d = new Date(date)
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  if (d.getDate() < day) {
    d.setDate(0)
  }
  return d
}

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export function InvoiceDialog({ invoice, open, onOpenChange }: InvoiceDialogProps) {
  const { customers, addInvoice, updateInvoice } = useCRM()
  const [formData, setFormData] = useState<InvoiceFormState>({
    customerId: "",
    customerName: "",
    invoiceNumber: "",
    issueDate: "",
    dueDate: "",
    status: "draft",
    subtotal: 0,
    gstRate: 18,
    notes: "",
    service: "",
    amount: "",
    items: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recalcSubtotalFromAmount = (amountStr: string) => {
    const value = Number.parseFloat(amountStr || "0")
    const safe = Number.isNaN(value) ? 0 : value
    setFormData((prev) => ({
      ...prev,
      subtotal: safe,
      items:
        safe > 0
          ? [
              {
                // use stored service label if present, fallback to previous description then generic
                description: prev.service || prev.items[0]?.description || "Service",
                quantity: 1,
                rate: safe,
                amount: safe,
                breakdown: prev.items[0]?.breakdown,
              },
            ]
          : prev.items,
    }))
  }

  const recalcSubtotalFromItems = (items: LineItemForm[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    setFormData((prev) => ({
      ...prev,
      items,
      subtotal,
      amount: subtotal ? String(subtotal) : prev.amount,
    }))
  }

  const handleAddItem = () => {
    const nextItems: LineItemForm[] = [
      ...formData.items,
      { description: formData.service || "", quantity: 1, rate: 0, amount: 0, breakdown: [] },
    ]
    recalcSubtotalFromItems(nextItems)
  }

  const handleItemChange = (
    index: number,
    field: keyof LineItemForm,
    value: string,
  ) => {
    const nextItems = formData.items.map((item, i) => {
      if (i !== index) return item
      const updated: LineItemForm = { ...item }
      if (field === "description") {
        updated.description = value
      } else if (field === "quantity") {
        const qty = Number(value || 0)
        updated.quantity = qty
        updated.amount = qty * updated.rate
      } else if (field === "rate") {
        const rate = Number(value || 0)
        updated.rate = rate
        updated.amount = updated.quantity * rate
      } else if (field === "amount") {
        const amt = Number(value || 0)
        updated.amount = amt
      }
      return updated
    })
    recalcSubtotalFromItems(nextItems)
  }

  useEffect(() => {
    const today = new Date()
    const defaultDue = addMonths(today, 1)

    if (invoice) {
      const issue = invoice.issueDate ? new Date(invoice.issueDate) : today
      const due = invoice.dueDate ? new Date(invoice.dueDate) : defaultDue

      const subtotal =
        typeof invoice.amount === "number"
          ? invoice.amount
          : Number(invoice.amount ?? 0) || 0

      const firstItem = invoice.items && invoice.items[0]
      const service = firstItem?.description ?? (invoice as any).service ?? ""
      const amount = firstItem?.amount ?? subtotal

      const items: LineItemForm[] =
        invoice.items && invoice.items.length > 0
          ? invoice.items.map((it: any) => {
              let parsedBreakdown: { label: string; amount: number }[] | undefined
              if (it.breakdown) {
                try {
                  parsedBreakdown =
                    typeof it.breakdown === "string"
                      ? JSON.parse(it.breakdown)
                      : it.breakdown
                } catch {
                  parsedBreakdown = undefined
                }
              }
              return {
                description: it.description,
                quantity: it.quantity ?? 1,
                rate:
                  typeof it.rate === "number"
                    ? it.rate
                    : Number(it.rate ?? 0) || 0,
                amount:
                  typeof it.amount === "number"
                    ? it.amount
                    : Number(it.amount ?? 0) || 0,
                breakdown: parsedBreakdown,
              }
            })
          : service || amount
          ? [
              {
                description: service || "Service",
                quantity: 1,
                rate:
                  typeof amount === "number" ? amount : Number(amount) || 0,
                amount:
                  typeof amount === "number" ? amount : Number(amount) || 0,
                breakdown: [],
              },
            ]
          : []

      const subtotalFromItems =
        items.length > 0
          ? items.reduce((sum, it) => sum + (it.amount || 0), 0)
          : subtotal

      setFormData({
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: issue.toISOString().split("T")[0],
        dueDate: due.toISOString().split("T")[0],
        status: invoice.status,
        subtotal: subtotalFromItems,
        gstRate: 18,
        notes: invoice.notes || "",
        service: service,
        amount: amount ? String(amount) : "",
        items,
      })
    } else {
      const issueStr = today.toISOString().split("T")[0]
      const dueStr = defaultDue.toISOString().split("T")[0]

      setFormData({
        customerId: "",
        customerName: "",
        invoiceNumber: `INV-${Date.now()}`,
        issueDate: issueStr,
        dueDate: dueStr,
        status: "draft",
        subtotal: 0,
        gstRate: 18,
        notes: "",
        service: "",
        amount: "",
        items: [],
      })
    }
    setError(null)
  }, [invoice, open])

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (!customer) return

    setFormData((prev) => {
      const issue = prev.issueDate ? new Date(prev.issueDate) : new Date()

      let nextDueDate = prev.dueDate
      if (customer.defaultDueDays != null && customer.defaultDueDays > 0) {
        const due = new Date(issue)
        due.setDate(due.getDate() + customer.defaultDueDays)
        nextDueDate = due.toISOString().split("T")[0]
      }

      const nextNotes = customer.defaultInvoiceNotes || prev.notes

      let serviceName = ""
      const customerServiceType =
        (customer as any).serviceType || (customer as any).service
      if (customerServiceType === "whatsapp_api") {
        serviceName = "WhatsApp Business API"
      } else if (customerServiceType === "website_dev") {
        serviceName = "Website Development"
      } else if (customerServiceType === "ai_agent") {
        serviceName = "AI Agent"
      } else if ((customer as any).service) {
        serviceName = (customer as any).service
      }

      const oneTime = Number((customer as any).oneTimePrice || 0)
      const monthly = Number((customer as any).monthlyPrice || 0)
      const manual = Number((customer as any).manualPrice || 0)

      let serviceAmount = oneTime + monthly + manual

      if (serviceAmount === 0) {
        if (customer.totalValue) {
          serviceAmount = Number(customer.totalValue)
        } else if (customer.recurringEnabled && customer.recurringAmount) {
          serviceAmount = Number(customer.recurringAmount)
        }
      }

      type BreakdownItem = { label: string; amount: number }
      const breakdown: BreakdownItem[] = []

      if (customerServiceType === "whatsapp_api") {
        if (oneTime > 0) breakdown.push({ label: "Onboarding", amount: oneTime })
        if (monthly > 0) breakdown.push({ label: "Recharge", amount: monthly })
        if (manual > 0) breakdown.push({ label: "Maintenance", amount: manual })
      } else if (customerServiceType === "website_dev") {
        if (oneTime > 0) breakdown.push({ label: "Development", amount: oneTime })
        if (monthly > 0) breakdown.push({ label: "Hosting", amount: monthly })
        if (manual > 0) breakdown.push({ label: "Maintenance", amount: manual })
      } else if (customerServiceType === "ai_agent") {
        if (oneTime > 0) breakdown.push({ label: "Development", amount: oneTime })
        if (monthly > 0) breakdown.push({ label: "Hosting", amount: monthly })
        if (manual > 0) breakdown.push({ label: "Maintenance", amount: manual })
      } else {
        if (oneTime > 0) breakdown.push({ label: "One-time", amount: oneTime })
        if (monthly > 0) breakdown.push({ label: "Monthly", amount: monthly })
        if (manual > 0) breakdown.push({ label: "Manual", amount: manual })
      }

      let fullServiceDescription = serviceName
      if (breakdown.length > 0) {
        const readable = breakdown
          .map((b) => `${b.label}: ₹${b.amount}`)
          .join(", ")
        fullServiceDescription = `${serviceName} (${readable})`
      }

      const mainAmount =
        serviceAmount || serviceAmount === 0
          ? serviceAmount
          : Number(prev.amount || 0)

      const updatedItems: LineItemForm[] =
        mainAmount > 0 || fullServiceDescription
          ? [
              {
                description: fullServiceDescription || prev.service || "Service",
                quantity: 1,
                rate: mainAmount,
                amount: mainAmount,
                breakdown: breakdown.length > 0 ? breakdown : undefined,
              },
            ]
          : prev.items || []

      const subtotalFromItems = updatedItems.reduce(
        (sum, it) => sum + (it.amount || 0),
        0,
      )

      const updated: InvoiceFormState = {
        ...prev,
        customerId,
        customerName: customer.name || "",
        dueDate: nextDueDate,
        notes: nextNotes,
        service: fullServiceDescription || prev.service,
        amount: subtotalFromItems ? String(subtotalFromItems) : prev.amount,
        subtotal: subtotalFromItems || prev.subtotal,
        items: updatedItems,
      }

      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.customerId) {
      setError("Customer is required.")
      return
    }

    if (!formData.invoiceNumber.trim()) {
      setError("Invoice number is required.")
      return
    }

    if (!formData.issueDate || !formData.dueDate) {
      setError("Issue date and due date are required.")
      return
    }

    if (formData.items.length === 0 && !formData.service.trim()) {
      setError("At least one service / description is required.")
      return
    }

    const amountNumber =
      formData.subtotal ||
      (formData.amount ? Number.parseFloat(formData.amount) : 0)

    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setError("Amount must be a positive number.")
      return
    }

    const issueDateSql = formData.issueDate
    const dueDateSql = formData.dueDate

    const subtotal = amountNumber
    const gstRate = formData.gstRate ?? 18
    const gstAmount = (subtotal * gstRate) / 100
    const totalWithGst = subtotal + gstAmount

    // derive a consistent service name that matches customer details block
    const selectedCustomer = formData.customerId
      ? customers.find((c) => c.id === formData.customerId)
      : null
    let resolvedServiceName = formData.service.trim()
    if (selectedCustomer) {
      const customerServiceType =
        (selectedCustomer as any).serviceType ||
        (selectedCustomer as any).service
      if (customerServiceType === "whatsapp_api") {
        resolvedServiceName = "WhatsApp Business API"
      } else if (customerServiceType === "website_dev") {
        resolvedServiceName = "Website Development"
      } else if (customerServiceType === "ai_agent") {
        resolvedServiceName = "AI Agent"
      } else if ((selectedCustomer as any).service) {
        resolvedServiceName = (selectedCustomer as any).service
      }
    }

    const itemsPayload =
      formData.items.length > 0
        ? formData.items.map((it) => ({
            description:
              it.description.trim() ||
              resolvedServiceName ||
              "Service",
            quantity: it.quantity || 1,
            rate: it.rate,
            amount: it.amount,
            breakdown:
              it.breakdown && it.breakdown.length > 0 ? it.breakdown : undefined,
          }))
        : [
            {
              description:
                resolvedServiceName ||
                formData.service.trim() ||
                "Service",
              quantity: 1,
              rate: subtotal,
              amount: subtotal,
              breakdown: undefined,
            },
          ]

    const apiPayload = {
      customerId: formData.customerId,
      amount: subtotal,
      tax: gstRate,
      total: totalWithGst,
      status: formData.status,
      issueDate: issueDateSql,
      dueDate: dueDateSql,
      items: itemsPayload,
      notes: formData.notes.trim(),
      gstAmount,
    }

    const invoiceData: Omit<Invoice, "id"> = {
      customerId: formData.customerId,
      customerName: formData.customerName,
      invoiceNumber: formData.invoiceNumber.trim(),
      issueDate: issueDateSql,
      dueDate: dueDateSql,
      status: formData.status,
      amount: subtotal,
      tax: gstRate,
      discount: 0,
      notes: formData.notes.trim(),
      items: itemsPayload as any,
    }

    setIsSubmitting(true)
    try {
      if (invoice) {
        await updateInvoice(invoice.id, invoiceData as any, apiPayload as any)
      } else {
        await addInvoice(invoiceData as any, apiPayload as any)
      }
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || "Failed to save invoice")
    } finally {
      setIsSubmitting(false)
    }
  }

  const gstAmount = (formData.subtotal * (formData.gstRate ?? 18)) / 100
  const totalWithGst = formData.subtotal + gstAmount

  const selectedCustomer = formData.customerId
    ? customers.find((c) => c.id === formData.customerId)
    : null

  // same service label as above, used only for display in Customer Details
  let displayServiceName = "—"
  if (selectedCustomer) {
    const customerServiceType =
      (selectedCustomer as any).serviceType ||
      (selectedCustomer as any).service
    if (customerServiceType === "whatsapp_api") {
      displayServiceName = "WhatsApp Business API"
    } else if (customerServiceType === "website_dev") {
      displayServiceName = "Website Development"
    } else if (customerServiceType === "ai_agent") {
      displayServiceName = "AI Agent"
    } else if ((selectedCustomer as any).service) {
      displayServiceName = (selectedCustomer as any).service
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? "Edit Invoice" : "Create New Invoice"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={formData.customerId}
                onValueChange={handleCustomerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}{" "}
                      {customer.company ? `(${customer.company})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoiceNumber: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    issueDate: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Invoice["status"]) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer Info Display */}
            {selectedCustomer && (
              <div className="md:col-span-2 text-sm border rounded-md p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h4 className="font-semibold mb-2 text-indigo-900">
                  Customer Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>{" "}
                    <span className="text-gray-900">
                      {selectedCustomer.name}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>{" "}
                    <span className="text-gray-900">
                      {selectedCustomer.email}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Phone:</span>{" "}
                    <span className="text-gray-900">
                      {selectedCustomer.phone}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Company:</span>{" "}
                    <span className="text-gray-900">
                      {selectedCustomer.company || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Service:</span>{" "}
                    <span className="text-gray-900">
                      {displayServiceName}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Total Value:
                    </span>{" "}
                    <span className="text-gray-900 font-semibold">
                      ₹
                      {Number(
                        selectedCustomer.totalValue || 0,
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Service Details */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Service Details</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddItem}
              >
                + Add service
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border rounded-md p-3"
                >
                  <div className="md:col-span-2 space-y-1">
                    <Label>Service / Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      placeholder="Service description"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Rate (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, "rate", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-4 flex justify-between text-sm font-medium">
                    <span>Line total:</span>
                    <span>{formatCurrency(item.amount || 0)}</span>
                  </div>

                  {item.breakdown && item.breakdown.length > 0 && (
                    <div className="md:col-span-4 mt-2 text-xs text-gray-600 border-t pt-2">
                      <div className="font-semibold mb-1">
                        Pricing breakdown
                      </div>
                      <div className="space-y-1">
                        {item.breakdown.map((b, i) => (
                          <div key={i} className="flex justify-between">
                            <span>• {b.label}</span>
                            <span>{formatCurrency(b.amount || 0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="planAmount">Total Charges (₹) *</Label>
                <Input
                  id="planAmount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData((prev) => ({ ...prev, amount: value }))
                    recalcSubtotalFromAmount(value)
                  }}
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Auto-filled from customer's pricing (One-time + Monthly +
                  Manual) or override manually.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Summary with GST */}
          <Card className="border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="text-indigo-900">
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="flex justify-between text-base">
                <span className="font-medium">
                  Total amount (before GST):
                </span>
                <span className="font-semibold">
                  {formatCurrency(formData.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-base text-orange-700">
                <span className="font-medium">
                  GST: {formData.gstRate}% (on total amount)
                </span>
                <span className="font-semibold">
                  {formatCurrency(gstAmount)}
                </span>
              </div>
              <div className="border-t-2 border-indigo-200 pt-3 mt-2" />
              <div className="flex justify-between text-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4">
                <span className="font-bold">
                  Total Payable Amount (with GST):
                </span>
                <span className="font-bold text-xl">
                  {formatCurrency(totalWithGst)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Additional notes (auto-filled from customer defaults)..."
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : invoice
                ? "Update Invoice"
                : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

