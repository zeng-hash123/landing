export interface ExtractedPageData {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  paragraphs: string[];
  ctas: string[];
  images: { alt: string; src: string }[];
  links: { text: string; href: string }[];
  sections: string[];
  visibleText: string;
  screenshotUrl?: string;
  rawHtml?: string;
}
