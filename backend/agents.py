import os
import json
import asyncio
from openai import AsyncOpenAI
from models import PageBrief, BrandKit, SectionSelection, AIGenerationError
from typing import Dict, List, Optional
import dotenv

dotenv.load_dotenv()

kimi_semaphore = asyncio.Semaphore(2)

def _clean_json_loads(content_str: str) -> dict:
    if not content_str:
        raise ValueError("Empty response content from AI")
    cleaned = content_str.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return json.loads(cleaned.strip())

async def _call_kimi(messages: list, temperature: float = 1.0, enable_web_search: bool = False) -> dict:
    key = os.getenv("KIMI_API_KEY") or os.getenv("MOONSHOT_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not key or key.strip() == "" or key == "placeholder-key":
        raise AIGenerationError("Kimi / Moonshot API Key missing. Please set MOONSHOT_API_KEY or KIMI_API_KEY in Vercel environment variables.")

    client = AsyncOpenAI(
        api_key=key.strip(),
        base_url="https://api.moonshot.ai/v1"
    )

    models_to_try = [
        "kimi-k2.7-code"
    ]

    async with kimi_semaphore:
        last_error = None
        for model in models_to_try:
            for attempt in range(5):
                try:
                    kwargs = {
                        "model": model,
                        "messages": messages,
                        "temperature": 1.0
                    }
                    if enable_web_search:
                        kwargs["tools"] = [{
                            "type": "builtin_function",
                            "function": {"name": "$web_search"}
                        }]
                    else:
                        kwargs["response_format"] = {"type": "json_object"}

                    response = await client.chat.completions.create(**kwargs)
                    msg = response.choices[0].message
                    content = msg.content
                    if content:
                        return _clean_json_loads(content)
                except Exception as e:
                    last_error = e
                    err_msg = str(e).lower()
                    is_rate_limit = "429" in err_msg or "concurrency" in err_msg or "rate limit" in err_msg
                    
                    wait_time = (2.0 * (attempt + 1)) if is_rate_limit else (1.0 * (attempt + 1))
                    print(f"Notice: AI call attempt {attempt + 1} failed (model={model}, rate_limit={is_rate_limit}): {e}. Waiting {wait_time}s...")
                    
                    if isinstance(e, json.JSONDecodeError):
                        messages.append({"role": "user", "content": f"Previous response failed validation: {e}. Return valid JSON."})
                    
                    await asyncio.sleep(wait_time)
        
        raise AIGenerationError(f"AI call failed: {last_error}")

async def run_copywriter(brief: PageBrief, enable_web_search: bool = False) -> Dict:
    system_prompt = (
        "You are a world-class direct-response copywriter for landing pages. "
        "Given the product brief, generate compelling copy for each section. Return JSON only. "
        "Generate content keys for: navbar, hero, features, testimonial, pricing, cta, footer sections. "
        "For 'navbar', generate 'logo_text' (short product/brand name), 'nav_link_1', 'nav_link_2', 'nav_link_3', 'nav_link_4', and 'cta_text'. "
        "For 'footer', generate 'headline', 'subheadline', 'copyright_text', 'company_name', and 'cta_text'. "
        "Include both 'headline' style (single headline) and 'headline_line1/line2/highlight' style for hero, features, and cta. "
        "If ab_test is true, generate a variant_b with alternative headline and CTA text."
    )
    if enable_web_search:
        system_prompt += " If an ad URL is provided and product details are sparse, perform at most 1 web search to get key features and benefits, then output the JSON immediately."

    user_prompt = brief.model_dump_json()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Generate copy for this brief: {user_prompt}"}
    ]
    return await _call_kimi(messages, temperature=0.7, enable_web_search=enable_web_search)

async def _design_section(sec_type: str, brief: PageBrief, copy: Dict, brand_kit: Optional[BrandKit], library: List[Dict]) -> SectionSelection:
    from library import filter_candidates
    candidates = filter_candidates(library, sec_type, brief.design_vibe)
    if not candidates:
        candidates_meta = []
        for item in library:
            st = item.get("metadata", {}).get("section_type", "").lower()
            if st == sec_type or st == sec_type + "s" or (sec_type == "testimonial" and st == "testimonials") or (sec_type == "features" and st == "feature") or (sec_type == "footer" and st in ["footer", "footers"]) or (sec_type in ["cta", "form", "forms"] and st in ["cta", "form", "forms"]):
                candidates_meta.append({"template_file": item.get("template_file"), "metadata": item.get("metadata")})
        candidates = candidates_meta
    
    system_prompt = (
        "You are an expert web designer. Pick the best template from the candidates and fill ALL token values from the tokens list. "
        "If brand_kit is provided, use those colors. "
        "If brand_kit has reference_images (list of URLs), use those image URLs for image tokens like hero_image, feature_image, background_image, or product_image where appropriate. "
        "Return JSON matching SectionSelection model: {'section_type': '...', 'template_file': '...', 'values': {'token_name': 'value'}}."
    )
    user_prompt = json.dumps({
        "section_type": sec_type,
        "candidates": candidates,
        "copy": copy.get(sec_type, {}),
        "brand_kit": brand_kit.model_dump() if brand_kit else None,
        "vibe": brief.design_vibe
    })
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    res = await _call_kimi(messages, temperature=1.0)
    return SectionSelection(**res)

async def run_designer(brief: PageBrief, copy: Dict, brand_kit: Optional[BrandKit], library: List[Dict]) -> List[SectionSelection]:
    import asyncio
    section_types = ["navbar", "hero", "features", "testimonial", "pricing", "cta", "footer"]
    sections = []
    batch_size = 2
    for i in range(0, len(section_types), batch_size):
        batch = section_types[i:i + batch_size]
        tasks = [_design_section(st, brief, copy, brand_kit, library) for st in batch]
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        for j, result in enumerate(batch_results):
            if isinstance(result, Exception):
                print(f"Warning: Section '{batch[j]}' failed: {result}, using fallback")
                sections.append(SectionSelection(section_type=batch[j], template_file="", values={}))
            else:
                sections.append(result)
        if i + batch_size < len(section_types):
            await asyncio.sleep(1.5)
    return sections

async def run_compliance_review(sections: List[SectionSelection], brief: PageBrief) -> Dict:
    system_prompt = (
        "You are an advertising compliance reviewer. Review copy for ad-policy risks "
        "(guarantees, medical claims, misleading urgency, false scarcity). "
        "Also generate SEO meta title and description. Return JSON only with format: "
        "{'flags': ['issue 1', 'issue 2'], 'meta_title': '...', 'meta_description': '...'}"
    )
    user_prompt = json.dumps({
        "brief": brief.model_dump(),
        "sections": [s.model_dump() for s in sections]
    })
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    return await _call_kimi(messages, temperature=0.2)
