import {createClient} from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://derznlsgvqphhbtwtkbm.supabase.co';
const supabaseKey = process.env.SUPABASE_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcnpubHNndnFwaGhidHd0a2JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDg1MzMyNywiZXhwIjoyMDYwNDI5MzI3fQ.bA_0FBGSEkyXWpnT-yIzm3zSCX6TKU3DtVTsiNwN9SA';

const supabase = createClient(supabaseUrl, supabaseKey);

export {supabase};
