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

export async function changeInvoiceStatus(id: string, status: string) {
  const response = await apiClient.patch(`/api/invoices/${id}/status`, { status })
  return response.data
}

export async function exportInvoicePdf(id: string) {
  const response = await apiClient.get(`/api/invoices/${id}/pdf`, {
    responseType: 'blob'
  })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `hoa-don-${id}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
} 