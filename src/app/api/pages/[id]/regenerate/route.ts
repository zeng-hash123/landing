import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { regeneratePage } from '@/lib/ai/regenerate';
import { BrandConfig } from '@/types/regenerate';
import { isAdminEmail } from '@/lib/admin';

// GET: Fetch all past generated versions for this audit
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = params.id;

    if (!auditId) {
      return NextResponse.json(
        { error: 'INVALID_ID', message: 'Audit ID is required.' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication is required.' },
        { status: 401 }
      );
    }

    const supabaseAdmin = getAdminSupabase();

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Invalid or expired session token.' },
        { status: 401 }
      );
    }

    const isUserAdmin = isAdminEmail(user.email);

    // Fetch all regenerations for this audit
    let query = supabaseAdmin
      .from('regenerations')
      .select('*')
      .eq('audit_id', auditId)
      .order('created_at', { ascending: false });

    if (!isUserAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data: regenerations, error: fetchError } = await query;

    if (fetchError) {
      console.warn('Failed to fetch regenerations history:', fetchError);
      return NextResponse.json({ success: true, history: [] });
    }

    return NextResponse.json({
      success: true,
      history: regenerations || [],
    });
  } catch (err: any) {
    console.error('API GET /api/pages/[id]/regenerate error:', err);
    return NextResponse.json(
      { error: 'FETCH_FAILED', message: err.message || 'Failed to fetch history.' },
      { status: 500 }
    );
  }
}

// POST: Trigger a new generation with Kimi K3 and save to history
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = params.id;

    if (!auditId) {
      return NextResponse.json(
        { error: 'INVALID_ID', message: 'Audit ID is required.' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication is required.' },
        { status: 401 }
      );
    }

    const supabaseAdmin = getAdminSupabase();

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Invalid or expired session token.' },
        { status: 401 }
      );
    }

    const isUserAdmin = isAdminEmail(user.email);

    // Fetch original audit record from database
    let auditQuery = supabaseAdmin
      .from('audits')
      .select('*')
      .eq('id', auditId);

    if (!isUserAdmin) {
      auditQuery = auditQuery.eq('user_id', user.id);
    }

    const { data: auditRecord, error: auditError } = await auditQuery.single();

    if (auditError || !auditRecord) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Audit record not found for this page.' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const suggestion_ids: string[] = body.suggestion_ids || [];
    const brandConfig: BrandConfig = body.brandConfig || {};

    const scrapedContent = auditRecord.page_data_json;
    const suggestions = auditRecord.audit_json?.categories || [];

    // Trigger Kimi K3 page generation
    const regenResult = await regeneratePage(
      scrapedContent,
      suggestions,
      brandConfig,
      suggestion_ids
    );

    // Save generation to Supabase public.regenerations table
    const { data: insertedRegen, error: insertError } = await supabaseAdmin
      .from('regenerations')
      .insert({
        audit_id: auditId,
        user_id: user.id,
        suggestion_ids,
        brand_config_json: brandConfig,
        sections_json: regenResult.sections,
        full_regenerated_html: regenResult.full_regenerated_html,
        token_usage_json: regenResult.token_usage || { input_tokens: 0, output_tokens: 0 },
      })
      .select('*')
      .single();

    if (insertError) {
      console.warn('Failed to insert regeneration into database:', insertError);
    }

    const record = insertedRegen || {
      id: `regen-${Date.now()}`,
      audit_id: auditId,
      user_id: user.id,
      suggestion_ids,
      brand_config_json: brandConfig,
      sections_json: regenResult.sections,
      full_regenerated_html: regenResult.full_regenerated_html,
      token_usage_json: regenResult.token_usage,
      created_at: new Date().toISOString(),
    };

    // Fetch updated history list
    const { data: allHistory } = await supabaseAdmin
      .from('regenerations')
      .select('*')
      .eq('audit_id', auditId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      regenerationRecord: record,
      history: allHistory && allHistory.length > 0 ? allHistory : [record],
    });
  } catch (err: any) {
    console.error('API /api/pages/[id]/regenerate error:', err);
    return NextResponse.json(
      { error: 'REGENERATE_FAILED', message: err.message || 'Page regeneration failed.' },
      { status: 500 }
    );
  }
}
