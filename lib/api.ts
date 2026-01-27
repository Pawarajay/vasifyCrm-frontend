const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://crm-api.vasifytech.com/api";
  // process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ msg: string; param: string }>;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
};

export const getAuthToken = (): string | null => {
  // Always sync from localStorage on client
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth_token");
    authToken = stored;
    return stored;
  }
  return authToken;
};

export const isAuthenticated = () => !!getAuthToken();

// API request wrapper
// async function apiRequest<T>(
//   endpoint: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const token = getAuthToken();

//   const config: RequestInit = {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {}),
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//   };

//   try {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(
//         errorData.error || errorData.message || `HTTP ${response.status}`,
//       );
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("API Request Error:", error);
//     throw error;
//   }
// }


async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // ✅ Log complete error details
      console.error("API Error Status:", response.status);
      console.error("API Error Data:", JSON.stringify(errorData, null, 2));
      console.error("API Error Details:", {
        error: errorData.error,
        message: errorData.message,
        errors: errorData.errors,
      });

      // Show all validation errors if they exist
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const validationErrors = errorData.errors
          .map((e: any) => `${e.param}: ${e.msg}`)
          .join(", ");
        throw new Error(`Validation failed: ${validationErrors}`);
      }

      throw new Error(
        errorData.error || errorData.message || `HTTP ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}


// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      token: string;
      user: any;
      message: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    const response = await apiRequest<{
      token: string;
      user: any;
      message: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  getProfile: async () => {
    return apiRequest<{ user: any }>("/auth/profile");
  },

  updateProfile: async (userData: any) => {
    return apiRequest<{ user: any; message: string }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest<{ message: string }>("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  logout: () => {
    setAuthToken(null);
  },

  verifyToken: async () => {
    return apiRequest<{ valid: boolean; user: any }>("/auth/verify");
  },
};

// Customers API
export const customersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    assignedTo?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return apiRequest<{ customers: any[]; pagination: any }>(
      `/customers${query ? `?${query}` : ""}`,
    );
  },

  getById: async (id: string) => {
    return apiRequest<{ customer: any; related: any }>(`/customers/${id}`);
  },

  create: async (customerData: any) => {
    return apiRequest<{ customer: any; message: string }>("/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  },

  update: async (id: string, customerData: any) => {
    return apiRequest<{ customer: any; message: string }>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/customers/${id}`, {
      method: "DELETE",
    });
  },

  // move customer back to lead
  moveToLead: async (id: string) => {
    return apiRequest<{ message: string; leadId: string }>(
      `/customers/${id}/move-to-lead`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
  },
};

// Leads API
export const leadsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    source?: string;
    assignedTo?: string;
    service?: string;
    createdBy?: string; // admin filter
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return apiRequest<{ leads: any[]; pagination: any }>(
      `/leads${query ? `?${query}` : ""}`,
    );
  },

  getById: async (id: string) => {
    return apiRequest<{ lead: any; related: any }>(`/leads/${id}`);
  },

  create: async (leadData: any) => {
    return apiRequest<{ lead: any; message: string }>("/leads", {
      method: "POST",
      body: JSON.stringify(leadData),
    });
  },

  update: async (id: string, leadData: any) => {
    return apiRequest<{ lead: any; message: string }>(`/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(leadData),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/leads/${id}`, {
      method: "DELETE",
    });
  },

  convertToCustomer: async (id: string, customerData?: any) => {
    return apiRequest<{ customer: any; message: string }>(
      `/leads/${id}/convert`,
      {
        method: "POST",
        body: JSON.stringify({ customerData }),
      },
    );
  },
};

