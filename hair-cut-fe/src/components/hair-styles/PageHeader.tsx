import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  onAddHairStyle: () => void
}

export function PageHeader({ onAddHairStyle }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản lý kiểu tóc</h1>
        <p className="text-gray-600">Quản lý các kiểu tóc của salon</p>
      </div>
      <Button onClick={onAddHairStyle} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Thêm kiểu tóc
      </Button>
    </div>
  )
} 