import {
  BarChart3,
  Calendar,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Scissors,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface Props {
  open: boolean
  toggle: () => void
}

export default function Sidebar({ open, toggle }: Props) {
  return (
    <div
      className={`bg-blue-900 text-white ${open ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out flex flex-col`}
    >
      <div className="flex items-center justify-between p-4 border-b border-blue-800">
        <div className="flex items-center">
          <img
            src="/placeholder.svg?height=40&width=40"
            className="h-10 w-10"
          />
          {open && (
            <span className="ml-3 font-bold text-xl">30Shine Admin</span>
          )}
        </div>
        <button onClick={toggle} className="text-white hover:text-blue-200">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {[
            { href: '/admin', icon: <Home size={20} />, label: 'Dashboard' },
            {
              href: '/admin/appointments',
              icon: <Calendar size={20} />,
              label: 'Lịch hẹn',
            },
            {
              href: '/admin/services',
              icon: <Scissors size={20} />,
              label: 'Dịch vụ',
            },
            {
              href: '/admin/customers',
              icon: <Users size={20} />,
              label: 'Khách hàng',
            },
            {
              href: '/admin/staff',
              icon: <User size={20} />,
              label: 'Nhân viên',
            },
            {
              href: '/admin/reports',
              icon: <BarChart3 size={20} />,
              label: 'Báo cáo',
            },
            {
              href: '/admin/messages',
              icon: <MessageSquare size={20} />,
              label: 'Tin nhắn',
            },
            {
              href: '/admin/settings',
              icon: <Settings size={20} />,
              label: 'Cài đặt',
            },
          ].map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="flex items-center px-4 py-3 text-white rounded-lg hover:bg-blue-800"
              >
                {item.icon}
                {open && <span className="ml-3">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-800">
        <a
          href="/logout"
          className="flex items-center text-white hover:text-blue-200"
        >
          <LogOut size={20} />
          {open && <span className="ml-3">Đăng xuất</span>}
        </a>
      </div>
    </div>
  )
}
