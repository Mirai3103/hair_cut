import apiClient from '@/lib/api'

interface FetchInvoicesParams {
  keyword?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export async function fetchInvoices({
  keyword = '',
  page = 1,
  size = 10,
  sortBy = 'id',
  sortDirection = 'desc',
  status,
  dateFrom,
  dateTo,
}: FetchInvoicesParams) {
  const params: Record<string, any> = {
    keyword,
    page,
    size,
    sortBy,
    sortDirection,
  }
  if (status) params.status = status
  if (dateFrom) params.dateFrom = dateFrom
  if (dateTo) params.dateTo = dateTo

  const response = await apiClient.get('/api/invoices', { params })
  return response.data as {
    data: Array<any>
    meta: { total: number; page: number; size: number }
  }
}

export async function getInvoiceById(id: string) {
  const response = await apiClient.get(`/api/invoices/${id}`)
  return response.data
}

export async function createInvoice(data: any) {
  const response = await apiClient.post('/api/invoices', data)
  return response.data
}

export async function deleteInvoice(id: string) {
  const response = await apiClient.delete(`/api/invoices/${id}`)
  return response.data
} 