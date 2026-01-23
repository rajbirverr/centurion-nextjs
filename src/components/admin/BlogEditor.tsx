
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBlog, updateBlog, type BlogPost, searchProductsForBlog, type ProductSummary } from '@/lib/actions/blogs'
import { getJewelryCategories, type Category } from '@/lib/actions/categories'

interface BlogEditorProps {
    initialData?: BlogPost
    isNew?: boolean
}

export default function BlogEditor({ initialData, isNew = false }: BlogEditorProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Real Data State
    const [categories, setCategories] = useState<Category[]>([])
    const [productQuery, setProductQuery] = useState('')
    const [productResults, setProductResults] = useState<ProductSummary[]>([])
    const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null)
    const [isSearchingProducts, setIsSearchingProducts] = useState(false)

    const [formData, setFormData] = useState<Partial<BlogPost>>(
        initialData || {
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            featured_image: '',
            category: 'Earrings', // Default to first likely category
            is_featured: false,
            published_at: null
        }
    )

    // Fetch Categories on Mount
    useEffect(() => {
        const fetchCategories = async () => {
            const cats = await getJewelryCategories()
            setCategories(cats)
            if (!formData.category && cats.length > 0) {
                setFormData(prev => ({ ...prev, category: cats[0].name }))
            }
        }
        fetchCategories()
    }, [])

    // Search Products Debounced (simplified to effect on button or type)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (productQuery.length < 2) {
                setProductResults([])
                return
            }
            setIsSearchingProducts(true)
            const results = await searchProductsForBlog(productQuery)
            setProductResults(results)
            setIsSearchingProducts(false)
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [productQuery])


    // Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Handle Checkbox
    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setFormData(prev => ({ ...prev, [name]: checked }))
    }

    // Handle Product Select
    const handleSelectProduct = (product: ProductSummary) => {
        setSelectedProduct(product)
        setProductQuery('') // Clear query to hide dropdown
        setProductResults([])

        // Auto specific fields if empty
        if (!formData.title) setFormData(prev => ({ ...prev, title: `Why We Love The ${product.name}` }))
        if (!formData.featured_image && product.image_url) setFormData(prev => ({ ...prev, featured_image: product.image_url }))
    }

    // AI Magic Generator (Real Gemini Integration)
    const handleMagicGenerate = async () => {
        if (!selectedProduct) {
            alert("Please select a product first to generate a focused post.")
            return
        }

        setLoading(true)
        try {
            // Import dynamically to avoid server-action issues in client component if strict
            const { generateBlogDraft } = await import('@/lib/actions/ai')

            const res = await generateBlogDraft(selectedProduct, formData.category || 'Jewelry')

            if (res.success && res.content) {
                setFormData(prev => ({
                    ...prev,
                    title: res.title,
                    content: res.content,
                    excerpt: `Discover why the ${selectedProduct.name} is the must-have piece of the season. Styling tips and more inside.`
                }))
            } else {
                alert('AI Generation Failed: ' + res.error)
            }
        } catch (error) {
            console.error(error)
            alert('Failed to connect to AI service.')
        } finally {
            setLoading(false)
        }
    }

    // Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload: Partial<BlogPost> = {
                title: formData.title,
                slug: formData.slug || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                excerpt: formData.excerpt,
                content: formData.content,
                featured_image: formData.featured_image,
                category: formData.category,
                is_featured: formData.is_featured,
                published_at: formData.published_at
            }

            if (isNew) {
                const res = await createBlog(payload)
                if (res.success) {
                    alert('Blog created successfully!')
                    router.push('/admin/blogs')
                } else {
                    alert('Error creating blog: ' + res.error)
                }
            } else {
                if (!initialData?.id) return
                const res = await updateBlog(initialData.id, payload)
                if (res.success) {
                    alert('Blog updated successfully!')
                    router.push('/admin/blogs')
                    router.refresh()
                } else {
                    alert('Error updating blog: ' + res.error)
                }
            }
        } catch (error) {
            console.error(error)
            alert('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    const togglePublish = () => {
        const newStatus = formData.published_at ? null : new Date().toISOString()
        setFormData(prev => ({ ...prev, published_at: newStatus }))
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <Link href="/admin/blogs" className="text-gray-500 text-sm mb-2 hover:text-black inline-block">&larr; Back to Blogs</Link>
                    <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Create New Post' : 'Edit Post'}</h1>
                </div>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={togglePublish}
                        className={`px-4 py-2 rounded font-medium transition-colors text-sm ${formData.published_at
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {formData.published_at ? 'Published' : 'Save as Draft'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-black text-white px-6 py-2 rounded text-sm hover:opacity-80 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* LEFT COLUMN (Editor) - 65% Width */}
                <div className="lg:w-[65%] space-y-8">
                    {/* Title & Slug */}
                    <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Title</label>
                            <input
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                className="w-full border-b-2 border-gray-200 p-2 text-xl font-serif focus:border-black focus:outline-none transition-colors"
                                placeholder="Enter post title..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Slug</label>
                            <input
                                name="slug"
                                value={formData.slug || ''}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 p-2 rounded text-sm text-gray-600 font-mono"
                                placeholder="auto-generated-slug"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-4">Content (HTML)</label>
                        <textarea
                            name="content"
                            value={formData.content || ''}
                            onChange={handleChange}
                            rows={20}
                            className="w-full border border-gray-200 p-4 rounded-md font-mono text-sm leading-relaxed focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                            placeholder="<p>Start writing your story...</p>"
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-4">Excerpt</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt || ''}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-200 p-3 rounded-md text-sm"
                            placeholder="Short description for the blog list..."
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN (Sidebar) - 35% Width */}
                <div className="lg:w-[35%] space-y-6">

                    {/* Product Picker & AI - Highlighted */}
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-lg shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-indigo-900 font-bold text-sm uppercase tracking-wide mb-1">
                                1. Select Product
                            </h3>
                            <p className="text-xs text-indigo-700 mb-3">Found a product? Select it to boost your post.</p>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type 'Necklace'..."
                                    value={productQuery}
                                    onChange={(e) => setProductQuery(e.target.value)}
                                    className="w-full border border-indigo-200 p-3 rounded text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {isSearchingProducts && (
                                    <div className="absolute right-3 top-3">
                                        <div className="animate-spin h-4 w-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full"></div>
                                    </div>
                                )}

                                {/* Dropdown Results */}
                                {productResults.length > 0 && (
                                    <div className="absolute z-50 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-xl max-h-60 overflow-y-auto ring-1 ring-black ring-opacity-5">
                                        {productResults.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => handleSelectProduct(p)}
                                                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0"
                                            >
                                                {p.image_url ? (
                                                    <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded bg-gray-100" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                                                )}
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                                    <p className="text-xs text-gray-500">₹{p.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedProduct && (
                                <div className="mt-3 p-3 bg-white rounded border border-indigo-200 flex items-start gap-3 shadow-sm">
                                    {selectedProduct.image_url && (
                                        <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-12 h-12 object-cover rounded" />
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">{selectedProduct.name}</p>
                                        <p className="text-[10px] text-green-600 font-medium">Ready to Feature</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProduct(null)}
                                        className="text-gray-400 hover:text-red-500 text-lg leading-none"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-indigo-200 pt-4">
                            <h3 className="text-purple-900 font-bold text-sm uppercase tracking-wide mb-1 flex items-center gap-2">
                                <span>✨</span> 2. Magic Write
                            </h3>
                            <p className="text-xs text-purple-700 mb-3">Generate a draft about this product.</p>
                            <button
                                type="button"
                                onClick={handleMagicGenerate}
                                disabled={!selectedProduct || loading}
                                className="w-full bg-purple-600 text-white px-4 py-3 rounded text-sm font-bold shadow-sm hover:bg-purple-700 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Generating Magic...' : (selectedProduct ? 'Auto-Write Blog Post' : 'Select Product Above First')}
                            </button>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-4">Category</label>
                        <select
                            name="category"
                            value={formData.category || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-200 p-2 rounded text-sm focus:border-black focus:outline-none bg-white"
                            required
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            {/* Fallbacks if DB is empty */}
                            {!categories.find(c => c.name === 'Advice') && <option value="Advice">Advice</option>}
                            {!categories.find(c => c.name === 'Style') && <option value="Style">Style</option>}
                            {!categories.find(c => c.name === 'Trends') && <option value="Trends">Trends</option>}
                        </select>
                    </div>

                    {/* Featured Image URL (Manual) */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-4">Cover Image</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                name="featured_image"
                                value={formData.featured_image || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-200 p-2 rounded text-sm text-gray-600"
                                placeholder="Image URL (will auto-fill from product)"
                            />
                        </div>
                        {formData.featured_image ? (
                            <div className="relative h-40 w-full bg-gray-100 rounded overflow-hidden border border-gray-200">
                                <img src={formData.featured_image} className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div className="h-40 w-full bg-gray-50 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                                No Image
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    id="is_featured"
                                    checked={formData.is_featured || false}
                                    onChange={handleCheckbox}
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                />
                                <label htmlFor="is_featured" className="text-sm text-gray-700 cursor-pointer select-none">Feature on Blog Home</label>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

// Add Link to import
import Link from 'next/link'
