import React, { memo, useCallback, useEffect, useState } from 'react'

import {
  CalendarClock,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Search,
  X,
} from 'lucide-react'

import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'react-use'
import dayjs from 'dayjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchBookings } from '@/lib/api/bookings'
import { formatDate, formatDateTime, formatPrice } from '@/lib/formatters'

// Mock data for users (customers and employees)
const mockUsers = [
  { id: 1, fullName: 'Nguyễn Văn A', phone: '0987654321', role: 'customer' },
  { id: 2, fullName: 'Trần Thị B', phone: '0987654322', role: 'customer' },
  { id: 3, fullName: 'Lê Văn C', phone: '0987654323', role: 'customer' },
  { id: 4, fullName: 'Phạm Thị D', phone: '0987654324', role: 'customer' },
  { id: 5, fullName: 'Hoàng Văn E', phone: '0987654325', role: 'customer' },
  { id: 101, fullName: 'Stylist Minh', phone: '0901234567', role: 'employee' },
  { id: 102, fullName: 'Stylist Hùng', phone: '0901234568', role: 'employee' },
  { id: 103, fullName: 'Stylist Tuấn', phone: '0901234569', role: 'employee' },
  { id: 104, fullName: 'Stylist Dũng', phone: '0901234570', role: 'employee' },
]

type Status =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'in_progress'
  | 'completed'
  | 'success'

type BookingUser = {
  id: number
  fullName: string
  phone: string
  role: string
}

type BookingService = {
  id: number
  bookingId: number
  serviceId: number
  serviceName: string
  price: number
}

type Booking = {
  id: number
  customerId: number
  customer: BookingUser
  employeeId: number | null
  employee: BookingUser | null
  appointmentDate: string
  status: Status
  totalPrice: number
  notes: string
  createdAt: string
  updatedAt: string
  services: Array<BookingService>
}

type FetchBookingsParams = {
  keyword?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: string
  employeeId?: number
  status?: string
  dateFrom?: string
  dateTo?: string
}

// Memoized StatusBadge component
const StatusBadge = memo(({ status }: { status: Status }) => {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Chờ xác nhận
        </Badge>
      )
    case 'confirmed':
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Đã xác nhận
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Đã hủy
        </Badge>
      )
    case 'in_progress':
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          Đang thực hiện
        </Badge>
      )
    case 'completed':
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Hoàn thành
        </Badge>
      )
    case 'success':
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          Thành công
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
})

