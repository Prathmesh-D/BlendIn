import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function createAdmin() {
  const email = 'admin@blendin.com';
  const password = 'password123';
  
  console.log('Attempting to sign up admin user...');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Failed to sign up:', error.message);
    return;
  }
  
  console.log('Sign up successful! User ID:', data.user.id);
  console.log('You can now log in with:');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('\nIMPORTANT: Next, run this SQL in Supabase to make them an admin:');
  console.log(`UPDATE profiles SET is_admin = true WHERE id = '${data.user.id}';`);
}

createAdmin();
