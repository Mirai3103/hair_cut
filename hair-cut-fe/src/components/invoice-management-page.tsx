import React, { memo, useCallback, useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
  Trash,
  Check,
  X,
  Clock,
  Download,
} from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useDebounce } from 'react-use'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import CreateInvoiceModal from './invoice/CreateInvoiceModal'
import {
  fetchInvoices,
  getInvoiceById,
  deleteInvoice,
  changeInvoiceStatus,
  exportInvoicePdf,
} from '@/lib/api/invoices'
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
import { formatDate, formatDateTime, formatPrice } from '@/lib/formatters'
import { useAuth } from '@/contexts/AuthContext'

type InvoiceStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'in_progress'
  | 'completed'
  | 'success'

type InvoiceUser = {
  id: number
  fullName: string
  phone: string
  role: string
}

type InvoiceService = {
  id: number
  bookingId: number
  serviceId: number
  service: {
    serviceName: string
    price: number
  }
}

type InvoiceBooking = {
  id: number
  customerId: number
  customer: InvoiceUser
  employeeId: number | null
  employee: InvoiceUser | null
  appointmentDate: string
  status: InvoiceStatus
  totalPrice: number
  notes: string
  services: Array<InvoiceService>
}

type Invoice = {
  id: number
  bookingId: number
  invoiceDate: string
  totalAmount: number
  status: InvoiceStatus
  booking: InvoiceBooking
}

