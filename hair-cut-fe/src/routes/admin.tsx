import { Outlet, createFileRoute } from '@tanstack/react-router'
import AdminLayout from '@/components/admin-layout'

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
