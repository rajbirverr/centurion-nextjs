'use client'

import { useState, useEffect } from 'react'
import { ReturnsPageSettings, ReturnsFAQ, getReturnsSettings, getReturnsFAQs, updateReturnsSettings, createFAQ, updateFAQ, deleteFAQ } from '@/lib/actions/returns'
import { useRouter } from 'next/navigation'

export default function AdminReturnsPage() {
    const router = useRouter()
    const [settings, setSettings] = useState<ReturnsPageSettings | null>(null)
    const [faqs, setFaqs] = useState<ReturnsFAQ[]>([])
    const [activeTab, setActiveTab] = useState<'settings' | 'faqs'>('settings')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // FAQ Edit State
    const [editingFaq, setEditingFaq] = useState<ReturnsFAQ | null>(null)
    const [newFaq, setNewFaq] = useState({ question: '', answer: '', sort_order: 0 })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const [s, f] = await Promise.all([getReturnsSettings(), getReturnsFAQs()])
        setSettings(s || {
            id: '',
            hero_title: 'Centurion Returns',
            hero_subtitle: '',
            hero_image_url: '',
            step_1_title: 'Start', step_1_desc: '',
            step_2_title: 'Label', step_2_desc: '',
            step_3_title: 'Ship', step_3_desc: '',
            policy_html: '',
            start_return_url: '#'
        })
        setFaqs(f)
        setLoading(false)
    }

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!settings) return
        setSaving(true)
        const res = await updateReturnsSettings(settings)
        setSaving(false)
        if (res.success) alert('Settings saved!')
        else alert('Error saving: ' + res.error)
    }

    const handleCreateFaq = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const res = await createFAQ(newFaq)
        setSaving(false)
        if (res.success) {
            setNewFaq({ question: '', answer: '', sort_order: 0 })
            loadData()
        } else alert('Error: ' + res.error)
    }

    const handleUpdateFaq = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingFaq) return
        setSaving(true)
        const res = await updateFAQ(editingFaq.id, editingFaq)
        setSaving(false)
        if (res.success) {
            setEditingFaq(null)
            loadData()
        } else alert('Error: ' + res.error)
    }

    const handleDeleteFaq = async (id: string) => {
        if (!confirm('Delete this FAQ?')) return
        const res = await deleteFAQ(id)
        if (res.success) loadData()
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-serif mb-8">Returns Page Manager</h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-8">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider ${activeTab === 'settings' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
                >
                    General Settings
                </button>
                <button
                    onClick={() => setActiveTab('faqs')}
                    className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider ${activeTab === 'faqs' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
                >
                    FAQs
                </button>
            </div>

            {/* General Settings Form */}
            {activeTab === 'settings' && settings && (
                <form onSubmit={handleSaveSettings} className="space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-100">

                    {/* Hero */}
                    <section className="space-y-4">
                        <h3 className="font-bold border-b pb-2">Hero Section</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-xs font-bold text-gray-500 uppercase">Page Title</span>
                                <input className="w-full mt-1 border p-2 rounded" value={settings.hero_title} onChange={e => setSettings({ ...settings, hero_title: e.target.value })} />
                            </label>
                            <label className="block">
                                <span className="text-xs font-bold text-gray-500 uppercase">Button Link (URL)</span>
                                <input className="w-full mt-1 border p-2 rounded" value={settings.start_return_url} onChange={e => setSettings({ ...settings, start_return_url: e.target.value })} />
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-xs font-bold text-gray-500 uppercase">Subtitle / Intro</span>
                            <textarea className="w-full mt-1 border p-2 rounded h-20" value={settings.hero_subtitle} onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })} />
                        </label>
                        <label className="block">
                            <span className="text-xs font-bold text-gray-500 uppercase">Hero Background Image URL</span>
                            <input className="w-full mt-1 border p-2 rounded" value={settings.hero_image_url || ''} onChange={e => setSettings({ ...settings, hero_image_url: e.target.value })} />
                        </label>
                    </section>

                    {/* Steps */}
                    <section className="space-y-4 bg-gray-50 p-4 rounded">
                        <h3 className="font-bold border-b pb-2">Step 1</h3>
                        <input className="w-full border p-2 mb-2" value={settings.step_1_title} onChange={e => setSettings({ ...settings, step_1_title: e.target.value })} placeholder="Title" />
                        <textarea className="w-full border p-2" value={settings.step_1_desc} onChange={e => setSettings({ ...settings, step_1_desc: e.target.value })} placeholder="Description" />
                    </section>
                    <section className="space-y-4 bg-gray-50 p-4 rounded">
                        <h3 className="font-bold border-b pb-2">Step 2</h3>
                        <input className="w-full border p-2 mb-2" value={settings.step_2_title} onChange={e => setSettings({ ...settings, step_2_title: e.target.value })} placeholder="Title" />
                        <textarea className="w-full border p-2" value={settings.step_2_desc} onChange={e => setSettings({ ...settings, step_2_desc: e.target.value })} placeholder="Description" />
                    </section>
                    <section className="space-y-4 bg-gray-50 p-4 rounded">
                        <h3 className="font-bold border-b pb-2">Step 3</h3>
                        <input className="w-full border p-2 mb-2" value={settings.step_3_title} onChange={e => setSettings({ ...settings, step_3_title: e.target.value })} placeholder="Title" />
                        <textarea className="w-full border p-2" value={settings.step_3_desc} onChange={e => setSettings({ ...settings, step_3_desc: e.target.value })} placeholder="Description" />
                    </section>

                    {/* Policy */}
                    <section className="space-y-4">
                        <h3 className="font-bold border-b pb-2">Return Policy (HTML)</h3>
                        <textarea
                            className="w-full mt-1 border p-2 rounded h-64 font-mono text-sm"
                            value={settings.policy_html}
                            onChange={e => setSettings({ ...settings, policy_html: e.target.value })}
                            placeholder="<p>Enter your policy text here...</p>"
                        />
                        <p className="text-xs text-gray-500">Supports basic HTML tags like &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;.</p>
                    </section>

                    <button disabled={saving} type="submit" className="bg-black text-white px-8 py-3 rounded text-sm font-bold uppercase hover:bg-gray-800 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            )}

            {/* FAQs Manager */}
            {activeTab === 'faqs' && (
                <div className="space-y-12">
                    <form onSubmit={handleCreateFaq} className="bg-gray-50 p-6 rounded border border-gray-200">
                        <h3 className="font-bold mb-4">Add New FAQ</h3>
                        <div className="space-y-4">
                            <input className="w-full border p-2 rounded" placeholder="Question" value={newFaq.question} onChange={e => setNewFaq({ ...newFaq, question: e.target.value })} required />
                            <textarea className="w-full border p-2 rounded h-24" placeholder="Answer" value={newFaq.answer} onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })} required />
                            <input type="number" className="w-24 border p-2 rounded" placeholder="Sort Order" value={newFaq.sort_order} onChange={e => setNewFaq({ ...newFaq, sort_order: parseInt(e.target.value) })} />
                            <button disabled={saving} type="submit" className="bg-black text-white px-6 py-2 rounded text-xs font-bold uppercase">Add FAQ</button>
                        </div>
                    </form>

                    <div className="space-y-4">
                        {faqs.map(faq => (
                            <div key={faq.id} className="border p-4 rounded bg-white shadow-sm flex justify-between items-start gap-4">
                                {editingFaq?.id === faq.id ? (
                                    <form onSubmit={handleUpdateFaq} className="w-full space-y-2">
                                        <input className="w-full border p-2" value={editingFaq.question} onChange={e => setEditingFaq({ ...editingFaq, question: e.target.value })} />
                                        <textarea className="w-full border p-2" value={editingFaq.answer} onChange={e => setEditingFaq({ ...editingFaq, answer: e.target.value })} />
                                        <div className="flex gap-2">
                                            <button type="submit" className="text-xs bg-green-600 text-white px-3 py-1 rounded">Save</button>
                                            <button type="button" onClick={() => setEditingFaq(null)} className="text-xs bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div>
                                            <h4 className="font-bold">{faq.question}</h4>
                                            <p className="text-gray-600 text-sm mt-1">{faq.answer}</p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => setEditingFaq(faq)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                            <button onClick={() => handleDeleteFaq(faq.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
