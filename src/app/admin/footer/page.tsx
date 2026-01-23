import { getFooterDataForAdmin } from '@/lib/actions/footer'
import FooterManagement from '@/components/admin/FooterManagement'

export default async function FooterPage() {
  const footerData = await getFooterDataForAdmin()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#5a4c46]">Footer Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <FooterManagement initialData={footerData} />
      </div>
    </div>
  )
}
