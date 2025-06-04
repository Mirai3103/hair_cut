import { useQuery } from '@tanstack/react-query'
import { Edit, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'
import type { HairStyle } from '@/lib/api/hair-styles'
import { fetchHairStyles } from '@/lib/api/hair-styles'
import { Button } from '@/components/ui/button'

interface HairStylesListProps {
  searchQuery: string
  currentPage: number
  sortBy: string
  sortDirection: string
  onEdit: (hairStyle: HairStyle) => void
  onView: (hairStyle: HairStyle) => void
  onDelete: (hairStyle: HairStyle) => void
  onPageChange: (page: number) => void
}

export function HairStylesList({
  searchQuery,
  currentPage,
  sortBy,
  sortDirection,
  onEdit,
  onView,
  onDelete,
  onPageChange,
}: HairStylesListProps) {
  const { data: hairStylesData, isLoading } = useQuery({
    queryKey: ['hair-styles', { searchQuery, currentPage, sortBy, sortDirection }],
    queryFn: () => fetchHairStyles({
      keyword: searchQuery,
      page: currentPage,
      size: 10,
      sortBy: sortBy as 'name' | 'createdAt',
      sortDirection: sortDirection as 'asc' | 'desc',
    }),
  })

  const hairStyles = hairStylesData?.data || []
  const meta = hairStylesData?.meta

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A'
    return dayjs(date).format('DD/MM/YYYY')
  }

  const totalPages = meta ? Math.ceil(meta.total / meta.size) : 0

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center">Đang tải dữ liệu...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hình ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên kiểu tóc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
              
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hairStyles.map((hairStyle: HairStyle) => (
                <tr key={hairStyle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hairStyle.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-12 w-16 rounded overflow-hidden bg-gray-100">
                      <img
                        src={hairStyle.imageUrl || '/placeholder.svg'}
                        alt={hairStyle.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {hairStyle.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {hairStyle.description || 'Không có mô tả'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onView(hairStyle)}
                        className="text-green-600 hover:text-green-900"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onEdit(hairStyle)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(hairStyle)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {hairStyles.length === 0 && !isLoading && (
            <div className="p-8 text-center text-gray-500">
              Không tìm thấy kiểu tóc nào
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {meta && totalPages > 1 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị {((currentPage - 1) * meta.size) + 1} đến {Math.min(currentPage * meta.size, meta.total)} trong tổng số {meta.total} kết quả
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 