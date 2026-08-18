import { NextRequest, NextResponse } from 'next/server';
import { validateTargetUrl } from '@/lib/security/url-validation';
import { crawlPage } from '@/lib/crawl/firecrawl';
import { getAdminSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication is required to start an audit.' },
        { status: 401 }
      );
    }

    const supabaseAdmin = getAdminSupabase();

    // Validate User Token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Invalid or expired session token.' },
        { status: 401 }
      );
    }

    // Check Server-Side Free Audit Usage
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('free_audit_used')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }

    if (profile?.free_audit_used) {
      return NextResponse.json(
        {
          error: 'FREE_AUDIT_USED',
          message: 'You have already used your lifetime free audit.',
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { url } = body;

    // Validate URL & SSRF Protection
    const validation = validateTargetUrl(url);
    if (!validation.isValid || !validation.normalizedUrl) {
      return NextResponse.json(
        { error: 'INVALID_URL', message: validation.error || 'Invalid landing page URL.' },
        { status: 400 }
      );
    }

    // Crawl target page via Firecrawl
    const pageData = await crawlPage(validation.normalizedUrl);

    return NextResponse.json({
      success: true,
      pageData,
    });
  } catch (err: any) {
    console.error('API /api/analyze error:', err);
    return NextResponse.json(
      {
        error: 'ANALYSIS_FAILED',
        message: err.message || 'Failed to crawl and extract landing page content.',
      },
      { status: 500 }
    );
  }
}
