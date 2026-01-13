// export interface Customer {
//   id: string
//   name: string
//   email: string
//   phone: string
//   company: string
//   address: string
//   city: string
//   state: string
//   zipCode: string
//   country: string
//   status: "active" | "inactive" | "prospect"
//   source: string
//   assignedTo: string
//   tags: string[]
//   notes: string
//   createdAt: Date
//   updatedAt: Date
//   lastContactDate?: Date
//   totalValue: number
//   whatsappNumber?: string

//   // New: invoice defaults
//   defaultTaxRate?: number          // maps to customers.default_tax_rate
//   defaultDueDays?: number          // maps to customers.default_due_days
//   defaultInvoiceNotes?: string     // maps to customers.default_invoice_notes

//   // New: recurring + renewal defaults
//   recurringEnabled?: boolean       // customers.recurring_enabled (TINYINT)
//   recurringInterval?: "monthly" | "yearly" // customers.recurring_interval
//   recurringAmount?: number         // customers.recurring_amount
//   recurringService?: string        // customers.recurring_service
//   nextRenewalDate?: Date | string  // customers.next_renewal_date

//   defaultRenewalStatus?: "active" | "expiring" | "expired" | "renewed"
//   defaultRenewalReminderDays?: number
//   defaultRenewalNotes?: string
// }


// export interface Lead {
//   id: string
//   name: string
//   email: string
//   phone: string
//   company?: string
//   source: "website" | "referral" | "social" | "advertisement" | "cold-call" | "other"
//   status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
//   priority: "low" | "medium" | "high"
//   assignedTo: string
//   estimatedValue: number
//   notes: string
//   createdAt: Date
//   updatedAt: Date
//   expectedCloseDate?: Date
//   whatsappNumber?: string
// }

// export interface Deal {
//   id: string
//   title: string
//   customerId: string
//   value: number
//   stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
//   probability: number
//   expectedCloseDate: Date
//   actualCloseDate?: Date
//   assignedTo: string
//   products: string[]
//   notes: string
//   createdAt: Date
//   updatedAt: Date
// }

// export interface Task {
//   id: string
//   title: string
//   description: string
//   type: "call" | "email" | "meeting" | "follow-up" | "demo" | "other"
//   priority: "low" | "medium" | "high"
//   status: "pending" | "in-progress" | "completed" | "cancelled"
//   assignedTo: string
//   relatedTo: {
//     type: "customer" | "lead" | "deal"
//     id: string
//   }
//   dueDate: Date
//   completedAt?: Date
//   createdAt: Date
//   updatedAt: Date
// }

// export interface Invoice {
//   id: string
//   customerId: string
//   invoiceNumber: string
//   amount: number
//   tax: number
//   total: number
//   status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
//   dueDate: Date
//   paidDate?: Date
//   items: InvoiceItem[]
//   notes: string
//   createdAt: Date
//   updatedAt: Date
// }

// export interface InvoiceItem {
//   id: string
//   description: string
//   quantity: number
//   rate: number
//   amount: number
// }

// export interface User {
//   id: string
//   name: string
//   email: string
//   role: "admin" | "manager" | "sales" | "support"
//   avatar?: string
//   isActive: boolean
//   createdAt: Date
// }

// export interface RenewalReminder {
//   id: string
//   customerId: string
//   serviceType: "whatsapp-panel" | "website" | "hosting" | "domain" | "other"
//   serviceName: string
//   expiryDate: Date
//   reminderDays: number[]
//   lastReminderSent?: Date
//   status: "active" | "renewed" | "expired" | "cancelled"
//   whatsappTemplate: string
//   createdAt: Date
//   updatedAt: Date
// }

// export interface Renewal {
//   id: string
//   customerId: string
//   service: string
//   amount: number
//   expiryDate: string
//   status: "active" | "expiring" | "expired" | "renewed"
//   reminderDays?: number
//   notes?: string
//   createdAt: Date
//   updatedAt: Date
// }

//testing
// Customers

// export interface Customer {
//   id: string
//   name: string
//   email: string
//   phone: string
//   company: string
//   address: string
//   city: string
//   state: string
//   zipCode: string
//   country: string
//   status: "active" | "inactive" | "prospect"
//   source: string
//   assignedTo: string
//   tags: string[]
//   notes: string
//   createdAt: Date | string
//   updatedAt: Date | string
//   lastContactDate?: Date | string
//   totalValue: number
//   whatsappNumber?: string

//   // Invoice defaults
//   defaultTaxRate?: number          // maps to customers.default_tax_rate
//   defaultDueDays?: number          // maps to customers.default_due_days
//   defaultInvoiceNotes?: string     // maps to customers.default_invoice_notes

//   // Recurring / subscription
//   recurringEnabled?: boolean       // customers.recurring_enabled
//   recurringInterval?: "monthly" | "yearly" | null // customers.recurring_interval
//   recurringAmount?: number         // customers.recurring_amount
//   recurringService?: string        // customers.recurring_service
//   nextRenewalDate?: Date | string | null  // customers.next_renewal_date

//   // Renewal defaults
//   defaultRenewalStatus?: "active" | "expiring" | "expired" | "renewed"
//   defaultRenewalReminderDays?: number
//   defaultRenewalNotes?: string
// }


