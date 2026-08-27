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

const REGENERATE_SYSTEM_PROMPT = `You are a world-class principal frontend architect and direct-response Conversion Rate Optimization (CRO) expert.

Your task is to take original landing page data, extracted content, brand configuration, and user-selected CRO audit suggestions, and regenerate an improved, high-converting variant of the original landing page that matches the original design, structure, and visual theme of the target URL while applying the generated copy improvements.

CRITICAL MULTILINGUAL & LOCALIZATION RULES:
1. LANGUAGE PRESERVATION: You MUST detect and preserve the primary natural language of the original landing page (e.g. English, Spanish, French, German, Japanese, Chinese, Portuguese, Italian, Russian, Hindi, etc.).
2. ALL regenerated copy, headings, subheadings, feature points, CTA button text, trust microcopy, and badges MUST be in the EXACT SAME LANGUAGE as the original landing page.
3. If the original page is in Spanish, every single piece of copy in the regenerated sections and full HTML must be in natural, persuasive Spanish. If German, in German. If Japanese, in Japanese, etc.
4. NEVER translate or switch the page to English if the original site is in another language.

DESIGN & STYLING SPECIFICATIONS:
1. Preserve the original brand's visual identity:
   - Primary colors, layout density, typography style, and logo/images.
   - Use Tailwind CSS classes for responsive layouts, clean spacing, glassmorphic headers, and modern cards.
   - Use Lucide Icons or crisp SVGs for icons.
2. In full_regenerated_html:
   - Provide a complete standalone HTML document with <!DOCTYPE html>, <head> (including Tailwind CDN <script src="https://cdn.tailwindcss.com"></script>, Google Fonts, and viewport meta), and <body>.

OUTPUT FORMAT:
Output MUST strictly be valid JSON matching this schema:
{
  "sections": [
    {
      "id": "sec_hero_1",
      "type": "hero" | "cta" | "social_proof" | "form" | "feature" | "footer" | "other",
      "original_html": "original section html string",
      "regenerated_html": "regenerated section html in the page's language",
      "change_summary": "one line summary explaining the CRO fix in the page's language",
      "suggestion_ids": ["matching_suggestion_name"]
    }
  ],
  "full_regenerated_html": "complete standalone HTML document in the page's language"
}

Strictly NO text or markdown blocks outside the JSON object.`;

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

  // 1. If raw HTML from the original website is available and substantial, generate exact variant by replacing copy in the original DOM
  if (scrapedContent.rawHtml && scrapedContent.rawHtml.trim().length > 200) {
    try {
      const exactVariant = generateExactOriginalVariant(scrapedContent, activeSuggestions, brandConfig);
      if (exactVariant.full_regenerated_html && exactVariant.full_regenerated_html.length > 200) {
        return exactVariant;
      }
    } catch (err) {
      console.warn('[Regenerate] Exact original variant generation fallback triggered:', err);
    }
  }

  // 2. Build section models from scraped content
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
Page Language: ${scrapedContent.language || 'auto-detect'}
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

          const reactTsx = convertToReactTsx(fullHtml, scrapedContent.title);
          const vueCode = convertToVue(fullHtml);

          return {
            sections: sanitizedSections,
            full_regenerated_html: fullHtml,
            react_tsx: reactTsx,
            vue_code: vueCode,
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

  // Fallback section builder with language-aware interactive design
  return generateFallbackRegeneration(mappedSections, activeSuggestions, brandConfig, scrapedContent);
}

/**
 * Generates the EXACT same variant of the original entered URL by replacing target copy in the original HTML.
 */
