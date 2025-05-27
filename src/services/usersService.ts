import type { User, PaginatedResponse } from '@/types/user.types'
import api from './api'

interface GetUsersParams {
  page?: number;
  per_page?: number;
  filter?: Record<string, string>;
  sort_by?: string;
  direction?: 'asc' | 'desc';
}

export const usersService = {
  async getUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
    try {
      const response = await api.get('/users', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },
  
  async getUserById(id: number): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`)
      
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar usuário com ID ${id}:`, error)
      throw error
    }
  },
  
  async createUser(userData: Partial<User> & { password: string }): Promise<User> {
    try {
      const response = await api.post('/users', userData)
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },
  
  async updateUser(id: number, userData: Partial<User> & { password?: string }): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, userData)
      
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      return response.data
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error)
      throw error
    }
  },
  
  async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/users/${id}`)
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error)
      throw error
    }
  }
}