//testing (19-12-2025)
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string

  status: "active" | "inactive" | "prospect"
  source: string
  assignedTo: string
  tags: string[]
  notes: string
  createdAt: Date | string
  updatedAt: Date | string
  lastContactDate?: Date | string
  totalValue: number
  whatsappNumber?: string

  // Invoice defaults
  defaultTaxRate?: number              // customers.default_tax_rate
  defaultDueDays?: number              // customers.default_due_days
  defaultInvoiceNotes?: string | null  // customers.default_invoice_notes

  // Recurring / subscription
  recurringEnabled?: boolean           // customers.recurring_enabled
  recurringInterval?: "monthly" | "yearly" | null // customers.recurring_interval
  recurringAmount?: number             // customers.recurring_amount
  recurringService?: string | null     // customers.recurring_service
  nextRenewalDate?: Date | string | null // customers.next_renewal_date

  // Renewal defaults
  defaultRenewalStatus?: "active" | "expiring" | "expired" | "renewed" | null
  defaultRenewalReminderDays?: number
  defaultRenewalNotes?: string | null

   service?: string | null   // add this
}


// Leads

// export interface Lead {
//   id: string
//   name: string
//   email: string
//   phone: string
//   company?: string
//   source:
//     | "website"
//     | "referral"
//     | "social"
//     | "advertisement"
//     | "cold-call"
//     | "other"
//   status:
//     | "new"
//     | "contacted"
//     | "qualified"
//     | "proposal"
//     | "negotiation"
//     | "closed-won"
//     | "closed-lost"
//   priority: "low" | "medium" | "high"
//   assignedTo: string
//   estimatedValue: number
//   notes: string
//   createdAt: Date | string
//   updatedAt: Date | string
//   expectedCloseDate?: Date | string
//   whatsappNumber?: string
// }


// testing

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source:
    | "website"
    | "referral"
    | "social"
    | "advertisement"
    | "cold-call"
    | "other";
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "closed-won"
    | "closed-lost";
  priority: "low" | "medium" | "high";
  assignedTo: string;

  // Creator fields
  createdBy?: string | null;          // id of creator (from created_by)
  created_user_name?: string | null;  // human-readable name from JOIN

  estimatedValue: number;
  notes: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  expectedCloseDate?: Date | string | null;
  whatsappNumber?: string;
  service?:
    | "whatsapp-business-api"
    | "website-development"
    | "ai-agent"
    | "other";
}

// export interface Lead {
//   id: string
//   name: string
//   email: string
//   phone: string
//   company?: string
//   source:
//     | "website"
//     | "referral"
//     | "social"
//     | "advertisement"
//     | "cold-call"
//     | "other"
//   status:
//     | "new"
//     | "contacted"
//     | "qualified"
//     | "proposal"
//     | "negotiation"
//     | "closed-won"
//     | "closed-lost"
//   priority: "low" | "medium" | "high"
//   assignedTo: string
//   createdBy: string  // Add this field - stores who created the lead
//   estimatedValue: number
//   notes: string
//   createdAt: Date | string
//   updatedAt: Date | string
//   expectedCloseDate?: Date | string
//   whatsappNumber?: string
//   service?: "whatsapp-business-api" | "website-development" | "ai-agent" | "other"
// }
// Deals

export interface Deal {
  id: string
  title: string
  customerId: string
  value: number
  stage:
    | "prospecting"
    | "qualification"
    | "proposal"
    | "negotiation"
    | "closed-won"
    | "closed-lost"
  probability: number
  expectedCloseDate: Date | string
  actualCloseDate?: Date | string
  assignedTo: string
  products: string[]
  notes: string
  createdAt: Date | string
  updatedAt: Date | string
}

// Tasks

export interface Task {
  id: string
  title: string
  description: string
  type: "call" | "email" | "meeting" | "follow-up" | "demo" | "other"
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed" | "cancelled"
  assignedTo: string
  relatedTo: {
    type: "customer" | "lead" | "deal"
    id: string
  }
  dueDate: Date | string
  completedAt?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
}

// Invoices

export interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  customerId: string
  customerName?: string           // used in UI and context
  invoiceNumber: string
  amount: number                  // subtotal before tax
  tax: number
  discount?: number
  total?: number                  // optional, backend may calculate
  status: "draft" | "sent" | "pending" | "paid" | "overdue" | "cancelled"
  issueDate?: Date | string
  dueDate: Date | string
  paidDate?: Date | string
  items: InvoiceItem[]
  notes: string
  createdAt: Date | string
  updatedAt: Date | string
}

// Users

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "sales" | "support"
  avatar?: string
  isActive: boolean
  createdAt: Date | string
}

// Renewal reminders

export interface RenewalReminder {
  id: string
  customerId: string
  serviceType:
    | "whatsapp-panel"
    | "website"
    | "hosting"
    | "domain"
    | "other"
  serviceName: string
  expiryDate: Date | string
  reminderDays: number[]
  lastReminderSent?: Date | string
  status: "active" | "renewed" | "expired" | "cancelled"
  whatsappTemplate: string
  createdAt: Date | string
  updatedAt: Date | string
}

// Renewals

export interface Renewal {
  id: string
  customerId: string
  service: string
  amount: number
  expiryDate: string
  status: "active" | "expiring" | "expired" | "renewed"
  reminderDays?: number
  notes?: string
  createdAt: Date | string
  updatedAt: Date | string
}
