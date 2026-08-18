import {
  GenerateRequest,
  GenerateResponse,
  EditRequest,
  EditResponse,
  VersionEntry,
  PageState,
} from '../types';
import { supabase } from './supabase';

export async function getUserPlan(email: string): Promise<{ email: string; plan: string }> {
  try {
    if (!supabase) return { email, plan: 'free' };
    const { data } = await supabase
      .from('profiles')
      .select('plan, free_audit_used')
      .eq('email', email)
      .maybeSingle();

    if (data && data.plan) {
      return { email, plan: data.plan };
    }
    return { email, plan: 'free' };
  } catch (e) {
    return { email, plan: 'free' };
  }
}

export async function getUserPages(email: string): Promise<any[]> {
  try {
    if (!supabase) return [];
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return [];

    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (e) {
    console.error('getUserPages error:', e);
    return [];
  }
}

export async function getPage(pageId: string): Promise<{ state: PageState; html: string }> {
  try {
    const headers: Record<string, string> = {};
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    }

    const res = await fetch(`/api/audit/${pageId}`, { headers });
    if (!res.ok) throw new Error('Failed to get audit page');
    const json = await res.json();
    const record = json.auditRecord;

    const dummyState: PageState = {
      brief: {
        product_description: record?.summary || '',
        campaign_goal: '',
        design_vibe: '',
        cta_focus: '',
        ab_test: false,
      },
      sections: [],
      meta: { title: 'Audit Report', description: record?.summary || '' },
      flags: [],
    };

    return {
      state: dummyState,
      html: record?.summary || 'Audit Report HTML preview ready.',
    };
  } catch (e) {
    console.error('getPage error:', e);
    throw new Error('Failed to load page');
  }
}

export async function getVersions(pageId: string): Promise<VersionEntry[]> {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('regenerations')
      .select('*')
      .eq('audit_id', pageId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: any, index: number) => ({
      id: item.id,
      page_id: pageId,
      created_at: item.created_at,
      label: `Version ${data.length - index}`,
      html: item.full_regenerated_html || '',
      state: {},
    }));
  } catch (e) {
    console.error('getVersions error:', e);
    return [];
  }
}

export async function generatePage(req: GenerateRequest): Promise<GenerateResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  }

  // 1. First run crawl/analysis if URL or prompt provided
  const targetUrl = req.ad_url || req.prompt || '';
  const analyzeRes = await fetch('/api/analyze', {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: targetUrl }),
  });

  const analyzeData = await analyzeRes.json();
  if (!analyzeRes.ok) {
    throw new Error(analyzeData.message || 'Page analysis failed');
  }

  // 2. Perform audit to generate audit report & page_id
  const auditRes = await fetch('/api/audit', {
    method: 'POST',
    headers,
    body: JSON.stringify({ pageData: analyzeData.pageData }),
  });

  const auditData = await auditRes.json();
  if (!auditRes.ok) {
    throw new Error(auditData.message || 'Audit generation failed');
  }

  return {
    page_id: auditData.auditId,
    html: `<div class="p-8 text-center"><h1 class="text-2xl font-bold">Audit Completed for ${targetUrl}</h1><p class="mt-2 text-gray-600">${auditData.audit?.summary || ''}</p></div>`,
    flags: [],
    versions: [],
  };
}

export async function editPage(req: EditRequest): Promise<EditResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  }

  const res = await fetch(`/api/pages/${req.page_id}/regenerate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      suggestion_ids: [],
      brandConfig: {},
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Page edit failed');
  }

  const record = json.regenerationRecord;
  return {
    html: record?.full_regenerated_html || '<div>Edited Page</div>',
    versions: [],
  };
}

export async function revertVersion(pageId: string, versionId: string): Promise<{ success: boolean }> {
  return { success: true };
}
