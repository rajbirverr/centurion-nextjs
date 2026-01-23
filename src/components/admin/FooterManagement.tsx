'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getFooterDataForAdmin,
  createFooterSection,
  updateFooterSection,
  deleteFooterSection,
  createFooterLink,
  updateFooterLink,
  deleteFooterLink,
  updateSocialMedia,
  updateFooterSetting,
  type FooterSection,
  type FooterLink,
  type SocialMedia,
  type FooterSettings
} from '@/lib/actions/footer'
import { Button, Input } from './ui'

interface FooterManagementProps {
  initialData: {
    sections: FooterSection[]
    socialMedia: SocialMedia[]
    settings: FooterSettings
  }
}

export default function FooterManagement({ initialData }: FooterManagementProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<FooterSection[]>(initialData.sections)
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>(initialData.socialMedia)
  const [settings, setSettings] = useState<FooterSettings>(initialData.settings)
  
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [showSectionForm, setShowSectionForm] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

  const [sectionForm, setSectionForm] = useState({ title: '', position: sections.length + 1 })
  const [linkForm, setLinkForm] = useState({ label: '', url: '', position: 0 })

  const refreshData = async () => {
    const data = await getFooterDataForAdmin()
    setSections(data.sections)
    setSocialMedia(data.socialMedia)
    setSettings(data.settings)
  }

  // Section handlers
  const handleAddSection = () => {
    setSectionForm({ title: '', position: sections.length + 1 })
    setEditingSectionId(null)
    setShowSectionForm(true)
  }

  const handleEditSection = (section: FooterSection) => {
    setSectionForm({ title: section.title, position: section.position })
    setEditingSectionId(section.id)
    setShowSectionForm(true)
  }

  const handleSaveSection = async () => {
    if (!sectionForm.title.trim()) {
      setError('Section title is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result
      if (editingSectionId) {
        result = await updateFooterSection(editingSectionId, sectionForm)
      } else {
        result = await createFooterSection(sectionForm)
      }

      if (result.success) {
        await refreshData()
        setShowSectionForm(false)
        setEditingSectionId(null)
      } else {
        setError(result.error || 'Failed to save section')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save section')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure? This will delete all links in this section.')) return

    setLoading(true)
    try {
      const result = await deleteFooterSection(id)
      if (result.success) {
        await refreshData()
      } else {
        setError(result.error || 'Failed to delete section')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete section')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSection = async (section: FooterSection) => {
    setLoading(true)
    try {
      const result = await updateFooterSection(section.id, { is_enabled: !section.is_enabled })
      if (result.success) {
        await refreshData()
      } else {
        setError(result.error || 'Failed to update section')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update section')
    } finally {
      setLoading(false)
    }
  }

  // Link handlers
  const handleAddLink = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    setLinkForm({ label: '', url: '', position: (section?.links?.length || 0) })
    setSelectedSectionId(sectionId)
    setEditingLinkId(null)
    setShowLinkForm(true)
  }

  const handleEditLink = (link: FooterLink) => {
    setLinkForm({ label: link.label, url: link.url, position: link.position })
    setSelectedSectionId(link.section_id)
    setEditingLinkId(link.id)
    setShowLinkForm(true)
  }

  const handleSaveLink = async () => {
    if (!linkForm.label.trim() || !linkForm.url.trim()) {
      setError('Label and URL are required')
      return
    }

    if (!selectedSectionId) {
      setError('Please select a section')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result
      if (editingLinkId) {
        result = await updateFooterLink(editingLinkId, linkForm)
      } else {
        result = await createFooterLink({ ...linkForm, section_id: selectedSectionId })
      }

      if (result.success) {
        await refreshData()
        setShowLinkForm(false)
        setEditingLinkId(null)
        setSelectedSectionId(null)
      } else {
        setError(result.error || 'Failed to save link')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save link')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    setLoading(true)
    try {
      const result = await deleteFooterLink(id)
      if (result.success) {
        await refreshData()
      } else {
        setError(result.error || 'Failed to delete link')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete link')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLink = async (link: FooterLink) => {
    setLoading(true)
    try {
      const result = await updateFooterLink(link.id, { is_enabled: !link.is_enabled })
      if (result.success) {
        await refreshData()
      } else {
        setError(result.error || 'Failed to update link')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update link')
    } finally {
      setLoading(false)
    }
  }

  // Social media handlers
  const handleUpdateSocialMedia = async (id: string, updates: Partial<{ url: string; is_enabled: boolean }>) => {
    setLoading(true)
    try {
      const result = await updateSocialMedia(id, updates)
      if (result.success) {
        await refreshData()
      } else {
        setError(result.error || 'Failed to update social media')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update social media')
    } finally {
      setLoading(false)
    }
  }

  // Settings handlers
  const handleUpdateSetting = async (key: keyof FooterSettings, value: string | boolean) => {
    setLoading(true)
    try {
      const result = await updateFooterSetting(key, String(value))
      if (result.success) {
        await refreshData()
        // Force page refresh to update footer on frontend
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      } else {
        setError(result.error || 'Failed to update setting')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update setting')
    } finally {
      setLoading(false)
    }
  }

  const platformLabels: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    twitter: 'Twitter',
    youtube: 'YouTube',
    tiktok: 'TikTok'
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Footer Settings */}
      <div className="border-b pb-6">
        <h2 className="text-xl font-semibold text-[#5a4c46] mb-4">Footer Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
            <Input
              value={settings.brand_name}
              onChange={(e) => {
                const newSettings = { ...settings, brand_name: e.target.value }
                setSettings(newSettings)
                handleUpdateSetting('brand_name', e.target.value)
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
            <Input
              value={settings.copyright_text}
              onChange={(e) => {
                const newSettings = { ...settings, copyright_text: e.target.value }
                setSettings(newSettings)
                handleUpdateSetting('copyright_text', e.target.value)
              }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Newsletter Description</label>
            <textarea
              value={settings.newsletter_description}
              onChange={(e) => {
                const newSettings = { ...settings, newsletter_description: e.target.value }
                setSettings(newSettings)
                handleUpdateSetting('newsletter_description', e.target.value)
              }}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="newsletter_enabled"
              checked={settings.newsletter_enabled}
              onChange={(e) => {
                const newSettings = { ...settings, newsletter_enabled: e.target.checked }
                setSettings(newSettings)
                handleUpdateSetting('newsletter_enabled', e.target.checked)
              }}
              className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46]"
            />
            <label htmlFor="newsletter_enabled" className="ml-2 text-sm font-medium text-gray-700">
              Enable Newsletter Section
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sms_enabled"
              checked={settings.sms_enabled}
              onChange={(e) => {
                const newSettings = { ...settings, sms_enabled: e.target.checked }
                setSettings(newSettings)
                handleUpdateSetting('sms_enabled', e.target.checked)
              }}
              className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46]"
            />
            <label htmlFor="sms_enabled" className="ml-2 text-sm font-medium text-gray-700">
              Enable SMS Section
            </label>
          </div>
          {settings.sms_enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMS Text</label>
                <Input
                  value={settings.sms_text}
                  onChange={(e) => {
                    const newSettings = { ...settings, sms_text: e.target.value }
                    setSettings(newSettings)
                    handleUpdateSetting('sms_text', e.target.value)
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMS Number</label>
                <Input
                  value={settings.sms_number}
                  onChange={(e) => {
                    const newSettings = { ...settings, sms_number: e.target.value }
                    setSettings(newSettings)
                    handleUpdateSetting('sms_number', e.target.value)
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Sections */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#5a4c46]">Footer Sections</h2>
          <Button onClick={handleAddSection} variant="outline">
            + Add Section
          </Button>
        </div>

        {showSectionForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <h3 className="text-lg font-medium text-[#5a4c46] mb-4">
              {editingSectionId ? 'Edit Section' : 'Add New Section'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Section Title"
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                required
              />
              <Input
                label="Position"
                type="number"
                value={sectionForm.position}
                onChange={(e) => setSectionForm({ ...sectionForm, position: parseInt(e.target.value) || 0 })}
                helperText="Lower numbers appear first"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSectionForm(false)
                  setEditingSectionId(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveSection} disabled={loading}>
                {editingSectionId ? 'Update' : 'Add'} Section
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-[#5a4c46]">{section.title}</h3>
                    <span className="text-xs text-gray-500">Position: {section.position}</span>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={section.is_enabled}
                        onChange={() => handleToggleSection(section)}
                        className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46]"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {section.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEditSection(section)}
                    className="text-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteSection(section.id)}
                    className="text-sm text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Links in this section */}
              <div className="ml-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Links</h4>
                  <Button
                    variant="outline"
                    onClick={() => handleAddLink(section.id)}
                    className="text-xs"
                  >
                    + Add Link
                  </Button>
                </div>
                {section.links && section.links.length > 0 ? (
                  <div className="space-y-2">
                    {section.links.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-100"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{link.label}</span>
                            <span className="text-xs text-gray-500">{link.url}</span>
                            <span className="text-xs text-gray-400">Pos: {link.position}</span>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={link.is_enabled}
                                onChange={() => handleToggleLink(link)}
                                className="w-3 h-3 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46]"
                              />
                              <span className="ml-1 text-xs text-gray-600">
                                {link.is_enabled ? 'On' : 'Off'}
                              </span>
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleEditLink(link)}
                            className="text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleDeleteLink(link.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No links yet. Click "Add Link" to create one.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link Form Modal */}
      {showLinkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-[#5a4c46] mb-4">
              {editingLinkId ? 'Edit Link' : 'Add New Link'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select
                  value={selectedSectionId || ''}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                >
                  <option value="">Select a section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Link Label"
                value={linkForm.label}
                onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                required
              />
              <Input
                label="URL"
                value={linkForm.url}
                onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                required
                placeholder="https://example.com or /page"
              />
              <Input
                label="Position"
                type="number"
                value={linkForm.position}
                onChange={(e) => setLinkForm({ ...linkForm, position: parseInt(e.target.value) || 0 })}
                helperText="Lower numbers appear first"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLinkForm(false)
                  setEditingLinkId(null)
                  setSelectedSectionId(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveLink} disabled={loading}>
                {editingLinkId ? 'Update' : 'Add'} Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Social Media */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold text-[#5a4c46] mb-4">Social Media</h2>
        <div className="space-y-3">
          {socialMedia.map((social) => (
            <div key={social.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-[#5a4c46]">{platformLabels[social.platform] || social.platform}</span>
                  <Input
                    value={social.url}
                    onChange={(e) => handleUpdateSocialMedia(social.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={social.is_enabled}
                      onChange={(e) => handleUpdateSocialMedia(social.id, { is_enabled: e.target.checked })}
                      className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46]"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {social.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