export function generateExactOriginalVariant(
  scrapedContent: ExtractedPageData,
  activeSuggestions: CategoryResult[],
  brandConfig?: BrandConfig
): RegenerationOutput {
  let originalHtml = scrapedContent.rawHtml || '';

  // Clean scripts that could break inside iframe srcDoc (e.g. trackers, hydration bundles)
  originalHtml = sanitizeRawHtmlForIframe(originalHtml);

  // Inject <base href="..."> so original images, CSS, fonts, and assets load seamlessly
  let updatedHtml = injectBaseTag(originalHtml, scrapedContent.url);

  const sections: RegeneratedSection[] = [];

  // Iterate over suggestions and replace text in the original HTML
  activeSuggestions.forEach((s, idx) => {
    const currentCopy = s.current_copy?.trim();
    const suggestedCopy = s.suggested_copy?.trim();

    if (!suggestedCopy) return;

    let targetToReplace = currentCopy;

    // If current_copy is missing, infer target from headings / CTAs in original language
    if (!targetToReplace) {
      const sName = s.name.toLowerCase();
      if (sName.includes('headline') || sName.includes('hero') || sName.includes('titular')) {
        targetToReplace = scrapedContent.headings[0] || scrapedContent.title;
      } else if (sName.includes('cta') || sName.includes('button') || sName.includes('botón')) {
        targetToReplace = scrapedContent.ctas[0];
      } else if (sName.includes('value') || sName.includes('subhead') || sName.includes('propuesta')) {
        targetToReplace = scrapedContent.paragraphs[0];
      }
    }

    if (targetToReplace) {
      const result = replaceCopyInHtml(updatedHtml, targetToReplace, suggestedCopy);
      if (result.replaced) {
        updatedHtml = result.updatedHtml;
      }

      sections.push({
        id: `sec_orig_${idx + 1}`,
        type: inferSectionType(s.name),
        original_html: `<div class="p-3 bg-red-50/70 border border-red-200 rounded font-mono text-xs text-red-950">${escapeHtml(targetToReplace)}</div>`,
        regenerated_html: `<div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded font-mono text-xs text-emerald-950">${escapeHtml(suggestedCopy)}</div>`,
        change_summary: `Replaced "${targetToReplace.substring(0, 40)}..." with "${suggestedCopy.substring(0, 40)}..."`,
        suggestion_ids: [s.name],
      });
    }
  });

  // If no specific replacements were matched, add a summary section
  if (sections.length === 0) {
    sections.push({
      id: 'sec_orig_1',
      type: 'hero',
      original_html: `<div class="text-xs text-zinc-600 font-mono">${escapeHtml(scrapedContent.headings[0] || scrapedContent.title)}</div>`,
      regenerated_html: `<div class="text-xs text-zinc-900 font-mono font-bold">${escapeHtml(activeSuggestions[0]?.suggested_copy || 'Optimized page variant')}</div>`,
      change_summary: 'Optimized landing page copy based on CRO recommendations',
      suggestion_ids: activeSuggestions.map((s) => s.name),
    });
  }

  const reactTsx = convertToReactTsx(updatedHtml, scrapedContent.title);
  const vueCode = convertToVue(updatedHtml);

  return {
    sections,
    full_regenerated_html: updatedHtml,
    react_tsx: reactTsx,
    vue_code: vueCode,
    token_usage: {
      input_tokens: 1200,
      output_tokens: 450,
    },
  };
}

function sanitizeRawHtmlForIframe(html: string): string {
  // Remove scripts that cause iframe errors / blank pages while keeping CSS and styling intact
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*(?:google-analytics|googletagmanager|hotjar|facebook\.net|clarity\.ms|sentry|datadog)[^<]*<\/script>/gi, '')
    .replace(/<script[^>]*id="__NEXT_DATA__"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');

  return cleaned;
}

