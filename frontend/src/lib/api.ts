import {
  GenerateRequest,
  GenerateResponse,
  EditRequest,
  EditResponse,
  VersionEntry,
  PageState,
} from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function generatePage(req: GenerateRequest): Promise<GenerateResponse> {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    let errText = `Failed to generate page (HTTP ${res.status})`;
    try {
      const errBody = await res.text();
      try {
        const errJson = JSON.parse(errBody);
        errText = errJson.detail || errJson.message || errText;
      } catch (_) {
        if (errBody.length < 200) errText = errBody || errText;
      }
    } catch (_) {}
    throw new Error(errText);
  }
  return res.json();
}

export async function editPage(req: EditRequest): Promise<EditResponse> {
  const res = await fetch(`${BASE_URL}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    let errText = 'Failed to edit page';
    try {
      const errJson = await res.json();
      errText = errJson.detail || errJson.message || errText;
    } catch (_) {}
    throw new Error(errText);
  }
  return res.json();
}

export async function getPage(pageId: string): Promise<PageState> {
  const res = await fetch(`${BASE_URL}/page/${pageId}`);
  if (!res.ok) throw new Error('Failed to get page');
  return res.json();
}

export async function getVersions(pageId: string): Promise<VersionEntry[]> {
  const res = await fetch(`${BASE_URL}/page/${pageId}/versions`);
  if (!res.ok) throw new Error('Failed to get versions');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.versions || []);
}

export async function revertVersion(pageId: string, versionId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/page/${pageId}/revert/${versionId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to revert version');
  return res.json();
}

export async function getUserPlan(email: string): Promise<{ email: string; plan: string }> {
  try {
    const res = await fetch(`${BASE_URL}/user/plan?email=${encodeURIComponent(email)}`);
    if (!res.ok) return { email, plan: 'free' };
    return res.json();
  } catch (e) {
    return { email, plan: 'free' };
  }
}
