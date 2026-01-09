import { useState, useEffect } from "react";
import { Shield, Users, CreditCard, Zap, Activity, ChevronRight, Lock, Key, RefreshCw, LogOut, BookOpen, Mail, Terminal, Calendar, Copy, Check, UserPlus, UserMinus, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import Header from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Sponsor {
    email: string;
    name?: string;
    tier: string;
    coffee_id?: string;
    is_active: boolean;
    updated_at: string;
}

interface UserProfile {
    id: string;
    email?: string;
    full_name?: string;
    daily_count: number;
    is_sponsor: boolean;
    sponsor_tier?: string;
    created_at: string;
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
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminKey, setAdminKey] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
    const [userTiers, setUserTiers] = useState<Record<string, string>>({});

    const tiers = ["Supporter", "Silver", "Gold", "Premium", "Platinum", "Manual Override"];

    const fetchStats = async (key: string) => {
        try {
            setLoading(true);
            const response = await fetch(getApiUrl("/api/admin/stats"), {
                headers: { "X-Admin-Key": key }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
                setIsAuthenticated(true);
                localStorage.setItem("mesh_admin_key", key);
                fetchUsers(key);
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

    const fetchUsers = async (key: string) => {
        try {
            const response = await fetch(getApiUrl("/api/admin/users"), {
                headers: { "X-Admin-Key": key }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    const toggleSponsor = async (userId: string) => {
        setIsActionLoading(userId + '-sponsor');
        const selectedTier = userTiers[userId] || "Premium";
        
        try {
            const formData = new FormData();
            formData.append("tier", selectedTier);

            const response = await fetch(getApiUrl(`/api/admin/users/${userId}/toggle-sponsor`), {
                method: 'POST',
                headers: { "X-Admin-Key": adminKey },
                body: formData
            });
            if (response.ok) {
                toast({ title: "Updated", description: `User promoted to ${selectedTier}.` });
                fetchUsers(adminKey);
                fetchStats(adminKey);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to toggle sponsor status." });
        } finally {
            setIsActionLoading(null);
        }
    };

    const resetQuota = async (userId: string) => {
        setIsActionLoading(userId + '-quota');
        try {
            const response = await fetch(getApiUrl(`/api/admin/users/${userId}/reset-quota`), {
                method: 'POST',
                headers: { "X-Admin-Key": adminKey }
            });
            if (response.ok) {
                toast({ title: "Reset", description: "User quota reset to zero." });
                fetchUsers(adminKey);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to reset quota." });
        } finally {
            setIsActionLoading(null);
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

    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedEmail(text);
        setTimeout(() => setCopiedEmail(null), 2000);
        toast({ title: "Copied!", description: "Email copied to clipboard." });
    };

    const filteredUsers = users.filter(u => 
        (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
        (u.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        u.id.includes(searchQuery)
    );

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
                                    <input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="••••••••••••" className="w-full bg-muted border-2 border-foreground/20 rounded-xl pl-10 pr-4 py-3 font-mono text-lg focus:border-primary transition-all outline-none" required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full py-6 text-lg font-black rounded-xl shadow-[4px_4px_0_0_hsl(var(--foreground))] border-2 border-foreground hover:translate-y-[2px] hover:shadow-none transition-all">Authenticate Master</Button>
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
                    {/* Top Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black px-3">OWNER COMMAND CENTER</Badge>
                                <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                            </div>
                            <h1 className="text-5xl font-black tracking-tight mb-2">Platform Console</h1>
                            <p className="text-muted-foreground text-lg font-medium">Operate and control MeshCards in real-time.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => { localStorage.removeItem("mesh_admin_key"); setIsAuthenticated(false); setAdminKey(""); }} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-foreground/10 hover:bg-muted font-bold transition-all text-sm"><LogOut className="w-4 h-4" />Logout</button>
                            <Button onClick={() => fetchStats(adminKey)} className="px-6 h-12 rounded-xl font-bold bg-primary text-primary-foreground border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-y-[2px] hover:shadow-none transition-all"><RefreshCw className="w-4 h-4 mr-2" />Refresh All</Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-card border-4 border-foreground rounded-3xl p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))] relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users className="w-32 h-32" /></div>
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">Total Users</p>
                            <h3 className="text-6xl font-black tracking-tighter mb-4">{stats?.total_users || 0}</h3>
                        </div>
                        <div className="bg-card border-4 border-foreground rounded-3xl p-8 shadow-[8px_8px_0_0_hsl(var(--primary))] relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><CreditCard className="w-32 h-32" /></div>
                            <p className="text-sm font-black uppercase tracking-widest text-primary mb-1">Active Sponsors</p>
                            <h3 className="text-6xl font-black tracking-tighter mb-4 text-primary">{stats?.total_active_sponsors || 0}</h3>
                        </div>
                        <div className="bg-card border-4 border-foreground rounded-3xl p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))] relative overflow-hidden group">
                             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><BookOpen className="w-32 h-32" /></div>
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">Decks Today</p>
                            <h3 className="text-6xl font-black tracking-tighter mb-4">{stats?.total_decks_today || 0}</h3>
                            <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden border border-foreground/5">
                                <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: `${Math.min(100, (stats?.total_decks_today || 0) / 100 * 100)}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <Tabs defaultValue="users" className="space-y-8">
                        <TabsList className="bg-muted p-1 rounded-2xl border-2 border-foreground h-16 w-full md:w-auto">
                            <TabsTrigger value="users" className="rounded-xl h-full px-8 font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">USER DIRECTORY</TabsTrigger>
                            <TabsTrigger value="sponsors" className="rounded-xl h-full px-8 font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">RECENT SPONSORS</TabsTrigger>
                            <TabsTrigger value="system" className="rounded-xl h-full px-8 font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">SYSTEM PULSE</TabsTrigger>
                        </TabsList>

                        <TabsContent value="users" className="space-y-6">
                            <div className="bg-card border-4 border-foreground rounded-3xl p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                    <h2 className="text-2xl font-black flex items-center gap-3"><Users className="w-6 h-6 text-primary" />Operate Users</h2>
                                    <div className="relative w-full md:w-96">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input type="text" placeholder="Search by name, email or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-muted border-2 border-foreground/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary transition-all outline-none" />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-foreground/5 text-left bg-muted/20">
                                                <th className="py-4 px-4 text-xs font-black uppercase tracking-widest">User Details</th>
                                                <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-center">Status</th>
                                                <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-center">Usage</th>
                                                <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-right">Target Tier</th>
                                                <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-foreground/5">
                                            {filteredUsers.map((u) => (
                                                <tr key={u.id} className="group hover:bg-muted/30 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="font-bold truncate max-w-[200px]">{u.full_name || 'Anonymous User'}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <span>{u.email || 'No email'}</span>
                                                            {u.email && <button onClick={() => copyToClipboard(u.email!)} className="opacity-0 group-hover:opacity-100 hover:text-primary transition-all"><Copy className="w-3 h-3" /></button>}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground/50 mt-1 font-mono">{u.id}</div>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        {u.is_sponsor ? <Badge className="bg-primary text-primary-foreground font-black">SPONSOR</Badge> : <Badge variant="secondary" className="font-bold opacity-50">FREE</Badge>}
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <div className="font-black text-xl">{u.daily_count}</div>
                                                        <div className="text-[10px] uppercase font-black text-muted-foreground">Today</div>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        {!u.is_sponsor && (
                                                            <select 
                                                                value={userTiers[u.id] || "Premium"}
                                                                onChange={(e) => setUserTiers({...userTiers, [u.id]: e.target.value})}
                                                                className="bg-muted border border-foreground/10 rounded-lg px-2 py-1 text-[10px] font-bold outline-none focus:border-primary"
                                                            >
                                                                {tiers.map(t => <option key={t} value={t}>{t}</option>)}
                                                            </select>
                                                        )}
                                                        {u.is_sponsor && <span className="text-[10px] font-black text-primary">{u.sponsor_tier || 'Premium'}</span>}
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button onClick={() => toggleSponsor(u.id)} disabled={!!isActionLoading} variant="outline" size="sm" className={`h-9 border-2 font-black text-[10px] rounded-lg ${u.is_sponsor ? 'border-red-500/20 text-red-500 hover:bg-red-50' : 'border-primary/20 text-primary'}`}>
                                                                {isActionLoading === u.id + '-sponsor' ? <RefreshCw className="w-3 h-3 animate-spin" /> : (u.is_sponsor ? <><UserMinus className="w-3 h-3 mr-1" /> REVOKE</> : <><UserPlus className="w-3 h-3 mr-1" /> GRANT</>)}
                                                            </Button>
                                                            <Button onClick={() => resetQuota(u.id)} disabled={!!isActionLoading} variant="ghost" size="sm" className="h-9 font-black text-[10px] text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 rounded-lg">
                                                                {isActionLoading === u.id + '-quota' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <><RotateCcw className="w-3 h-3 mr-1" /> RESET</>}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="sponsors" className="space-y-6">
                            <div className="bg-card border-4 border-foreground rounded-3xl p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                                <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><CreditCard className="w-6 h-6 text-primary" />Recent Financial Activity</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {stats?.sponsors && stats.sponsors.length > 0 ? (
                                        stats.sponsors.map((s, i) => (
                                            <div key={i} className="p-6 bg-muted/30 rounded-2xl border-2 border-foreground/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                                                <div className="absolute top-2 right-2 opacity-5"><Zap className="w-12 h-12" /></div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="font-black text-xl group-hover:text-primary transition-colors">{s.name || s.email.split('@')[0]}</p>
                                                        <button onClick={() => copyToClipboard(s.email)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"><Mail className="w-3 h-3" />{s.email}</button>
                                                    </div>
                                                    <Badge className="bg-primary/20 text-primary border-primary/20 font-black">{s.tier}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-foreground/5 font-mono text-[10px] text-muted-foreground">
                                                    <div className="flex items-center gap-1"><Terminal className="w-3 h-3" />ID: {s.coffee_id || 'manual'}</div>
                                                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(s.updated_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-20 text-muted-foreground border-4 border-dashed border-foreground/5 rounded-3xl">No sponsor data found yet.</div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="system" className="space-y-6">
                            <div className="bg-card border-4 border-foreground rounded-3xl p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Activity className="w-6 h-6 text-green-500" />System Health</h2>
                                <div className="space-y-4">
                                    <div className="p-5 bg-muted/30 rounded-2xl border-2 border-green-500/10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20"><Shield className="w-6 h-6" /></div>
                                            <div>
                                                <p className="font-black text-lg">Backend Core Active</p>
                                                <p className="text-xs text-muted-foreground">API responses are within nominal limits.</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="border-green-500/50 text-green-500 font-black px-4 py-1">ONLINE</Badge>
                                    </div>
                                    <div className="p-5 bg-muted/30 rounded-2xl border-2 border-foreground/5 flex items-center justify-between opacity-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Zap className="w-6 h-6" /></div>
                                            <div>
                                                <p className="font-black text-lg">Broadcast Module</p>
                                                <p className="text-xs text-muted-foreground">Notification engine waiting for 50+ users.</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="font-black px-4 py-1">LOCKED</Badge>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <SimpleFooter />
        </div>
    );
};

export default AdminPage;
