import { z } from 'zod'
import dayjs from 'dayjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export const bookingFormSchema = z.object({
  customerPhone: z.string().regex(/^\d{10,11}$/, {
    message: 'Số điện thoại phải có 10 hoặc 11 chữ số',
  }),
  serviceIds: z.array(z.number()).min(1, {
    message: 'Vui lòng chọn ít nhất một dịch vụ',
  }),
  appointmentDatetime: z.date().refine((date) => dayjs(date).isAfter(dayjs()), {
    message: 'Thời gian đặt lịch phải lớn hơn thời gian hiện tại',
  }),
  notes: z.string().optional(),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>
export default function useBookingForm(
  defaultValues: Partial<BookingFormValues> = {},
) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerPhone: '',
      appointmentDatetime: dayjs().add(2, 'hour').toDate(),
      ...defaultValues,
    },
  })
  return form
}
