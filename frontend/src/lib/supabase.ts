import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export const initSupabase = (url: string, key: string) => {
    if (url && key) {
        supabase = createClient(url, key);
        console.log("Supabase Initialized");
    }
};

export const getSupabase = () => supabase;

export const signInWithGoogle = async () => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        }
    });
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};
