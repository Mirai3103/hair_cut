import apiClient from '@/lib/api'

interface HairStyle {
  id: number
  name: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

interface FetchHairStylesResponse {
  data: HairStyle[]
  meta?: {
    total: number
    page: number
    size: number
  }
}

export async function fetchHairStyles() {
  const response = await apiClient.get('/api/hair-styles')
  return response.data as FetchHairStylesResponse
}

export async function getHairStyleById(id: number) {
  const response = await apiClient.get(`/api/hair-styles/${id}`)
  return response.data as HairStyle
} 