// Deals API
export const dealsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    stage?: string;
    customerId?: string;
    assignedTo?: string;
    minValue?: number;
    maxValue?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return apiRequest<{ deals: any[]; pagination: any }>(
      `/deals${query ? `?${query}` : ""}`,
    );
  },

  getById: async (id: string) => {
    return apiRequest<{ deal: any; related: any }>(`/deals/${id}`);
  },

  create: async (dealData: any) => {
    return apiRequest<{ deal: any; message: string }>("/deals", {
      method: "POST",
      body: JSON.stringify(dealData),
    });
  },

  update: async (id: string, dealData: any) => {
    return apiRequest<{ deal: any; message: string }>(`/deals/${id}`, {
      method: "PUT",
      body: JSON.stringify(dealData),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/deals/${id}`, {
      method: "DELETE",
    });
  },

  getPipelineSummary: async () => {
    return apiRequest<{ pipeline: any[]; closed: any[] }>(
      "/deals/pipeline/summary",
    );
  },
};

// Tasks API
export const tasksApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    priority?: string;
    status?: string;
    assignedTo?: string;
    relatedType?: string;
    relatedId?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return apiRequest<{ tasks: any[]; pagination: any }>(
      `/tasks${query ? `?${query}` : ""}`,
    );
  },

  getById: async (id: string) => {
    return apiRequest<{ task: any }>(`/tasks/${id}`);
  },

  create: async (taskData: any) => {
    return apiRequest<{ task: any; message: string }>("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },

  update: async (id: string, taskData: any) => {
    return apiRequest<{ task: any; message: string }>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/tasks/${id}`, {
      method: "DELETE",
    });
  },

  getStats: async (assignedTo?: string) => {
    const query = assignedTo ? `?assignedTo=${assignedTo}` : "";
    return apiRequest<{
      statusBreakdown: any[];
      overdue: number;
      dueToday: number;
    }>(`/tasks/stats/overview${query}`);
  },
};

// Invoices API
export const invoicesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return apiRequest<{ invoices: any[]; pagination: any }>(
      `/invoices${query ? `?${query}` : ""}`,
    );
  },

  getById: async (id: string) => {
    return apiRequest<{ invoice: any }>(`/invoices/${id}`);
  },

  create: async (invoiceData: any) => {
    return apiRequest<{ invoice: any; message: string }>("/invoices", {
      method: "POST",
      body: JSON.stringify(invoiceData),
    });
  },

  update: async (id: string, invoiceData: any) => {
    return apiRequest<{ invoice: any; message: string }>(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(invoiceData),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/invoices/${id}`, {
      method: "DELETE",
    });
  },

  getStats: async () => {
    return apiRequest<{
      statusBreakdown: any[];
      monthlyTrend: any[];
      overdue: { count: number; total_amount: number };
    }>("/invoices/stats/overview");
  },
};

// Renewals API
export const renewalsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
    expiryDateFrom?: string;
    expiryDateTo?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return apiRequest<{ renewals: any[]; pagination: any }>(
      `/renewals${query ? `?${query}` : ""}`,
    );
  },

  getById: async (id: string) => {
    return apiRequest<{ renewal: any }>(`/renewals/${id}`);
  },

  create: async (renewalData: any) => {
    return apiRequest<{ renewal: any; message: string }>("/renewals", {
      method: "POST",
      body: JSON.stringify(renewalData),
    });
  },

  update: async (id: string, renewalData: any) => {
    return apiRequest<{ renewal: any; message: string }>(`/renewals/${id}`, {
      method: "PUT",
      body: JSON.stringify(renewalData),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/renewals/${id}`, {
      method: "DELETE",
    });
  },

  getReminders: async () => {
    return apiRequest<{ reminders: any[] }>("/renewals/reminders/list");
  },

  createReminder: async (reminderData: any) => {
    return apiRequest<{ reminder: any; message: string }>(
      "/renewals/reminders",
      {
        method: "POST",
        body: JSON.stringify(reminderData),
      },
    );
  },

  getStats: async () => {
    return apiRequest<{
      statusBreakdown: any[];
      expiryBreakdown: any[];
      monthlyRevenue: any[];
    }>("/renewals/stats/overview");
  },
};

//testing


//testing 30-12-2025

// const API_BASE_URL =
//   // process.env.NEXT_PUBLIC_API_URL || "https://vasify-crm-backend-2.onrender.com/api";
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// interface ApiResponse<T> {
//   data?: T;
//   message?: string;
//   error?: string;
//   errors?: Array<{ msg: string; param: string }>;
// }

// interface PaginatedResponse<T> {
//   data: T[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//     hasNext: boolean;
//     hasPrev: boolean;
//   };
// }

// // Auth token management
// let authToken: string | null = null;

