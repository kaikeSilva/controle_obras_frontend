import type { Client, PaginatedResponse } from '@/types/client.types'
import api from './api'

export interface Cliente {
  id: number
  nome: string
}

export interface ClientesResponse {
  data: Cliente[]
}

interface GetClientsParams {
  page?: number;
  per_page?: number;
  filter?: Record<string, string>;
  sort_by?: string;
  direction?: 'asc' | 'desc';
}

export const clientsService = {
  async getClients(params: GetClientsParams = {}): Promise<PaginatedResponse<Client>> {
    try {
      const response = await api.get('/clients', { params })
      
      return response.data
    } catch (error) {
      console.error('Error fetching clients:', error)
      throw error
    }
  },
  
  async getClientById(id: number): Promise<Client> {
    try {
      const response = await api.get(`/clients/${id}`)
      
      // A API retorna os dados dentro de um objeto 'data'
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar cliente com ID ${id}:`, error)
      throw error
    }
  },
  
  async createClient(clientData: Partial<Client>): Promise<Client> {
    try {
      const response = await api.post('/clients', clientData)
      
      return response.data
    } catch (error) {
      console.error('Error creating client:', error)
      throw error
    }
  },
  
  async updateClient(id: number, clientData: Partial<Client>): Promise<Client> {
    try {
      const response = await api.put(`/clients/${id}`, clientData)
      
      // A API retorna os dados dentro de um objeto 'data'
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      return response.data
    } catch (error) {
      console.error(`Error updating client with ID ${id}:`, error)
      throw error
    }
  },
  
  async deleteClient(id: number): Promise<void> {
    try {
      await api.delete(`/clients/${id}`)
    } catch (error) {
      console.error(`Error deleting client with ID ${id}:`, error)
      throw error
    }
  },
  
  /**
   * Busca clientes para autocomplete
   */
  async getClientesAutocomplete(): Promise<Cliente[]> {
    try {
      const response = await api.get<ClientesResponse>('/autocomplete/clientes')
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar clientes para autocomplete:', error)
      return []
    }
  }
}
