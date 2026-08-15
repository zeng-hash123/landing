import { ExtractedPageData } from '@/types/page';

interface FirecrawlScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    screenshot?: string;
    metadata?: {
      title?: string;
      description?: string;
      ogTitle?: string;
      ogDescription?: string;
      statusCode?: number;
    };
  };
  error?: string;
}

export async function crawlPage(targetUrl: string): Promise<ExtractedPageData> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY is not configured on the server.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: targetUrl,
        formats: ['markdown', 'html', 'screenshot'],
        onlyMainContent: true,
        timeout: 25000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Firecrawl API request failed with status ${response.status}: ${errText}`);
    }

    const json = (await response.json()) as FirecrawlScrapeResponse;

    if (!json.success || !json.data) {
      throw new Error(json.error || 'Firecrawl failed to scrape the provided URL.');
    }

    const { markdown = '', html = '', screenshot = '', metadata = {} } = json.data;

    // Parse HTML & Markdown into compact structured representation
    return extractStructuredContent(targetUrl, markdown, html, metadata, screenshot);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Website crawl timed out. Please check if the site is accessible.');
    }
    throw err;
  }
}

function extractStructuredContent(
  url: string,
  markdown: string,
  html: string,
  metadata: Record<string, any>,
  screenshotUrl?: string
): ExtractedPageData {
  const title = metadata.title || metadata.ogTitle || extractMarkdownHeading1(markdown) || 'Untitled Page';
  const metaDescription = metadata.description || metadata.ogDescription || '';

  // Extract headings (H1-H6)
  const headings: string[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    if (match[2] && match[2].trim()) {
      headings.push(match[2].trim());
    }
  }

  // Extract paragraphs (lines with substantial text)
  const paragraphs: string[] = markdown
    .split('\n\n')
    .map((p) => p.replace(/[#*`_[\]]/g, '').trim())
    .filter((p) => p.length > 20 && !p.startsWith('http'));

  // Extract CTAs (buttons or action link text)
  const ctas: string[] = [];
  const ctaRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  while ((match = ctaRegex.exec(markdown)) !== null) {
    const text = match[1]?.trim();
    if (text && text.length < 50 && isCtaText(text)) {
      ctas.push(text);
    }
  }

  // Extract Images
  const images: { alt: string; src: string }[] = [];
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((match = imgRegex.exec(markdown)) !== null) {
    if (match[2] && images.length < 10) {
      images.push({ alt: match[1] || '', src: match[2] });
    }
  }

  // Extract Links (first 15)
  const links: { text: string; href: string }[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  while ((match = linkRegex.exec(markdown)) !== null) {
    if (match[1] && match[2] && links.length < 15) {
      links.push({ text: match[1].trim(), href: match[2] });
    }
  }

  // Extract major content sections
  const sections = headings.slice(0, 10);

  // Compact visible text (truncate to max 4000 characters to keep payload light for LLM)
  const visibleText = markdown
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .substring(0, 4000);

  return {
    url,
    title,
    metaDescription,
    headings: headings.slice(0, 15),
    paragraphs: paragraphs.slice(0, 15),
    ctas: Array.from(new Set(ctas)).slice(0, 10),
    images,
    links,
    sections,
    visibleText,
    screenshotUrl: screenshotUrl || undefined,
  };
}

function extractMarkdownHeading1(md: string): string | null {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function isCtaText(text: string): boolean {
  const ctaKeywords = [
    'sign up',
    'get started',
    'try free',
    'start free',
    'buy now',
    'join',
    'subscribe',
    'book',
    'demo',
    'contact',
    'download',
    'learn more',
    'claim',
    'request',
  ];
  const lower = text.toLowerCase();
  return ctaKeywords.some((kw) => lower.includes(kw));
}
