import httpx
from html.parser import HTMLParser

class SimpleHTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.meta_description = ""
        self.og_title = ""
        self.og_description = ""
        self.headings = []
        self.paragraphs = []
        self._current_tag = None

    def handle_starttag(self, tag, attrs):
        self._current_tag = tag.lower()
        attr_dict = {k.lower(): v for k, v in attrs if k and v}
        
        if tag.lower() == "meta":
            name = attr_dict.get("name", "").lower()
            prop = attr_dict.get("property", "").lower()
            content = attr_dict.get("content", "")
            
            if name == "description":
                self.meta_description = content
            elif prop == "og:description":
                self.og_description = content
            elif prop == "og:title":
                self.og_title = content

    def handle_data(self, data):
        text = data.strip()
        if not text:
            return
        if self._current_tag == "title" and not self.title:
            self.title = text
        elif self._current_tag in ["h1", "h2", "h3"] and len(self.headings) < 5:
            self.headings.append(text)
        elif self._current_tag == "p" and len(self.paragraphs) < 8:
            self.paragraphs.append(text)

async def scrape_ad_url(url: str) -> dict:
    """
    Fetches and extracts key page information (title, meta description, headers, paragraphs)
    from a given URL to generate a landing page brief.
    """
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            html_content = response.text

        parser = SimpleHTMLTextExtractor()
        parser.feed(html_content)

        title = parser.og_title or parser.title or ""
        desc = parser.og_description or parser.meta_description or ""
        headings_text = " | ".join(parser.headings[:3]) if parser.headings else ""
        body_sample = " ".join(parser.paragraphs[:4]) if parser.paragraphs else ""

        summary_parts = []
        if title:
            summary_parts.append(f"Product/Brand: {title}")
        if desc:
            summary_parts.append(f"Description: {desc}")
        if headings_text:
            summary_parts.append(f"Key Highlights: {headings_text}")
        if body_sample:
            summary_parts.append(f"Overview: {body_sample[:300]}")

        scraped_text = "\n".join(summary_parts) if summary_parts else f"Content scraped from {url}"

        return {
            "product_description": scraped_text,
            "title": title,
            "description": desc,
            "url": url
        }
    except Exception as e:
        print(f"Scraper error for {url}: {e}")
        return {
            "product_description": f"Landing page for product at {url}. (Unable to fetch raw HTML: {str(e)})",
            "url": url
        }
