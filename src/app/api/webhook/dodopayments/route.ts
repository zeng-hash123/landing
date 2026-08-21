import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

// Webhook endpoint for Dodo Payments (https://pixelpage.site/api/webhook/dodopayments)
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = body.event_type || body.type || body.event;
    const data = body.data || body.payload || body;

    // Identify product / plan
    const productId = data.product_id || data.productId;
    const customerEmail = data.customer?.email || data.customer_email || data.email;
    const metadata = data.metadata || {};

    let plan = 'pro';
    let generationCredits = 1;

    // $5 one-time plan: pdt_0NlsfRGt1hxhBfPNLsoFZ (1 optimized generation)
    // $49 agency plan: pdt_0Njtj6vpds8u2k9BreAhC (100 optimized generations)
    if (productId === 'pdt_0Njtj6vpds8u2k9BreAhC' || data.total_amount === 4900 || data.amount === 4900) {
      plan = 'agency';
      generationCredits = 100;
    } else if (productId === 'pdt_0NlsfRGt1hxhBfPNLsoFZ' || data.total_amount === 500 || data.amount === 500) {
      plan = 'pro';
      generationCredits = 1;
    }

    const isSuccessfulEvent =
      !eventType ||
      eventType === 'payment.succeeded' ||
      eventType === 'payment.successful' ||
      eventType === 'subscription.active' ||
      eventType === 'order.completed' ||
      data.status === 'succeeded' ||
      data.status === 'paid';

    if (isSuccessfulEvent && customerEmail) {
      try {
        const supabaseAdmin = getAdminSupabase();

        // 1. Check if user exists with this email
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const matchedUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
        );

        if (matchedUser) {
          await supabaseAdmin
            .from('profiles')
            .upsert({
              id: matchedUser.id,
              email: customerEmail,
              plan,
              free_audit_used: false,
            }, { onConflict: 'id' });
        } else {
          // If profile table has email as key or fallback
          await supabaseAdmin
            .from('profiles')
            .upsert({
              id: metadata.user_id || `cust_${Date.now()}`,
              email: customerEmail,
              plan,
              free_audit_used: false,
            }, { onConflict: 'email' });
        }
      } catch (dbErr) {
        console.warn('Database update in webhook failed:', dbErr);
      }
    }

    return NextResponse.json({
      received: true,
      success: true,
      eventType,
      plan,
      generationCredits,
    }, { status: 200 });
  } catch (err: any) {
    console.error('Dodo webhook processing error:', err);
    return NextResponse.json(
      { error: 'Webhook processing error', message: err.message },
      { status: 500 }
    );
  }
}
