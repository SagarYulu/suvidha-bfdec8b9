
export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface Issue {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  updatedAt: string
  assignedTo?: string
  reportedBy: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}
