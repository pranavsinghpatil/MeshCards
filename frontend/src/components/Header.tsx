import { useState } from "react";
import { Menu, X, Sparkles, Palette, LogIn, LogOut, User, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { session, user } = useAuth();
  const [contactMessage, setContactMessage] = useState("");

  const handleSignIn = async () => {
    try {
        await signInWithGoogle();
    } catch (error) {
        console.error("Sign in failed", error);
    }
  };

  const handleSignOut = async () => {
      await signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span>Anki<span className="text-primary">Gen</span></span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            
            {/* Contact Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Contact Developer</DialogTitle>
                  <DialogDescription>
                    Have a question or suggestion? Send us a message directly.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input id="email" placeholder="name@example.com" type="email" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Type your message here..." 
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={() => alert("Message sent! (Mock)")}>Send Message</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Theme Switcher */}
            <div className="relative group hidden sm:block">
              <button className="btn-ghost p-2" title="Change theme">
                <Palette className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[140px]">
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
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium mr-2">
                        <User className="w-4 h-4" />
                        {user?.email?.split('@')[0]}
                    </div>
                     <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            ) : (
                <Button variant="default" size="sm" onClick={handleSignIn} className="gap-2">
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
              <Dialog>
                  <DialogTrigger asChild>
                     <Button variant="ghost" className="w-full justify-start px-4">Contact Developer</Button>
                  </DialogTrigger>
                   <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Contact Developer</DialogTitle>
                        <DialogDescription>
                            Have a question? Send us a message.
                        </DialogDescription>
                        </DialogHeader>
                         <div className="grid gap-4 py-4">
                            <Input placeholder="Your Email" />
                            <Textarea placeholder="Message" />
                            <Button onClick={() => setMobileMenuOpen(false)}>Send</Button>
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
