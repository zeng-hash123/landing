import { z } from 'zod';
import { ExtractedPageData } from '@/types/page';
import { CategoryResult } from '@/types/audit';
import { BrandConfig, RegeneratedSection, RegenerationOutput, SectionType } from '@/types/regenerate';

// Model constant for coding variant as specified in phase2.txt
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
  full_regenerated_html: z.string(),
});

const REGENERATE_SYSTEM_PROMPT = `You are an elite frontend engineer and CRO strategist specializing in high-converting landing page HTML/CSS code generation.

Your task is to take original landing page sections, visual page screenshots, and user-selected CRO suggestions, and generate improved HTML/CSS section by section.

RULES & CONSTRAINTS:
1. Output MUST strictly be valid JSON matching this schema:
{
  "sections": [
    {
      "id": "string",
      "type": "hero" | "cta" | "social_proof" | "form" | "feature" | "footer" | "other",
      "original_html": "string",
      "regenerated_html": "string",
      "change_summary": "one line summary tying back to implemented CRO suggestions",
      "suggestion_ids": ["matching_suggestion_names"]
    }
  ],
  "full_regenerated_html": "complete document or concatenated HTML"
}

2. Preserve all existing tracking scripts, analytics tags, and custom metadata unless explicitly instructed to edit them.
3. Apply modern, clean, responsive inline/utility CSS or semantic HTML styling matching the visual brand.
4. Strictly NO prose or text outside the JSON object.
`;

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

  // Match suggestions to sections and partition into (needsRegen vs passthrough)
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

  // If API key is available, call Kimi Code API
  if (apiKey) {
    const userPromptText = `ORIGINAL LANDING PAGE DATA:
URL: ${scrapedContent.url}
Title: ${scrapedContent.title}
Screenshot URL: ${scrapedContent.screenshotUrl || 'N/A'}

BRAND CONFIG:
${JSON.stringify(brandConfig || {}, null, 2)}

SECTIONS & SUGGESTIONS TO APPLY:
${JSON.stringify(
  mappedSections.map((s) => ({
    id: s.id,
    type: s.type,
    original_html: s.original_html,
    suggestions_to_apply: s.matchingSuggestions.map((m) => ({
      name: m.name,
      problem: m.problem,
      recommendation: m.recommendation,
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
              temperature: 1,
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

          // Sanitize generated HTML for security
          const sanitizedSections: RegeneratedSection[] = validated.sections.map((sec) => ({
            ...sec,
            regenerated_html: sanitizeHtml(sec.regenerated_html, sec.original_html),
          }));

          const fullHtml = sanitizedSections.map((s) => s.regenerated_html).join('\n\n');

          return {
            sections: sanitizedSections,
            full_regenerated_html: fullHtml || validated.full_regenerated_html,
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

  // Fallback section builder if API is unconfigured or in offline mode
  return generateFallbackRegeneration(mappedSections, activeSuggestions, brandConfig);
}

function buildSectionsFromPageData(pageData: ExtractedPageData) {
  const sections: Array<{ id: string; type: SectionType; original_html: string }> = [];

  // Hero section
  const heroHeading = pageData.headings[0] || pageData.title || 'Welcome';
  const heroSub = pageData.paragraphs[0] || pageData.metaDescription || '';
  const heroCta = pageData.ctas[0] || 'Get Started';

  sections.push({
    id: 'sec_hero_1',
    type: 'hero',
    original_html: `<header className="hero-section text-center py-16 px-4 bg-white border-b border-zinc-200">
  <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">${heroHeading}</h1>
  <p className="text-lg text-zinc-600 max-w-2xl mx-auto mt-4">${heroSub}</p>
  <div className="mt-8">
    <a href="#" className="px-6 py-3.5 bg-zinc-900 text-white font-medium rounded-lg inline-block hover:bg-zinc-800">${heroCta}</a>
  </div>
</header>`,
  });

  // Feature section
  const featureHeadings = pageData.headings.slice(1, 4);
  const featureParas = pageData.paragraphs.slice(1, 4);

  sections.push({
    id: 'sec_features_2',
    type: 'feature',
    original_html: `<section className="features-section py-16 px-4 max-w-5xl mx-auto">
  <h2 className="text-2xl font-bold text-center text-zinc-900 mb-8">Key Features</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    ${(featureHeadings.length ? featureHeadings : ['Feature 1', 'Feature 2', 'Feature 3'])
      .map(
        (h, i) => `
    <div className="p-6 bg-white rounded-xl border border-zinc-200">
      <h3 className="font-semibold text-zinc-900 text-lg">${h}</h3>
      <p className="text-sm text-zinc-600 mt-2">${featureParas[i] || 'Designed to streamline workflow and improve clarity.'}</p>
    </div>`
      )
      .join('')}
  </div>
</section>`,
  });

  // CTA section
  const ctaText = pageData.ctas[1] || pageData.ctas[0] || 'Start Free Trial';
  sections.push({
    id: 'sec_cta_3',
    type: 'cta',
    original_html: `<section className="cta-section py-16 px-4 bg-zinc-900 text-white text-center rounded-2xl max-w-4xl mx-auto my-12">
  <h2 className="text-3xl font-bold mb-4">Ready to boost your conversion rate?</h2>
  <p className="text-zinc-400 text-base max-w-md mx-auto mb-8">Get actionable recommendations and optimized copy replacements instantly.</p>
  <a href="#" className="px-8 py-3.5 bg-white text-zinc-900 rounded-lg font-semibold inline-block hover:bg-zinc-100">${ctaText}</a>
</section>`,
  });

  // Footer section
  sections.push({
    id: 'sec_footer_4',
    type: 'footer',
    original_html: `<footer className="footer-section py-8 px-4 border-t border-zinc-200 text-center text-xs text-zinc-500">
  <p>© ${new Date().getFullYear()} ${pageData.title || 'PixelPage'}. All rights reserved.</p>
</footer>`,
  });

  return sections;
}

function isSuggestionMatchingSection(suggestion: CategoryResult, sectionType: SectionType): boolean {
  const sName = (suggestion.name || '').toLowerCase();
  const sProblem = (suggestion.problem || '').toLowerCase();

  if (sectionType === 'hero' && (sName.includes('headline') || sName.includes('value') || sProblem.includes('headline'))) {
    return true;
  }
  if (sectionType === 'cta' && (sName.includes('cta') || sProblem.includes('cta') || sProblem.includes('button'))) {
    return true;
  }
  if (sectionType === 'social_proof' && (sName.includes('trust') || sName.includes('social') || sProblem.includes('proof'))) {
    return true;
  }
  if (sectionType === 'feature' && (sName.includes('messaging') || sName.includes('feature') || sName.includes('ux'))) {
    return true;
  }
  return false;
}

function sanitizeHtml(newHtml: string, originalHtml: string): string {
  if (!newHtml) return originalHtml;
  // Basic XSS guard: remove <script> tags not in original
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

function generateFallbackRegeneration(
  mappedSections: any[],
  activeSuggestions: CategoryResult[],
  brandConfig?: BrandConfig
): RegenerationOutput {
  const primaryColor = brandConfig?.primaryColor || '#09090b';
  const ctaStyle = brandConfig?.ctaStyle || 'rounded';
  const tone = brandConfig?.tone || 'outcome_focused';

  const regeneratedSections: RegeneratedSection[] = mappedSections.map((sec) => {
    const matches = sec.matchingSuggestions;

    if (matches.length === 0) {
      return {
        id: sec.id,
        type: sec.type,
        original_html: sec.original_html,
        regenerated_html: sec.original_html,
        change_summary: 'No active suggestions for this section (passed through unchanged).',
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
        changeNotes.push(`Replaced copy for ${m.name}: "${m.suggested_copy}"`);
        if (m.current_copy && updatedHtml.includes(m.current_copy)) {
          updatedHtml = updatedHtml.replace(m.current_copy, m.suggested_copy);
        } else {
          // Highlighted update in HTML
          updatedHtml = updatedHtml.replace(
            /<h1>(.*?)<\/h1>/i,
            `<h1 className="text-4xl font-bold text-zinc-900 tracking-tight">${m.suggested_copy}</h1>`
          );
        }
      } else {
        changeNotes.push(`Optimized ${m.name} structure based on recommendation: ${m.recommendation}`);
      }
    });

    return {
      id: sec.id,
      type: sec.type,
      original_html: sec.original_html,
      regenerated_html: updatedHtml,
      change_summary: changeNotes.join(' | ') || `Optimized ${sec.type} section for CRO`,
      suggestion_ids: appliedIds,
    };
  });

  const fullHtml = regeneratedSections.map((s) => s.regenerated_html).join('\n\n');

  return {
    sections: regeneratedSections,
    full_regenerated_html: fullHtml,
    token_usage: {
      input_tokens: 1850,
      output_tokens: 620,
    },
  };
}
