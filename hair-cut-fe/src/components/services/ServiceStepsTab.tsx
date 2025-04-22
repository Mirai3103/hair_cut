// /src/routes/admin-services/components/edit/ServiceStepsTab.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Edit, ImageIcon, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Service, Step } from '@/types/service'
import { stepSchema } from '@/types/service'
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

interface ServiceStepsTabProps {
  service: Service
  serviceId: string
}

export function ServiceStepsTab({ service, serviceId }: ServiceStepsTabProps) {
  const queryClient = useQueryClient()
  const [steps, setSteps] = useState<Array<Step>>(service.steps || [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1)

  const form = useForm({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      stepOrder: steps.length + 1,
      stepTitle: '',
      stepDescription: '',
      stepImageUrl: '',
    },
  })

  const updateStepsMutation = useMutation({
    mutationFn: async (updatedSteps: Array<Step>) => {
      await Promise.resolve(updatedSteps)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] })
      toast('Cập nhật thành công', {
        description: 'Các bước thực hiện đã được cập nhật.',
      })
    },
    onError: (error) => {
      toast('Cập nhật thất bại', {
        description: error.message || 'Đã xảy ra lỗi khi cập nhật các bước.',
      })
    },
  })

  const openAddDialog = () => {
    form.reset({
      stepOrder: steps.length + 1,
      stepTitle: '',
      stepDescription: '',
      stepImageUrl: '',
    })
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (step: Step, index: number) => {
    setCurrentStep(step)
    setCurrentStepIndex(index)
    form.reset({
      stepOrder: step.stepOrder,
      stepTitle: step.stepTitle,
      stepDescription: step.stepDescription || '',
      stepImageUrl: step.stepImageUrl || '',
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (step: Step, index: number) => {
    setCurrentStep(step)
    setCurrentStepIndex(index)
    setIsDeleteDialogOpen(true)
  }

  const handleAddStep = (data: any) => {
    const newSteps = [...steps, data]
    // Sort steps by order
    newSteps.sort((a, b) => a.stepOrder - b.stepOrder)
    setSteps(newSteps)
    updateStepsMutation.mutate(newSteps)
    setIsAddDialogOpen(false)
  }

  const handleEditStep = (data: any) => {
    if (currentStepIndex === -1) return
    const newSteps = [...steps]
    newSteps[currentStepIndex] = data
    // Sort steps by order
    newSteps.sort((a, b) => a.stepOrder - b.stepOrder)
    setSteps(newSteps)
    updateStepsMutation.mutate(newSteps)
    setIsEditDialogOpen(false)
  }

  const handleDeleteStep = () => {
    if (currentStepIndex === -1) return
    const newSteps = steps.filter((_, index) => index !== currentStepIndex)
    // Reorder steps
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      stepOrder: index + 1,
    }))
    setSteps(reorderedSteps)
    updateStepsMutation.mutate(reorderedSteps)
    setIsDeleteDialogOpen(false)
  }

  const moveStepUp = (index: number) => {
    if (index <= 0) return
    const newSteps = [...steps]
    // Swap order numbers
    const temp = newSteps[index].stepOrder
    newSteps[index].stepOrder = newSteps[index - 1].stepOrder
    newSteps[index - 1].stepOrder = temp[
      // Swap positions
      (newSteps[index], newSteps[index - 1])
    ] = [newSteps[index - 1], newSteps[index]]
    setSteps(newSteps)
    updateStepsMutation.mutate(newSteps)
  }

  const moveStepDown = (index: number) => {
    if (index >= steps.length - 1) return
    const newSteps = [...steps]
    // Swap order numbers
    const temp = newSteps[index].stepOrder
    newSteps[index].stepOrder = newSteps[index + 1].stepOrder
    newSteps[index + 1].stepOrder = temp[
      // Swap positions
      (newSteps[index], newSteps[index + 1])
    ] = [newSteps[index + 1], newSteps[index]]
    setSteps(newSteps)
    updateStepsMutation.mutate(newSteps)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Các bước thực hiện dịch vụ</h3>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus size={16} />
          Thêm bước mới
        </Button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">
            Chưa có bước thực hiện nào được thêm
          </p>
          <Button
            variant="outline"
            onClick={openAddDialog}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus size={16} />
            Thêm bước đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-gray-50 flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base font-medium">
                  Bước {step.stepOrder}: {step.stepTitle}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStepUp(index)}
                    disabled={index === 0}
                    title="Di chuyển lên"
                  >
                    <ArrowUp size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStepDown(index)}
                    disabled={index === steps.length - 1}
                    title="Di chuyển xuống"
                  >
                    <ArrowDown size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {step.stepDescription && (
                  <p className="text-gray-700 mb-4">{step.stepDescription}</p>
                )}
                {step.stepImageUrl && (
                  <div className="mt-2 border rounded-md overflow-hidden max-h-48 bg-gray-50">
                    <img
                      src={step.stepImageUrl}
                      alt={step.stepTitle}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-end gap-2 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600"
                  onClick={() => openEditDialog(step, index)}
                >
                  <Edit size={16} className="mr-1" />
                  Sửa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => openDeleteDialog(step, index)}
                >
                  <Trash2 size={16} className="mr-1" />
                  Xóa
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Step Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm bước thực hiện mới</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddStep)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="stepOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự bước</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stepTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề bước</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stepDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả bước</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stepImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL hình ảnh minh họa</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={updateStepsMutation.isPending}>
                  Thêm bước
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Step Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bước thực hiện</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEditStep)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="stepOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự bước</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stepTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề bước</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stepDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả bước</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stepImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL hình ảnh minh họa</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={updateStepsMutation.isPending}>
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Step Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bước</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bước "{currentStep?.stepTitle}"? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStep}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa bước
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
