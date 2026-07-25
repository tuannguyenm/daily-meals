import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient,processLock} from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import {AppState,Platform} from 'react-native';

const url=process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const publishableKey=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isSupabaseConfigured=Boolean(url&&publishableKey);

export const supabase=isSupabaseConfigured
 ?createClient(url!,publishableKey!,{
   auth:{
    storage:AsyncStorage,
    autoRefreshToken:true,
    persistSession:true,
    detectSessionInUrl:false,
    lock:processLock,
   },
  })
 :undefined;

if(supabase&&Platform.OS!=='web'){
 AppState.addEventListener('change',state=>{
  if(state==='active')supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
 });
}
