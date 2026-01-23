import CategoryForm from '@/components/admin/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#5a4c46]">Create New Category</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <CategoryForm />
      </div>
    </div>
  )
}

