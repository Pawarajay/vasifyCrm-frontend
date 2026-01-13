
"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCRM } from "@/contexts/crm-context";
import { RenewalDialog } from "./renewal-dialog";
import { WhatsAppSettingsDialog } from "./whatsapp-settings-dialog";
import { MessageTemplateDialog } from "./message-template-dialog";
import {
  MessageSquare,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Send,
  Search,
  Filter,
  Plus,
  CalendarClock,
  RefreshCcw,
} from "lucide-react";

type CustomerRenewalRow = {
  customerId: string;
  customerName: string;
  service: string;
  expiryDate: string | null;
  amount: number;
  status: string;
  renewalId: string | null;
  baseDate: string | null;
};

// Safely add months to a date string
const addMonths = (dateStr: string, months: number): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d.toISOString().slice(0, 10);
};

// Calculate status based on expiry date
const calculateRenewalStatus = (expiryDate: string | null): string => {
  if (!expiryDate) return "active";

  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry <= 30) return "expiring";
  return "active";
};

export function RenewalsContent() {
  const { customers, renewals, addRenewal, updateRenewal } = useCRM();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isRenewalDialogOpen, setIsRenewalDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CustomerRenewalRow | null>(
    null,
  );

  // Join customers + renewals
  const customerRenewals: CustomerRenewalRow[] = useMemo(
    () =>
      customers.map((c) => {
        const r = renewals.find((x) => x.customerId === c.id);

        const service =
          r?.service ??
          (c as any).recurringService ??
          (c as any).service ??
          "";

        const rawExpiry =
          (r as any)?.expiryDate ??
          (r as any)?.expiry_date ??
          (c as any).nextRenewalDate ??
          null;

        const expiryDate = rawExpiry;

        const amount =
          typeof r?.amount === "number"
            ? r.amount
            : typeof (c as any).recurringAmount === "number"
            ? (c as any).recurringAmount
            : 0;

        const statusFromExpiry = calculateRenewalStatus(expiryDate);
        const status =
          r?.status === "renewed" ? "renewed" : statusFromExpiry;

        const baseDate =
          (r as any)?.baseDate ??
          (c.createdAt instanceof Date
            ? c.createdAt.toISOString()
            : (c as any).createdAt) ??
          null;

        return {
          customerId: c.id,
          customerName: c.name,
          service,
          expiryDate: expiryDate
            ? new Date(expiryDate as any).toISOString()
            : null,
          amount,
          status,
          renewalId: r?.id ?? null,
          baseDate,
        };
      }),
    [customers, renewals],
  );

  // Filter rows by search + status
  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return customerRenewals.filter((row) => {
      const matchesSearch =
        !term ||
        row.customerName.toLowerCase().includes(term) ||
        row.service.toLowerCase().includes(term);

      const matchesStatus =
        filterStatus === "all" ||
        row.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [customerRenewals, searchTerm, filterStatus]);

  // Statistics cards

  // Upcoming renewals (same logic, but with safe date parse)
  const upcomingRenewals = customerRenewals.filter((row) => {
    if (!row.expiryDate) return false;
    const d = new Date(row.expiryDate);
    if (Number.isNaN(d.getTime())) return false;
    const daysUntilExpiry = Math.ceil(
      (d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  // ✅ FIXED: Expired services with safe date handling
  const expiredRenewals = customerRenewals.filter((row) => {
    if (!row.expiryDate) return false;
    const d = new Date(row.expiryDate);
    if (Number.isNaN(d.getTime())) return false;
    const daysUntilExpiry = Math.ceil(
      (d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 0;
  }).length;

  // ✅ FIXED: Renewed this month (status + current month/year)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const renewedThisMonth =
    renewals.filter((r) => {
      if (r.status !== "renewed") return false;

      const raw =
        (r as any).updatedAt ??
        (r as any).updated_at ??
        (r as any).expiryDate ??
        (r as any).expiry_date;

      if (!raw) return false;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return false;

      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "expiring":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Expiring Soon
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case "renewed":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Renewed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return NaN;
    const d = new Date(expiryDate);
    if (Number.isNaN(d.getTime())) return NaN;
    const days = Math.ceil(
      (d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    return days;
  };

  const sendWhatsAppReminder = (renewalId: string | null) => {
    if (!renewalId) {
      alert("Create a renewal record before sending reminders.");
      return;
    }
    alert(`WhatsApp reminder sent for renewal ${renewalId}`);
  };

  const handleMarkRenewed = async (row: CustomerRenewalRow) => {
    if (!row.renewalId) {
      alert("Create a renewal record before marking as renewed.");
      return;
    }
    await updateRenewal(row.renewalId, { status: "renewed" });
  };

  const handleMarkActive = async (row: CustomerRenewalRow) => {
    if (!row.renewalId) {
      alert("Create a renewal record before changing status.");
      return;
    }
    await updateRenewal(row.renewalId, { status: "active" });
  };

  // Save handler with expiry auto-calc
  const handleRenewalSave = async (renewalData: any) => {
    try {
      const finalData = {
        ...renewalData,
        customerId: selectedRow?.customerId ?? renewalData.customerId,
      };

      if (!finalData.expiryDate || finalData.expiryDate === "Expiry Not Set") {
        const baseDate =
          finalData.baseDate ||
          selectedRow?.baseDate ||
          new Date().toISOString().slice(0, 10);
        const intervalMonths = finalData.intervalMonths || 1;
        finalData.expiryDate = addMonths(baseDate, intervalMonths);
      }

      if (selectedRow?.renewalId) {
        await updateRenewal(selectedRow.renewalId, finalData);
      } else {
        await addRenewal(finalData);
      }
    } finally {
      setIsRenewalDialogOpen(false);
      setSelectedRow(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Renewal Management
          </h1>
          <p className="text-gray-600 mt-1">
            Automated tracking and WhatsApp reminders for expiring services
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsSettingsDialogOpen(true)}
            className="border-gray-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            WhatsApp Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsTemplateDialogOpen(true)}
            className="border-gray-300"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message Templates
          </Button>
          <Button
            onClick={() => {
              setSelectedRow(null);
              setIsRenewalDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Renewal
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Renewals
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {upcomingRenewals}
            </div>
            <p className="text-xs text-muted-foreground">
              Expiring in next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expired Services
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {expiredRenewals}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Renewed This Month
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {renewedThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully renewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerRenewals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Under renewal tracking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search renewals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("active")}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === "expiring" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("expiring")}
          >
            Expiring
          </Button>
          <Button
            variant={filterStatus === "expired" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("expired")}
          >
            Expired
          </Button>
          <Button
            variant={filterStatus === "renewed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("renewed")}
          >
            Renewed
          </Button>
        </div>
      </div>

      {/* Renewals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Renewals</CardTitle>
          <CardDescription>
            Manage and track all service renewals with automatic status updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRows.map((row) => {
              const daysUntilExpiry = getDaysUntilExpiry(row.expiryDate);

              return (
                <div
                  key={row.customerId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {row.customerName}
                        </h3>
                        {getStatusBadge(row.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {row.service || "No service set"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {row.baseDate && (
                          <div className="flex items-center gap-1">
                            <CalendarClock className="w-3 h-3" />
                            <span>
                              Started:{" "}
                              {new Date(row.baseDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Expires:{" "}
                            {row.expiryDate
                              ? new Date(
                                  row.expiryDate,
                                ).toLocaleDateString()
                              : "Not set"}
                          </span>
                        </div>
                        <span className="font-medium">
                          Amount: ₹{row.amount || 0}
                        </span>
                        {!Number.isNaN(daysUntilExpiry) &&
                          daysUntilExpiry <= 30 &&
                          daysUntilExpiry > 0 && (
                            <span className="text-yellow-600 font-medium">
                              {daysUntilExpiry} days left
                            </span>
                          )}
                        {!Number.isNaN(daysUntilExpiry) &&
                          daysUntilExpiry <= 0 &&
                          row.expiryDate && (
                            <span className="text-red-600 font-medium">
                              Expired {Math.abs(daysUntilExpiry)} days ago
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendWhatsAppReminder(row.renewalId)}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send Reminder
                    </Button>

                    {row.status !== "renewed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkRenewed(row)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        disabled={!row.renewalId}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Renewed
                      </Button>
                    )}
                    {row.status === "renewed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkActive(row)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        disabled={!row.renewalId}
                      >
                        <RefreshCcw className="w-4 h-4 mr-1" />
                        Mark Active
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRow(row);
                        setIsRenewalDialogOpen(true);
                      }}
                    >
                      {row.renewalId ? "Edit" : "Create"} Renewal
                    </Button>
                  </div>
                </div>
              );
            })}
            {filteredRows.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-1">No renewals found</p>
                <p className="text-sm">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "Add your first renewal to get started"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <RenewalDialog
        isOpen={isRenewalDialogOpen}
        onClose={() => {
          setIsRenewalDialogOpen(false);
          setSelectedRow(null);
        }}
        renewal={
          selectedRow?.renewalId
            ? renewals.find((r) => r.id === selectedRow.renewalId) || null
            : null
        }
        customerId={selectedRow?.customerId}
        onSave={handleRenewalSave}
      />

      <WhatsAppSettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
      />

      <MessageTemplateDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
      />
    </div>
  );
}
