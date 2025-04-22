// /src/utils/formatters.ts
import dayjs from 'dayjs'

// Format price to VND
export function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price)
}

// Format date
export function formatDate(dateString: string) {
  return dayjs(dateString).format('DD/MM/YYYY HH:mm')
}
