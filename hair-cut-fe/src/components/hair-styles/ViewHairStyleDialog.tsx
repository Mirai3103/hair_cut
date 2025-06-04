import dayjs from 'dayjs'
import { type HairStyle } from '@/lib/api/hair-styles'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ViewHairStyleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  hairStyle: HairStyle | null
}

export function ViewHairStyleDialog({ 
  isOpen, 
  onOpenChange, 
  hairStyle 
}: ViewHairStyleDialogProps) {
  if (!hairStyle) return null

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A'
    return dayjs(date).format('DD/MM/YYYY HH:mm')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chi tiết kiểu tóc</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          {hairStyle.imageUrl && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900">Hình ảnh</h3>
              <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={hairStyle.imageUrl}
                  alt={hairStyle.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900">ID</h3>
              <p className="text-sm text-gray-600">{hairStyle.id}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900">Tên kiểu tóc</h3>
              <p className="text-sm text-gray-600">{hairStyle.name}</p>
            </div>

            {hairStyle.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">Mô tả</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {hairStyle.description}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900">Ngày tạo</h3>
              <p className="text-sm text-gray-600">{formatDate(hairStyle.createdAt)}</p>
            </div>

            {hairStyle.updatedAt && hairStyle.updatedAt !== hairStyle.createdAt && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">Ngày cập nhật</h3>
                <p className="text-sm text-gray-600">{formatDate(hairStyle.updatedAt)}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 