// Memoized BookingRow component
const BookingRow = memo(
  ({
    booking,
    onView,
    onEdit,
  }: {
    booking: Booking
    onView: (booking: Booking) => void
    onEdit: (booking: Booking) => void
  }) => {
    return (
      <tr key={booking.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          #{booking.id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">
            {booking.customer.fullName}
          </div>
          <div className="text-sm text-gray-500">{booking.customer.phone}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(booking.appointmentDate)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDateTime(booking.appointmentDate)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {booking.employee ? booking.employee.fullName : 'Chưa phân công'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {formatPrice(booking.totalPrice)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge status={booking.status} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(booking)}>
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(booking)}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {booking.status === 'pending' && (
                <DropdownMenuItem>
                  <Check className="h-4 w-4 mr-2" />
                  Xác nhận lịch hẹn
                </DropdownMenuItem>
              )}
              {(booking.status === 'pending' ||
                booking.status === 'confirmed') && (
                <DropdownMenuItem>
                  <Clock className="h-4 w-4 mr-2" />
                  Bắt đầu thực hiện
                </DropdownMenuItem>
              )}
              {booking.status === 'in_progress' && (
                <DropdownMenuItem>
                  <Check className="h-4 w-4 mr-2" />
                  Hoàn thành
                </DropdownMenuItem>
              )}
              {booking.status === 'completed' && (
                <DropdownMenuItem>
                  <Check className="h-4 w-4 mr-2" />
                  Đánh dấu thành công
                </DropdownMenuItem>
              )}
              {(booking.status === 'pending' ||
                booking.status === 'confirmed') && (
                <DropdownMenuItem>
                  <X className="h-4 w-4 mr-2" />
                  Hủy lịch hẹn
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
    )
  },
)

export default function AdminBookings() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchParams, setSearchParams] = useState<FetchBookingsParams>({
    keyword: '',
    page: 1,
    size: 10,
    sortBy: 'appointmentDate',
    sortDirection: 'asc',
    status: '',
    dateFrom: '',
    dateTo: '',
  })

  // Debounce the search input
  useDebounce(
    () => {
      setSearchParams({ ...searchParams, keyword: searchInput, page: 1 })
    },
    500,
    [searchInput],
  )

  // Update API request when page changes
  useEffect(() => {
    setSearchParams((prev) => ({ ...prev, page: currentPage }))
  }, [currentPage])

  const {
    data = {
      bookings: [],
      total: 0,
      page: 1,
      size: 10,
    },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['bookings', searchParams],
    queryFn: async () => {
      return fetchBookings({
        ...searchParams,
        status: searchParams.status == 'all' ? undefined : searchParams.status,
        employeeId:
          searchParams.employeeId == 0 || searchParams.employeeId == undefined
            ? undefined
            : Number(searchParams.employeeId),
        dateFrom: searchParams.dateFrom
          ? dayjs(searchParams.dateFrom).startOf('day').toISOString()
          : undefined,
        dateTo: searchParams.dateTo
          ? dayjs(searchParams.dateTo).endOf('day').toISOString()
          : undefined,
      })
    },
    select: (da) => {
      return {
        bookings: da.data,
        total: da.meta.total || 1,
        page: da.meta.page || 1,
        size: da.meta.size || 10,
      }
    },
    staleTime: 30000, // 30 seconds
  })

  const employees = mockUsers.filter((user) => user.role === 'employee')

  // Memoized handlers to prevent unnecessary re-renders
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value)
    },
    [],
  )

  const handleStatusChange = useCallback((value: string) => {
    setSearchParams((prev) => ({ ...prev, status: value, page: 1 }))
  }, [])

  const handleEmployeeChange = useCallback((value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      employeeId: value ? Number.parseInt(value) : undefined,
      page: 1,
    }))
  }, [])

  const handleDateFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchParams((prev) => ({
        ...prev,
        dateFrom: e.target.value,
        page: 1,
      }))
    },
    [],
  )

  const handleDateToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchParams((prev) => ({ ...prev, dateTo: e.target.value, page: 1 }))
    },
    [],
  )

  const handleSortChange = useCallback((value: string) => {
    const [sortBy, sortDirection] = value.split(':')
    setSearchParams((prev) => ({ ...prev, sortBy, sortDirection }))
  }, [])

  const handleViewBooking = useCallback((booking: Booking) => {
    setCurrentBooking(booking)
    setIsViewDialogOpen(true)
  }, [])

  const handleEditBooking = useCallback((booking: Booking) => {
    setCurrentBooking(booking)
    setIsEditDialogOpen(true)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const resetFilters = useCallback(() => {
    setSearchInput('')
    setCurrentPage(1)
    setSearchParams({
      keyword: '',
      page: 1,
      size: 10,
      sortBy: 'appointmentDate',
      sortDirection: 'asc',
      status: '',
      dateFrom: '',
      dateTo: '',
    })
  }, [])

  const totalPages = Math.ceil(data.total / searchParams.size!)

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Quản lý Lịch hẹn
            </h1>
            <p className="text-gray-600">
              Quản lý tất cả các lịch hẹn của khách hàng
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            onClick={resetFilters}
          >
            <RefreshCcw size={16} />
            Làm mới
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700 font-medium">Lọc:</span>
            </div>

            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, SĐT..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1 min-w-[200px]">
              <Select
                value={searchParams.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employee Filter */}
            <div className="flex-1 min-w-[200px]">
              <Select
                value={searchParams.employeeId?.toString() || ''}
                onValueChange={handleEmployeeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Tất cả nhân viên</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem
                      key={employee.id}
                      value={employee.id.toString()}
                    >
                      {employee.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="dateFrom" className="text-xs text-gray-500">
                    Từ ngày
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={searchParams.dateFrom}
                    onChange={handleDateFromChange}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="dateTo" className="text-xs text-gray-500">
                    Đến ngày
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={searchParams.dateTo}
                    onChange={handleDateToChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex-1 min-w-[200px] ml-2">
              <Select
                value={`${searchParams.sortBy}:${searchParams.sortDirection}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointmentDate:asc">
                    Ngày hẹn: Tăng dần
                  </SelectItem>
                  <SelectItem value="appointmentDate:desc">
                    Ngày hẹn: Giảm dần
                  </SelectItem>
                  <SelectItem value="id:desc">Mới nhất</SelectItem>
                  <SelectItem value="id:asc">Cũ nhất</SelectItem>
                  <SelectItem value="totalPrice:desc">
                    Giá: Cao đến thấp
                  </SelectItem>
                  <SelectItem value="totalPrice:asc">
                    Giá: Thấp đến cao
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày hẹn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giờ hẹn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : data.bookings.length > 0 ? (
                  data.bookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onView={handleViewBooking}
                      onEdit={handleEditBooking}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Không tìm thấy lịch hẹn nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {data.total > 0 && (
                <>
                  Hiển thị {(currentPage - 1) * searchParams.size! + 1} đến{' '}
                  {Math.min(currentPage * searchParams.size!, data.total)} của{' '}
                  {data.total} lịch hẹn
                </>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Dynamic pagination buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber

                // Handle case when current page is near the end
                if (currentPage > totalPages - 3 && totalPages > 5) {
                  pageNumber = totalPages - 4 + i
                }
                // Handle case when current page is in the middle
                else if (currentPage > 3 && totalPages > 5) {
                  pageNumber = currentPage - 2 + i
                }
                // Handle normal case (start from page 1)
                else {
                  pageNumber = i + 1
                }

                // Ensure pageNumber is always valid
                if (pageNumber > 0 && pageNumber <= totalPages) {
                  return (
                    <Button
                      key={pageNumber}
                      variant={
                        currentPage === pageNumber ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                }
                return null
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2 flex items-center">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Chi tiết lịch hẹn #{currentBooking?.id}</DialogTitle>
          </DialogHeader>
          {currentBooking && (
            <div className="py-4">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Thông tin chung</TabsTrigger>
                  <TabsTrigger value="services">Dịch vụ</TabsTrigger>
                  <TabsTrigger value="history">Lịch sử</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Thông tin khách hàng
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <p className="text-sm font-medium">
                            {currentBooking.customer.fullName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {currentBooking.customer.phone}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Thời gian hẹn
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md flex items-center">
                          <CalendarDays className="h-5 w-5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">
                              {formatDate(currentBooking.appointmentDate)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(currentBooking.appointmentDate)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Ghi chú
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-600">
                            {currentBooking.notes || 'Không có ghi chú'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Nhân viên phụ trách
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <p className="text-sm font-medium">
                            {currentBooking.employee
                              ? currentBooking.employee.fullName
                              : 'Chưa phân công'}
                          </p>
                          {currentBooking.employee && (
                            <p className="text-sm text-gray-600">
                              {currentBooking.employee.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Trạng thái
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <StatusBadge status={currentBooking.status} />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Tổng tiền
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <p className="text-lg font-bold text-blue-600">
                            {formatPrice(currentBooking.totalPrice)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Thời gian tạo
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md flex items-center">
                          <CalendarClock className="h-5 w-5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">
                              {formatDate(currentBooking.createdAt)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(currentBooking.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="services">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500">
                      Dịch vụ đã đặt
                    </h3>
                    <div className="bg-gray-50 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              STT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tên dịch vụ
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Giá
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentBooking.services.map((service, index) => (
                            <tr key={service.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {service.serviceName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatPrice(service.price)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50">
                            <td
                              colSpan={2}
                              className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                            >
                              Tổng cộng
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">
                              {formatPrice(currentBooking.totalPrice)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500">
                      Lịch sử thay đổi
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="space-y-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <CalendarDays className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium">Tạo lịch hẹn</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(currentBooking.createdAt)}{' '}
                              {formatDateTime(currentBooking.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <RefreshCcw className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium">
                              Cập nhật lịch hẹn
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(currentBooking.updatedAt)}{' '}
                              {formatDateTime(currentBooking.updatedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Simulated status changes */}
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium">
                              Thay đổi trạng thái:{' '}
                              <StatusBadge status={currentBooking.status} />
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(currentBooking.updatedAt)}{' '}
                              {formatDateTime(currentBooking.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Đóng
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                if (currentBooking) {
                  handleEditBooking(currentBooking)
                }
              }}
            >
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lịch hẹn #{currentBooking?.id}</DialogTitle>
          </DialogHeader>
          {currentBooking && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // Handle form submission here
                setIsEditDialogOpen(false)
                // Refresh data after update
                setTimeout(() => {
                  refetch()
                }, 300)
              }}
              className="grid gap-4 py-4"
            >
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="appointmentDate" className="text-right">
                  Ngày hẹn
                </Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  className="col-span-3"
                  defaultValue={
                    new Date(currentBooking.appointmentDate)
                      .toISOString()
                      .split('T')[0]
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="appointmentTime" className="text-right">
                  Giờ hẹn
                </Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  className="col-span-3"
                  defaultValue={new Date(currentBooking.appointmentDate)
                    .toTimeString()
                    .slice(0, 5)}
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employee" className="text-right">
                  Nhân viên
                </Label>
                <Select
                  defaultValue={currentBooking.employeeId?.toString() || ''}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Chưa phân công</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                      >
                        {employee.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Trạng thái
                </Label>
                <Select defaultValue={currentBooking.status}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xác nhận</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="success">Thành công</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Ghi chú
                </Label>
                <Textarea
                  id="notes"
                  className="col-span-3"
                  rows={3}
                  defaultValue={currentBooking.notes}
                />
              </div>

              <div className="col-span-full">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Dịch vụ đã đặt
                </h3>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="space-y-2">
                    {currentBooking.services.map((service, index) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">
                            {index + 1}.
                          </span>
                          <span className="text-sm font-medium">
                            {service.serviceName}
                          </span>
                        </div>
                        <span className="text-sm">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 flex justify-between">
                      <span className="font-medium">Tổng cộng</span>
                      <span className="font-bold text-blue-600">
                        {formatPrice(currentBooking.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">Lưu thay đổi</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
