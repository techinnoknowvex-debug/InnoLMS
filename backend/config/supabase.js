const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL=process.env.SUPABASE_URL;
const SUPABSE_SERVICE_ROLE_KEY=process.env.SUPABSE_SERVICE_ROLE_KEY

const supabase=createClient(SUPABASE_URL,SUPABSE_SERVICE_ROLE_KEY);

if(!SUPABASE_URL||!SUPABSE_SERVICE_ROLE_KEY){  
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
}

module.exports=supabase;

