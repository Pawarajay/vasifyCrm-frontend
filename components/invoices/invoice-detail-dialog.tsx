"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  Send,
  Edit,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react"
import type { Invoice } from "@/types/crm"

interface InvoiceDetailDialogProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditInvoice?: (invoice: Invoice) => void
  onDownloadInvoice?: (invoice: Invoice) => void
  onSendInvoice?: (invoice: Invoice) => void
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

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export function InvoiceDetailDialog({
  invoice,
  open,
  onOpenChange,
  onEditInvoice,
  onDownloadInvoice,
  onSendInvoice,
}: InvoiceDetailDialogProps) {
  if (!invoice) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "overdue":
        return <Clock className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // In new format: amount is total before GST, items is single-line service
  const subtotal =
    invoice.items?.reduce((sum, item) => sum + (item.amount ?? 0), 0) ??
    (typeof invoice.amount === "number"
      ? invoice.amount
      : Number(invoice.amount ?? 0) || 0)

  const gstRate = invoice.tax ?? 18
  const gstAmount = (subtotal * gstRate) / 100
  const totalWithGst = subtotal + gstAmount

  const handleEdit = () => onEditInvoice?.(invoice)
  const handleDownload = () => onDownloadInvoice?.(invoice)
  const handleSend = () => onSendInvoice?.(invoice)

  const customerName = (invoice as any).customerName ?? "Customer"

  const serviceItem =
    invoice.items && invoice.items.length > 0 ? invoice.items[0] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice Details</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice header: customer, dates, total before GST */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {invoice.invoiceNumber}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Invoice to {customerName}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={getStatusColor(invoice.status)}
                >
                  <div className="flex items-center gap-1">
                    {getStatusIcon(invoice.status)}
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Issue Date</h4>
                  <p className="text-muted-foreground">
                    {formatDate((invoice as any).issueDate)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Date</h4>
                  <p className="text-muted-foreground">
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Total amount (before GST)
                  </h4>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(subtotal)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service row: Sr. No | Service | Charges */}
          {serviceItem && (
            <Card>
              <CardHeader>
                <CardTitle>Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 font-semibold border-b pb-2 mb-2">
                  <div className="col-span-2">Sr. No</div>
                  <div className="col-span-6">Service</div>
                  <div className="col-span-4 text-right">Charges (₹)</div>
                </div>
                <div className="grid grid-cols-12 py-2">
                  <div className="col-span-2">1</div>
                  <div className="col-span-6">
                    {serviceItem.description || "Service"}
                  </div>
                  <div className="col-span-4 text-right font-medium">
                    {formatCurrency(serviceItem.amount ?? subtotal)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary: Total, GST 18%, Total payable with GST */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Total amount (before GST):</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">
                  GST : {gstRate}% (on total amount)
                </span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total payable amount with GST:</span>
                <span className="text-primary">
                  {formatCurrency(totalWithGst)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
