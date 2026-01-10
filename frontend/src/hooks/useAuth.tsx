import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { initSupabase, getSupabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isSponsor: boolean;
  refreshSponsorStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
    session: null, 
    user: null, 
    isLoading: true, 
    isSponsor: false,
    refreshSponsorStatus: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSponsor, setIsSponsor] = useState(false);
    const { toast } = useToast();

    const checkSponsorStatus = async (currentUser: User | null) => {
        if (!currentUser) {
            setIsSponsor(false);
            return;
        }

        const sb = getSupabase();
        if (!sb) return;

        try {
            const { data } = await sb.from('profiles')
                .select('is_sponsor')
                .eq('id', currentUser.id)
                .maybeSingle();
            
            if (data?.is_sponsor) {
                setIsSponsor(true);
            } else {
                // Secondary check in sponsors table
                const { data: sponsorData } = await sb.from('sponsors')
                    .select('is_active')
                    .eq('user_id', currentUser.id)
                    .maybeSingle();
                
                setIsSponsor(sponsorData?.is_active ?? false);
            }
        } catch (e) {
            console.error("Auth sponsor check failed", e);
        }
    };

    const refreshSponsorStatus = async () => {
        await checkSponsorStatus(user);
    };

    useEffect(() => {
        fetch(getApiUrl('/api/config'))
            .then(res => res.json())
            .then(config => {
                if (config.supabase_url && config.supabase_anon_key) {
                    initSupabase(config.supabase_url, config.supabase_anon_key);
                    const sb = getSupabase();
                    if (sb) {
                        sb.auth.getSession().then(({ data: { session } }) => {
                            setSession(session);
                            const u = session?.user ?? null;
                            setUser(u);
                            checkSponsorStatus(u);
                            setIsLoading(false);
                        });
                        
                        const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
                            const wasSignedOut = !user;
                            const isNowSignedIn = session?.user;
                            
                            setSession(session);
                            const u = session?.user ?? null;
                            setUser(u);
                            checkSponsorStatus(u);
                            setIsLoading(false);
                            
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
        <AuthContext.Provider value={{ session, user, isLoading, isSponsor, refreshSponsorStatus }}>
            {children}
        </AuthContext.Provider>
    );
};
