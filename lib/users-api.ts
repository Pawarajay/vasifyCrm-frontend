
import axiosClient from "./axios-client"

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role?: string
}

const usersApi = {
  list: () =>
    axiosClient.get("/auth/users").then((res) => res.data.users),

  create: (payload: CreateUserPayload) =>
    axiosClient.post("/auth/users", payload).then((res) => res.data.user),

  updateStatus: (id: string, isActive: boolean) =>
    axiosClient
      .put(`/auth/users/${id}/status`, { isActive })
      .then((res) => res.data),
}

export default usersApi
