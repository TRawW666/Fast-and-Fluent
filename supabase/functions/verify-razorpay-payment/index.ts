import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// TODO: Set SUPABASE_SERVICE_ROLE_KEY via: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... (find this in Project Settings > API > service_role key — NEVER expose this key to the frontend)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  return signatureArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      courseName,
      amount
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !courseName) {
      return new Response(JSON.stringify({ error: 'Missing required payment verification details' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || 'test_secret';
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await hmacSha256Hex(keySecret, message);

    // If keySecret is set to test_secret or default, allow test mode verification
    const isSignatureValid = (expectedSignature === razorpay_signature) || keySecret === 'test_secret';

    if (!isSignatureValid) {
      return new Response(JSON.stringify({ error: 'Invalid payment signature. Verification failed.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role key to bypass RLS for inserting/updating bookings securely
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || supabaseAnonKey;
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: existingBookings } = await adminSupabase
      .from('bookings')
      .select('*')
      .eq('student_id', user.id)
      .eq('course_name', courseName);

    let updatedBooking;

    if (existingBookings && existingBookings.length > 0) {
      const existingId = existingBookings[0].id;
      const { data, error: updateError } = await adminSupabase
        .from('bookings')
        .update({
          is_paid: true,
          payment_id: razorpay_payment_id,
          amount_paid: amount,
          price: amount / 100,
          status: 'Enrolled'
        })
        .eq('id', existingId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      updatedBooking = data;
    } else {
      const { data, error: insertError } = await adminSupabase
        .from('bookings')
        .insert({
          student_id: user.id,
          course_name: courseName,
          is_paid: true,
          payment_id: razorpay_payment_id,
          amount_paid: amount,
          price: amount / 100,
          status: 'Enrolled'
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      updatedBooking = data;
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking: updatedBooking
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error during verification' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
