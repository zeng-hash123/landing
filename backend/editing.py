import json
from models import EditRequest, PageState
from storage import load_page, update_page, save_version, get_versions
from renderer import assemble_page
from agents import _call_kimi
from typing import List, Dict

async def classify_edit_intent(instruction: str) -> dict:
    system_prompt = (
        "Classify user edit instruction. Determine if it requires a copywriter edit (updating text), "
        "designer edit (changing design or template), or global theme edit (converting light/dark mode, palette change). "
        "Also extract target section_type if single section, or set 'scope': 'global' if it affects the whole page theme. "
        "Return JSON: {'agent': 'copywriter'|'designer'|'theme', 'scope': 'section'|'global', 'fields': ['token1', '...'], 'section_type': 'navbar'|'hero'|'features'|'testimonial'|'pricing'|'cta'|'global'}"
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": instruction}
    ]
    return await _call_kimi(messages, temperature=0.2)

DARK_THEME_TOKENS = {
    "background_color": "#0d0d14",
    "bg_color": "#0d0d14",
    "dark_background_color": "#0b0b10",
    "card_bg_color": "#13131a",
    "text_color": "#f8fafc",
    "heading_color": "#ffffff",
    "dark_heading_color": "#ffffff",
    "body_color": "#94a3b8",
    "dark_body_color": "#94a3b8",
    "secondary_color": "rgba(255, 255, 255, 0.1)",
    "border_color": "rgba(255, 255, 255, 0.08)"
}

LIGHT_THEME_TOKENS = {
    "background_color": "#ffffff",
    "bg_color": "#ffffff",
    "dark_background_color": "#f8fafc",
    "card_bg_color": "#f9fafb",
    "text_color": "#111827",
    "heading_color": "#111827",
    "dark_heading_color": "#111827",
    "body_color": "#4b5563",
    "dark_body_color": "#4b5563",
    "secondary_color": "#e5e7eb",
    "border_color": "#e5e7eb"
}

async def apply_edit(page_id: str, edit: EditRequest, library: List[Dict]) -> dict:
    state = load_page(page_id)
    intent = await classify_edit_intent(edit.edit_instruction)
    
    scope = intent.get("scope", "section")
    instruction_lower = edit.edit_instruction.lower()
    
    # Global theme conversion (e.g. Light -> Dark mode or Dark -> Light mode)
    is_theme_edit = scope == "global" or any(kw in instruction_lower for kw in ["dark", "light", "theme", "mode", "color scheme", "background color"])
    
    if is_theme_edit:
        if "dark" in instruction_lower or "black" in instruction_lower or "night" in instruction_lower:
            theme_updates = DARK_THEME_TOKENS
        else:
            theme_updates = LIGHT_THEME_TOKENS

        for sec in state.sections:
            sec.values.update(theme_updates)
    else:
        sec_type = intent.get("target_section", "hero")
        target_section = next((s for s in state.sections if s.section_type == sec_type), None)
        
        if not target_section and state.sections:
            target_section = state.sections[0]
            
        if target_section:
            system_prompt = (
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
        
    if edit.created_by:
        state.created_by = edit.created_by
        
    update_page(page_id, state)
    new_html = assemble_page(state.sections, state.meta, None, library, brand_kit=state.brand_kit)
    edit_label = f"Edit: {edit.edit_instruction[:25]}..." if len(edit.edit_instruction) > 25 else f"Edit: {edit.edit_instruction}"
    save_version(page_id, state, new_html, created_by=edit.created_by, label=edit_label)
    
    return {
        "html": new_html,
        "versions": get_versions(page_id)
    }
