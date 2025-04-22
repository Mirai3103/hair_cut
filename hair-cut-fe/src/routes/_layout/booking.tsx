import { createFileRoute } from '@tanstack/react-router'

import { useState } from 'react'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import type { BookingFormValues } from '@/hooks/useBookingForm'
import useBookingForm from '@/hooks/useBookingForm'
import BookingForm from '@/components/booking-form'

export const Route = createFileRoute('/_layout/booking')({
  component: BookingPage,
})

export default function BookingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useBookingForm()

  const handleSubmit = async (values: BookingFormValues) => {
    setIsSubmitting(true)
    try {
      console.log('Booking submitted:', values)

      toast('Đặt lịch thành công!', {
        description: `Bạn đã đặt lịch vào lúc ${dayjs(values.appointmentDatetime).format('HH:mm DD/MM/YYYY')}`,
      })

      form.reset()
    } catch (error) {
      console.error('Error submitting booking:', error)
      toast('Đặt lịch thất bại', {
        description: 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <BookingForm form={form} onSubmit={handleSubmit} />
    </div>
  )
}
