
export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    image: string;
    category: string;
    date: string;
    featured?: boolean;
}

export const BLOG_CATEGORIES = ['ALL', 'ADVICE', 'STYLE', 'WOMEN'];

export const DUMMY_BLOGS: BlogPost[] = [
    {
        id: '1',
        title: 'How To Style Your Jewelry For Every Occasion',
        slug: 'how-to-style-jewelry-every-occasion',
        excerpt: 'The ultimate guide to pairing your favorite pieces with any outfit. Our stylists have distilled years of knowledge into this handy guide.',
        image: 'https://images.unsplash.com/photo-1543238163-d23819106049?q=80&w=2073&auto=format&fit=crop', // Elegant jewelry model
        category: 'ADVICE',
        date: '20 January 2026',
        featured: true
    },
    {
        id: '2',
        title: '16 Essential Types of Earrings',
        slug: '16-essential-types-of-earrings',
        excerpt: 'This is the ultimate earring style dictionary. These 16 styles are the absolute essentials every woman should know about.',
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a51?q=80&w=2062&auto=format&fit=crop', // Earring closeup
        category: 'STYLE',
        date: '6 May 2026',
        featured: false
    },
    {
        id: '3',
        title: 'Gold vs. Silver: What\'s the Difference?',
        slug: 'gold-vs-silver-whats-the-difference',
        excerpt: 'Today, we\'re diving deep into metals. This super common question has some distinct features and characteristics that set them apart.',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop', // Gold and silver jewelry
        category: 'ADVICE',
        date: '26 March 2026',
        featured: false
    },
    {
        id: '4',
        title: 'The Best Statement Pieces for 2026',
        slug: 'best-statement-pieces-2026',
        excerpt: 'What is a statement piece, and how does it transform your look? We\'re breaking it all down and recommending styles.',
        image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=1975&auto=format&fit=crop', // Statement necklace
        category: 'STYLE',
        date: '26 March 2026',
        featured: false
    },
    {
        id: '5',
        title: 'Why The "Tennis Bracelet" Is A Must-Have',
        slug: 'why-tennis-bracelet-must-have',
        excerpt: 'Discover the history and enduring appeal of this classic piece that elevates any ensemble instantly.',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop', // Bracelet
        category: 'WOMEN',
        date: '6 January 2026',
        featured: false
    }
];
