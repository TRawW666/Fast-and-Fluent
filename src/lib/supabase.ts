import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lahaekyikhlctlflupsg.supabase.co';
const supabaseAnonKey = 'sb_publishable_If8RTVOrppKRkPM8hhJEdw_vys4jWFa';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
