'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCategory } from '@/lib/actions/categories'
import { Button } from './ui'

interface DeleteCategoryButtonProps {
  categoryId: string
  categoryName: string
}

export default function DeleteCategoryButton({ categoryId, categoryName }: DeleteCategoryButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setLoading(true)
    try {
      const result = await deleteCategory(categoryId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete category')
      }
    } catch (error: any) {
      console.error('Error deleting category:', error)
      alert(error.message || 'Failed to delete category')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Delete "{categoryName}"?</span>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          isLoading={loading}
        >
          Confirm
        </Button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 text-sm"
    >
      Delete
    </button>
  )
}

