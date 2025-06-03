
import api from './api'

export interface Issue {
  id: string
  description: string
  type_id: string
  sub_type_id: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  employee_name: string
  assigned_to_name?: string
  created_at: string
  updated_at: string
}

export interface CreateIssueData {
  description: string
  type_id: string
  sub_type_id: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export const issueService = {
  getIssues: (params?: any) => {
    return api.get('/issues', { params })
  },

  getIssue: (id: string) => {
    return api.get(`/issues/${id}`)
  },

  createIssue: (data: CreateIssueData) => {
    return api.post('/issues', data)
  },

  updateStatus: (id: string, status: string) => {
    return api.patch(`/issues/${id}/status`, { status })
  },

  assignIssue: (id: string, assignedTo: string) => {
    return api.patch(`/issues/${id}/assign`, { assignedTo })
  },

  addComment: (id: string, content: string) => {
    return api.post(`/issues/${id}/comments`, { content })
  }
}
