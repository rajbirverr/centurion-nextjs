'use server'

import { ProductSummary } from './blogs'

export async function generateBlogDraft(product: ProductSummary, category: string) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is missing')

    console.log('Generating blog via OpenRouter (Molmo)...')

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Optional headers for OpenRouter rankings
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Centurion Edit"
      },
      body: JSON.stringify({
        "model": "allenai/molmo-2-8b:free",
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": `You are an expert fashion editor for "The Centurion Edit", a luxury jewelry blog.
Write a sophisticated, editorial-style blog post for a product called "${product.name}".

Context:
- Product Name: ${product.name}
- Price: ₹${product.price}
- Category: ${category}

Requirements:
1. Title: Catchy, editorial headline.
2. Format: Return PURE HTML.
   - Use <h3> for Section Headers (e.g., <h3>Why It's Special</h3>).
   - Use <p> for paragraphs. Keep them SHORT (max 3 sentences).
   - Use <ul> and <li> for lists.
3. Tone: Elegant, persuasive, knowledgeable.
4. Structure:
   - <p class="lead">Introduction: Hook the reader with a question or bold statement.</p>
   - <div class="my-8"><img src="{{PRODUCT_IMAGE_URL}}" ... /></div>
   - <h3>Why It's Special</h3>: <p>Describe craftsmanship.</p>
   - <h3>How to Style It</h3>: <ul><li><strong>Day:</strong> ...</li><li><strong>Night:</strong> ...</li></ul>
   - <h3>The Verdict</h3>: <p>Call to action.</p>

Output ONLY the HTML string. No markdown fences. No preamble.`
              },
              // Include image if available (Molmo is multimodal)
              ...(product.image_url ? [{
                "type": "image_url",
                "image_url": {
                  "url": product.image_url
                }
              }] : [])
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content || '';

    // Clean up markdown code blocks if present (Molmo might be chatty)
    let cleanHtml = rawContent.replace(/```html/g, '').replace(/```/g, '').trim();

    // Remove any conversational preamble (everything before the first <h tag)
    const headerMatch = cleanHtml.search(/<h[1-6]/i);
    if (headerMatch > 0) {
      cleanHtml = cleanHtml.substring(headerMatch);
    }

    if (!cleanHtml) {
      console.error('Empty response from AI. Raw:', rawContent)
      throw new Error('Empty response from AI')
    }

    // Inject the real image URL back into the HTML (replacing the placeholder)
    const finalHtml = cleanHtml.replace('{{PRODUCT_IMAGE_URL}}', product.image_url || '/placeholder-product.png');

    console.log('AI Success. Length:', finalHtml.length)
    return { success: true, content: finalHtml, title: `Why We Love The ${product.name}` }

  } catch (error: any) {
    console.error('AI Generation Failed:', error)
    return { success: false, error: error.message || 'Failed to generate content' }
  }
}
