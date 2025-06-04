import { createFileRoute } from '@tanstack/react-router'
import { AdminHairStylesPage } from '@/components/hair-styles/AdminHairStylesPage'

export const Route = createFileRoute('/admin/hair-styles/')({
  component: AdminHairStylesPage,
})