// export const setAuthToken = (token: string | null) => {
//   authToken = token;
//   if (typeof window !== "undefined") {
//     if (token) {
//       localStorage.setItem("auth_token", token);
//     } else {
//       localStorage.removeItem("auth_token");
//     }
//   }
// };

// export const getAuthToken = (): string | null => {
//   // Always sync from localStorage on client
//   if (typeof window !== "undefined") {
//     const stored = localStorage.getItem("auth_token");
//     authToken = stored;
//     return stored;
//   }
//   return authToken;
// };

// export const isAuthenticated = () => !!getAuthToken();

// // API request wrapper
// async function apiRequest<T>(
//   endpoint: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const token = getAuthToken();

//   const config: RequestInit = {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {}),
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//   };

//   try {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(
//         errorData.error || errorData.message || `HTTP ${response.status}`,
//       );
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("API Request Error:", error);
//     throw error;
//   }
// }

// // Auth API
// export const authApi = {
//   login: async (email: string, password: string) => {
//     const response = await apiRequest<{
//       token: string;
//       user: any;
//       message: string;
//     }>("/auth/login", {
//       method: "POST",
//       body: JSON.stringify({ email, password }),
//     });

//     if (response.token) {
//       setAuthToken(response.token);
//     }

//     return response;
//   },

//   register: async (userData: {
//     name: string;
//     email: string;
//     password: string;
//     role?: string;
//   }) => {
//     const response = await apiRequest<{
//       token: string;
//       user: any;
//       message: string;
//     }>("/auth/register", {
//       method: "POST",
//       body: JSON.stringify(userData),
//     });

//     if (response.token) {
//       setAuthToken(response.token);
//     }

//     return response;
//   },

//   getProfile: async () => {
//     return apiRequest<{ user: any }>("/auth/profile");
//   },

//   updateProfile: async (userData: any) => {
//     return apiRequest<{ user: any; message: string }>("/auth/profile", {
//       method: "PUT",
//       body: JSON.stringify(userData),
//     });
//   },

//   changePassword: async (currentPassword: string, newPassword: string) => {
//     return apiRequest<{ message: string }>("/auth/change-password", {
//       method: "PUT",
//       body: JSON.stringify({ currentPassword, newPassword }),
//     });
//   },

//   logout: () => {
//     setAuthToken(null);
//   },

//   verifyToken: async () => {
//     return apiRequest<{ valid: boolean; user: any }>("/auth/verify");
//   },
// };

// // Customers API
// export const customersApi = {
//   getAll: async (params?: {
//     page?: number;
//     limit?: number;
//     search?: string;
//     status?: string;
//     assignedTo?: string;
//   }) => {
//     const searchParams = new URLSearchParams();
//     if (params) {
//       Object.entries(params).forEach(([key, value]) => {
//         if (value !== undefined && value !== null && value !== "") {
//           searchParams.append(key, String(value));
//         }
//       });
//     }

//     const query = searchParams.toString();
//     return apiRequest<{ customers: any[]; pagination: any }>(
//       `/customers${query ? `?${query}` : ""}`,
//     );
//   },

//   getById: async (id: string) => {
//     return apiRequest<{ customer: any; related: any }>(`/customers/${id}`);
//   },

// create: async (customerData: any) => {
//   return apiRequest<{ customer: any; message: string; invoice?: any }>("/customers", {
//     method: "POST",
//     body: JSON.stringify(customerData),
//   });
// },


//   update: async (id: string, customerData: any) => {
//     return apiRequest<{ customer: any; message: string }>(`/customers/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(customerData),
//     });
//   },

//   delete: async (id: string) => {
//     return apiRequest<{ message: string }>(`/customers/${id}`, {
//       method: "DELETE",
//     });
//   },

//   // move customer back to lead
//   moveToLead: async (id: string) => {
//     return apiRequest<{ message: string; leadId: string }>(
//       `/customers/${id}/move-to-lead`,
//       {
//         method: "POST",
//         body: JSON.stringify({}),
//       },
//     );
//   },
// };