type FetchInvoicesParams = {
  keyword?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

const StatusBadge = memo(({ status }: { status: InvoiceStatus }) => {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Chờ thanh toán
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
          Đang xử lý
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
          Đã thanh toán
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
})

const InvoiceRow = memo(
  ({
    invoice,
    onView,
    onEdit,
    onDelete,
    onChangeStatus,
    onExportPdf,
    isBarber,
  }: {
    invoice: Invoice
    onView: (invoice: Invoice) => void
    onEdit: (invoice: Invoice) => void
    onDelete: (invoiceId: number) => void
    onChangeStatus: (invoiceId: string, status: string) => void
    onExportPdf: (invoiceId: string) => void
    isBarber: boolean
  }) => {
    return (
      <tr key={invoice.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          #{invoice.id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">
            {invoice.booking.customer.fullName}
          </div>
          <div className="text-sm text-gray-500">{invoice.booking.customer.phone}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(invoice.invoiceDate)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(invoice.booking.appointmentDate)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {invoice.booking.employee ? invoice.booking.employee.fullName : 'Chưa phân công'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {formatPrice(invoice.totalAmount)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge status={invoice.status} />
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
              <DropdownMenuItem onClick={() => onView(invoice)}>
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportPdf(invoice.id.toString())}>
                <Download className="h-4 w-4 mr-2" />
                Xuất hóa đơn
              </DropdownMenuItem>
              {!isBarber && (
                <DropdownMenuItem
                  onClick={() => onDelete(invoice.id)}
                  disabled={invoice.status !== 'cancelled'}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Xóa hóa đơn
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {invoice.status === 'pending' && (
                <DropdownMenuItem
                  onClick={() => onChangeStatus(invoice.id.toString(), 'confirmed')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Xác nhận hóa đơn
                </DropdownMenuItem>
              )}
              {(invoice.status === 'pending' || invoice.status === 'confirmed') && (
                <DropdownMenuItem
                  onClick={() => onChangeStatus(invoice.id.toString(), 'in_progress')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Bắt đầu thực hiện
                </DropdownMenuItem>
              )}
              {invoice.status === 'in_progress' && (
                <DropdownMenuItem
                  onClick={() => onChangeStatus(invoice.id.toString(), 'completed')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Hoàn thành
                </DropdownMenuItem>
              )}
              {invoice.status === 'completed' && (
                <DropdownMenuItem
                  onClick={() => onChangeStatus(invoice.id.toString(), 'success')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Đánh dấu thành công
                </DropdownMenuItem>
              )}
              {(invoice.status === 'pending' || invoice.status === 'confirmed') && (
                <DropdownMenuItem
                  onClick={() => onChangeStatus(invoice.id.toString(), 'cancelled')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy hóa đơn
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
    )
  },
)

export default function InvoiceManagement() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchParams, setSearchParams] = useState<FetchInvoicesParams>({
    keyword: '',
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDirection: 'desc',
    status: '',
    dateFrom: '',
    dateTo: '',
  })

  const { data: invoiceDetail } = useQuery({
    queryKey: ['invoices', currentInvoice?.id],
    queryFn: async () => getInvoiceById(currentInvoice!.id.toString()),
    enabled: !!currentInvoice?.id,
  })

  useDebounce(
    () => {
      setSearchParams({ ...searchParams, keyword: searchInput, page: 1 })
    },
    500,
    [searchInput],
  )

  useEffect(() => {
    setSearchParams((prev) => ({ ...prev, page: currentPage }))
  }, [currentPage])

  const { user } = useAuth()
  const isBarber = user?.role === 'barber'

  const {
    data = {
      invoices: [],
      total: 0,
      page: 1,
      size: 10,
    },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['invoices', searchParams],
    queryFn: async () => {
      return fetchInvoices({
        ...searchParams,
        status: searchParams.status === 'all' ? undefined : searchParams.status,
        dateFrom: searchParams.dateFrom
          ? dayjs(searchParams.dateFrom).startOf('day').toISOString()
          : undefined,
        dateTo: searchParams.dateTo
          ? dayjs(searchParams.dateTo).endOf('day').toISOString()
          : undefined,
      })
    },
    select: (data) => {
      return {
        invoices: data.data,
        total: data.meta.total || 1,
        page: data.meta.page || 1,
        size: data.meta.size || 10,
      }
    },
    staleTime: 30000,
  })

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value)
    },
    [],
  )

  const handleStatusChange = useCallback((value: string) => {
    setSearchParams((prev) => ({ ...prev, status: value, page: 1 }))
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

  const handleViewInvoice = useCallback((invoice: Invoice) => {
    setCurrentInvoice(invoice)
    setIsViewDialogOpen(true)
  }, [])

  const handleEditInvoice = useCallback((invoice: Invoice) => {
    setCurrentInvoice(invoice)
    setIsEditDialogOpen(true)
    toast.info('Chức năng chỉnh sửa đang được phát triển')
  }, [])

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteInvoice(id.toString())
    },
    onSuccess: () => {
      toast.success('Xóa hóa đơn thành công')
      refetch()
    },
    onError: () => {
      toast.error('Xóa hóa đơn thất bại')
    },
  })

  const changeStatusMutation = useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: string; status: string }) => {
      await changeInvoiceStatus(invoiceId, status)
    },
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công')
      refetch()
    },
    onError: () => {
      toast.error('Cập nhật trạng thái thất bại')
    },
  })

  const handleDeleteInvoice = useCallback((invoiceId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
      deleteMutation.mutate(invoiceId)
    }
  }, [deleteMutation])

  const handleCreateInvoice = useCallback(() => {
    setIsCreateDialogOpen(true)
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
      sortBy: 'id',
      sortDirection: 'desc',
      status: '',
      dateFrom: '',
      dateTo: '',
    })
  }, [])

  const totalPages = Math.ceil(data.total / searchParams.size!)

  const handleExportPdf = useCallback(async (invoiceId: string) => {
    try {
      await exportInvoicePdf(invoiceId)
      toast.success('Xuất hóa đơn PDF thành công')
    } catch (error) {
      toast.error('Xuất hóa đơn PDF thất bại')
    }
  }, [])

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Quản lý Hóa đơn
            </h1>
            <p className="text-gray-600">
              Quản lý tất cả các hóa đơn của khách hàng
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              onClick={handleCreateInvoice}
              hidden={isBarber}
            >
              <Plus size={16} />
              Tạo hóa đơn
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              onClick={resetFilters}
            >
              <RefreshCcw size={16} />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-[200px]">
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
            <div className="w-[200px]">
              <Select
                value={searchParams.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ thanh toán</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="in_progress">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="success">Đã thanh toán</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="w-[300px]">
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
            <div className="w-[200px] ml-2">
              <Select
                value={`${searchParams.sortBy}:${searchParams.sortDirection}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id:desc">Mới nhất</SelectItem>
                  <SelectItem value="id:asc">Cũ nhất</SelectItem>
                  <SelectItem value="invoiceDate:desc">
                    Ngày tạo: Giảm dần
                  </SelectItem>
                  <SelectItem value="invoiceDate:asc">
                    Ngày tạo: Tăng dần
                  </SelectItem>
                  <SelectItem value="totalAmount:desc">
                    Giá: Cao đến thấp
                  </SelectItem>
                  <SelectItem value="totalAmount:asc">
                    Giá: Thấp đến cao
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
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
                    Ngày tạo HĐ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày hẹn
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
                ) : data.invoices.length > 0 ? (
                  data.invoices.map((invoice) => (
                    <InvoiceRow
                      key={invoice.id}
                      invoice={invoice}
                      onView={handleViewInvoice}
                      onEdit={handleEditInvoice}
                      onDelete={handleDeleteInvoice}
                      onChangeStatus={(id, status) =>
                        changeStatusMutation.mutate({ invoiceId: id, status })
                      }
                      onExportPdf={handleExportPdf}
                      isBarber={isBarber}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Không tìm thấy hóa đơn nào
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
                  {data.total} hóa đơn
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

                if (currentPage > totalPages - 3 && totalPages > 5) {
                  pageNumber = totalPages - 4 + i
                } else if (currentPage > 3 && totalPages > 5) {
                  pageNumber = currentPage - 2 + i
                } else {
                  pageNumber = i + 1
                }

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

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Chi tiết hóa đơn #{currentInvoice?.id}
            </DialogTitle>
          </DialogHeader>
          {currentInvoice && (
            <div className="py-4">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Thông tin chung</TabsTrigger>
                  <TabsTrigger value="services">Dịch vụ</TabsTrigger>
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
                            {currentInvoice.booking.customer.fullName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {currentInvoice.booking.customer.phone}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Ngày tạo hóa đơn
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <p className="text-sm font-medium">
                            {formatDate(currentInvoice.invoiceDate)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(currentInvoice.invoiceDate)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Ngày hẹn
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <p className="text-sm font-medium">
                            {formatDate(currentInvoice.booking.appointmentDate)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(currentInvoice.booking.appointmentDate)}
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
                            {currentInvoice.booking.employee
                              ? currentInvoice.booking.employee.fullName
                              : 'Chưa phân công'}
                          </p>
                          {currentInvoice.booking.employee && (
                            <p className="text-sm text-gray-600">
                              {currentInvoice.booking.employee.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Trạng thái
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <StatusBadge status={currentInvoice.status} />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Tổng tiền
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <p className="text-lg font-bold text-blue-600">
                            {formatPrice(currentInvoice.totalAmount)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Ghi chú
                        </h3>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-600">
                            {currentInvoice.booking.notes || 'Không có ghi chú'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="services">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500">
                      Dịch vụ đã sử dụng
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
                          {invoiceDetail?.booking?.services?.map(
                            (service: any, index: number) => (
                              <tr key={service.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {service.service.serviceName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {formatPrice(service.service.price)}
                                </td>
                              </tr>
                            ),
                          )}
                          <tr className="bg-gray-50">
                            <td
                              colSpan={2}
                              className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                            >
                              Tổng cộng
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">
                              {formatPrice(currentInvoice.totalAmount)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
                if (currentInvoice) {
                  handleEditInvoice(currentInvoice)
                }
              }}
            >
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => refetch()}
      />
    </>
  )
} 