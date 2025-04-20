'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale' // Thêm locale tiếng Việt cho định dạng ngày

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  service: z.string({
    required_error: 'Vui lòng chọn một dịch vụ',
  }),
  stylist: z.string({
    required_error: 'Vui lòng chọn một thợ làm tóc',
  }),
  date: z.date({
    required_error: 'Vui lòng chọn một ngày',
  }),
  time: z.string({
    required_error: 'Vui lòng chọn một giờ',
  }),
  name: z.string().min(2, {
    message: 'Tên phải có ít nhất 2 ký tự',
  }),
  email: z.string().email({
    message: 'Vui lòng nhập địa chỉ email hợp lệ',
  }),
  phone: z.string().min(10, {
    message: 'Vui lòng nhập số điện thoại hợp lệ',
  }),
  notes: z.string().optional(),
})

export default function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Giả lập gọi API
    setTimeout(() => {
      console.log(values)
      setIsSubmitting(false)
      setIsSuccess(true)

      // Đặt lại biểu mẫu sau 3 giây
      setTimeout(() => {
        setIsSuccess(false)
        form.reset()
      }, 3000)
    }, 1500)
  }

  const availableTimes = [
    '9:00 Sáng',
    '9:30 Sáng',
    '10:00 Sáng',
    '10:30 Sáng',
    '11:00 Sáng',
    '11:30 Sáng',
    '12:00 Trưa',
    '12:30 Chiều',
    '1:00 Chiều',
    '1:30 Chiều',
    '2:00 Chiều',
    '2:30 Chiều',
    '3:00 Chiều',
    '3:30 Chiều',
    '4:00 Chiều',
    '4:30 Chiều',
    '5:00 Chiều',
    '5:30 Chiều',
    '6:00 Chiều',
    '6:30 Chiều',
    '7:00 Chiều',
  ]

  return (
    <div>
      {isSuccess ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">Đặt lịch thành công!</h3>
          <p className="text-muted-foreground">
            Cuộc hẹn của bạn đã được lên lịch. Chúng tôi đã gửi email xác nhận
            đến bạn.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dịch vụ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn một dịch vụ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="womens-haircut">
                          Cắt tóc nữ
                        </SelectItem>
                        <SelectItem value="mens-haircut">
                          Cắt tóc nam
                        </SelectItem>
                        <SelectItem value="color">Nhuộm toàn bộ</SelectItem>
                        <SelectItem value="highlights">
                          Nhuộm highlight
                        </SelectItem>
                        <SelectItem value="balayage">Nhuộm balayage</SelectItem>
                        <SelectItem value="blowout">Sấy tạo kiểu</SelectItem>
                        <SelectItem value="treatment">Chăm sóc tóc</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stylist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thợ làm tóc</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn một thợ làm tóc" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="emma">Emma Johnson</SelectItem>
                        <SelectItem value="michael">Michael Chen</SelectItem>
                        <SelectItem value="sophia">Sophia Rodriguez</SelectItem>
                        <SelectItem value="james">James Wilson</SelectItem>
                        <SelectItem value="any">
                          Bất kỳ thợ làm tóc nào còn trống
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: vi }) // Sử dụng locale tiếng Việt
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() ||
                            date >
                              new Date(
                                new Date().setMonth(new Date().getMonth() + 2),
                              )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn một giờ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ và tên của bạn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập email của bạn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập số điện thoại của bạn"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yêu cầu đặc biệt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Bất kỳ yêu cầu hoặc ghi chú đặc biệt nào cho thợ làm tóc"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Vui lòng cho chúng tôi biết nếu bạn có bất kỳ sở thích hoặc
                    mối quan ngại cụ thể nào.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Đang đặt lịch...' : 'Đặt lịch hẹn'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
