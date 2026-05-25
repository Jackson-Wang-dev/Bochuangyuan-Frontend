import axios from 'axios'

export const apiClient = axios.create({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bcyToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bcyToken')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  },
)
