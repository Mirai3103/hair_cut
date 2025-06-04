import { useState } from 'react'
import { HairStylesList } from './HairStylesList'
import { AddHairStyleDialog } from './AddHairStyleDialog'
import { EditHairStyleDialog } from './EditHairStyleDialog'
import { ViewHairStyleDialog } from './ViewHairStyleDialog'
import { DeleteHairStyleDialog } from './DeleteHairStyleDialog'
import { PageHeader } from './PageHeader'
import { FiltersBar } from './FiltersBar'
import type { HairStyle } from '@/lib/api/hair-styles'

export function AdminHairStylesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentHairStyle, setCurrentHairStyle] = useState<HairStyle | null>(null)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')

  const handleEditHairStyle = (hairStyle: HairStyle) => {
    setCurrentHairStyle(hairStyle)
    setIsEditDialogOpen(true)
  }

  const handleViewHairStyle = (hairStyle: HairStyle) => {
    setCurrentHairStyle(hairStyle)
    setIsViewDialogOpen(true)
  }

  const handleDeleteHairStyle = (hairStyle: HairStyle) => {
    setCurrentHairStyle(hairStyle)
    setIsDeleteDialogOpen(true)
  }


  return (
    <>
      <PageHeader onAddHairStyle={() => setIsAddDialogOpen(true)} />

      <FiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}

      />

      <HairStylesList
        searchQuery={searchQuery}
        currentPage={currentPage}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onEdit={handleEditHairStyle}
        onView={handleViewHairStyle}
        onDelete={handleDeleteHairStyle}
        onPageChange={setCurrentPage}
      />

      <AddHairStyleDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <EditHairStyleDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        hairStyle={currentHairStyle}
      />

      <ViewHairStyleDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        hairStyle={currentHairStyle}
      />

      <DeleteHairStyleDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        hairStyle={currentHairStyle}
      />
    </>
  )
} 