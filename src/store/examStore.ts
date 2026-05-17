import { create } from 'zustand'
import axios from 'axios'
import { useAuthStore } from './authStore'
import { API_BASE_URL } from '../lib/api'

interface Question {
  text: string
  options: string[]
  correctOption: number
  subject?: string
  explanation?: string
}

interface Exam {
  _id: string
  title: string
  description: string
  subject: string
  duration: number
  difficulty: string
  creator: {
    _id: string
    name: string
    username: string
    profilePicture: string
  }
  isPublic: boolean
  questions: Question[]
  attempts: number
  rating: number
  negativeMarking?: boolean
  negativeMarkValue?: number
  randomizeQuestions?: boolean
  resultsReleaseType?: string
  resultsReleaseDate?: string
  resultsReleased?: boolean
  createdAt: string
}

interface ExamState {
  exams: Exam[]
  currentExam: Exam | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  message: string
  createExam: (examData: any) => Promise<void>
  getPublicExams: (subject?: string) => Promise<void>
  getExamById: (id: string) => Promise<void>
  reset: () => void
}

const API_URL = `${API_BASE_URL}/api/exams/`

export const useExamStore = create<ExamState>((set) => ({
  exams: [],
  currentExam: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',

  createExam: async (examData) => {
    set({ isLoading: true })
    try {
      const token = useAuthStore.getState().user?.token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      
      const response = await axios.post(API_URL, examData, config)
      
      set((state) => ({ 
        exams: [response.data, ...state.exams],
        isSuccess: true, 
        isLoading: false, 
        isError: false 
      }))
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString()
      
      // Auto-logout on 401 (stale/invalid token)
      if (error.response && error.response.status === 401) {
        useAuthStore.getState().logout()
      }
      
      set({ isError: true, message, isLoading: false, isSuccess: false })
    }
  },

  getPublicExams: async (subject) => {
    set({ isLoading: true })
    try {
      const url = subject && subject !== 'All Subjects' 
        ? `${API_URL}public?subject=${subject}`
        : `${API_URL}public`
        
      const response = await axios.get(url)
      
      set({ exams: response.data, isLoading: false, isError: false })
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString()
      set({ isError: true, message, isLoading: false })
    }
  },

  getExamById: async (id) => {
    set({ isLoading: true })
    try {
      const response = await axios.get(`${API_URL}${id}`)
      set({ currentExam: response.data, isLoading: false, isError: false })
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString()
      set({ isError: true, message, isLoading: false })
    }
  },

  reset: () => {
    set({ isError: false, isSuccess: false, isLoading: false, message: '' })
  },
}))
