export type SectionType =
  | 'hero'
  | 'cta'
  | 'social_proof'
  | 'form'
  | 'feature'
  | 'footer'
  | 'other';

export interface BrandConfig {
  tone?: 'professional' | 'conversational' | 'bold' | 'outcome_focused';
  primaryColor?: string;
  ctaStyle?: string;
  bannedWords?: string[];
}

export interface RegeneratedSection {
  id: string;
  type: SectionType;
  original_html: string;
  regenerated_html: string;
  change_summary: string;
  suggestion_ids: string[];
}

export interface RegenerationOutput {
  sections: RegeneratedSection[];
  full_regenerated_html: string;
  token_usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface RegenerationRecord {
  id: string;
  audit_id: string;
  user_id: string;
  suggestion_ids: string[];
  brand_config_json: BrandConfig;
  sections_json: RegeneratedSection[];
  full_regenerated_html: string;
  token_usage_json: {
    input_tokens: number;
    output_tokens: number;
  };
  created_at: string;
}
