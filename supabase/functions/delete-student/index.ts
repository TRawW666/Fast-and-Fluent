import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Verify caller identity using standard client
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin email
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@gmail.com';
    if (user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'Forbidden: Caller is not admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { studentId } = await req.json();
    if (!studentId) {
      return new Response(JSON.stringify({ error: 'Missing studentId parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin client initialized with Service Role Key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 1. Delete student's homework files from Supabase Storage ('homework' bucket, folder: {student_id}/)
    try {
      const { data: fileList } = await supabaseAdmin.storage.from('homework').list(studentId);
      if (fileList && fileList.length > 0) {
        const pathsToDelete = fileList.map((file) => `${studentId}/${file.name}`);
        await supabaseAdmin.storage.from('homework').remove(pathsToDelete);
      }
    } catch (storageErr) {
      console.warn('Storage cleanup warning:', storageErr);
    }

    // 2. Explicitly clean up records in student-related tables
    await supabaseAdmin.from('homework_submissions').delete().eq('student_id', studentId);
    await supabaseAdmin.from('attendance').delete().eq('student_id', studentId);
    await supabaseAdmin.from('bookings').delete().eq('student_id', studentId);
    await supabaseAdmin.from('students').delete().eq('id', studentId);

    // 3. Delete the auth user using Supabase Admin SDK
    const { error: deleteAuthErr } = await supabaseAdmin.auth.admin.deleteUser(studentId);
    if (deleteAuthErr) {
      console.error('Error deleting auth user:', deleteAuthErr);
      return new Response(JSON.stringify({ error: deleteAuthErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Student deleted successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('delete-student edge function error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
