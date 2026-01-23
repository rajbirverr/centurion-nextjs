import { getReturnsSettings, getReturnsFAQs } from '@/lib/actions/returns'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { Plus, Minus, Check, XCircle, Package, Printer, Truck } from 'lucide-react' // Icons for steps

export const metadata: Metadata = {
    title: 'Returns & Exchanges - Centurion',
    description: 'Easy returns and exchanges for your Centurion jewelry.'
}

// Client Component for FAQ Accordion to keep page SSR
import FAQAccordion from '@/components/FAQAccordion' // I will create this snippet inline or separately? 
// Better to keep it simple. I'll make the whole page a server component but import a client FAQ component.
// Or just make a simple client component for the FAQ list.

export default async function ReturnsPage() {
    const settings = await getReturnsSettings() || {
        hero_title: 'Centurion Returns',
        hero_subtitle: 'We offer free shipping on all exchanges and returns for store credit.',
        hero_image_url: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=2070&auto=format&fit=crop', // Fallback luxury background
        step_1_title: 'Start Your Return', step_1_desc: 'Click the button above to start.',
        step_2_title: 'Get Your Label', step_2_desc: 'Print your prepaid shipping label.',
        step_3_title: 'Pack & Ship', step_3_desc: 'Drop off at any courier location.',
        policy_html: '<p>Items must be returned within 30 days...</p>',
        start_return_url: '#'
    }
    const faqs = await getReturnsFAQs()

    return (
        <main className="min-h-screen bg-white">

            {/* HERO SECTION */}
            <section className="relative h-[500px] md:h-[600px] w-full flex items-center bg-gray-100 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={settings.hero_image_url || 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=2070&auto=format&fit=crop'}
                        alt="Returns Background"
                        fill
                        className="object-cover opacity-90"
                        priority
                    />
                </div>

                {/* Content Container */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

                    {/* Left Text (Hidden on mobile usually in Honeylove, but we keep it for SEO/Context) */}
                    <div className="hidden md:block text-white">
                        {/* Optional decorative text if needed, Honeylove is clean */}
                    </div>

                    {/* Floating White Card (Right Side) */}
                    <div className="bg-white p-8 md:p-12 shadow-2xl max-w-lg ml-auto relative">
                        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-6 leading-tight">
                            {settings.hero_title}
                        </h1>
                        <p className="text-gray-600 mb-8 leading-relaxed font-light text-lg">
                            {settings.hero_subtitle}
                        </p>

                        <a
                            href={settings.start_return_url}
                            className="block w-full bg-black text-white text-center py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                        >
                            Start A Return
                        </a>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            You will need your order number and email.
                        </p>
                    </div>
                </div>
            </section>

            {/* PROCESS SECTION (3 Columns) */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl font-medium">Initiating a Return</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 text-center relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[1px] bg-gray-200 -z-10"></div>

                        {/* Step 1 */}
                        <div className="flex flex-col items-center gap-4 bg-white p-4">
                            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center font-serif text-2xl font-bold shadow-lg mb-4">
                                1
                            </div>
                            <h3 className="font-bold text-lg uppercase tracking-wide">{settings.step_1_title}</h3>
                            <p className="text-gray-500 font-light leading-relaxed max-w-xs">{settings.step_1_desc}</p>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center gap-4 bg-white p-4">
                            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center font-serif text-2xl font-bold shadow-lg mb-4">
                                2
                            </div>
                            <h3 className="font-bold text-lg uppercase tracking-wide">{settings.step_2_title}</h3>
                            <p className="text-gray-500 font-light leading-relaxed max-w-xs">{settings.step_2_desc}</p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center gap-4 bg-white p-4">
                            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center font-serif text-2xl font-bold shadow-lg mb-4">
                                3
                            </div>
                            <h3 className="font-bold text-lg uppercase tracking-wide">{settings.step_3_title}</h3>
                            <p className="text-gray-500 font-light leading-relaxed max-w-xs">{settings.step_3_desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* POLICY TEXT SECTION */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row gap-16">
                    {/* Main Policy Text */}
                    <div className="flex-1">
                        <h3 className="font-serif text-2xl mb-6">Our Return Policy</h3>
                        <div
                            className="prose prose-p:text-gray-600 prose-p:font-light prose-headings:font-serif prose-a:text-black"
                            dangerouslySetInnerHTML={{ __html: settings.policy_html }}
                        />
                    </div>

                    {/* Non-Returnable Sidebar */}
                    <div className="w-full md:w-80 shrink-0">
                        <div className="bg-white p-8 shadow-sm border border-gray-100">
                            <h4 className="font-bold uppercase text-xs tracking-widest mb-6 text-gray-900 border-b pb-4">
                                Non-Returnable Items
                            </h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-500">Gift Cards</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-500">Original Shipping Fees</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-500">Custom/Engraved Items</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-500">Items marked "Final Sale"</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="py-20 bg-white">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="font-serif text-3xl text-center mb-12">Frequently Asked Questions</h2>
                    <FAQAccordion items={faqs} />
                </div>
            </section>

            {/* CONTACT FOOTER */}
            <div className="bg-[#2B2B2B] text-white py-16 text-center">
                <h3 className="font-serif text-2xl mb-4 text-white">Have more questions?</h3>
                <p className="text-gray-400 mb-8 font-light">Our team is here to help you every step of the way.</p>
                <div className="flex gap-4 justify-center">
                    <a href="mailto:support@centurion.com" className="bg-white text-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-100">
                        Email Support
                    </a>
                </div>
            </div>
        </main>
    )
}
