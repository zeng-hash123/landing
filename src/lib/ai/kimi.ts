import { z } from 'zod';
import { ExtractedPageData } from '@/types/page';
import { AuditResult } from '@/types/audit';
import { KIMI_CRO_SYSTEM_PROMPT } from './prompts';

// Enforced Token Limits for Kimi K3
export const MAX_INPUT_TOKENS = 6000;
export const MAX_OUTPUT_TOKENS = 2000;

// Approximate character limit to guarantee input stays strictly within 6,000 input tokens
const MAX_INPUT_CHARS = 22000;

// Server-side Zod Schema for strict validation
const SeverityEnum = z.enum(['critical', 'high', 'medium', 'low']);

const CategorySchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  severity: SeverityEnum,
  problem: z.string(),
  why_it_matters: z.string(),
  recommendation: z.string(),
  current_copy: z.string().optional().default(''),
  suggested_copy: z.string().optional().default(''),
});

const PrioritySchema = z.object({
  title: z.string(),
  severity: SeverityEnum,
  reason: z.string(),
  recommendation: z.string(),
});

const AuditResultSchema = z.object({
  overall_score: z.number().min(0).max(100),
  summary: z.string(),
  categories: z.array(CategorySchema),
  top_priorities: z.array(PrioritySchema),
});

// Primary global endpoint and fallback endpoints for Kimi K3 platform
const ENDPOINTS = [
  'https://api.moonshot.ai/v1/chat/completions',
  'https://api.moonshot.cn/v1/chat/completions',
];

export async function auditLandingPage(pageData: ExtractedPageData): Promise<AuditResult> {
  const rawKey = process.env.KIMI_API_KEY;

  if (!rawKey) {
    throw new Error('KIMI_API_KEY is not configured on the server.');
  }

  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');

  // Truncate input content to strictly respect max_input_tokens = 6000
  const safeVisibleText = (pageData.visibleText || '').substring(0, MAX_INPUT_CHARS);

  const userPromptText = `Please perform a comprehensive CRO audit for the following landing page:

URL: ${pageData.url}
Page Title: ${pageData.title}
Meta Description: ${pageData.metaDescription}

Headings:
${pageData.headings.join('\n')}

CTAs / Buttons:
${pageData.ctas.join('\n')}

Key Paragraphs & Copy:
${pageData.paragraphs.join('\n\n')}

Page Sections:
${pageData.sections.join('\n')}

Full Content Snippet:
${safeVisibleText}
`;

  // Multimodal user message supporting visual screenshot + text context
  const userMessageContent = pageData.screenshotUrl
    ? [
        { type: 'text', text: userPromptText },
        { type: 'image_url', image_url: { url: pageData.screenshotUrl } },
      ]
    : userPromptText;

  // Configuration combinations to attempt
  const configs = [
    {
      endpoint: 'https://api.moonshot.ai/v1/chat/completions',
      model: 'kimi-k3',
      temperature: 1,
    },
    {
      endpoint: 'https://api.moonshot.cn/v1/chat/completions',
      model: 'moonshot-v1-8k',
      temperature: 0.2,
    },
  ];

  let lastErrorMsg = '';

  for (const config of configs) {
    // Retry loop for rate limits (429) and transient errors
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            temperature: config.temperature,
            max_tokens: MAX_OUTPUT_TOKENS,
            max_output_tokens: MAX_OUTPUT_TOKENS,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: KIMI_CRO_SYSTEM_PROMPT },
              { role: 'user', content: userMessageContent },
            ],
          }),
        });

        if (response.status === 429) {
          lastErrorMsg = `Rate limit (429) on ${config.endpoint}. Retrying...`;
          console.warn(`[Kimi AI] ${lastErrorMsg} (Attempt ${attempt}/4)`);
          const delay = attempt * 2000;
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          lastErrorMsg = `Status ${response.status} on ${config.endpoint}: ${errorText}`;
          console.warn(`[Kimi AI] ${lastErrorMsg}`);
          break; // move to next config if non-429 error
        }

        const json = await response.json();
        const contentStr = json?.choices?.[0]?.message?.content || '';

        const cleanedContent = sanitizeJsonString(contentStr);
        const parsedRaw = JSON.parse(cleanedContent);

        const validatedData = AuditResultSchema.parse(parsedRaw);
        return validatedData as AuditResult;
      } catch (err: any) {
        lastErrorMsg = err.message || String(err);
        console.warn(`[Kimi AI] Error on ${config.endpoint}: ${lastErrorMsg}`);
      }
    }
  }

  throw new Error(`Kimi AI audit failed: ${lastErrorMsg}`);
}

function sanitizeJsonString(raw: string): string {
  let trimmed = raw.trim();

  // Strip markdown code block wrappers if present
  if (trimmed.startsWith('```json')) {
    trimmed = trimmed.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (trimmed.startsWith('```')) {
    trimmed = trimmed.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  return trimmed.trim();
}
