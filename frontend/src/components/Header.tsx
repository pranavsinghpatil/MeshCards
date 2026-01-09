import { useState } from "react";
import { Menu, X, Sparkles, Palette, LogIn, LogOut, User, Heart, ChevronDown, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme, themes } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle, signOut } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { session, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
        await signInWithGoogle();
    } catch (error) {
        console.error("Sign in failed", error);
    }
  };

  const handleSignOut = async () => {
      await signOut();
      navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Studio", path: "/studio" },
    { name: "Guide", path: "/guide" },
    { name: "Feedback", path: "/feedback" },
    { name: "Legal", path: "/legal" },
  ];

  return (
    <header className="relative w-full z-[9999] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <img src="/logo.png" alt="MeshCards Logo" className="w-8 h-8 object-contain" />
            <span>Mesh<span className="text-primary">Cards</span></span>
          </Link>

          {/* Navigation (Only when signed in) */}
          {session && (
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.path
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            
            {/* Sponsor Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/10">
                  <Heart className="w-4 h-4 fill-current" />
                  Sponsor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500 fill-current" />
                    Support MeshCards
                  </DialogTitle>
                  <DialogDescription>
                    Help us keep this project free and working for everyone.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <p className="text-muted-foreground leading-relaxed">
                    MeshCards is a labor of love, designed to help students and professionals learn faster. 
                    Running the AI models and servers costs money. 
                  </p>
                  <p className="font-medium">
                    If you find this tool useful, please consider buying me a coffee! ☕
                  </p>
                </div>
                <div className="flex justify-between items-center">
                    <iframe 
                        src="https://github.com/sponsors/pranavsinghpatil/button" 
                        title="Sponsor pranavsinghpatil" 
                        height="32" 
                        width="114" 
                        style={{ border: 0, borderRadius: "6px" }}
                    ></iframe>
                    <a 
                      href="https://buymeacoffee.com/htclodkzgo" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button className="w-full bg-[#FFDD00] text-black hover:bg-[#FFDD00]/90 font-bold">
                        Buy Me a Coffee
                      </Button>
                    </a>
                </div>
              </DialogContent>
            </Dialog>

            {/* Theme Switcher */}
            <div className="relative group hidden sm:block">
              <button className="btn-ghost p-2 text-muted-foreground hover:text-foreground transition-colors" title="Change theme">
                <Palette className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] min-w-[140px]">
                {themes.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      theme === t.name ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {session ? (
                <div className="relative group">
                    <button 
                        className="flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border/40"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-primary-foreground border-2 border-primary/20 shadow-md overflow-hidden shrink-0">
                            {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                                <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4" />
                            )}
                        </div>
                        <span className="max-w-[100px] truncate hidden sm:block">
                            {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-300" />
                    </button>

                    {/* User Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-72 bg-card border-2 border-foreground rounded-2xl shadow-[4px_4px_0_0_hsl(var(--foreground))] p-1 z-[10000] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right scale-95 group-hover:scale-100">
                        <div className="px-4 py-4 border-b-2 border-foreground/10 mb-1 bg-muted/30 rounded-t-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] overflow-hidden shrink-0">
                                {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                                    <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground leading-none mb-1">Auth Account</p>
                                <p className="text-sm font-bold truncate text-foreground leading-tight">{user?.email}</p>
                                <p className="text-[10px] text-primary font-black truncate uppercase mt-0.5">
                                    {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Mesh Explorer'}
                                </p>
                            </div>
                        </div>
                        <div className="p-1">
                            <Link 
                                to="/studio"
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                                onClick={() => setUserMenuOpen(false)}
                            >
                                <Sparkles className="w-4 h-4" />
                                Flashcard Studio
                            </Link>
                            <button 
                                onClick={() => {
                                    // This event is caught by Studio.tsx to open the dialog
                                    window.dispatchEvent(new CustomEvent('mesh_open_api_settings'));
                                    setUserMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                API Key Settings
                            </button>
                            <div className="h-px bg-foreground/10 my-1 mx-2" />
                            <button 
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <Button variant="default" size="sm" onClick={handleSignIn} className="gap-2 font-bold shadow-md hover:shadow-lg transition-all">
                    <LogIn className="w-4 h-4" />
                    Sign In
                </Button>
            )}

            <button
              className="md:hidden btn-ghost p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              {session && navLinks.map(link => (
                 <Link 
                    key={link.path} 
                    to={link.path} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                 >
                    {link.name}
                 </Link>
              ))}

              <Dialog>
                  <DialogTrigger asChild>
                     <Button variant="ghost" className="w-full justify-start px-4 text-pink-500">
                        <Heart className="w-4 h-4 mr-2" />
                        Sponsor / Support
                     </Button>
                  </DialogTrigger>
                   <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Support MeshCards</DialogTitle>
                        <DialogDescription>
                            Help keep the project alive!
                        </DialogDescription>
                        </DialogHeader>
                         <div className="grid gap-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Your support helps cover server costs and API fees.
                            </p>
                            <a 
                              href="https://buymeacoffee.com/htclodkzgo" 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Button className="w-full bg-[#FFDD00] text-black">Buy Me a Coffee</Button>
                            </a>
                        </div>
                   </DialogContent>
              </Dialog>
              
              {session ? (
                  <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="px-4 py-2 text-left hover:bg-muted rounded-lg text-red-500">
                      Sign Out
                  </button>
              ) : (
                  <button onClick={() => { handleSignIn(); setMobileMenuOpen(false); }} className="px-4 py-2 text-left hover:bg-muted rounded-lg text-primary">
                      Sign In
                  </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
