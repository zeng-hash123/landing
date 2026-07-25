export interface PageBrief {
  product_description: string;
  campaign_goal: string;
  design_vibe: string;
  cta_focus: string;
  ab_test: boolean;
  raw_ad_content?: string;
}

export interface BrandKit {
  primary_color?: string;
  secondary_color?: string;
  text_color?: string;
  logo_url?: string;
  font_heading?: string;
  font_body?: string;
  reference_images?: string[];
}

export interface GenerateRequest {
  prompt?: string;
  ad_url?: string;
  campaign_goal: string;
  design_vibe: string;
  cta_focus: string;
  ab_test: boolean;
  brand_kit?: BrandKit;
  created_by?: string;
}

export interface GenerateResponse {
  html: string;
  html_b?: string;
  page_id: string;
  flags: string[];
  versions?: VersionEntry[];
}

export interface EditRequest {
  page_id: string;
  edit_instruction: string;
  target_section?: string;
  created_by?: string;
}

export interface EditResponse {
  html: string;
  versions?: VersionEntry[];
}

export interface ChatLogEntry {
  id: string;
  type: 'generate' | 'edit';
  instruction: string;
  response?: string;
  timestamp: Date;
  versionId?: string;
}

export interface VersionEntry {
  id: string;
  page_id: string;
  created_at: string;
  html: string;
  label?: string;
  state: Record<string, unknown>;
  created_by?: string;
}

export interface PageState {
  brief: PageBrief;
  brand_kit?: BrandKit;
  sections: Array<{
    section_type: string;
    template_file: string;
    values: Record<string, string>;
  }>;
  meta: Record<string, string>;
  flags: string[];
}
