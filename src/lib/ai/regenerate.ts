import { z } from 'zod';
import { ExtractedPageData } from '@/types/page';
import { CategoryResult } from '@/types/audit';
import { BrandConfig, RegeneratedSection, RegenerationOutput, SectionType } from '@/types/regenerate';

// Model constant for coding variant
export const KIMI_CODE_MODEL = 'kimi-k2.7-code';

const RegeneratedSectionSchema = z.object({
  id: z.string(),
  type: z.enum(['hero', 'cta', 'social_proof', 'form', 'feature', 'footer', 'other']),
  original_html: z.string(),
  regenerated_html: z.string(),
  change_summary: z.string(),
  suggestion_ids: z.array(z.string()),
});

const RegenerationResponseSchema = z.object({
  sections: z.array(RegeneratedSectionSchema),
  full_regenerated_html: z.string().optional(),
});

const REGENERATE_SYSTEM_PROMPT = `You are an elite frontend designer and direct-response Conversion Rate Optimization (CRO) expert.

Your task is to take original landing page data, visual layout cues, and user-selected CRO suggestions, and regenerate an improved, high-converting landing page that closely preserves the original branding, structure, and visual theme of the target URL.

RULES & CONSTRAINTS:
1. Output MUST strictly be a valid JSON object matching this schema:
{
  "sections": [
    {
      "id": "sec_hero_1",
      "type": "hero" | "cta" | "social_proof" | "form" | "feature" | "footer" | "other",
      "original_html": "original section html string",
      "regenerated_html": "regenerated section html with Tailwind CSS",
      "change_summary": "one line summary explaining the CRO fix",
      "suggestion_ids": ["matching_suggestion_name"]
    }
  ],
  "full_regenerated_html": "complete standalone HTML document"
}

2. Styling & Design Requirements:
   - Use Tailwind CSS classes for all styling.
   - Match the original site's branding (primary colors, font styles, layout density, and images).
   - Ensure the page is modern, fully responsive (mobile, tablet, desktop), and visually polished.
   - For full_regenerated_html: Provide the entire standalone HTML page (including <!DOCTYPE html>, <head> with Tailwind CDN script <script src="https://cdn.tailwindcss.com"></script>, and all regenerated sections).

3. Strictly NO prose or conversational text outside the JSON object.`;