// // Leads API
// export const leadsApi = {
//   getAll: async (params?: {
//     page?: number;
//     limit?: number;
//     search?: string;
//     status?: string;
//     priority?: string;
//     source?: string;
//     assignedTo?: string;
//     service?: string;
//     createdBy?: string; // admin filter
//   }) => {
//     const searchParams = new URLSearchParams();
//     if (params) {
//       Object.entries(params).forEach(([key, value]) => {
//         if (value !== undefined && value !== null && value !== "") {
//           searchParams.append(key, String(value));
//         }
//       });
//     }

//     const query = searchParams.toString();
//     return apiRequest<{ leads: any[]; pagination: any }>(
//       `/leads${query ? `?${query}` : ""}`,
//     );
//   },

//   getById: async (id: string) => {
//     return apiRequest<{ lead: any; related: any }>(`/leads/${id}`);
//   },

//   create: async (leadData: any) => {
//     return apiRequest<{ lead: any; message: string }>("/leads", {
//       method: "POST",
//       body: JSON.stringify(leadData),
//     });
//   },

//   update: async (id: string, leadData: any) => {
//     return apiRequest<{ lead: any; message: string }>(`/leads/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(leadData),
//     });
//   },

//   delete: async (id: string) => {
//     return apiRequest<{ message: string }>(`/leads/${id}`, {
//       method: "DELETE",
//     });
//   },

//   convertToCustomer: async (id: string, customerData?: any) => {
//     return apiRequest<{ customer: any; message: string }>(
//       `/leads/${id}/convert`,
//       {
//         method: "POST",
//         body: JSON.stringify({ customerData }),
//       },
//     );
//   },
// };

// // Deals API
// export const dealsApi = {
//   getAll: async (params?: {
//     page?: number;
//     limit?: number;
//     search?: string;
//     stage?: string;
//     customerId?: string;
//     assignedTo?: string;
//     minValue?: number;
//     maxValue?: number;
//   }) => {
//     const searchParams = new URLSearchParams();
//     if (params) {
//       Object.entries(params).forEach(([key, value]) => {
//         if (value !== undefined && value !== null && value !== "") {
//           searchParams.append(key, String(value));
//         }
//       });
//     }

//     const query = searchParams.toString();
//     return apiRequest<{ deals: any[]; pagination: any }>(
//       `/deals${query ? `?${query}` : ""}`,
//     );
//   },

//   getById: async (id: string) => {
//     return apiRequest<{ deal: any; related: any }>(`/deals/${id}`);
//   },

//   create: async (dealData: any) => {
//     return apiRequest<{ deal: any; message: string }>("/deals", {
//       method: "POST",
//       body: JSON.stringify(dealData),
//     });
//   },

//   update: async (id: string, dealData: any) => {
//     return apiRequest<{ deal: any; message: string }>(`/deals/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(dealData),
//     });
//   },

//   delete: async (id: string) => {
//     return apiRequest<{ message: string }>(`/deals/${id}`, {
//       method: "DELETE",
//     });
//   },

//   getPipelineSummary: async () => {
//     return apiRequest<{ pipeline: any[]; closed: any[] }>(
//       "/deals/pipeline/summary",
//     );
//   },
// };

// // Tasks API
// export const tasksApi = {
//   getAll: async (params?: {
//     page?: number;
//     limit?: number;
//     search?: string;
//     type?: string;
//     priority?: string;
//     status?: string;
//     assignedTo?: string;
//     relatedType?: string;
//     relatedId?: string;
//     dueDateFrom?: string;
//     dueDateTo?: string;
//   }) => {
//     const searchParams = new URLSearchParams();
//     if (params) {
//       Object.entries(params).forEach(([key, value]) => {
//         if (value !== undefined && value !== null && value !== "") {
//           searchParams.append(key, String(value));
//         }
//       });
//     }

//     const query = searchParams.toString();
//     return apiRequest<{ tasks: any[]; pagination: any }>(
//       `/tasks${query ? `?${query}` : ""}`,
//     );
//   },

//   getById: async (id: string) => {
//     return apiRequest<{ task: any }>(`/tasks/${id}`);
//   },

//   create: async (taskData: any) => {
//     return apiRequest<{ task: any; message: string }>("/tasks", {
//       method: "POST",
//       body: JSON.stringify(taskData),
//     });
//   },

