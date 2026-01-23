import { getHomepageSetsForAdmin } from '@/lib/actions/homepage-sets'
import HomepageSetsManagement from '@/components/admin/HomepageSetsManagement'

export default async function HomepageSetsPage() {
  const result = await getHomepageSetsForAdmin()

  if (!result.success || !result.data) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8 text-[#5a4c46]">Homepage Sets Section</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {result.error || 'Failed to load data'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#5a4c46]">Homepage Sets Section</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <HomepageSetsManagement initialData={result.data} />
      </div>
    </div>
  )
}
