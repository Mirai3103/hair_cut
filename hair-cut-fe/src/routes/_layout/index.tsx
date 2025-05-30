import { Link, createFileRoute, useLoaderData } from '@tanstack/react-router'
import {
  ChevronRight,
  ChevronUp,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Star,
  Twitter,
} from 'lucide-react'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import serviceService from '@/services/service.service'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/_layout/')({
  loader: async () => {
    const data = await serviceService.queryServices({
      sortDirection: 'desc',
      sortBy: 'createdAt',
      size: 3,
      page: 1,
    })
    return data.data.data
  },

  component: RouteComponent,
})

function RouteComponent() {
  const [rating, setRating] = useState(1)
  const data = useLoaderData({
    from: '/_layout/',
  })
  const { user } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  React.useEffect(() => {
    if (user) {
      setPhoneNumber(user.phone)
    }
  }, [user])
  const handleBooking = () => {
    if (phoneNumber) {
    } else {
    }
  }
  return (
    <>
      <div className="relative w-full h-[400px] bg-blue-900">
        <img
          src="https://storage.30shine.com/banner/2025/20250103_banner_uongdinhhinh_w.png"
          alt="30Shine Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex items-center"></div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Form */}
          <div className="bg-blue-900 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-1">
              ĐẶT LỊCH GIỮ CHỖ CHỈ 30 GIÂY
            </h2>
            <p className="mb-4">Cắt xong trả tiền, hủy lịch không sao</p>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập SĐT để đặt lịch"
                className="bg-white text-gray-800"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
              />
              <Button
                className={cn(
                  'bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold whitespace-nowrap',
                  !phoneNumber && '!cursor-not-allowed',
                )}
                onClick={handleBooking}
                disabled={!phoneNumber}
                type="button"
                asChild
              >
                <Link
                  to="/booking"
                  search={{
                    phoneNumber: phoneNumber,
                  }}
                >
                  Đặt lịch ngay
                </Link>
              </Button>
            </div>
            <div className="mt-4">
              <Button
                className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold w-full"
                asChild
              >
                <Link to="/test-hair">
                  🎨 Thử mẫu tóc ảo - Xem trước kiểu tóc mới
                </Link>
              </Button>
            </div>
          </div>

          {/* Rating Section */}
          <div className="bg-white rounded-lg p-6 border">
            <h2 className="text-xl font-bold text-blue-900 mb-1">
              MỜI ANH ĐÁNH GIÁ CHẤT LƯỢNG PHỤC VỤ
            </h2>
            <p className="text-gray-600 mb-4">
              Phản hồi của anh sẽ giúp chúng em cải thiện chất lượng dịch vụ tốt
              hơn
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-blue-500 mr-3"></div>
          <div className="flex justify-between w-full">
            <h2 className="text-2xl font-bold text-blue-900">DỊCH VỤ TÓC</h2>

            <a
              href="/services/hair-cut"
              className="text-blue-500 flex items-center"
            >
              xem thêm <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {data.map((service) => (
            <div className="bg-white rounded-lg overflow-hidden shadow-sm group">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.bannerImageUrl}
                  alt="Cắt tóc"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl capitalize font-bold text-blue-900 mb-1">
                  {service.serviceName}
                </h3>

                <div className="flex justify-between items-center">
                  <Link
                    to={`/services/hair-cut/$id`}
                    params={{
                      id: service.id + '',
                    }}
                    className="text-blue-500 flex items-center"
                  >
                    Tìm hiểu thêm <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <Button
          size="icon"
          className="rounded-full bg-blue-900 hover:bg-blue-800 h-12 w-12 shadow-lg"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
        <Button
          size="icon"
          className="rounded-full bg-blue-900 hover:bg-blue-800 h-12 w-12 shadow-lg"
        >
          <Phone className="h-6 w-6" />
        </Button>
      </div>
      <section id="contact" className="container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="animate-fade-right animate-once animate-duration-1000 animate-ease-in-out">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Liên hệ với chúng tôi
            </h2>
            <p className="text-muted-foreground mb-8">
              Có câu hỏi hoặc cần hỗ trợ? Liên hệ với chúng tôi qua bất kỳ
              phương thức nào dưới đây.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Địa chỉ</h3>
                  <p className="text-muted-foreground">
                    123 Đường Tóc Đẹp, Quận 1
                    <br />
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Giờ mở cửa</h3>
                  <p className="text-muted-foreground">
                    Thứ Hai - Thứ Sáu: 9:00 - 20:00
                    <br />
                    Thứ Bảy: 9:00 - 18:00
                    <br />
                    Chủ Nhật: 10:00 - 17:00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Điện thoại</h3>
                  <p className="text-muted-foreground">(028) 1234-5678</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">info@tocdep.vn</p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-medium mb-3">Theo dõi chúng tôi</h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="bg-muted hover:bg-muted/80 p-2 rounded-full hover:animate-spin hover:animate-once hover:animate-duration-500"
                  >
                    <Instagram className="h-5 w-5" />
                    <span className="sr-only">Instagram</span>
                  </a>
                  <a
                    href="#"
                    className="bg-muted hover:bg-muted/80 p-2 rounded-full hover:animate-spin hover:animate-once hover:animate-duration-500"
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="sr-only">Facebook</span>
                  </a>
                  <a
                    href="#"
                    className="bg-muted hover:bg-muted/80 p-2 rounded-full hover:animate-spin hover:animate-once hover:animate-duration-500"
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[400px] rounded-lg overflow-hidden animate-fade-left animate-once animate-duration-1000 animate-ease-in-out">
            {/* This would be a map in a real implementation */}
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-primary animate-bounce animate-infinite animate-duration-[2000ms]" />
                <p className="text-lg font-medium">Vị trí bản đồ</p>
                <p className="text-muted-foreground">
                  Bản đồ tương tác sẽ được hiển thị tại đây
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
