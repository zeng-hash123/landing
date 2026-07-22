from models import BrandKit, SectionSelection
from renderer import assemble_page

bk = BrandKit(
    primary_color="#10b981",
    secondary_color="#f59e0b",
    text_color="#1f2937",
    font_heading="Outfit",
    font_body="Roboto",
    logo_url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
)

sections = [
    SectionSelection(
        section_type="hero",
        template_file="hero8.json",
        values={
            "headline": "Custom Brand Kit Test",
            "subheadline": "Testing brand kit font and logo integration",
            "cta_text": "Get Started"
        }
    )
]

library = [
    {
        "template_file": "hero8.json",
        "html_template": "<div class=\"hero\"><img src=\"{{logo_image_url}}\" alt=\"Logo\"><h1 class=\"font-heading\">{{headline}}</h1><p class=\"font-body\">{{subheadline}}</p></div>",
        "metadata": {"section_type": "hero"}
    }
]

html = assemble_page(sections, {"meta_title": "Test"}, None, library, brand_kit=bk)

print("--- Generated HTML Head & Content ---")
print(html[:600])

assert "family=Outfit" in html, "Heading font Outfit missing from Google Fonts URL"
assert "family=Roboto" in html, "Body font Roboto missing from Google Fonts URL"
assert "data:image/png;base64," in html, "Uploaded logo data URI missing from rendered HTML logo tag"
assert "var(--font-heading)" in html, "Heading font CSS rule missing"

print("\nSUCCESS: Brand kit fonts and logo are 100% working!")
