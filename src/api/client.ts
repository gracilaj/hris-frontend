import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'http://localhost:8080/api/v1'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}
