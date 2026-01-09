import { useState, useEffect } from "react";
import { Shield, Users, CreditCard, Zap, Activity, ChevronRight, Lock, Key, RefreshCw, LogOut, BookOpen, Mail, Terminal, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import Header from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";
import { toast } from "@/hooks/use-toast";

interface Sponsor {
    email: string;
    name?: string;
    tier: string;
    coffee_id?: string;
    is_active: boolean;
    updated_at: string;
}

interface Stats {
    total_users: number;
    total_active_sponsors: number;
    total_decks_today: number;
    sponsors: Sponsor[];
    timestamp: string;
}

const AdminPage = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [adminKey, setAdminKey] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchStats = async (key: string) => {
        try {
            setLoading(true);
            const response = await fetch(getApiUrl("/api/admin/stats"), {
                headers: {
                    "X-Admin-Key": key
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
                setIsAuthenticated(true);
                localStorage.setItem("mesh_admin_key", key);
            } else {
                toast({
                    variant: "destructive",
                    title: "Access Denied",
                    description: "Invalid admin key provided."
                });
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedKey = localStorage.getItem("mesh_admin_key");
        if (savedKey) {
            setAdminKey(savedKey);
            fetchStats(savedKey);
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStats(adminKey);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-md bg-card border-4 border-foreground rounded-3xl shadow-[8px_8px_0_0_hsl(var(--foreground))] p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Lock className="w-32 h-32" />
                        </div>
                        
                        <div className="relative z-10 text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                                <Shield className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tighter mb-2">Admin Access</h1>
                            <p className="text-muted-foreground font-medium">Please enter your master key to view metrics.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Master Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input 
                                        type="password" 
                                        value={adminKey}
                                        onChange={(e) => setAdminKey(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full bg-muted border-2 border-foreground/20 rounded-xl pl-10 pr-4 py-3 font-mono text-lg focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full py-6 text-lg font-black rounded-xl shadow-[4px_4px_0_0_hsl(var(--foreground))] border-2 border-foreground hover:translate-y-[2px] hover:shadow-none transition-all">
                                Authenticate Master
                            </Button>
                        </form>
                    </div>
                </main>
                <SimpleFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 p-6 md:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded border border-primary/20">
                                    System Dashboard
                                </div>
                                <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                            </div>
                            <h1 className="text-5xl font-black tracking-tight mb-2">Owner Console</h1>
                            <p className="text-muted-foreground text-lg font-medium">Real-time metrics for MeshCards.</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => {
                                    localStorage.removeItem("mesh_admin_key");
                                    setIsAuthenticated(false);
                                    setAdminKey("");
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-foreground/10 hover:bg-muted font-bold transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                            <Button 
                                onClick={() => fetchStats(adminKey)}
                                className="px-6 h-12 rounded-xl font-bold bg-primary text-primary-foreground border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-y-[2px] hover:shadow-none transition-all"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh Stats
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* Users Card */}
                        <div className="bg-card border-4 border-foreground rounded-3xl p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))] relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Users className="w-32 h-32" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">Total Users</p>
                            <h3 className="text-6xl font-black tracking-tighter mb-4">{stats?.total_users || 0}</h3>
                            <div className="flex items-center gap-2 text-green-500 font-bold">
                                <ChevronRight className="w-4 h-4" />
                                <span>Organic Growth</span>
                            </div>
                        </div>

                        {/* Sponsors Card */}
                        <div className="bg-card border-4 border-foreground rounded-3xl p-8 shadow-[8px_8px_0_0_hsl(var(--primary))] relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <CreditCard className="w-32 h-32" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest text-primary mb-1">Active Sponsors</p>
                            <h3 className="text-6xl font-black tracking-tighter mb-4 text-primary">{stats?.total_active_sponsors || 0}</h3>
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <Zap className="w-4 h-4 fill-primary" />
                                <span>Streamlined Revenue</span>
                            </div>
                        </div>

                        {/* Today's Stats */}
                        <div className="bg-card border-4 border-foreground rounded-3xl p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))] relative overflow-hidden group">
                             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <BookOpen className="w-32 h-32" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">Decks Generated Today</p>
                            <h3 className="text-6xl font-black tracking-tighter mb-4">{stats?.total_decks_today || 0}</h3>
                            <div className="flex items-center gap-2 text-yellow-500 font-bold">
                                <Activity className="w-4 h-4" />
                                <span>Platform Activity</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* Sponsors Table */}
                        <div className="bg-card border-4 border-foreground rounded-3xl p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-primary" />
                                Recent Sponsors
                            </h2>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {stats?.sponsors && stats.sponsors.length > 0 ? (
                                    stats.sponsors.map((s, i) => (
                                        <div key={i} className="p-4 bg-muted/30 rounded-xl border-2 border-foreground/5 hover:border-primary/20 transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-black text-lg group-hover:text-primary transition-colors">{s.name || s.email.split('@')[0]}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Mail className="w-3 h-3" />
                                                        {s.email}
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg border border-primary/20">
                                                    {s.tier}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-foreground/5">
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                    <Terminal className="w-3 h-3" />
                                                    ID: {s.coffee_id || 'manual'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(s.updated_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-foreground/10 rounded-2xl">
                                        No sponsors found yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent System Activity */}
                        <div className="bg-card border-4 border-foreground rounded-3xl p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                            <h2 className="text-2xl font-black mb-6">Recent System Activity</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold">System Pulse Ok</p>
                                            <p className="text-xs text-muted-foreground">Last sync: {new Date(stats?.timestamp || Date.now()).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black uppercase px-2 py-1 bg-green-500/10 text-green-500 rounded">Active</span>
                                </div>
                                
                                <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-center justify-between opacity-50 grayscale">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Broadcast Notifications</p>
                                            <p className="text-xs text-muted-foreground">Feature coming when base reaches 50+ users</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black uppercase px-2 py-1 bg-muted text-muted-foreground rounded">Locked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <SimpleFooter />
        </div>
    );
};

export default AdminPage;
