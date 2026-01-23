
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBlogBySlug } from '@/lib/actions/blogs';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getBlogBySlug(slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: `${post.seo_title || post.title} - The Centurion Edit`,
        description: post.seo_description || post.excerpt,
        openGraph: {
            images: post.featured_image ? [post.featured_image] : [],
        },
    };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getBlogBySlug(slug);

    if (!post) {
        notFound();
    }

    // Generate fallback content if empty
    const content = post.content || `
    <p class="mb-6 text-lg leading-relaxed text-gray-700">
      ${post.excerpt || 'Content coming soon...'}
    </p>
  `;

    return (
        <main className="min-h-screen bg-white pb-32">
            {/* HER0 SECTION: Centered Editorial Header */}
            <header className="pt-20 pb-12 px-4 max-w-4xl mx-auto text-center">
                <div className="flex flex-col items-center gap-6">
                    {/* Category Label */}
                    <div className="flex items-center gap-3 text-xs tracking-[0.2em] font-bold text-gray-500 uppercase">
                        <Link href="/blogs" className="hover:text-black transition-colors">Journal</Link>
                        <span className="w-8 h-[1px] bg-gray-300"></span>
                        <span className="text-black">{post.category}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-serif font-medium text-gray-900 leading-tight md:leading-tight">
                        {post.title}
                    </h1>

                    {/* Meta */}
                    <div className="text-sm font-sans tracking-wide text-gray-500 mt-2">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft'}
                        <span className="mx-2">•</span>
                        By Centurion Edit
                    </div>
                </div>
            </header>

            {/* HERO IMAGE: Cinematic & Wide */}
            {post.featured_image && (
                <div className="w-full max-w-[1400px] mx-auto mb-20 px-4 md:px-8">
                    <div className="relative aspect-[16/10] md:aspect-[21/9] w-full overflow-hidden bg-gray-100">
                        <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="100vw"
                        />
                    </div>
                </div>
            )}

            {/* ARTICLE CONTENT: Narrow & Elegant */}
            <article className="max-w-[680px] mx-auto px-6">
                {/* Intro/Lead Paragraph styling helper */}
                <div
                    className="
                        prose prose-lg md:prose-xl 
                        prose-headings:font-serif prose-headings:font-normal prose-headings:text-gray-900 
                        prose-p:text-gray-600 prose-p:font-light prose-p:leading-loose
                        prose-a:text-black prose-a:underline prose-a:decoration-1 prose-a:underline-offset-4
                        prose-img:rounded-none prose-img:shadow-none prose-img:my-12
                        prose-li:text-gray-600
                        prose-strong:font-semibold prose-strong:text-gray-900
                    "
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </article>

            {/* SHOP THE LOOK: Sophisticated Footer */}
            <div className="max-w-[680px] mx-auto px-6 mt-24">
                <div className="border-t border-gray-200 pt-16 flex flex-col items-center">
                    <h2 className="font-serif text-2xl text-center mb-2 italic">Inspired by this story?</h2>
                    <p className="text-gray-500 text-sm mb-8 tracking-wide uppercase">Shop The Collection</p>

                    <Link
                        href="/all-products"
                        className="group relative inline-flex items-center justify-center px-8 py-3 bg-black text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-gray-800 transition-all"
                    >
                        Explore Jewelry
                    </Link>
                </div>
            </div>

            {/* NAVIGATION: Simple Back Link */}
            <div className="fixed bottom-8 left-8 hidden md:block z-50">
                <Link href="/blogs" className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase bg-white/90 backdrop-blur px-4 py-2 border border-gray-100 hover:border-black transition-colors shadow-sm">
                    &larr; Back
                </Link>
            </div>
        </main>
    );
}
