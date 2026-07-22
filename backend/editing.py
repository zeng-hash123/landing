import json
from models import EditRequest, PageState
from storage import load_page, update_page, save_version, get_versions
from renderer import assemble_page
from agents import _call_kimi
from typing import List, Dict

async def classify_edit_intent(instruction: str) -> dict:
    system_prompt = (
        "Classify user edit instruction. Determine if it requires a copywriter edit (updating text) "
        "or designer edit (changing design or template). Also extract the target section_type if any. "
        "Return JSON: {'agent': 'copywriter'|'designer', 'fields': ['token1', '...'], 'section_type': 'hero'|'features'|'testimonial'|'pricing'|'cta'}"
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": instruction}
    ]
    return await _call_kimi(messages, temperature=0.2)

async def apply_edit(page_id: str, edit: EditRequest, library: List[Dict]) -> str:
    state = load_page(page_id)
    intent = await classify_edit_intent(edit.edit_instruction)
    
    # Save pre-edit version
    current_html = assemble_page(state.sections, state.meta, None, library, brand_kit=state.brand_kit)
    save_version(page_id, state, current_html)
    
    target_section_type = intent.get("section_type") or edit.target_section
    if not target_section_type:
        target_section_type = "hero" # fallback
        
    target_section = next((s for s in state.sections if s.section_type == target_section_type), None)
    
    if target_section:
        system_prompt = (
            f"You are a helpful assistant making a specific edit to the '{target_section_type}' section. "
            f"Given the user instruction and the current section values, return the updated values. "
            f"Only return the JSON dict with updated key-value pairs matching the existing keys."
        )
        user_prompt = json.dumps({
            "instruction": edit.edit_instruction,
            "current_values": target_section.values
        })
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        updates = await _call_kimi(messages, temperature=0.3)
        target_section.values.update(updates)
        
    update_page(page_id, state)
    new_html = assemble_page(state.sections, state.meta, None, library, brand_kit=state.brand_kit)
    save_version(page_id, state, new_html)
    
    return {
        "html": new_html,
        "versions": get_versions(page_id)
    }