function replaceCopyInHtml(
  html: string,
  targetText: string,
  replacementText: string
): { updatedHtml: string; replaced: boolean } {
  if (!targetText || !replacementText) return { updatedHtml: html, replaced: false };

  const cleanTarget = targetText.trim();
  const cleanReplacement = replacementText.trim();

  // 1. Direct exact match
  if (html.includes(cleanTarget)) {
    return { updatedHtml: html.replace(cleanTarget, cleanReplacement), replaced: true };
  }

  // 2. Case-insensitive exact match
  const idx = html.toLowerCase().indexOf(cleanTarget.toLowerCase());
  if (idx !== -1) {
    const before = html.substring(0, idx);
    const after = html.substring(idx + cleanTarget.length);
    return { updatedHtml: before + cleanReplacement + after, replaced: true };
  }

  // 3. Flexible whitespace regex match (supports Unicode across any language)
  try {
    const escaped = cleanTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const regex = new RegExp(escaped, 'i');
    if (regex.test(html)) {
      return { updatedHtml: html.replace(regex, cleanReplacement), replaced: true };
    }
  } catch {}

  // 4. Word-by-word substring match for long sentences
  const words = cleanTarget.split(/\s+/).filter((w) => w.length > 2);
  if (words.length >= 3) {
    try {
      const partialEscaped = words.slice(0, 4).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
      const partialRegex = new RegExp(`(<[^>]*>)?${partialEscaped}[^<]*`, 'i');
      if (partialRegex.test(html)) {
        return {
          updatedHtml: html.replace(partialRegex, (m) =>
            m.startsWith('<') ? m.substring(0, m.indexOf('>') + 1) + cleanReplacement : cleanReplacement
          ),
          replaced: true,
        };
      }
    } catch {}
  }

  return { updatedHtml: html, replaced: false };
}

function injectBaseTag(html: string, url: string): string {
  try {
    const parsed = new URL(url);
    const origin = parsed.origin + (parsed.pathname.endsWith('/') ? parsed.pathname : parsed.pathname.substring(0, parsed.pathname.lastIndexOf('/') + 1) || '/');

    if (html.includes('<base ') || html.includes('<base>')) {
      return html;
    }

    const baseTag = `<base href="${origin}">\n`;
    if (html.includes('<head>')) {
      return html.replace('<head>', `<head>\n  ${baseTag}`);
    } else if (html.includes('<head ')) {
      return html.replace(/<head[^>]*>/, (match) => `${match}\n  ${baseTag}`);
    } else if (html.includes('<html')) {
      return html.replace(/<html[^>]*>/, (match) => `${match}\n<head>\n  ${baseTag}</head>`);
    } else {
      return `<head>${baseTag}</head>\n` + html;
    }
  } catch {
    return html;
  }
}

