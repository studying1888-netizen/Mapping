import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  name: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  category: 'update' | 'question' | 'announcement';
  marketplace?: string;
  status?: 'open' | 'resolved';
  created_at: string;
  updated_at: string;
  users?: User;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  users?: User;
}
