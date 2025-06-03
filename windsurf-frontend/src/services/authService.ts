
import api from './api'

export const authService = {
  login: (email: string, password: string) => {
    return api.post('/auth/login', { email, password })
  },

  getProfile: () => {
    return api.get('/users/profile')
  }
}
