import axiosClient from "./axiosClient"

const authApi = {
  login: (email, password) =>
    axiosClient.post("/auth/login", { email, password }).then((res) => res.data),
  verify: () => axiosClient.get("/auth/verify").then((res) => res.data),
}

export default authApi
