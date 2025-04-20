import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Menu } from 'lucide-react'
import TanstackQueryLayout from '../integrations/tanstack-query/layout'
import type { QueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <a href="/" className="flex items-center">
              <img
                src="/placeholder.svg?height=50&width=150"
                alt="30Shine Logo"
                className="h-10 w-auto"
              />
            </a>
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="/"
                className="text-blue-900 font-medium hover:text-blue-700"
              >
                Trang chủ
              </a>
              <a
                href="/about"
                className="text-blue-900 font-medium hover:text-blue-700"
              >
                Về 30Shine
              </a>
              <a
                href="/shop"
                className="text-blue-900 font-medium hover:text-blue-700"
              >
                30Shine Shop
              </a>
              <a
                href="/locations"
                className="text-blue-900 font-medium hover:text-blue-700"
              >
                Tìm 30Shine gần nhất
              </a>
              <a
                href="/franchise"
                className="text-blue-900 font-medium hover:text-blue-700"
              >
                Nhượng quyền
              </a>
              <a
                href="/partners"
                className="text-blue-900 font-medium hover:text-blue-700"
              >
                Đối tác
              </a>
              <a
                href="/wedding"
                className="text-blue-900 font-medium hover:text-blue-700"
              >
                Nụ cười DV
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="hidden md:flex border-blue-800 text-blue-800 hover:bg-blue-50"
            >
              Đăng nhập
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <Outlet />
      <TanStackRouterDevtools />

      <TanstackQueryLayout />
    </div>
  ),
})