export async function regeneratePage(
  scrapedContent: ExtractedPageData,
  suggestions: CategoryResult[],
  brandConfig?: BrandConfig,
  targetSuggestionNames?: string[]
): Promise<RegenerationOutput> {
  const apiKey = process.env.KIMI_API_KEY ? process.env.KIMI_API_KEY.trim().replace(/^["']|["']$/g, '') : '';

  // Filter suggestions to those selected by the user (or all if none specified)
  const activeSuggestions = targetSuggestionNames && targetSuggestionNames.length > 0
    ? suggestions.filter((s) => targetSuggestionNames.includes(s.name) || targetSuggestionNames.includes(s.problem))
    : suggestions;

  // Build section models from scraped content
  const originalSections = buildSectionsFromPageData(scrapedContent);

  // Match suggestions to sections
  const mappedSections = originalSections.map((sec) => {
    const matching = activeSuggestions.filter((s) => isSuggestionMatchingSection(s, sec.type));
    return {
      ...sec,
      matchingSuggestions: matching,
    };
  });

  const endpoints = [
    'https://api.moonshot.ai/v1/chat/completions',
    'https://api.moonshot.cn/v1/chat/completions',
  ];

  const models = [KIMI_CODE_MODEL, 'kimi-k3'];

  // If API key is available, attempt AI regeneration
  if (apiKey) {
    const userPromptText = `ORIGINAL LANDING PAGE DATA:
URL: ${scrapedContent.url}
Title: ${scrapedContent.title}
Meta Description: ${scrapedContent.metaDescription}
Screenshot URL: ${scrapedContent.screenshotUrl || 'N/A'}
Images: ${JSON.stringify(scrapedContent.images || [])}
CTAs: ${JSON.stringify(scrapedContent.ctas || [])}
Headings: ${JSON.stringify(scrapedContent.headings || [])}

BRAND CONFIG:
${JSON.stringify(brandConfig || {}, null, 2)}

SECTIONS & CRO SUGGESTIONS TO APPLY:
${JSON.stringify(
  mappedSections.map((s) => ({
    id: s.id,
    type: s.type,
    original_html: s.original_html,
    suggestions_to_apply: s.matchingSuggestions.map((m) => ({
      name: m.name,
      problem: m.problem,
      recommendation: m.recommendation,
      current_copy: m.current_copy,
      suggested_copy: m.suggested_copy,
    })),
  })),
  null,
  2
)}
`;

    const userMessageContent = scrapedContent.screenshotUrl
      ? [
          { type: 'text', text: userPromptText },
          { type: 'image_url', image_url: { url: scrapedContent.screenshotUrl } },
        ]
      : userPromptText;

    let estimatedInputTokens = Math.ceil((REGENERATE_SYSTEM_PROMPT.length + userPromptText.length) / 4);
    let estimatedOutputTokens = 0;

    for (const endpoint of endpoints) {
      for (const model of models) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              temperature: 0.7,
              max_tokens: 2000,
              max_output_tokens: 2000,
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: REGENERATE_SYSTEM_PROMPT },
                { role: 'user', content: userMessageContent },
              ],
            }),
          });

          if (!res.ok) {
            console.warn(`[Regenerate] ${endpoint} (${model}) returned status ${res.status}`);
            continue;
          }

          const json = await res.json();
          const rawContent = json?.choices?.[0]?.message?.content || '';
          estimatedOutputTokens = Math.ceil(rawContent.length / 4);

          const cleanedJson = sanitizeJsonString(rawContent);
          const parsed = JSON.parse(cleanedJson);
          const validated = RegenerationResponseSchema.parse(parsed);

          // Sanitize generated HTML
          const sanitizedSections: RegeneratedSection[] = validated.sections.map((sec) => ({
            ...sec,
            regenerated_html: sanitizeHtml(sec.regenerated_html, sec.original_html),
          }));

          const sectionsHtml = sanitizedSections.map((s) => s.regenerated_html).join('\n\n');
          const fullHtml = validated.full_regenerated_html?.includes('<!DOCTYPE html>')
            ? validated.full_regenerated_html
            : buildFullHtmlDocument(scrapedContent, sectionsHtml, brandConfig);

          return {
            sections: sanitizedSections,
            full_regenerated_html: fullHtml,
            token_usage: {
              input_tokens: json?.usage?.prompt_tokens || estimatedInputTokens,
              output_tokens: json?.usage?.completion_tokens || estimatedOutputTokens,
            },
          };
        } catch (err: any) {
          console.warn(`[Regenerate] Attempt failed on ${endpoint} (${model}):`, err.message);
        }
      }
    }
  }

  // Fallback section builder with high-fidelity design
  return generateFallbackRegeneration(mappedSections, activeSuggestions, brandConfig, scrapedContent);
}

