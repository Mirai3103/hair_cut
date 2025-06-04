import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteHairStyle, type HairStyle } from '@/lib/api/hair-styles'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteHairStyleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  hairStyle: HairStyle | null
}

export function DeleteHairStyleDialog({ 
  isOpen, 
  onOpenChange, 
  hairStyle 
}: DeleteHairStyleDialogProps) {
  const queryClient = useQueryClient()

  const deleteHairStyleMutation = useMutation({
    mutationFn: (id: number) => deleteHairStyle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hair-styles'] })
      toast.success('Xóa kiểu tóc thành công!')
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa kiểu tóc')
    },
  })

  const handleDelete = () => {
    if (!hairStyle?.id) return
    deleteHairStyleMutation.mutate(hairStyle.id)
  }

  if (!hairStyle) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa kiểu tóc</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa kiểu tóc "{hairStyle.name}"? 
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteHairStyleMutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteHairStyleMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteHairStyleMutation.isPending ? 'Đang xóa...' : 'Xóa kiểu tóc'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 