//   update: async (id: string, taskData: any) => {
//     return apiRequest<{ task: any; message: string }>(`/tasks/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(taskData),
//     });
//   },

//   delete: async (id: string) => {
//     return apiRequest<{ message: string }>(`/tasks/${id}`, {
//       method: "DELETE",
//     });
//   },

//   getStats: async (assignedTo?: string) => {
//     const query = assignedTo ? `?assignedTo=${assignedTo}` : "";
//     return apiRequest<{
//       statusBreakdown: any[];
//       overdue: number;
//       dueToday: number;
//     }>(`/tasks/stats/overview${query}`);
//   },
// };

// // Invoices API
// export const invoicesApi = {
//   getAll: async (params?: {
//     page?: number;
//     limit?: number;
//     search?: string;
//     status?: string;
//     customerId?: string;
//     dueDateFrom?: string;
//     dueDateTo?: string;
//   }) => {
//     const searchParams = new URLSearchParams();
//     if (params) {
//       Object.entries(params).forEach(([key, value]) => {
//         if (value !== undefined && value !== null && value !== "") {
//           searchParams.append(key, String(value));
//         }
//       });
//     }

//     const query = searchParams.toString();
//     return apiRequest<{ invoices: any[]; pagination: any }>(
//       `/invoices${query ? `?${query}` : ""}`,
//     );
//   },

//   getById: async (id: string) => {
//     return apiRequest<{ invoice: any }>(`/invoices/${id}`);
//   },

//   create: async (invoiceData: any) => {
//     return apiRequest<{ invoice: any; message: string }>("/invoices", {
//       method: "POST",
//       body: JSON.stringify(invoiceData),
//     });
//   },

//   update: async (id: string, invoiceData: any) => {
//     return apiRequest<{ invoice: any; message: string }>(`/invoices/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(invoiceData),
//     });
//   },

//   delete: async (id: string) => {
//     return apiRequest<{ message: string }>(`/invoices/${id}`, {
//       method: "DELETE",
//     });
//   },

//   getStats: async () => {
//     return apiRequest<{
//       statusBreakdown: any[];
//       monthlyTrend: any[];
//       overdue: { count: number; total_amount: number };
//     }>("/invoices/stats/overview");
//   },
// };

// // Renewals API
// export const renewalsApi = {
//   getAll: async (params?: {
//     page?: number;
//     limit?: number;
//     search?: string;
//     status?: string;
//     customerId?: string;
//     expiryDateFrom?: string;
//     expiryDateTo?: string;
//   }) => {
//     const searchParams = new URLSearchParams();
//     if (params) {
//       Object.entries(params).forEach(([key, value]) => {
//         if (value !== undefined && value !== null && value !== "") {
//           searchParams.append(key, String(value));
//         }
//       });
//     }

//     const query = searchParams.toString();
//     return apiRequest<{ renewals: any[]; pagination: any }>(
//       `/renewals${query ? `?${query}` : ""}`,
//     );
//   },

//   getById: async (id: string) => {
//     return apiRequest<{ renewal: any }>(`/renewals/${id}`);
//   },

//   create: async (renewalData: any) => {
//     return apiRequest<{ renewal: any; message: string }>("/renewals", {
//       method: "POST",
//       body: JSON.stringify(renewalData),
//     });
//   },

//   update: async (id: string, renewalData: any) => {
//     return apiRequest<{ renewal: any; message: string }>(`/renewals/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(renewalData),
//     });
//   },

//   delete: async (id: string) => {
//     return apiRequest<{ message: string }>(`/renewals/${id}`, {
//       method: "DELETE",
//     });
//   },

//   getReminders: async () => {
//     return apiRequest<{ reminders: any[] }>("/renewals/reminders/list");
//   },

//   createReminder: async (reminderData: any) => {
//     return apiRequest<{ reminder: any; message: string }>(
//       "/renewals/reminders",
//       {
//         method: "POST",
//         body: JSON.stringify(reminderData),
//       },
//     );
//   },

//   getStats: async () => {
//     return apiRequest<{
//       statusBreakdown: any[];
//       expiryBreakdown: any[];
//       monthlyRevenue: any[];
//     }>("/renewals/stats/overview");
//   },
// };
