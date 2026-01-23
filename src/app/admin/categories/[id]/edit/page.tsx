import { notFound } from 'next/navigation'
import { getCategoryById, getSubcategoriesByCategoryId } from '@/lib/actions/categories'
import CategoryForm from '@/components/admin/CategoryForm'

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  const category = await getCategoryById(id)

  if (!category) {
    notFound()
  }

  const subcategories = await getSubcategoriesByCategoryId(id)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#5a4c46]">Edit Category</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <CategoryForm category={category} initialSubcategories={subcategories} />
      </div>
    </div>
  )
}

