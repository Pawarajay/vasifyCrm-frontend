
"use client"

import { useMemo, useState } from "react"
import { useCRM } from "@/contexts/crm-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CustomerDialog } from "./customer-dialog"
import { CustomerDetailDialog } from "./customer-detail-dialog"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MessageCircle,
  Undo2,
} from "lucide-react"
import type { Customer } from "@/types/crm"

export function CustomersContent() {
  const { customers, deleteCustomer, moveCustomerToLead } = useCRM()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isBackToLead, setIsBackToLead] = useState<string | null>(null)

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        if (!normalizedSearch) return true

        const name = customer.name?.toLowerCase() ?? ""
        const email = customer.email?.toLowerCase() ?? ""
        const company = customer.company?.toLowerCase() ?? ""
        const phone = customer.phone ?? ""

        return (
          name.includes(normalizedSearch) ||
          email.includes(normalizedSearch) ||
          company.includes(normalizedSearch) ||
          phone.includes(searchTerm)
        )
      }),
    [customers, normalizedSearch, searchTerm],
  )

  const handleEdit = (e: React.MouseEvent, customer: Customer) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedCustomer(customer)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (e: React.MouseEvent, customerId: string) => {
    e.preventDefault()
    e.stopPropagation()

    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?\n\nThis action cannot be undone and will remove all associated data.",
    )

    if (!confirmed) return

    setIsDeleting(customerId)
    try {
      const success = await deleteCustomer(customerId)
      if (!success) {
        alert("Failed to delete customer. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting customer:", error)
      alert("An error occurred while deleting the customer.")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleBackToLead = async (e: React.MouseEvent, customer: Customer) => {
    e.preventDefault()
    e.stopPropagation()

    const confirmed = window.confirm(
      "Move this customer back to Leads?\n\nThey will be removed from Customers and restored as a Lead.",
    )
    if (!confirmed) return

    setIsBackToLead(customer.id)
    try {
      const success = await moveCustomerToLead(customer.id)
      if (!success) {
        alert("Failed to move customer back to lead. Please try again.")
      }
    } catch (error) {
      console.error("Error moving customer back to lead:", error)
      alert("An error occurred while moving the customer back to lead.")
    } finally {
      setIsBackToLead(null)
    }
  }

  const handleViewDetails = (e: React.MouseEvent, customer: Customer) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedCustomer(customer)
    setIsDetailDialogOpen(true)
  }

  const handleCallCustomer = (e: React.MouseEvent, customer: Customer) => {
    e.preventDefault()
    e.stopPropagation()
    if (!customer.phone) {
      alert("No phone number available for this customer.")
      return
    }
    window.location.href = `tel:${customer.phone}`
  }

  const handleEmailCustomer = (e: React.MouseEvent, customer: Customer) => {
    e.preventDefault()
    e.stopPropagation()
    if (!customer.email) {
      alert("No email address available for this customer.")
      return
    }
    window.location.href = `mailto:${customer.email}`
  }

  const handleWhatsAppCustomer = (e: React.MouseEvent, customer: Customer) => {
    e.preventDefault()
    e.stopPropagation()
    const number = customer.whatsappNumber || customer.phone
    if (!number) {
      alert("No WhatsApp number available for this customer.")
      return
    }
    const cleanNumber = number.replace(/\D/g, "")
    const message = encodeURIComponent("Hi, I'd like to follow up regarding our conversation.")
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank", "noopener,noreferrer")
  }

  const getStatusBadge = (status: Customer["status"]) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800 hover:bg-green-100",
      inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      prospect: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    }
    return variants[status] || variants.active
  }

  const formatLastContact = (value: Customer["lastContactDate"]) => {
    if (!value) return "Never"
    if (value instanceof Date) return value.toLocaleDateString()
    return String(value)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>Search and manage all your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>

          {/* Customers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  {/* new Service column */}
                  <TableHead>Service</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm
                        ? "No customers found matching your search."
                        : "No customers yet. Add your first customer!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {customer.name?.charAt(0)?.toUpperCase() ?? "C"}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{customer.name || "Unnamed"}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{customer.company || "—"}</div>
                        <div className="text-sm text-muted-foreground">
                          {[customer.city, customer.state].filter(Boolean).join(", ") || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{customer.phone || "No phone"}</span>
                        </div>
                        {customer.whatsappNumber && (
                          <div className="flex items-center space-x-2 mt-1">
                            <MessageCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-green-600">WhatsApp</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(customer.status)}>
                          {customer.status ?? "active"}
                        </Badge>
                      </TableCell>
                      {/* Service cell – uses recurringService or service field */}
                      <TableCell>
                        <div className="text-sm">
                          {customer.recurringService || (customer as any).service || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {typeof customer.totalValue === "number"
                            ? `₹${customer.totalValue.toLocaleString()}`
                            : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatLastContact(customer.lastContactDate)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-accent"
                              disabled={isDeleting === customer.id || isBackToLead === customer.id}
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                handleViewDetails(e as any, customer)
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                handleEdit(e as any, customer)
                              }}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Customer
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                handleBackToLead(e as any, customer)
                              }}
                              className="cursor-pointer"
                              disabled={isBackToLead === customer.id}
                            >
                              <Undo2 className="mr-2 h-4 w-4" />
                              {isBackToLead === customer.id ? "Moving..." : "Back to Lead"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                handleCallCustomer(e as any, customer)
                              }}
                              disabled={!customer.phone}
                              className="cursor-pointer"
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              Call
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                handleEmailCustomer(e as any, customer)
                              }}
                              disabled={!customer.email}
                              className="cursor-pointer"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Email
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                handleWhatsAppCustomer(e as any, customer)
                              }}
                              disabled={!customer.whatsappNumber && !customer.phone}
                              className="cursor-pointer"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              WhatsApp
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                handleDelete(e as any, customer.id)
                              }}
                              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                              disabled={isDeleting === customer.id}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isDeleting === customer.id ? "Deleting..." : "Delete Customer"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CustomerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        customer={null}
        mode="add"
      />

      <CustomerDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setSelectedCustomer(null)
          }
        }}
        customer={selectedCustomer}
        mode="edit"
      />

      <CustomerDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={(open) => {
          setIsDetailDialogOpen(open)
          if (!open) {
            setSelectedCustomer(null)
          }
        }}
        customer={selectedCustomer}
        onCallCustomer={(customer) => handleCallCustomer({} as any, customer)}
        onEmailCustomer={(customer) => handleEmailCustomer({} as any, customer)}
        onWhatsAppCustomer={(customer) => handleWhatsAppCustomer({} as any, customer)}
        onScheduleMeeting={(customer) => {
          alert(`Meeting scheduling feature coming soon for ${customer.name}`)
        }}
      />
    </div>
  )
}

