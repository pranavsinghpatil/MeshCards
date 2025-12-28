import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { initSupabase, getSupabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
    const { toast } = useToast();

    useEffect(() => {
        // Fetch Config & Init Supabase
        fetch(getApiUrl('/api/config'))
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
                        
                        const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
                            const wasSignedOut = !user;
                            const isNowSignedIn = session?.user;
                            
                            setSession(session);
                            setUser(session?.user ?? null);
                            setIsLoading(false);
                            
                            // Show terms acceptance toast ONLY on first sign-in per session
                            if (wasSignedOut && isNowSignedIn && event === 'SIGNED_IN') {
                                const hasSeenWelcome = sessionStorage.getItem('meshcards_welcome_shown');
                                
                                if (!hasSeenWelcome) {
                                    toast({
                                        title: "Welcome to MeshCards! 🎉",
                                        description: (
                                            <div className="text-sm">
                                                <p className="mb-2">By signing in, you agree to our Disclaimer, Terms and Privacy.</p>
                                                <a 
                                                    href="/legal" 
                                                    className="text-primary hover:text-primary/80 underline font-medium"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open('/legal', '_blank');
                                                    }}
                                                >
                                                    View Disclaimer →
                                                </a>
                                            </div>
                                        ),
                                        duration: 5000,
                                    });
                                    
                                    // Mark as shown for this browser session
                                    sessionStorage.setItem('meshcards_welcome_shown', 'true');
                                }
                            }
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
    }, [toast]);

    return (
        <AuthContext.Provider value={{ session, user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
