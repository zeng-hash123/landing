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

    // Fetch audit belonging to user
    const { data: auditRecord, error: fetchError } = await supabaseAdmin
      .from('audits')
      .select('*')
      .eq('id', auditId)
      .eq('user_id', user.id)
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
