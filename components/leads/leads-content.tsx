
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCRM } from "@/contexts/crm-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadDialog } from "./lead-dialog";
import { LeadDetailDialog } from "./lead-detail-dialog";
import { ConvertLeadDialog } from "./convert-lead-dialog";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  UserCheck,
  Users,
  UserPlus,
} from "lucide-react";
import type { Lead } from "@/types/crm";

const formatDate = (value: unknown) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

type LeadViewMode = "table" | "kanban";

const statusColumns: { id: Lead["status"]; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal", label: "Proposal" },
  { id: "negotiation", label: "Negotiation" },
  { id: "closed-won", label: "Closed Won" },
  { id: "closed-lost", label: "Closed Lost" },
];

export function LeadsContent() {
  const {
    leads,
    deleteLead,
    users,
    currentUser,
    leadFilters,
    setLeadFilters,
    refreshLeads,
  } = useCRM();

  const safeUsers = Array.isArray(users) ? users : [];
  const isAdmin = currentUser?.role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [creatorSearchTerm, setCreatorSearchTerm] = useState(""); // New state for creator search
  const [statusFilter, setStatusFilter] = useState<string>(
    leadFilters.status ?? "all",
  );
  const [priorityFilter, setPriorityFilter] = useState<string>(
    leadFilters.priority ?? "all",
  );
  const [serviceFilter, setServiceFilter] = useState<string>(
    leadFilters.service ?? "all",
  );
  const [createdByFilter, setCreatedByFilter] = useState<string>(
    leadFilters.createdBy ?? "all",
  );
  const [assignedToFilter, setAssignedToFilter] = useState<string>(
    leadFilters.assignedTo ?? "all",
  );

  const [viewMode, setViewMode] = useState<LeadViewMode>("table");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedCreatorSearch = creatorSearchTerm.trim().toLowerCase();

  useEffect(() => {
    const normalizedAssignedTo =
      isAdmin && assignedToFilter !== "all"
        ? assignedToFilter
        : undefined;

    const normalizedCreatedBy =
      isAdmin && createdByFilter !== "all"
        ? createdByFilter
        : undefined;

    const next = {
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      service: serviceFilter !== "all" ? serviceFilter : undefined,
      assignedTo: normalizedAssignedTo,
      createdBy: normalizedCreatedBy,
    };

    if (
      next.status === leadFilters.status &&
      next.priority === leadFilters.priority &&
      next.service === leadFilters.service &&
      (next.assignedTo ?? "all") === (leadFilters.assignedTo ?? "all") &&
      (next.createdBy ?? "all") === (leadFilters.createdBy ?? "all")
    ) {
      return;
    }

    setLeadFilters(next);
    void refreshLeads();
  }, [
    statusFilter,
    priorityFilter,
    serviceFilter,
    createdByFilter,
    assignedToFilter,
    isAdmin,
    leadFilters,
    setLeadFilters,
    refreshLeads,
  ]);

  const getCreatorName = (lead: Lead) => {
    if ((lead as any).created_user_name) {
      return (lead as any).created_user_name as string;
    }

    const creatorId =
      (lead as any).createdBy ?? (lead as any).created_by ?? null;
    if (!creatorId) return "Unknown";

    const user = safeUsers.find((u) => String(u.id) === String(creatorId));
    return user?.name || "Unknown";
  };

  const getAssignedToName = (lead: Lead) => {
    if ((lead as any).assigned_user_name) {
      return (lead as any).assigned_user_name as string;
    }

    const assignedId = (lead as any).assignedTo ?? (lead as any).assigned_to ?? null;
    if (!assignedId) return "Unassigned";

    const user = safeUsers.find((u) => String(u.id) === String(assignedId));
    return user?.name || "Unknown";
  };

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        // Main search (name, email, company, phone)
        const matchesSearch =
          !normalizedSearch ||
          (lead.name?.toLowerCase() ?? "").includes(normalizedSearch) ||
          (lead.email?.toLowerCase() ?? "").includes(normalizedSearch) ||
          (lead.company?.toLowerCase() ?? "").includes(normalizedSearch) ||
          (lead.phone ?? "").includes(searchTerm);

        // Creator name search
        const matchesCreator =
          !normalizedCreatorSearch ||
          getCreatorName(lead).toLowerCase().includes(normalizedCreatorSearch);

        return matchesSearch && matchesCreator;
      }),
    [leads, normalizedSearch, searchTerm, normalizedCreatorSearch],
  );

  const visibleLeads = useMemo(
    () =>
      filteredLeads.filter(
        (lead) =>
          !(lead.status === "closed-won" && (lead as any).isConverted),
      ),
    [filteredLeads],
  );

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (leadId: string) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      void deleteLead(leadId);
    }
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailDialogOpen(true);
  };

  const handleConvert = (lead: Lead) => {
    setSelectedLead(lead);
    setIsConvertDialogOpen(true);
  };

  const handleCallLead = (lead: Lead) => {
    if (!lead.phone) return;
    window.open(`tel:${lead.phone}`, "_self");
  };

  const handleEmailLead = (lead: Lead) => {
    if (!lead.email) return;
    window.location.href = `mailto:${lead.email}`;
  };

  const handleWhatsAppLead = (lead: Lead) => {
    const number = lead.whatsappNumber || lead.phone;
    if (!number) return;
    const text = encodeURIComponent(
      "Hi, I'd like to follow up regarding our discussion.",
    );
    window.open(
      `https://wa.me/${number}?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleScheduleMeeting = (lead: Lead) => {
    console.log("Schedule meeting for lead:", lead.id);
  };

  const handleCreateDeal = (lead: Lead) => {
    console.log("Create deal from lead:", lead.id);
  };

  const getStatusBadge = (status: Lead["status"]) => {
    const variants: Record<Lead["status"], string> = {
      new: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      contacted: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      qualified: "bg-green-100 text-green-800 hover:bg-green-100",
      proposal: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      negotiation: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      "closed-won": "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      "closed-lost": "bg-red-100 text-red-800 hover:bg-red-100",
    };
    return variants[status] ?? variants.new;
  };

  const getPriorityBadge = (priority: Lead["priority"]) => {
    const variants: Record<Lead["priority"], string> = {
      low: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      high: "bg-red-100 text-red-800 hover:bg-red-100",
    };
    return variants[priority] ?? variants.medium;
  };

  const stats = useMemo(() => {
    const total = leads.length;
    const byStatus = {
      new: leads.filter((l) => l.status === "new").length,
      qualified: leads.filter((l) => l.status === "qualified").length,
      won: leads.filter((l) => l.status === "closed-won").length,
    };
    const totalValue = leads.reduce(
      (sum, lead) =>
        sum +
        (typeof lead.estimatedValue === "number"
          ? lead.estimatedValue
          : Number(lead.estimatedValue ?? 0) || 0),
      0,
    );

    return {
      total,
      new: byStatus.new,
      qualified: byStatus.qualified,
      won: byStatus.won,
      totalValue,
    };
  }, [leads]);

  const groupedByStatus = useMemo(() => {
    const map: Record<Lead["status"], Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      "closed-won": [],
      "closed-lost": [],
    };
    visibleLeads.forEach((lead) => {
      map[lead.status]?.push(lead);
    });
    return map;
  }, [visibleLeads]);

  const renderLeadCard = (lead: Lead) => {
    const valueNumber =
      typeof lead.estimatedValue === "number"
        ? lead.estimatedValue
        : Number(lead.estimatedValue ?? 0);

    return (
      <Card
        key={lead.id}
        className="mb-3 cursor-pointer hover:border-primary/60"
        onDoubleClick={() => handleViewDetails(lead)}
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{lead.name}</div>
              <div className="text-xs text-muted-foreground">
                {lead.company || "—"}
              </div>
            </div>
            <Badge className={getPriorityBadge(lead.priority)}>
              {lead.priority}
            </Badge>
          </div>
          {lead.service && (
            <div className="text-xs capitalize text-muted-foreground">
              Service: {lead.service.replace(/-/g, " ")}
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <span>
              Value:{" "}
              {valueNumber ? `₹${valueNumber.toLocaleString()}` : "—"}
            </span>
            <span>
              Close:{" "}
              {lead.expectedCloseDate
                ? formatDate(lead.expectedCloseDate)
                : "—"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Created by: {getCreatorName(lead)}
          </div>
          {isAdmin && (
            <div className="text-xs text-muted-foreground">
              Assigned to: {getAssignedToName(lead)}
            </div>
          )}
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  aria-label="Open actions"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleViewDetails(lead)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(lead)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    lead.status === "closed-won" && handleConvert(lead)
                  }
                  disabled={lead.status !== "closed-won"}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Convert to Customer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleCallLead(lead)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEmailLead(lead)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(lead.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your sales leads
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.new}
            </div>
            <p className="text-xs text-muted-foreground">New Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.qualified}
            </div>
            <p className="text-xs text-muted-foreground">Qualified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.won}
            </div>
            <p className="text-xs text-muted-foreground">Closed Won</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ₹{stats.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline</CardTitle>
          <CardDescription>Track and manage your sales leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Main Search */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search leads (name, email, company, phone)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* New Creator Search Bar */}
            <div className="relative min-w-[220px] max-w-sm">
              <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by Creator..."
                value={creatorSearchTerm}
                onChange={(e) => setCreatorSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closed-won">Closed Won</SelectItem>
                <SelectItem value="closed-lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="whatsapp-business-api">
                  WhatsApp Business API
                </SelectItem>
                <SelectItem value="website-development">
                  Website Development
                </SelectItem>
                <SelectItem value="ai-agent">AI Agent</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {isAdmin && (
              <Select
                value={createdByFilter}
                onValueChange={setCreatedByFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Creator">
                    {createdByFilter === "all" ? (
                      <span className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        All Creators
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        {safeUsers.find(u => String(u.id) === createdByFilter)?.name || "Creator"}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      All Creators
                    </span>
                  </SelectItem>
                  {safeUsers.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {isAdmin && (
              <Select
                value={assignedToFilter}
                onValueChange={setAssignedToFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Owner">
                    {assignedToFilter === "all" ? (
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        All Owners
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {safeUsers.find(u => String(u.id) === assignedToFilter)?.name || "Owner"}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Owners
                    </span>
                  </SelectItem>
                  {safeUsers.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground">View:</span>
              <Button
                type="button"
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Table
              </Button>
              <Button
                type="button"
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("kanban")}
              >
                Kanban
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {visibleLeads.length} of {leads.length} leads
            </div>
          </div>

          {viewMode === "table" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Expected Close</TableHead>
                    <TableHead>Created By</TableHead>
                    {isAdmin && <TableHead>Assigned To</TableHead>}
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleLeads.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isAdmin ? 11 : 10}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm ||
                        creatorSearchTerm ||
                        statusFilter !== "all" ||
                        priorityFilter !== "all" ||
                        serviceFilter !== "all" ||
                        createdByFilter !== "all" ||
                        assignedToFilter !== "all"
                          ? "No leads found matching your filters."
                          : "No leads yet. Add your first lead!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleLeads.map((lead) => {
                      const valueNumber =
                        typeof lead.estimatedValue === "number"
                          ? lead.estimatedValue
                          : Number(lead.estimatedValue ?? 0);

                      return (
                        <TableRow
                          key={lead.id}
                          className="hover:bg-muted/50 cursor-pointer"
                          onDoubleClick={() => handleViewDetails(lead)}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {lead.name?.charAt(0) ?? "L"}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{lead.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {lead.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {lead.company || "—"}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {lead.source}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {lead.phone || "No phone"}
                              </span>
                            </div>
                            {lead.whatsappNumber && (
                              <div className="flex items-center space-x-2 mt-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm text-green-600">
                                  WhatsApp
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(lead.status)}>
                              {lead.status.replace("-", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityBadge(lead.priority)}>
                              {lead.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {lead.service ? (
                              <span className="text-xs capitalize">
                                {lead.service.replace(/-/g, " ")}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {valueNumber
                                ? `₹${valueNumber.toLocaleString()}`
                                : "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {lead.expectedCloseDate
                                ? formatDate(lead.expectedCloseDate)
                                : "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{getCreatorName(lead)}</div>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <div className="text-sm">
                                {getAssignedToName(lead)}
                              </div>
                            </TableCell>
                          )}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  aria-label="Open actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(lead)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(lead)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    lead.status === "closed-won" &&
                                    handleConvert(lead)
                                  }
                                  disabled={lead.status !== "closed-won"}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Convert to Customer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleCallLead(lead)}
                                >
                                  <Phone className="mr-2 h-4 w-4" />
                                  Call
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEmailLead(lead)}
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(lead.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Kanban View
            <div className="w-full overflow-x-auto">
              <div className="flex gap-4 min-w-max">
                {statusColumns.map((column) => {
                  const columnLeads = groupedByStatus[column.id];
                  return (
                    <div
                      key={column.id}
                      className="w-64 bg-muted/40 rounded-lg border flex flex-col"
                    >
                      <div className="px-3 py-2 border-b flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {column.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {columnLeads.length}
                        </span>
                      </div>
                      <div className="p-2 flex-1 overflow-y-auto max-h-[540px]">
                        {columnLeads.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center mt-4">
                            No leads
                          </p>
                        ) : (
                          columnLeads.map((lead) => renderLeadCard(lead))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <LeadDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        lead={null}
        mode="add"
      />

      <LeadDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        lead={selectedLead}
        mode="edit"
      />

      <LeadDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        lead={selectedLead}
        onCallLead={handleCallLead}
        onEmailLead={handleEmailLead}
        onWhatsAppLead={handleWhatsAppLead}
        onScheduleMeeting={handleScheduleMeeting}
        onCreateDeal={handleCreateDeal}
      />

      <ConvertLeadDialog
        open={isConvertDialogOpen}
        onOpenChange={setIsConvertDialogOpen}
        lead={selectedLead}
      />
    </div>
  );
}

