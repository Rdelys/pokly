import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ⚠️ Remplace ces valeurs par celles de ton projet Supabase
// (Dashboard Supabase → Project Settings → API)
const SUPABASE_URL = 'https://faux-projet.supabase.co';
const SUPABASE_ANON_KEY = 'fausse-cle-anon-a-remplacer';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
