import React, { memo, useCallback, useEffect, useState } from 'react'
import {
  CalendarIcon,
  FileText,
  Plus,
  Search,
  User,
  X,
} from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useDebounce } from 'react-use'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import AdminCreateBookingModal from '../booking/AdminCreateBookingModal'
import { createInvoice } from '@/lib/api/invoices'
import { fetchBookings } from '@/lib/api/bookings'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatDate, formatDateTime, formatPrice } from '@/lib/formatters'
import { fetchUsers } from '@/lib/api/users'
import serviceService from '@/services/service.service'

type InvoiceCreationType = 'existing' | 'new'

type BookingForInvoice = {
  id: number
  customer: {
    id: number
    fullName: string
    phone: string
  }
  employee: {
    id: number
    fullName: string
  } | null
  appointmentDate: string
  status: string
  totalPrice: number
  notes: string
  services: Array<{
    id: number
    service: {
      serviceName: string
      price: number
    }
  }>
}

const StatusBadge = memo(({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Chờ xác nhận
        </Badge>
      )
    case 'confirmed':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Đã xác nhận
        </Badge>
      )
    case 'in_progress':
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Đang thực hiện
        </Badge>
      )
    case 'completed':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Hoàn thành
        </Badge>
      )
    case 'success':
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          Thành công
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
})

