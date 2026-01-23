
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedBlogs, type BlogPost } from '@/lib/actions/blogs';

export const metadata = {
    title: 'The Centurion Edit - Jewelry Trends & Style Advice',
    description: 'Discover the latest jewelry trends, style guides, and expert advice from The Centurion Edit.',
};

export const revalidate = 300; // Revalidate every 5 minutes

export default async function BlogIndexPage({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
    const params = await searchParams;
    const currentCategory = params?.category || 'ALL';
    const blogsRaw = await getPublishedBlogs(currentCategory === 'ALL' ? undefined : currentCategory);
    // Filter out blogs with missing slugs/titles to prevent broken links
    const blogs = blogsRaw.filter(b => b.slug && b.slug.trim() !== '');

    const featuredPost = blogs.find(blog => blog.is_featured) || blogs[0];
    const otherPosts = featuredPost ? blogs.filter(blog => blog.id !== featuredPost.id) : [];

    const CATEGORIES = ['ALL', 'ADVICE', 'STYLE', 'WOMEN', 'TRENDS'];

    return (
        <main className="min-h-screen bg-white">
            {/* Header Section */}
            <section className="pt-16 pb-12 text-center px-4">
                <h1 className="text-3xl md:text-5xl font-normal text-[#2B2B2B] mb-8 font-serif">
                    The Centurion Edit
                </h1>

                {/* Categories Bar */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-xs md:text-sm font-medium tracking-widest uppercase text-[#2B2B2B]">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat}
                            href={cat === 'ALL' ? '/blogs' : `/blogs?category=${cat}`}
                            className={`hover:text-black hover:underline underline-offset-4 transition-all duration-200 ${currentCategory === cat ? 'text-black underline' : 'text-gray-500'}`}
                        >
                            {cat}
                        </Link>
                    ))}
                </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-20">

                {/* Featured Post */}
                {featuredPost && (
                    <div className="grid md:grid-cols-12 gap-8 mb-20 items-center">
                        <div className="md:col-span-8 relative aspect-[4/3] md:aspect-[16/9] w-full overflow-hidden bg-gray-100">
                            {featuredPost.featured_image ? (
                                <Image
                                    src={featuredPost.featured_image}
                                    alt={featuredPost.title}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 75vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">No Image</div>
                            )}
                        </div>
                        <div className="md:col-span-4 flex flex-col justify-center text-left">
                            <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                                {featuredPost.published_at ? new Date(featuredPost.published_at).toLocaleDateString() : 'Draft'}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-medium text-[#2B2B2B] mb-4 leading-tight hover:underline cursor-pointer">
                                <Link href={`/blogs/${featuredPost.slug}`}>
                                    {featuredPost.title}
                                </Link>
                            </h2>
                            <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed line-clamp-3">
                                {featuredPost.excerpt}
                            </p>
                            <Link
                                href={`/blogs/${featuredPost.slug}`}
                                className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 self-start hover:text-gray-600 hover:border-gray-600 transition-colors"
                            >
                                Read More
                            </Link>
                        </div>
                    </div>
                )}

                {/* Trending / Latest Grid */}
                <div className="mb-12">
                    <h3 className="text-xl font-medium text-[#2B2B2B] mb-8 border-b border-gray-200 pb-2">Latest Stories</h3>
                    {otherPosts.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
                            {otherPosts.map((post) => (
                                <div key={post.id} className="flex flex-col group">
                                    <div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-100 mb-5">
                                        <Link href={`/blogs/${post.slug}`}>
                                            {post.featured_image ? (
                                                <Image
                                                    src={post.featured_image}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 text-xs">No Image</div>
                                            )}
                                        </Link>
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">
                                            {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}
                                        </span>
                                        <h4 className="text-lg font-medium text-[#2B2B2B] mb-3 leading-snug group-hover:underline">
                                            <Link href={`/blogs/${post.slug}`}>
                                                {post.title}
                                            </Link>
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                                            {post.excerpt}
                                        </p>
                                        <Link
                                            href={`/blogs/${post.slug}`}
                                            className="text-[10px] font-bold uppercase tracking-widest self-start"
                                        >
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-10">No other stories found.</p>
                    )}
                </div>

            </div>
        </main>
    );
}
