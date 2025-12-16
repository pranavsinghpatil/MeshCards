import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { initSupabase, getSupabase } from "@/lib/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, user: null, isLoading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch Config & Init Supabase
        fetch('/api/config')
            .then(res => res.json())
            .then(config => {
                if (config.supabase_url && config.supabase_anon_key) {
                    initSupabase(config.supabase_url, config.supabase_anon_key);
                    const sb = getSupabase();
                    if (sb) {
                        sb.auth.getSession().then(({ data: { session } }) => {
                            setSession(session);
                            setUser(session?.user ?? null);
                            setIsLoading(false);
                        });
                        const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
                             setSession(session);
                             setUser(session?.user ?? null);
                             setIsLoading(false);
                        });
                        return () => subscription.unsubscribe();
                    } else {
                        setIsLoading(false);
                    }
                } else {
                    console.warn("Missing Supabase Config");
                    setIsLoading(false);
                }
            })
            .catch(err => {
                console.error("Config load failed", err);
                setIsLoading(false);
            });
    }, []);

    return (
        <AuthContext.Provider value={{ session, user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