const BookingRow = memo(
  ({
    booking,
    isSelected,
    onSelect,
  }: {
    booking: BookingForInvoice
    isSelected: boolean
    onSelect: (booking: BookingForInvoice) => void
  }) => {
    return (
      <TableRow 
        className={`cursor-pointer hover:bg-gray-50 ${
          isSelected ? 'bg-blue-50 border-blue-200' : ''
        }`}
        onClick={() => onSelect(booking)}
      >
        <TableCell className="w-4">
          <input
            type="radio"
            checked={isSelected}
            onChange={() => onSelect(booking)}
            className="text-blue-600"
          />
        </TableCell>
        <TableCell className="font-medium">#{booking.id}</TableCell>
        <TableCell>
          <div>
            <div className="font-medium">{booking.customer.fullName}</div>
            <div className="text-sm text-gray-500">{booking.customer.phone}</div>
          </div>
        </TableCell>
        <TableCell>
          <div>
            <div className="font-medium">{formatDate(booking.appointmentDate)}</div>
            <div className="text-sm text-gray-500">
              {dayjs(booking.appointmentDate).format('HH:mm')}
            </div>
          </div>
        </TableCell>
        <TableCell>
          {booking.employee ? booking.employee.fullName : 'Chưa phân công'}
        </TableCell>
        <TableCell>
          <StatusBadge status={booking.status} />
        </TableCell>
        <TableCell className="text-right font-medium">
          {formatPrice(booking.totalPrice)}
        </TableCell>
      </TableRow>
    )
  },
)

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [creationType, setCreationType] = useState<InvoiceCreationType>('existing')
  const [selectedBooking, setSelectedBooking] = useState<BookingForInvoice | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false)
  const [newlyCreatedBooking, setNewlyCreatedBooking] = useState<any>(null)
  const [bookingFilters, setBookingFilters] = useState({
    keyword: '',
    page: 1,
    size: 10,
    status: 'completed', // Only show completed bookings by default
  })

  useDebounce(
    () => {
      setBookingFilters(prev => ({ ...prev, keyword: searchInput, page: 1 }))
    },
    500,
    [searchInput],
  )

  // Fetch available bookings (completed ones without invoices)
  const { data: bookingsData, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['bookings-for-invoice', bookingFilters],
    queryFn: () => fetchBookings(bookingFilters),
    enabled: isOpen && creationType === 'existing',
    select: (data) => ({
      bookings: data.data,
      total: data.meta.total,
    }),
  })

  // Fetch services for new booking creation
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () =>
      serviceService.queryServices({
        sortBy: 'createdAt',
        sortDirection: 'desc',
        page: 1,
        size: 10000,
      }),
    select: (d) => d.data.data,
  })

  // Fetch employees for new booking creation
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () =>
      fetchUsers({
        role: ['barber' as any],
      }),
    select: (d) => d.data,
  })

  const { mutate: createInvoiceMutation, isPending: isCreatingInvoice } = useMutation({
    mutationFn: async (data: { bookingId?: number; booking?: any }) => {
      return createInvoice(data)
    },
    onSuccess: () => {
      toast.success('Tạo hóa đơn thành công!')
      onSuccess()
      onClose()
      resetForm()
    },
    onError: (error: any) => {
      toast.error('Tạo hóa đơn thất bại', {
        description: error?.response?.data?.error || 'Có lỗi xảy ra khi tạo hóa đơn'
      })
    },
  })

  const resetForm = useCallback(() => {
    setCreationType('existing')
    setSelectedBooking(null)
    setSearchInput('')
    setIsCreateBookingOpen(false)
    setNewlyCreatedBooking(null)
    setBookingFilters({
      keyword: '',
      page: 1,
      size: 10,
      status: 'completed',
    })
  }, [])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen, resetForm])

  const handleSelectBooking = useCallback((booking: BookingForInvoice) => {
    setSelectedBooking(booking)
  }, [])

  const handleCreateInvoice = useCallback(() => {
    if (creationType === 'existing' && selectedBooking) {
      createInvoiceMutation({ bookingId: selectedBooking.id })
    } else if (creationType === 'new') {
      if (newlyCreatedBooking) {
        // Use the newly created booking to create invoice
        createInvoiceMutation({ bookingId: newlyCreatedBooking.id })
      } else {
        // Open modal to create new booking
        setIsCreateBookingOpen(true)
      }
    }
  }, [creationType, selectedBooking, newlyCreatedBooking, createInvoiceMutation])

  const handleBookingCreated = useCallback((createdBookingData: any) => {
    console.log('Booking created with data:', createdBookingData)
    
    // Store the newly created booking data
    setNewlyCreatedBooking(createdBookingData)
    setIsCreateBookingOpen(false)
    
    toast.success('Lịch hẹn đã được tạo thành công!', {
      description: 'Bây giờ bạn có thể tạo hóa đơn từ lịch hẹn này.'
    })
  }, [])

  const handleStatusFilterChange = useCallback((value: string) => {
    setBookingFilters(prev => ({ ...prev, status: value, page: 1 }))
  }, [])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tạo hóa đơn mới
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Creation Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chọn phương thức tạo hóa đơn</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={creationType}
                  onValueChange={(value) => setCreationType(value as InvoiceCreationType)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing" className="cursor-pointer">
                      <div>
                        <div className="font-medium">Từ lịch hẹn có sẵn</div>
                        <div className="text-sm text-gray-500">
                          Chọn từ danh sách lịch hẹn đã hoàn thành
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="cursor-pointer">
                      <div>
                        <div className="font-medium">Tạo lịch hẹn mới</div>
                        <div className="text-sm text-gray-500">
                          Tạo lịch hẹn mới và tạo hóa đơn
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Existing Booking Selection */}
            {creationType === 'existing' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chọn lịch hẹn</CardTitle>
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Tìm kiếm theo tên, SĐT..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={bookingFilters.status}
                      onValueChange={handleStatusFilterChange}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="success">Thành công</SelectItem>
                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                        <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-4"></TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Khách hàng</TableHead>
                          <TableHead>Ngày hẹn</TableHead>
                          <TableHead>Nhân viên</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Tổng tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingBookings ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              <div className="flex justify-center">
                                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : bookingsData?.bookings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                              Không tìm thấy lịch hẹn nào
                            </TableCell>
                          </TableRow>
                        ) : (
                          bookingsData?.bookings.map((booking) => (
                            <BookingRow
                              key={booking.id}
                              booking={booking}
                              isSelected={selectedBooking?.id === booking.id}
                              onSelect={handleSelectBooking}
                            />
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Selected Booking Details */}
                  {selectedBooking && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium mb-2">Lịch hẹn đã chọn</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Khách hàng:</span>
                          <span className="ml-2 font-medium">{selectedBooking.customer.fullName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Ngày hẹn:</span>
                          <span className="ml-2 font-medium">
                            {formatDateTime(selectedBooking.appointmentDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Nhân viên:</span>
                          <span className="ml-2 font-medium">
                            {selectedBooking.employee?.fullName || 'Chưa phân công'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tổng tiền:</span>
                          <span className="ml-2 font-medium text-blue-600">
                            {formatPrice(selectedBooking.totalPrice)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Services */}
                      <div className="mt-3">
                        <span className="text-gray-600">Dịch vụ:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedBooking.services.map((service) => (
                            <Badge key={service.id} variant="secondary">
                              {service.service.serviceName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* New Booking Creation */}
            {creationType === 'new' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tạo lịch hẹn mới</CardTitle>
                </CardHeader>
                <CardContent>
                  {!newlyCreatedBooking ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">
                        Nhấn nút bên dưới để tạo lịch hẹn mới
                      </p>
                      <Button
                        onClick={() => setIsCreateBookingOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo lịch hẹn mới
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium mb-2 text-green-800">✓ Lịch hẹn đã được tạo thành công</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">ID lịch hẹn:</span>
                            <span className="ml-2 font-medium">#{newlyCreatedBooking.id}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Khách hàng:</span>
                            <span className="ml-2 font-medium">{newlyCreatedBooking.customer.fullName || 'Khách hàng mới'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Ngày hẹn:</span>
                            <span className="ml-2 font-medium">
                              {formatDateTime(newlyCreatedBooking.appointmentDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tổng tiền:</span>
                            <span className="ml-2 font-medium text-green-600">
                              {formatPrice(newlyCreatedBooking.totalPrice)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Services */}
                        {newlyCreatedBooking.services && newlyCreatedBooking.services.length > 0 && (
                          <div className="mt-3">
                            <span className="text-gray-600">Dịch vụ:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {newlyCreatedBooking.services.map((service: any) => (
                                <Badge key={service.id} variant="secondary">
                                  {service.service?.serviceName || service.serviceName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setNewlyCreatedBooking(null)}
                          className="flex-1"
                        >
                          Tạo lịch hẹn khác
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="flex justify-between gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={
                isCreatingInvoice ||
                (creationType === 'existing' && !selectedBooking) ||
                (creationType === 'new' && !newlyCreatedBooking)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreatingInvoice ? 'Đang tạo...' : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  {creationType === 'new' && !newlyCreatedBooking ? 'Tạo lịch hẹn trước' : 'Tạo hóa đơn'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Booking Modal */}
      <AdminCreateBookingModal
        allowPastHours={true}
        isOpen={isCreateBookingOpen}
        onClose={() => setIsCreateBookingOpen(false)}
        onSuccess={handleBookingCreated}
        services={services || []}
        employees={employees || []}
      />
    </>
  )
}

export default CreateInvoiceModal 