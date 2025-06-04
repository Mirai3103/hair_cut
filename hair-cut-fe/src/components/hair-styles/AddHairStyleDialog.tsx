import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { createHairStyle } from '@/lib/api/hair-styles'
import { ImageUploader } from '@/components/ui/image-uploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const hairStyleSchema = z.object({
  name: z.string().min(1, 'Tên kiểu tóc là bắt buộc'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
})

type HairStyleFormData = z.infer<typeof hairStyleSchema>

interface AddHairStyleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AddHairStyleDialog({ isOpen, onOpenChange }: AddHairStyleDialogProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<HairStyleFormData>({
    resolver: zodResolver(hairStyleSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
    },
  })

  const createHairStyleMutation = useMutation({
    mutationFn: createHairStyle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hair-styles'] })
      toast.success('Tạo kiểu tóc thành công!')
      form.reset()
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo kiểu tóc')
    },
  })

  const onSubmit = (data: HairStyleFormData) => {
    createHairStyleMutation.mutate(data)
  }

  const handleImageUpload = (url: string) => {
    form.setValue('imageUrl', url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm kiểu tóc mới</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên kiểu tóc</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên kiểu tóc..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Nhập mô tả kiểu tóc..." 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình ảnh</FormLabel>
                  <FormControl>
                    <ImageUploader
                      onChange={(url) => field.onChange(url)}
                      imageUrl={field.value || ''}
                      id='2zmja'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={createHairStyleMutation.isPending || uploadingImage}
              >
                {createHairStyleMutation.isPending ? 'Đang tạo...' : 'Tạo kiểu tóc'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 