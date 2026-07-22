import os
import json
import asyncio
from openai import AsyncOpenAI
from models import PageBrief, BrandKit, SectionSelection, AIGenerationError
from typing import Dict, List, Optional
import dotenv

dotenv.load_dotenv()

client = AsyncOpenAI(
    api_key=os.getenv("KIMI_API_KEY"),
    base_url="https://api.moonshot.ai/v1"
)
MODEL_NAME = "kimi-k2.7-code"

kimi_semaphore = asyncio.Semaphore(2)

async def _call_kimi(messages: list, temperature: float = 1.0) -> dict:
    async with kimi_semaphore:
        for attempt in range(4):
            try:
                response = await client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=messages,
                    response_format={"type": "json_object"},
                    temperature=1.0
                )
                content = response.choices[0].message.content
                return json.loads(content)
            except Exception as e:
                if attempt < 3:
                    await asyncio.sleep(1.5 * (attempt + 1))
                    if isinstance(e, json.JSONDecodeError):
                        messages.append({"role": "user", "content": f"Previous response failed validation: {e}. Please ensure you return valid JSON."})
                else:
                    raise AIGenerationError(f"AI call failed: {e}")

async def run_copywriter(brief: PageBrief) -> Dict:
    system_prompt = (
        "You are a world-class direct-response copywriter for landing pages. "
        "Given the product brief, generate compelling copy for each section. Return JSON only. "
        "Generate content keys for: hero, features, testimonial, pricing, cta sections. "
        "Include both 'headline' style (single headline) and 'headline_line1/line2/highlight' style. "
        "If ab_test is true, generate a variant_b with alternative headline and CTA text."
    )
    user_prompt = brief.model_dump_json()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Generate copy for this brief: {user_prompt}"}
    ]
    return await _call_kimi(messages, temperature=0.7)

async def _design_section(sec_type: str, brief: PageBrief, copy: Dict, brand_kit: Optional[BrandKit], library: List[Dict]) -> SectionSelection:
    from library import filter_candidates
    candidates = filter_candidates(library, sec_type, brief.design_vibe)
    if not candidates:
        candidates_meta = []
        for item in library:
            st = item.get("metadata", {}).get("section_type", "").lower()
            if st == sec_type or st == sec_type + "s" or (sec_type == "testimonial" and st == "testimonials") or (sec_type == "features" and st == "feature"):
                candidates_meta.append({"template_file": item.get("template_file"), "metadata": item.get("metadata")})
        candidates = candidates_meta
    
    system_prompt = (
        "You are an expert web designer. Pick the best template from the candidates and fill ALL token values from the tokens list. "
        "If brand_kit is provided, use those colors, else generate a cohesive palette in hex. "
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
    section_types = ["hero", "features", "testimonial", "pricing", "cta"]
    tasks = [_design_section(st, brief, copy, brand_kit, library) for st in section_types]
    sections = await asyncio.gather(*tasks)
    return list(sections)

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
