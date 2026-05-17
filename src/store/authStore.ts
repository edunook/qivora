import { create } from 'zustand'
import axios from 'axios'
import { API_BASE_URL } from '../lib/api'

interface User {
  _id: string
  name: string
  email: string
  role: string
  token: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  message: string
  login: (userData: any) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  reset: () => void
}

// Get user from localStorage
const userStr = localStorage.getItem('user')
const user = userStr ? JSON.parse(userStr) : null

const API_URL = `${API_BASE_URL}/api/auth/`

export const useAuthStore = create<AuthState>((set) => ({
  user: user,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',

  login: async (userData) => {
    set({ isLoading: true })
    try {
      const response = await axios.post(API_URL + 'login', userData)
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
        set({ user: response.data, isSuccess: true, isLoading: false, isError: false })
      }
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString()
      set({ isError: true, message, isLoading: false, isSuccess: false })
    }
  },

  register: async (userData) => {
    set({ isLoading: true })
    try {
      const response = await axios.post(API_URL + 'register', userData)
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
        set({ user: response.data, isSuccess: true, isLoading: false, isError: false })
      }
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString()
      set({ isError: true, message, isLoading: false, isSuccess: false })
    }
  },

  logout: () => {
    localStorage.removeItem('user')
    set({ user: null })
  },

  reset: () => {
    set({ isError: false, isSuccess: false, isLoading: false, message: '' })
  },
}))