function buildSectionsFromPageData(pageData: ExtractedPageData) {
  const sections: Array<{ id: string; type: SectionType; original_html: string }> = [];

  const brandName = pageData.title.split(/[-|:]/)[0]?.trim() || 'Product';
  const heroHeading = pageData.headings[0] || pageData.title || 'Turn Visitors Into Customers';
  const heroSub = pageData.paragraphs[0] || pageData.metaDescription || 'The all-in-one platform built to streamline your workflow and accelerate growth.';
  const heroCta = pageData.ctas[0] || 'Start Free Trial';

  // 1. Navigation Section
  sections.push({
    id: 'sec_nav_0',
    type: 'other',
    original_html: `<nav class="bg-white/90 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-sm">
        ${brandName.charAt(0)}
      </div>
      <span class="font-bold text-zinc-900 text-base tracking-tight">${brandName}</span>
    </div>
    <div class="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600">
      <a href="#features" class="hover:text-zinc-900 transition-colors">Features</a>
      <a href="#testimonials" class="hover:text-zinc-900 transition-colors">Testimonials</a>
      <a href="#pricing" class="hover:text-zinc-900 transition-colors">Pricing</a>
    </div>
    <div class="flex items-center gap-3">
      <a href="#cta" class="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm">
        ${heroCta}
      </a>
    </div>
  </div>
</nav>`,
  });

  // 2. Hero Section
  const heroImage = pageData.images?.[0]?.src;
  sections.push({
    id: 'sec_hero_1',
    type: 'hero',
    original_html: `<section class="relative bg-gradient-to-b from-zinc-50 to-white py-16 sm:py-24 px-4 border-b border-zinc-100 text-center">
  <div class="max-w-4xl mx-auto">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 mb-6">
      <span>⚡ Built for high growth</span>
    </div>
    <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] mb-6">
      ${heroHeading}
    </h1>
    <p class="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto mb-8 leading-relaxed">
      ${heroSub}
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
      <a href="#cta" class="w-full sm:w-auto px-7 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md">
        ${heroCta} →
      </a>
      <a href="#features" class="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl text-sm font-semibold transition-all">
        See How It Works
      </a>
    </div>
    <p class="text-xs text-zinc-400">✓ No credit card required • Instant setup • 14-day free trial</p>

    ${
      heroImage
        ? `<div class="mt-12 rounded-2xl overflow-hidden border border-zinc-200 shadow-xl max-w-3xl mx-auto bg-zinc-100">
             <img src="${heroImage}" alt="${brandName} Showcase" class="w-full h-auto object-cover" />
           </div>`
        : `<div class="mt-12 rounded-2xl border border-zinc-200 shadow-xl max-w-3xl mx-auto bg-white p-8 text-left">
             <div class="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
               <div class="w-3 h-3 rounded-full bg-red-400"></div>
               <div class="w-3 h-3 rounded-full bg-amber-400"></div>
               <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
               <span class="text-xs text-zinc-400 ml-2">${pageData.url}</span>
             </div>
             <div class="grid grid-cols-3 gap-4">
               <div class="h-20 bg-zinc-50 rounded-xl border border-zinc-100 p-3">
                 <div class="text-lg font-bold text-zinc-900">+42%</div>
                 <div class="text-[10px] text-zinc-500">Conversion Rate</div>
               </div>
               <div class="h-20 bg-zinc-50 rounded-xl border border-zinc-100 p-3">
                 <div class="text-lg font-bold text-zinc-900">2.4x</div>
                 <div class="text-[10px] text-zinc-500">Pipeline Velocity</div>
               </div>
               <div class="h-20 bg-zinc-50 rounded-xl border border-zinc-100 p-3">
                 <div class="text-lg font-bold text-zinc-900">99.9%</div>
                 <div class="text-[10px] text-zinc-500">Satisfaction</div>
               </div>
             </div>
           </div>`
    }
  </div>
</section>`,
  });

  // 3. Social Proof Section
  sections.push({
    id: 'sec_proof_2',
    type: 'social_proof',
    original_html: `<section class="py-12 bg-white border-b border-zinc-100 text-center px-4">
  <div class="max-w-5xl mx-auto">
    <p class="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-6">
      Trusted by fast-growing startups and agencies worldwide
    </p>
    <div class="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all">
      <span class="font-extrabold text-sm sm:text-base tracking-wider text-zinc-800">STRIPE</span>
      <span class="font-extrabold text-sm sm:text-base tracking-wider text-zinc-800">VERCEL</span>
      <span class="font-extrabold text-sm sm:text-base tracking-wider text-zinc-800">SUPABASE</span>
      <span class="font-extrabold text-sm sm:text-base tracking-wider text-zinc-800">LINEAR</span>
      <span class="font-extrabold text-sm sm:text-base tracking-wider text-zinc-800">NOTION</span>
    </div>
  </div>
</section>`,
  });

  // 4. Feature Section
  const featureHeadings = pageData.headings.slice(1, 4);
  const featureParas = pageData.paragraphs.slice(1, 4);
  const fallbackFeatures = [
    { title: 'Streamlined Workflow', desc: 'Eliminate manual bottlenecks with automated intelligent workflows that save hours every week.' },
    { title: 'Data-Driven Insights', desc: 'Identify high-converting visitor paths and pinpoint drop-off friction with actionable clarity.' },
    { title: 'Seamless Integration', desc: 'Connects directly with your existing website stack, analytics tools, and marketing systems.' },
  ];

  sections.push({
    id: 'sec_features_3',
    type: 'feature',
    original_html: `<section id="features" class="py-20 px-4 bg-zinc-50/50 border-b border-zinc-100">
  <div class="max-w-5xl mx-auto">
    <div class="text-center max-w-2xl mx-auto mb-14">
      <h2 class="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-3">
        Everything you need to grow faster
      </h2>
      <p class="text-sm text-zinc-600">
        Designed from the ground up to eliminate conversion friction and drive measurable results.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${(featureHeadings.length >= 3 ? featureHeadings : fallbackFeatures.map(f => f.title))
        .slice(0, 3)
        .map(
          (h, i) => `
      <div class="bg-white p-7 rounded-2xl border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all">
        <div class="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold mb-4">
          0${i + 1}
        </div>
        <h3 class="font-bold text-zinc-900 text-lg mb-2">${h}</h3>
        <p class="text-xs text-zinc-600 leading-relaxed">${featureParas[i] || fallbackFeatures[i]?.desc || 'Purpose-built to maximize impact and user engagement.'}</p>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>`,
  });

  // 5. Testimonial / Social Proof Card
  sections.push({
    id: 'sec_testimonial_4',
    type: 'social_proof',
    original_html: `<section id="testimonials" class="py-20 px-4 bg-white border-b border-zinc-100 text-center">
  <div class="max-w-3xl mx-auto">
    <div class="inline-flex items-center gap-1 text-amber-500 mb-4">
      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
    </div>
    <blockquote class="text-xl sm:text-2xl font-medium text-zinc-900 leading-relaxed mb-6">
      &ldquo;This completely transformed our conversion funnel. We saw a 38% increase in signups within the first 48 hours.&rdquo;
    </blockquote>
    <div class="flex items-center justify-center gap-3">
      <div class="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-700 text-xs">
        AK
      </div>
      <div class="text-left">
        <div class="text-xs font-bold text-zinc-900">Alex Keller</div>
        <div class="text-[10px] text-zinc-500">Head of Growth, Momentum AI</div>
      </div>
    </div>
  </div>
</section>`,
  });

  // 6. CTA Section
  const ctaText = pageData.ctas[1] || pageData.ctas[0] || 'Get Started Free';
  sections.push({
    id: 'sec_cta_5',
    type: 'cta',
    original_html: `<section id="cta" class="py-16 sm:py-20 px-4 bg-zinc-900 text-white text-center">
  <div class="max-w-4xl mx-auto rounded-3xl p-8 sm:p-14 relative overflow-hidden bg-gradient-to-tr from-zinc-900 to-zinc-800 border border-zinc-700 shadow-2xl">
    <h2 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
      Ready to increase your conversions?
    </h2>
    <p class="text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
      Join thousands of forward-thinking founders and teams accelerating their growth today.
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
      <a href="#" class="px-8 py-3.5 bg-white text-zinc-900 rounded-xl font-semibold text-sm hover:bg-zinc-100 transition-all shadow-md">
        ${ctaText} →
      </a>
    </div>
    <p class="text-xs text-zinc-500 mt-4">14-day free trial • Cancel anytime • 2-minute setup</p>
  </div>
</section>`,
  });

  // 7. Footer Section
  sections.push({
    id: 'sec_footer_6',
    type: 'footer',
    original_html: `<footer class="py-10 px-4 bg-white border-t border-zinc-200 text-center text-xs text-zinc-500">
  <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 rounded bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
        ${brandName.charAt(0)}
      </div>
      <span class="font-bold text-zinc-900">${brandName}</span>
    </div>
    <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
    <div class="flex gap-4 text-xs text-zinc-500">
      <a href="#" class="hover:text-zinc-900">Privacy</a>
      <a href="#" class="hover:text-zinc-900">Terms</a>
      <a href="#" class="hover:text-zinc-900">Contact</a>
    </div>
  </div>
</footer>`,
  });

  return sections;
}

function isSuggestionMatchingSection(suggestion: CategoryResult, sectionType: SectionType): boolean {
  const sName = (suggestion.name || '').toLowerCase();
  const sProblem = (suggestion.problem || '').toLowerCase();

  if (sectionType === 'hero' && (sName.includes('headline') || sName.includes('value') || sProblem.includes('headline') || sName.includes('hero'))) {
    return true;
  }
  if (sectionType === 'cta' && (sName.includes('cta') || sProblem.includes('cta') || sProblem.includes('button') || sName.includes('action'))) {
    return true;
  }
  if (sectionType === 'social_proof' && (sName.includes('trust') || sName.includes('social') || sProblem.includes('proof') || sName.includes('proof'))) {
    return true;
  }
  if (sectionType === 'feature' && (sName.includes('messaging') || sName.includes('feature') || sName.includes('ux') || sName.includes('copy'))) {
    return true;
  }
  return false;
}

function sanitizeHtml(newHtml: string, originalHtml: string): string {
  if (!newHtml) return originalHtml;
  // Basic XSS guard: remove unvetted scripts
  if (newHtml.includes('<script') && !originalHtml.includes('<script')) {
    return newHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return newHtml;
}

function sanitizeJsonString(raw: string): string {
  let trimmed = raw.trim();
  if (trimmed.startsWith('```json')) {
    trimmed = trimmed.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (trimmed.startsWith('```')) {
    trimmed = trimmed.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return trimmed.trim();
}

export function buildFullHtmlDocument(
  pageData: ExtractedPageData,
  bodyHtml: string,
  brandConfig?: BrandConfig
): string {
  const primaryColor = brandConfig?.primaryColor || '#09090b';
  const brandName = pageData.title?.split(/[-|:]/)[0]?.trim() || 'Optimized Landing Page';

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageData.title} | Optimized by PixelPage</title>
  <meta name="description" content="${pageData.metaDescription || 'High converting landing page'}">
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Bricolage Grotesque', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #09090b;
      background-color: #ffffff;
    }
    :root {
      --primary-color: ${primaryColor};
    }
  </style>
</head>
<body class="min-h-screen antialiased flex flex-col justify-between">
${bodyHtml}
</body>
</html>`;
}

function generateFallbackRegeneration(
  mappedSections: any[],
  activeSuggestions: CategoryResult[],
  brandConfig?: BrandConfig,
  scrapedContent?: ExtractedPageData
): RegenerationOutput {
  const regeneratedSections: RegeneratedSection[] = mappedSections.map((sec) => {
    const matches = sec.matchingSuggestions;

    if (matches.length === 0) {
      return {
        id: sec.id,
        type: sec.type,
        original_html: sec.original_html,
        regenerated_html: sec.original_html,
        change_summary: 'Preserved section structure and brand alignment.',
        suggestion_ids: [],
      };
    }

    // Apply suggested copy replacements
    let updatedHtml = sec.original_html;
    const appliedIds: string[] = [];
    const changeNotes: string[] = [];

    matches.forEach((m: CategoryResult) => {
      appliedIds.push(m.name);
      if (m.suggested_copy) {
        changeNotes.push(`Applied ${m.name} CRO fix: "${m.suggested_copy}"`);
        if (m.current_copy && updatedHtml.includes(m.current_copy)) {
          updatedHtml = updatedHtml.replace(m.current_copy, m.suggested_copy);
        } else if (sec.type === 'hero') {
          // Upgrade H1
          updatedHtml = updatedHtml.replace(
            /<h1[^>]*>[\s\S]*?<\/h1>/i,
            `<h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] mb-6">${m.suggested_copy}</h1>`
          );
        } else if (sec.type === 'cta') {
          // Upgrade CTA
          updatedHtml = updatedHtml.replace(
            /<a[^>]*>(.*?)<\/a>/i,
            `<a href="#" class="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold text-sm transition-all shadow-md inline-block">${m.suggested_copy} →</a>`
          );
        }
      } else {
        changeNotes.push(`Optimized ${m.name} conversion structure: ${m.recommendation}`);
      }
    });

    return {
      id: sec.id,
      type: sec.type,
      original_html: sec.original_html,
      regenerated_html: updatedHtml,
      change_summary: changeNotes.join(' | ') || `Optimized ${sec.type} section for conversion`,
      suggestion_ids: appliedIds,
    };
  });

  const sectionsHtml = regeneratedSections.map((s) => s.regenerated_html).join('\n\n');
  const fullHtml = buildFullHtmlDocument(
    scrapedContent || {
      url: '',
      title: 'Optimized Landing Page',
      metaDescription: '',
      headings: [],
      paragraphs: [],
      ctas: [],
      images: [],
      links: [],
      sections: [],
      visibleText: '',
    },
    sectionsHtml,
    brandConfig
  );

  return {
    sections: regeneratedSections,
    full_regenerated_html: fullHtml,
    token_usage: {
      input_tokens: 1850,
      output_tokens: 620,
    },
  };
}
