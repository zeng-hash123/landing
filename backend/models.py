from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PageBrief(BaseModel):
    product_description: str
    campaign_goal: str
    design_vibe: str
    cta_focus: str
    ab_test: bool = False
    raw_ad_content: Optional[str] = None

class BrandKit(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    text_color: Optional[str] = None
    logo_url: Optional[str] = None
    font_heading: Optional[str] = None
    font_body: Optional[str] = None

class SectionSelection(BaseModel):
    section_type: str
    template_file: str
    values: Dict[str, str]

class PageState(BaseModel):
    brief: PageBrief
    brand_kit: Optional[BrandKit]
    sections: List[SectionSelection]
    meta: Dict[str, str]
    flags: List[Any]
    created_by: Optional[str] = None

class EditRequest(BaseModel):
    page_id: str
    edit_instruction: str
    target_section: Optional[str] = None
    created_by: Optional[str] = None

class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    ad_url: Optional[str] = None
    campaign_goal: str
    design_vibe: str
    cta_focus: str
    ab_test: bool = False
    brand_kit: Optional[BrandKit] = None
    created_by: Optional[str] = None

class PageNotFoundError(Exception):
    pass

class VersionNotFoundError(Exception):
    pass

class AIGenerationError(Exception):
    pass