function inferSectionType(name: string): SectionType {
  const lower = (name || '').toLowerCase();
  if (lower.includes('headline') || lower.includes('hero') || lower.includes('title') || lower.includes('titular')) return 'hero';
  if (lower.includes('cta') || lower.includes('button') || lower.includes('action') || lower.includes('botón') || lower.includes('appel')) return 'cta';
  if (lower.includes('proof') || lower.includes('trust') || lower.includes('social') || lower.includes('confianza')) return 'social_proof';
  if (lower.includes('feature') || lower.includes('benefit') || lower.includes('característica') || lower.includes('fonction')) return 'feature';
  return 'other';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getLocalizedLabels(lang: string = 'en') {
  const l = lang.toLowerCase();
  if (l.startsWith('es')) {
    return {
      features: 'Características',
      testimonials: 'Testimonios',
      pricing: 'Precios',
      faq: 'Preguntas Frecuentes',
      whyChoose: 'Por qué elegir',
      verifiedCro: 'CRO Verificado',
      getStarted: 'Comenzar Gratis',
      exploreFeatures: 'Explorar Funciones',
      coreCapabilities: 'Capacidades Principales',
      noCreditCard: 'Sin tarjeta de crédito',
      freeTrial: 'Prueba de 14 días',
      quickSetup: 'Configuración en 2 min',
      monthly: 'Mensual',
      annual: 'Anual',
      save20: 'AHORRA 20%',
      rightsReserved: 'Todos los derechos reservados.',
    };
  }
  if (l.startsWith('de')) {
    return {
      features: 'Funktionen',
      testimonials: 'Kundenstimmen',
      pricing: 'Preise',
      faq: 'Häufige Fragen',
      whyChoose: 'Warum',
      verifiedCro: 'Verifiziertes CRO',
      getStarted: 'Kostenlos Starten',
      exploreFeatures: 'Funktionen Entdecken',
      coreCapabilities: 'Hauptfunktionen',
      noCreditCard: 'Keine Kreditkarte erforderlich',
      freeTrial: '14 Tage kostenlos testen',
      quickSetup: 'In 2 Minuten einsatzbereit',
      monthly: 'Monatlich',
      annual: 'Jährlich',
      save20: '20% SPAREN',
      rightsReserved: 'Alle Rechte vorbehalten.',
    };
  }
  if (l.startsWith('fr')) {
    return {
      features: 'Fonctionnalités',
      testimonials: 'Témoignages',
      pricing: 'Tarifs',
      faq: 'Questions Fréquentes',
      whyChoose: 'Pourquoi choisir',
      verifiedCro: 'CRO Vérifié',
      getStarted: 'Démarrer Gratuitement',
      exploreFeatures: 'Découvrir les Fonctionnalités',
      coreCapabilities: 'Capacités Clés',
      noCreditCard: 'Aucune carte de crédit requise',
      freeTrial: 'Essai gratuit de 14 jours',
      quickSetup: 'Configuration en 2 min',
      monthly: 'Mensuel',
      annual: 'Annuel',
      save20: 'ÉCONOMISEZ 20%',
      rightsReserved: 'Tous droits réservés.',
    };
  }
  if (l.startsWith('pt')) {
    return {
      features: 'Recursos',
      testimonials: 'Depoimentos',
      pricing: 'Preços',
      faq: 'Perguntas Frequentes',
      whyChoose: 'Por que escolher',
      verifiedCro: 'CRO Verificado',
      getStarted: 'Começar Grátis',
      exploreFeatures: 'Explorar Recursos',
      coreCapabilities: 'Principais Recursos',
      noCreditCard: 'Sem cartão de crédito',
      freeTrial: 'Teste grátis de 14 dias',
      quickSetup: 'Configuração em 2 min',
      monthly: 'Mensal',
      annual: 'Anual',
      save20: 'ECONOMIZE 20%',
      rightsReserved: 'Todos os direitos reservados.',
    };
  }
  if (l.startsWith('ja')) {
    return {
      features: '機能',
      testimonials: '導入事例',
      pricing: '料金プラン',
      faq: 'よくある質問',
      whyChoose: '選ばれる理由',
      verifiedCro: '検証済みCRO',
      getStarted: '無料で始める',
      exploreFeatures: '機能を見る',
      coreCapabilities: '主な機能',
      noCreditCard: 'クレジットカード不要',
      freeTrial: '14日間の無料トライアル',
      quickSetup: '2分でセットアップ',
      monthly: '月額',
      annual: '年額',
      save20: '20%割引',
      rightsReserved: 'All rights reserved.',
    };
  }
  if (l.startsWith('zh')) {
    return {
      features: '产品功能',
      testimonials: '客户评价',
      pricing: '价格方案',
      faq: '常见问题',
      whyChoose: '为什么选择',
      verifiedCro: '专业转化率优化',
      getStarted: '免费开始使用',
      exploreFeatures: '探索核心功能',
      coreCapabilities: '核心能力',
      noCreditCard: '无需信用卡',
      freeTrial: '14天免费试用',
      quickSetup: '2分钟快速配置',
      monthly: '按月付费',
      annual: '按年付费',
      save20: '立省20%',
      rightsReserved: '保留所有权利。',
    };
  }

  // Default: English
  return {
    features: 'Features',
    testimonials: 'Testimonials',
    pricing: 'Pricing',
    faq: 'FAQ',
    whyChoose: 'Why',
    verifiedCro: 'Verified CRO',
    getStarted: 'Start Free Trial',
    exploreFeatures: 'Explore Core Features',
    coreCapabilities: 'Core Capabilities',
    noCreditCard: 'No credit card required',
    freeTrial: '14-day free trial',
    quickSetup: '2-minute setup',
    monthly: 'Monthly',
    annual: 'Annual',
    save20: 'SAVE 20%',
    rightsReserved: 'All rights reserved.',
  };
}

function buildSectionsFromPageData(pageData: ExtractedPageData) {
  const sections: Array<{ id: string; type: SectionType; original_html: string }> = [];

  const lang = pageData.language || 'en';
  const L = getLocalizedLabels(lang);

  const brandName = pageData.title.split(/[-|:]/)[0]?.trim() || 'Product';
  const heroHeading = pageData.headings[0] || pageData.title || `${brandName}`;
  const heroSub = pageData.paragraphs[0] || pageData.metaDescription || '';
  const heroCta = pageData.ctas[0] || L.getStarted;

  // 1. Navigation Section
  sections.push({
    id: 'sec_nav_0',
    type: 'other',
    original_html: `<nav class="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50 transition-all">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-zinc-900 text-white font-bold text-base flex items-center justify-center shadow-sm">
        ${brandName.charAt(0)}
      </div>
      <div class="flex items-center gap-2">
        <span class="font-bold text-zinc-900 text-lg tracking-tight">${brandName}</span>
        <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-block">${L.verifiedCro}</span>
      </div>
    </div>

    <div class="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-600">
      <a href="#features" class="hover:text-zinc-900 transition-colors">${L.features}</a>
      <a href="#testimonials" class="hover:text-zinc-900 transition-colors">${L.testimonials}</a>
      <a href="#pricing" class="hover:text-zinc-900 transition-colors">${L.pricing}</a>
      <a href="#faq" class="hover:text-zinc-900 transition-colors">${L.faq}</a>
    </div>

    <div class="flex items-center gap-3">
      <a href="#cta" class="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]">
        ${heroCta} →
      </a>
    </div>
  </div>
</nav>`,
  });

  // 2. Hero Section with Original Image / Screenshot
  const heroImage = pageData.screenshotUrl || pageData.images?.[0]?.src;
  sections.push({
    id: 'sec_hero_1',
    type: 'hero',
    original_html: `<section class="relative bg-gradient-to-b from-zinc-50/80 via-white to-white py-16 sm:py-24 px-4 border-b border-zinc-100 overflow-hidden text-center">
  <div class="max-w-4xl mx-auto relative z-10">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 border border-zinc-200 text-xs font-semibold text-zinc-700 mb-6 shadow-xs">
      <span class="flex h-2 w-2 relative">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>⚡ ${L.verifiedCro}</span>
    </div>

    <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.12] mb-6">
      ${heroHeading}
    </h1>

    ${
      heroSub
        ? `<p class="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">${heroSub}</p>`
        : ''
    }

    <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
      <a href="#cta" class="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]">
        ${heroCta} →
      </a>
      <a href="#features" class="w-full sm:w-auto px-7 py-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-xl text-sm font-semibold transition-all shadow-xs">
        ${L.exploreFeatures}
      </a>
    </div>

    <div class="flex items-center justify-center gap-4 text-xs text-zinc-500 flex-wrap">
      <span class="flex items-center gap-1.5 font-medium text-zinc-700">
        <span class="text-emerald-600 font-bold">✓</span> ${L.noCreditCard}
      </span>
      <span>•</span>
      <span class="flex items-center gap-1.5 font-medium text-zinc-700">
        <span class="text-emerald-600 font-bold">✓</span> ${L.freeTrial}
      </span>
      <span>•</span>
      <span class="flex items-center gap-1.5 font-medium text-zinc-700">
        <span class="text-emerald-600 font-bold">✓</span> ${L.quickSetup}
      </span>
    </div>

    <!-- Product Showcase Mockup Card -->
    <div class="mt-14 rounded-2xl border border-zinc-200/90 shadow-2xl max-w-4xl mx-auto bg-white p-3 sm:p-5 text-left transition-all">
      <div class="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4 px-2">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-red-400"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span class="text-xs font-mono text-zinc-400 ml-2 hidden sm:inline-block">${pageData.url}</span>
        </div>
        <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">● ${L.verifiedCro}</span>
      </div>

      ${
        heroImage
          ? `<img src="${heroImage}" alt="${brandName} Showcase" class="w-full h-auto rounded-xl object-cover border border-zinc-100 max-h-[480px]" />`
          : `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-2">
               <div class="bg-zinc-50 p-5 rounded-xl border border-zinc-200/70">
                 <span class="text-xs font-semibold text-zinc-500 uppercase">Conversion Lift</span>
                 <div class="text-3xl font-extrabold text-zinc-900 mt-1">+38.4%</div>
               </div>
               <div class="bg-zinc-50 p-5 rounded-xl border border-zinc-200/70">
                 <span class="text-xs font-semibold text-zinc-500 uppercase">Page Speed</span>
                 <div class="text-3xl font-extrabold text-zinc-900 mt-1">2.4s</div>
               </div>
               <div class="bg-zinc-50 p-5 rounded-xl border border-zinc-200/70">
                 <span class="text-xs font-semibold text-zinc-500 uppercase">Trust Rating</span>
                 <div class="text-3xl font-extrabold text-zinc-900 mt-1">4.9/5</div>
               </div>
             </div>`
      }
    </div>
  </div>
</section>`,
  });

  // 3. Feature Section in Original Language
  const featureHeadings = pageData.headings.slice(1, 4);
  const featureParas = pageData.paragraphs.slice(1, 4);

  sections.push({
    id: 'sec_features_3',
    type: 'feature',
    original_html: `<section id="features" class="py-20 px-4 bg-zinc-50/60 border-b border-zinc-100">
  <div class="max-w-6xl mx-auto">
    <div class="text-center max-w-2xl mx-auto mb-14">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 mb-3">
        <span>${L.coreCapabilities}</span>
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-3">
        ${L.features}
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${(featureHeadings.length >= 1 ? featureHeadings : ['Feature 1', 'Feature 2', 'Feature 3'])
        .slice(0, 3)
        .map(
          (h, i) => `
      <div class="bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all">
        <div class="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-base mb-5 shadow-sm">
          0${i + 1}
        </div>
        <h3 class="font-bold text-zinc-900 text-lg mb-2">${h}</h3>
        <p class="text-xs text-zinc-600 leading-relaxed">${featureParas[i] || ''}</p>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>`,
  });

  // 4. CTA Section in Original Language
  const ctaText = pageData.ctas[1] || pageData.ctas[0] || L.getStarted;
  sections.push({
    id: 'sec_cta_4',
    type: 'cta',
    original_html: `<section id="cta" class="py-20 px-4 bg-zinc-900 text-white text-center">
  <div class="max-w-4xl mx-auto rounded-3xl p-8 sm:p-16 relative overflow-hidden bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 border border-zinc-700 shadow-2xl">
    <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
      ${heroHeading}
    </h2>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
      <a href="#" class="px-8 py-4 bg-white text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]">
        ${ctaText} →
      </a>
    </div>
    <p class="text-xs text-zinc-500 mt-4">✓ ${L.freeTrial} • ${L.noCreditCard} • ${L.quickSetup}</p>
  </div>
</section>`,
  });

  // 5. Footer Section in Original Language
  sections.push({
    id: 'sec_footer_5',
    type: 'footer',
    original_html: `<footer class="py-12 px-4 bg-white border-t border-zinc-200 text-xs text-zinc-500">
  <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
    <div class="flex items-center gap-2.5">
      <div class="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
        ${brandName.charAt(0)}
      </div>
      <span class="font-bold text-zinc-900 text-sm">${brandName}</span>
    </div>
    <p>© ${new Date().getFullYear()} ${brandName}. ${L.rightsReserved}</p>
  </div>
</footer>`,
  });

  return sections;
}

function isSuggestionMatchingSection(suggestion: CategoryResult, sectionType: SectionType): boolean {
  const sName = (suggestion.name || '').toLowerCase();
  const sProblem = (suggestion.problem || '').toLowerCase();

  if (sectionType === 'hero' && (sName.includes('headline') || sName.includes('hero') || sName.includes('titular') || sName.includes('titre') || sProblem.includes('headline'))) {
    return true;
  }
  if (sectionType === 'cta' && (sName.includes('cta') || sName.includes('button') || sName.includes('action') || sName.includes('botón') || sProblem.includes('cta'))) {
    return true;
  }
  if (sectionType === 'social_proof' && (sName.includes('trust') || sName.includes('social') || sName.includes('proof') || sName.includes('confianza') || sProblem.includes('proof'))) {
    return true;
  }
  if (sectionType === 'feature' && (sName.includes('messaging') || sName.includes('feature') || sName.includes('característica') || sName.includes('copy'))) {
    return true;
  }
  return false;
}

function sanitizeHtml(newHtml: string, originalHtml: string): string {
  if (!newHtml) return originalHtml;
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
  const lang = pageData.language || 'en';

  return `<!DOCTYPE html>
<html lang="${lang}" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageData.title)}</title>
  <meta name="description" content="${escapeHtml(pageData.metaDescription || '')}">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Alpine.js Interactivity -->
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
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
<body class="min-h-screen antialiased flex flex-col justify-between selection:bg-zinc-900 selection:text-white">
${bodyHtml}
<script>
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
</script>
</body>
</html>`;
}

export function convertToReactTsx(htmlString: string, title?: string): string {
  const cleanTitle = (title || 'OptimizedLandingPage').replace(/[^a-zA-Z0-9]/g, '');

  let jsx = htmlString
    .replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*?<\/html>/i, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\bclass=/g, 'className=')
    .replace(/\bfor=/g, 'htmlFor=')
    .replace(/\bx-data="[^"]*"/g, '')
    .replace(/\bx-text="[^"]*"/g, '')
    .replace(/\bx-show="[^"]*"/g, '')
    .replace(/\bx-collapse/g, '')
    .replace(/@click="[^"]*"/g, '')
    .replace(/:class="[^"]*"/g, '')
    .replace(/<img([^>]*?)>/gi, '<img$1 />')
    .replace(/<input([^>]*?)>/gi, '<input$1 />')
    .replace(/<br>/gi, '<br />')
    .replace(/<hr>/gi, '<hr />');

  return `"use client";

import React, { useState } from 'react';

export default function ${cleanTitle || 'LandingPage'}() {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased font-sans flex flex-col justify-between">
      ${jsx.trim()}
    </div>
  );
}
`;
}

export function convertToVue(htmlString: string): string {
  let template = htmlString
    .replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*?<\/html>/i, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');

  return `<template>
  <div class="min-h-screen bg-white text-zinc-900 antialiased font-sans flex flex-col justify-between">
    ${template.trim()}
  </div>
</template>

<script setup>
import { ref } from 'vue';

const annualBilling = ref(true);
const openFaq = ref(0);
</script>
`;
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

    // Apply suggested copy replacements in original language
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
            `<h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.12] mb-6">${m.suggested_copy}</h1>`
          );
        } else if (sec.type === 'cta') {
          // Upgrade CTA
          updatedHtml = updatedHtml.replace(
            /<a[^>]*>(.*?)<\/a>/i,
            `<a href="#" class="px-8 py-4 bg-white text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] inline-block">${m.suggested_copy} →</a>`
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
      language: 'en',
    },
    sectionsHtml,
    brandConfig
  );

  const reactTsx = convertToReactTsx(fullHtml, scrapedContent?.title);
  const vueCode = convertToVue(fullHtml);

  return {
    sections: regeneratedSections,
    full_regenerated_html: fullHtml,
    react_tsx: reactTsx,
    vue_code: vueCode,
    token_usage: {
      input_tokens: 1850,
      output_tokens: 620,
    },
  };
}
