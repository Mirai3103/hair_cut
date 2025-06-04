import apiClient from '@/lib/api'

export interface HairStyle {
  id: number
  name: string
  description?: string
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface HairStyleCreateData {
  name: string
  description?: string
  imageUrl?: string
}

export interface HairStyleUpdateData {
  name?: string
  description?: string
  imageUrl?: string
}

export interface FetchHairStylesParams {
  keyword?: string
  page?: number
  size?: number
  sortBy?: 'name' | 'createdAt'
  sortDirection?: 'asc' | 'desc'
}

export interface FetchHairStylesResponse {
  data: HairStyle[]
  meta: {
    total: number
    page: number
    size: number
  }
}

export async function fetchHairStyles(params?: FetchHairStylesParams): Promise<FetchHairStylesResponse> {
  const response = await apiClient.get('/api/hair-styles', { params })
  return response.data
}

export async function getHairStyleById(id: number | string): Promise<HairStyle> {
  const response = await apiClient.get(`/api/hair-styles/${id}`)
  return response.data
}

export async function createHairStyle(data: HairStyleCreateData): Promise<HairStyle> {
  const response = await apiClient.post('/api/hair-styles', data)
  return response.data
}

export async function updateHairStyle(id: number | string, data: HairStyleUpdateData): Promise<HairStyle> {
  const response = await apiClient.put(`/api/hair-styles/${id}`, data)
  return response.data
}

export async function deleteHairStyle(id: number | string): Promise<void> {
  await apiClient.delete(`/api/hair-styles/${id}`)
} 