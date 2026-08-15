import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { regeneratePage } from '@/lib/ai/regenerate';
import { BrandConfig } from '@/types/regenerate';

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

    // Fetch original audit record from database
    const { data: auditRecord, error: auditError } = await supabaseAdmin
      .from('audits')
      .select('*')
      .eq('id', auditId)
      .eq('user_id', user.id)
      .single();

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

    // Trigger section-by-section regeneration
    const regenResult = await regeneratePage(
      scrapedContent,
      suggestions,
      brandConfig,
      suggestion_ids
    );

    // Save regeneration to Supabase public.regenerations table
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
      id: 'demo-regen-id',
      audit_id: auditId,
      user_id: user.id,
      suggestion_ids,
      brand_config_json: brandConfig,
      sections_json: regenResult.sections,
      full_regenerated_html: regenResult.full_regenerated_html,
      token_usage_json: regenResult.token_usage,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      regenerationRecord: record,
    });
  } catch (err: any) {
    console.error('API /api/pages/[id]/regenerate error:', err);
    return NextResponse.json(
      { error: 'REGENERATE_FAILED', message: err.message || 'Page regeneration failed.' },
      { status: 500 }
    );
  }
}
