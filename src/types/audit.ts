import { ExtractedPageData } from './page';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface CategoryResult {
  name: string;
  score: number;
  severity: Severity;
  problem: string;
  why_it_matters: string;
  recommendation: string;
  current_copy?: string;
  suggested_copy?: string;
}

export interface PriorityItem {
  title: string;
  severity: Severity;
  reason: string;
  recommendation: string;
}

export interface AuditResult {
  overall_score: number;
  summary: string;
  categories: CategoryResult[];
  top_priorities: PriorityItem[];
}

export interface AuditRecord {
  id: string;
  user_id: string;
  url: string;
  overall_score: number;
  summary: string;
  page_data_json: ExtractedPageData;
  audit_json: AuditResult;
  created_at: string;
}
