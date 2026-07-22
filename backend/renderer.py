import jinja2
from typing import List, Dict, Optional, Any
from models import SectionSelection, BrandKit

DEFAULT_TOKENS = {
    "primary_color": "#6366f1",
    "secondary_color": "#a855f7",
    "accent_color": "#3b82f6",
    "text_color": "#111827",
    "bg_color": "#ffffff",
    "background_color": "#ffffff",
    "dark_background_color": "#0f172a",
    "heading_color": "#111827",
    "dark_heading_color": "#f8fafc",
    "body_color": "#4b5563",
    "dark_body_color": "#94a3b8",
    "card_bg_color": "#f9fafb",
    "banner_color": "#4f46e5",
    "gradient_from": "#6366f1",
    "gradient_to": "#a855f7",
    "overlay_opacity": "0.5",
    "cta_url": "#",
    "cta_url_1": "#",
    "cta_url_2": "#",
    "secondary_cta_url": "#",
    "cta_text": "Get Started Now",
    "cta_text_1": "Get Started",
    "cta_text_2": "Learn More",
    "secondary_cta_text": "Learn More",
    "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "hero_image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "bg_image_url": "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80",
    "logo_url": "#",
    "logo_image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
}

def render_section(section: SectionSelection, library: List[Dict], brand_context: Optional[Dict] = None) -> str:
    template_data = next((item for item in library if item["template_file"] == section.template_file), None)
    if not template_data:
        return ""
    
    html_template_string = template_data.get("html_template", "")
    
    context = dict(DEFAULT_TOKENS)
    if brand_context:
        context.update(brand_context)

    if section.values:
        for k, v in section.values.items():
            if v is not None and str(v).strip() != "":
                clean_k = str(k).replace("{", "").replace("}", "").strip()
                context[clean_k] = str(v)
                context["{{" + clean_k + "}}"] = str(v)

    # Force brand kit overrides (logo & colors take precedence)
    if brand_context:
        if brand_context.get("logo_url"):
            context["logo_image_url"] = brand_context["logo_url"]
            context["brand_logo_url"] = brand_context["logo_url"]
            context["brand_logo"] = brand_context["logo_url"]
        if brand_context.get("primary_color"):
            context["primary_color"] = brand_context["primary_color"]
        if brand_context.get("secondary_color"):
            context["secondary_color"] = brand_context["secondary_color"]
        if brand_context.get("text_color"):
            context["text_color"] = brand_context["text_color"]

    env = jinja2.Environment(undefined=jinja2.Undefined)
    template = env.from_string(html_template_string)
    
    try:
        rendered = template.render(**context)
    except Exception as e:
        print(f"Error rendering section {section.template_file}: {e}")
        rendered = ""
        
    return rendered

def assemble_page(sections: List[SectionSelection], meta: Dict, pixel_ids: Optional[Dict], library: List[Dict], brand_kit: Optional[Any] = None) -> str:
    bk_dict = {}
    if brand_kit:
        if hasattr(brand_kit, 'model_dump'):
            bk_dict = brand_kit.model_dump()
        elif isinstance(brand_kit, dict):
            bk_dict = brand_kit

    brand_context = {}
    if bk_dict.get("primary_color"):
        brand_context["primary_color"] = bk_dict["primary_color"]
    if bk_dict.get("secondary_color"):
        brand_context["secondary_color"] = bk_dict["secondary_color"]
    if bk_dict.get("text_color"):
        brand_context["text_color"] = bk_dict["text_color"]
    if bk_dict.get("logo_url") and str(bk_dict["logo_url"]).strip():
        logo_val = str(bk_dict["logo_url"]).strip()
        brand_context["logo_url"] = logo_val
        brand_context["logo_image_url"] = logo_val
        brand_context["brand_logo_url"] = logo_val
        brand_context["brand_logo"] = logo_val

    rendered_sections = [render_section(sec, library, brand_context) for sec in sections]
    body_content = "\n".join(rendered_sections)
    
    requires_js = False
    for sec in sections:
        template_data = next((item for item in library if item["template_file"] == sec.template_file), None)
        if template_data and template_data.get("metadata", {}).get("js_dependency") == "requires_js":
            requires_js = True
            break
            
    alpine_script = "<script defer src=\"https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js\"></script>" if requires_js else ""
    
    pixel_scripts = ""
    if pixel_ids:
        meta_pixel = pixel_ids.get("meta")
        if meta_pixel:
            pixel_scripts += f"<!-- Meta Pixel --> <script>!function(f,b,e,v,n,t,s){{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '{meta_pixel}');fbq('track', 'PageView');</script>"
        google_ads = pixel_ids.get("google")
        if google_ads:
            pixel_scripts += f"<!-- Google Ads --> <script async src=\"https://www.googletagmanager.com/gtag/js?id={google_ads}\"></script><script>window.dataLayer = window.dataLayer || [];function gtag(){{dataLayer.push(arguments);}}gtag('js', new Date());gtag('config', '{google_ads}');</script>"

    title = meta.get("meta_title", "Landing Page")
    description = meta.get("meta_description", "")

    # Typography configuration
    font_heading = bk_dict.get("font_heading") or "Inter"
    font_body = bk_dict.get("font_body") or "Inter"
    
    font_heading_query = font_heading.strip().replace(" ", "+")
    font_body_query = font_body.strip().replace(" ", "+")

    fonts_url = f"https://fonts.googleapis.com/css2?family={font_heading_query}:wght@400;600;700;800&family={font_body_query}:wght@300;400;500;600;700&display=swap"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="{fonts_url}" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {{
            --font-heading: '{font_heading}', sans-serif;
            --font-body: '{font_body}', sans-serif;
        }}
        h1, h2, h3, h4, h5, h6, .font-heading {{
            font-family: var(--font-heading) !important;
        }}
        body, p, span, a, button, li, input, .font-body {{
            font-family: var(--font-body) !important;
        }}
    </style>
    {alpine_script}
    {pixel_scripts}
</head>
<body class="bg-white text-gray-900 antialiased">
    {body_content}
</body>
</html>"""
    return html
