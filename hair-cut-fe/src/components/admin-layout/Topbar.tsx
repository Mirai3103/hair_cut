import { Bell } from 'lucide-react'

export default function Topbar() {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center w-72"></div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-blue-600">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <div className="flex items-center">
            <img
              src="/placeholder.svg?height=40&width=40"
              className="h-8 w-8 rounded-full"
            />
            <div className="ml-2">
              <div className="text-sm font-medium text-gray-700">
                Admin User
              </div>
              <div className="text-xs text-gray-500">Quản trị viên</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
