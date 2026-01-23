import { getAllFilterConfigs } from '@/lib/actions/filter-config'
import FilterSettingsClient from './FilterSettingsClient'

export default async function FilterSettingsPage() {
  const filterConfigs = await getAllFilterConfigs()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#5a4c46]">Filter Settings</h1>
      <FilterSettingsClient initialConfigs={filterConfigs} />
    </div>
  )
}

