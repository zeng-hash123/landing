import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

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

    const supabaseAdmin = getAdminSupabase();
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // 1. If token is provided, verify user ownership
    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        const { data: userAudit } = await supabaseAdmin
          .from('audits')
          .select('*')
          .eq('id', auditId)
          .eq('user_id', user.id)
          .single();

        if (userAudit) {
          return NextResponse.json({
            success: true,
            auditRecord: userAudit,
          });
        }
      }
    }

    // 2. Direct lookup by audit UUID (guarantees retrieval even during client auth token hydration)
    const { data: auditRecord, error: fetchError } = await supabaseAdmin
      .from('audits')
      .select('*')
      .eq('id', auditId)
      .single();

    if (fetchError || !auditRecord) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Audit report not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      auditRecord,
    });
  } catch (err: any) {
    console.error('API GET /api/audit/[id] error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message || 'Failed to retrieve audit report.' },
      { status: 500 }
    );
  }
}
