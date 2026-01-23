'use client'

import { useState } from 'react'
import { ReturnsFAQ } from '@/lib/actions/returns'
import { Plus, Minus } from 'lucide-react'

export default function FAQAccordion({ items }: { items: ReturnsFAQ[] }) {
    const [openId, setOpenId] = useState<string | null>(null)

    const toggle = (id: string) => {
        setOpenId(openId === id ? null : id)
    }

    if (!items.length) {
        return (
            <p className="text-center text-gray-400 italic">No FAQs added yet.</p>
        )
    }

    return (
        <div className="border-t border-gray-200">
            {items.map((item) => {
                const isOpen = openId === item.id
                return (
                    <div key={item.id} className="border-b border-gray-200">
                        <button
                            onClick={() => toggle(item.id)}
                            className="w-full py-6 flex justify-between items-center text-left group hover:bg-gray-50 transition-colors px-2 rounded-sm"
                        >
                            <span className="font-bold text-gray-900 pr-8">{item.question}</span>
                            <span className="shrink-0 text-gray-400 group-hover:text-black transition-colors">
                                {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </span>
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out px-2 ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                        >
                            <p className="text-gray-600 font-light leading-relaxed">
                                {item.answer}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
