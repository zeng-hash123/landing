import { NextRequest, NextResponse } from 'next/server';
import { auditLandingPage } from '@/lib/ai/kimi';
import { getAdminSupabase } from '@/lib/supabase';
import { ExtractedPageData } from '@/types/page';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication is required to perform an audit.' },
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

    // Check free audit limit
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('free_audit_used')
      .eq('id', user.id)
      .single();

    if (profile?.free_audit_used) {
      return NextResponse.json(
        {
          error: 'FREE_AUDIT_USED',
          message: 'You have already used your lifetime free audit.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const pageData: ExtractedPageData = body.pageData;

    if (!pageData || !pageData.url) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Page content structure is missing.' },
        { status: 400 }
      );
    }

    // Perform CRO audit via Kimi AI Engine
    const auditResult = await auditLandingPage(pageData);

    // Atomically upsert profile record to guarantee profile existence and mark free_audit_used = true
    const { error: profileUpsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email || '',
          free_audit_used: true,
        },
        { onConflict: 'id' }
      );

    if (profileUpsertError) {
      console.error('Error updating user profile:', profileUpsertError);
    }

    // Insert record into audits table
    const { data: insertedAudit, error: insertError } = await supabaseAdmin
      .from('audits')
      .insert({
        user_id: user.id,
        url: pageData.url,
        overall_score: auditResult.overall_score,
        summary: auditResult.summary,
        page_data_json: pageData,
        audit_json: auditResult,
      })
      .select('id')
      .single();

    if (insertError || !insertedAudit) {
      console.error('Failed to insert audit record in database:', insertError);
      return NextResponse.json(
        { error: 'DATABASE_ERROR', message: `Database insert failed: ${insertError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      auditId: insertedAudit.id,
      audit: auditResult,
    });
  } catch (err: any) {
    console.error('API /api/audit error:', err);
    return NextResponse.json(
      {
        error: 'AUDIT_FAILED',
        message: err.message || 'Failed to complete Kimi AI landing page audit.',
      },
      { status: 500 }
    );
  }
}
