import { createFileRoute } from '@tanstack/react-router'
import InvoiceManagement from '@/components/invoice-management-page'

export const Route = createFileRoute('/admin/invoices/')({
  component: InvoicesPage,
})

function InvoicesPage() {
  return <InvoiceManagement />
}
