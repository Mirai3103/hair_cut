import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FiltersBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  
}

export function FiltersBar({ 
  searchQuery, 
  onSearchChange, 
 
}: FiltersBarProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo tên kiểu tóc..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      
      </div>
    </div>
  )
} 