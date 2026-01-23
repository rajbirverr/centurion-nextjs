'use client'

interface AccountTabsProps {
  activeTab: 'profile' | 'addresses' | 'orders' | 'settings'
  onTabChange: (tab: 'profile' | 'addresses' | 'orders' | 'settings') => void
}

export default function AccountTabs({ activeTab, onTabChange }: AccountTabsProps) {
  const tabs = [
    { id: 'profile' as const, label: 'Profile' },
    { id: 'addresses' as const, label: 'Addresses' },
    { id: 'orders' as const, label: 'Orders' },
    { id: 'settings' as const, label: 'Settings' },
  ]

  return (
    <div className="border-b border-[#e5e2e0] mb-6">
      <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-4 px-2 text-sm uppercase tracking-[0.1em] transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-[#5a4c46] text-[#5a4c46] font-medium'
                : 'text-[#84756f] hover:text-[#5a4c46] border-b-2 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}


