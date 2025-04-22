import { useEffect, useState } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  PlusCircle,
  Scissors,
} from 'lucide-react'
import dayjs from 'dayjs'
import ServiceSelectionModal from './SelectServiceModal'
import type { BookingFormValues } from '@/hooks/useBookingForm'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatMinutes } from '@/lib/duration'

const SERVICES = [
  { id: 1, name: 'Cắt tóc nam', price: 100000, duration: 30, category: 'Nam' },
  { id: 2, name: 'Cắt tóc nữ', price: 150000, duration: 45, category: 'Nữ' },
  {
    id: 3,
    name: 'Uốn tóc',
    price: 300000,
    duration: 120,
    category: 'Tạo kiểu',
  },
  {
    id: 4,
    name: 'Nhuộm tóc',
    price: 400000,
    duration: 90,
    category: 'Màu sắc',
  },
  {
    id: 5,
    name: 'Gội đầu massage',
    price: 80000,
    duration: 30,
    category: 'Chăm sóc',
  },
  {
    id: 6,
    name: 'Duỗi tóc',
    price: 350000,
    duration: 150,
    category: 'Tạo kiểu',
  },
  {
    id: 7,
    name: 'Nối tóc',
    price: 500000,
    duration: 180,
    category: 'Tạo kiểu',
  },
  {
    id: 8,
    name: 'Tạo kiểu tóc cô dâu',
    price: 700000,
    duration: 120,
    category: 'Đặc biệt',
  },
  {
    id: 9,
    name: 'Cắt và tạo kiểu tóc trẻ em',
    price: 80000,
    duration: 25,
    category: 'Trẻ em',
  },
  {
    id: 10,
    name: 'Điều trị tóc hư tổn',
    price: 250000,
    duration: 60,
    category: 'Chăm sóc',
  },
]

interface BookingFormProps {
  form: UseFormReturn<BookingFormValues>
  onSubmit: (values: BookingFormValues) => void
}

const BookingForm: React.FC<BookingFormProps> = ({ form, onSubmit }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    form.getValues().appointmentDatetime,
  )
  const [timeSlots, setTimeSlots] = useState<Array<string>>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<Array<number>>(
    form.getValues().serviceIds,
  )
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)

  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate)
      setTimeSlots(slots)
      setSelectedTimeSlot(null)
    }
  }, [selectedDate])

  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number)
      const dateTime = dayjs(selectedDate)
        .hour(hours)
        .minute(minutes)
        .second(0)
        .toDate()

      form.setValue('appointmentDatetime', dateTime)
    }
  }, [selectedDate, selectedTimeSlot, form])

  const generateTimeSlots = (date: Date): Array<string> => {
    const slots = []
    const currentDate = dayjs()
    const selectedDay = dayjs(date)
    const isSameDay =
      currentDate.format('YYYY-MM-DD') === selectedDay.format('YYYY-MM-DD')

    let startMinutes = 7 * 60

    const endMinutes = 24 * 60

    if (isSameDay) {
      const currentHour = currentDate.hour()
      const currentMinute = currentDate.minute()
      const currentTotalMinutes = currentHour * 60 + currentMinute

      startMinutes = Math.ceil((currentTotalMinutes + 40) / 20) * 20
    }

    for (let minutes = startMinutes; minutes < endMinutes; minutes += 20) {
      const hour = Math.floor(minutes / 60)
      const minute = minutes % 60
      slots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      )
    }

    return slots
  }

  const handleServiceSelection = (serviceIds: Array<number>) => {
    setSelectedServices(serviceIds)
    form.setValue('serviceIds', serviceIds)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    return dayjs(date).format('DD/MM/YYYY')
  }

  const getServiceById = (id: number) => {
    return SERVICES.find((service) => service.id === id)
  }

  const calculateTotal = () => {
    let totalPrice = 0
    let totalDuration = 0

    selectedServices.forEach((serviceId) => {
      const service = getServiceById(serviceId)
      if (service) {
        totalPrice += service.price
        totalDuration += service.duration
      }
    })

    return { totalPrice, totalDuration }
  }

  const { totalPrice, totalDuration } = calculateTotal()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Đặt Lịch Cắt Tóc
        </CardTitle>
        <CardDescription>
          Đặt lịch cắt tóc của bạn theo các bước bên dưới
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="0123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceIds"
              render={() => (
                <FormItem>
                  <FormLabel>Dịch vụ</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full flex justify-between items-center h-10"
                        onClick={() => setIsServiceModalOpen(true)}
                      >
                        <span className="text-muted-foreground">
                          {selectedServices.length === 0
                            ? 'Chọn dịch vụ'
                            : `${selectedServices.length} dịch vụ đã chọn`}
                        </span>
                        <PlusCircle className="h-4 w-4" />
                      </Button>

                      {selectedServices.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedServices.map((serviceId) => {
                            const service = getServiceById(serviceId)
                            return service ? (
                              <Badge key={serviceId} variant="secondary">
                                {service.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointmentDatetime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Chọn ngày và giờ</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !selectedDate && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate
                              ? formatDate(selectedDate)
                              : 'Chọn ngày'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) =>
                            date < dayjs().startOf('day').toDate()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Select
                      disabled={!selectedDate || timeSlots.length === 0}
                      value={selectedTimeSlot || ''}
                      onValueChange={setSelectedTimeSlot}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn giờ">
                          {selectedTimeSlot ? (
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              {selectedTimeSlot}
                            </div>
                          ) : (
                            'Chọn giờ'
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.length > 0 ? (
                          timeSlots.map((timeSlot) => (
                            <SelectItem key={timeSlot} value={timeSlot}>
                              {timeSlot}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-slots" disabled>
                            Không có giờ trống
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú thêm về nhu cầu của bạn..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedServices.length > 0 && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="summary">
                  <AccordionTrigger className="font-medium">
                    Thông tin đặt lịch
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b">
                        <span>Dịch vụ đã chọn:</span>
                        <span>{selectedServices.length} dịch vụ</span>
                      </div>
                      {selectedServices.map((serviceId) => {
                        const service = getServiceById(serviceId)
                        return service ? (
                          <div
                            key={serviceId}
                            className="flex justify-between text-sm pl-2"
                          >
                            <span>{service.name}</span>
                            <span>{service.price.toLocaleString()}đ</span>
                          </div>
                        ) : null
                      })}
                      <div className="flex justify-between py-1 border-b">
                        <span>Thời gian dự kiến:</span>
                        <span>{formatMinutes(totalDuration)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-1">
                        <span>Tổng tiền:</span>
                        <span>{totalPrice.toLocaleString()}đ</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-blue-900 hover:bg-blue-800"
          onClick={form.handleSubmit(onSubmit)}
          disabled={
            form.formState.isSubmitting ||
            selectedServices.length === 0 ||
            !selectedTimeSlot
          }
        >
          {form.formState.isSubmitting ? 'Đang xử lý...' : 'Đặt lịch ngay'}
        </Button>
      </CardFooter>

      <ServiceSelectionModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        services={SERVICES}
        selectedServiceIds={selectedServices}
        onConfirm={handleServiceSelection}
      />
    </Card>
  )
}

export default BookingForm
