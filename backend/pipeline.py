from models import GenerateRequest, PageBrief, PageState
from scraper import scrape_ad_url
from agents import run_copywriter, run_designer, run_compliance_review, _design_section
from renderer import assemble_page
from storage import save_page, save_version, get_versions
from typing import Dict, List

async def generate_landing_page(user_input: GenerateRequest, library: List[Dict]) -> Dict:
    brief = PageBrief(
        product_description=user_input.prompt or "",
        campaign_goal=user_input.campaign_goal,
        design_vibe=user_input.design_vibe,
        cta_focus=user_input.cta_focus,
        ab_test=user_input.ab_test,
        raw_ad_content=None
    )
    
    enable_web_search = False
    if user_input.ad_url:
        scraped_data = await scrape_ad_url(user_input.ad_url)
        is_success = scraped_data.get("success", False)
        desc = scraped_data.get("product_description", "")
        
        if is_success and len(desc) > 30:
            brief.raw_ad_content = desc
            if not brief.product_description:
                brief.product_description = desc
        else:
            enable_web_search = True
            brief.product_description = f"Landing page for URL: {user_input.ad_url}. {user_input.prompt or ''}"
            
    copy = await run_copywriter(brief, enable_web_search=enable_web_search)
    sections = await run_designer(brief, copy, user_input.brand_kit, library)
    compliance = await run_compliance_review(sections, brief)
    
    meta = {
        "meta_title": compliance.get("meta_title", ""),
        "meta_description": compliance.get("meta_description", "")
    }
    
    html = assemble_page(sections, meta, None, library, brand_kit=user_input.brand_kit)
    
    html_b = None
    if brief.ab_test:
        copy_b = copy.get("variant_b", {})
        if not isinstance(copy_b, dict) or not copy_b:
            copy_b = dict(copy)
            hero_copy = dict(copy.get("hero", {}))
            if "headline" in hero_copy:
                hero_copy["headline"] = f"{hero_copy['headline']} — Exclusive Edition"
            if "cta_text" in hero_copy:
                hero_copy["cta_text"] = "Claim Your Special Offer Now"
            copy_b["hero"] = hero_copy
        else:
            # Ensure navbar and footer are preserved if variant_b didn't specify them
            if "navbar" not in copy_b and "navbar" in copy:
                copy_b["navbar"] = copy["navbar"]
            if "footer" not in copy_b and "footer" in copy:
                copy_b["footer"] = copy["footer"]

        # Exclude Variant A's hero template file so Variant B is forced to select a DIFFERENT hero section layout
        hero_a_template = next((s.template_file for s in sections if s.section_type == "hero"), "")
        exclude_hero = [hero_a_template] if hero_a_template else None

        sections_b = await run_designer(brief, copy_b, user_input.brand_kit, library, exclude_templates=exclude_hero)
        html_b = assemble_page(sections_b, meta, None, library, brand_kit=user_input.brand_kit)
        
    state = PageState(
        brief=brief,
        brand_kit=user_input.brand_kit,
        sections=sections,
        meta=meta,
        flags=compliance.get("flags", []),
        created_by=user_input.created_by
    )
    
    page_id = save_page(state, created_by=user_input.created_by)

    if brief.ab_test and html_b:
        state_b = PageState(
            brief=brief,
            brand_kit=user_input.brand_kit,
            sections=sections_b,
            meta=meta,
            flags=compliance.get("flags", []),
            created_by=user_input.created_by
        )
        save_version(page_id, state, html, created_by=user_input.created_by, label="Variant A (Control)")
        save_version(page_id, state_b, html_b, created_by=user_input.created_by, label="Variant B (Challenger)")
    else:
        save_version(page_id, state, html, created_by=user_input.created_by, label="Variant A")
    
    res = {
        "html": html,
        "page_id": page_id,
        "flags": state.flags,
        "versions": get_versions(page_id)
    }
    if html_b:
        res["html_b"] = html_b
        
    return res
