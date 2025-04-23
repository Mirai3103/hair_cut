import { Outlet, createFileRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Menu, Scissors } from 'lucide-react'
import { useState } from 'react'
import TanstackQueryLayout from '../integrations/tanstack-query/layout'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { isAuth, user } = useAuth()
  const [authType, setAuthType] = useState<'login' | 'register'>('login')
  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Scissors />
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
            {isAuth && user ? (
              <Button
                variant="outline"
                className="hidden cursor-pointer md:flex border-blue-800 text-blue-800 hover:bg-blue-50"
                // todo: add link to profile page
              >
                {user.fullName || user.phone}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="hidden cursor-pointer md:flex border-blue-800 text-blue-800 hover:bg-blue-50"
                onClick={() => {
                  setAuthType('register')
                  setIsAuthModalOpen(true)
                }}
              >
                Đăng ký
              </Button>
            )}

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        setIsOpen={setIsAuthModalOpen}
        type={authType}
        setType={setAuthType}
      />
      <Outlet />
      <Toaster />

      <TanStackRouterDevtools />
      <TanstackQueryLayout />
      <footer className="border-t bg-muted">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="animate-fade-up animate-once animate-duration-700 animate-delay-100 animate-ease-in-out">
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="h-6 w-6" />
                <span className="text-xl font-bold">Tóc Đẹp</span>
              </div>
              <p className="text-muted-foreground">
                Dịch vụ tạo kiểu tóc chuyên nghiệp cho mọi loại tóc và phong
                cách.
              </p>
            </div>

            <div className="animate-fade-up animate-once animate-duration-700 animate-delay-200 animate-ease-in-out">
              <h3 className="font-medium mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#services"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Dịch vụ
                  </a>
                </li>
                <li>
                  <a
                    href="#stylists"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Thợ làm tóc
                  </a>
                </li>
                <li>
                  <a
                    href="#booking"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Đặt lịch
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Đánh giá
                  </a>
                </li>
              </ul>
            </div>

            <div className="animate-fade-up animate-once animate-duration-700 animate-delay-300 animate-ease-in-out">
              <h3 className="font-medium mb-4">Dịch vụ</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cắt tóc
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Nhuộm tóc
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Tạo kiểu
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Chăm sóc tóc
                  </a>
                </li>
              </ul>
            </div>

            <div className="animate-fade-up animate-once animate-duration-700 animate-delay-400 animate-ease-in-out">
              <h3 className="font-medium mb-4">Pháp lý</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Chính sách bảo mật
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Điều khoản dịch vụ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Chính sách cookie
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground animate-fade animate-once animate-duration-1000 animate-delay-500 animate-ease-in-out">
            <p>
              © {new Date().getFullYear()} Tóc Đẹp. Mọi quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
