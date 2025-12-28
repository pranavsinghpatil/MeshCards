import { ArrowRight, FileText, Brain, Download, GraduationCap, Microscope, BookOpen, Briefcase, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle } from "@/lib/supabase";

const Hero = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (session) {
      navigate("/studio");
    } else {
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error("Sign in failed", error);
      }
    }
  };

  return (
    <div className="pt-0">
      {/* Hero Section - Neutral/Theme-aware background */}
      <section className="min-h-[70vh] relative overflow-visible bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="relative z-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-foreground">
                Turn Anything into
                <br />
                <span className="relative inline-block text-primary">
                  Flashcards
                  <Sparkles className="absolute -top-2 -right-6 w-6 h-6 text-primary/80" />
                </span>
                <br />
                <span>Anki Decks</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Upload PDFs, paste notes, or drop any text. AI generates high-quality flashcards so you can study smarter, not harder.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-xl font-semibold shadow-lg"
                >
                  {session ? "Create new Deck" : "Get Started Free"}
                </Button>
                <Link to="/guide">
                  <Button variant="ghost" className="text-foreground hover:text-foreground hover:bg-muted/50 px-6 py-6 rounded-xl font-medium">
                    Import guide <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Preview Card */}
            <div className="relative hidden lg:block">
              {/* Stacked cards effect - subtle neutral tones */}
              <div className="absolute top-4 left-4 w-full h-full bg-muted/60 rounded-2xl transform rotate-2" />
              <div className="absolute top-2 left-2 w-full h-full bg-muted/40 rounded-2xl transform rotate-1" />
              
              {/* Main preview card */}
              <div className="relative bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
                {/* Window header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground ml-2">MeshCards</span>
                </div>
                
                {/* Card content */}
                <div className="p-6 space-y-4">
                  {/* Service indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Flashcard Deck</p>
                        <p className="font-semibold text-sm">biology-chapter-5</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 text-xs font-semibold rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Ready
                    </span>
                  </div>
                  
                  {/* Stats row */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-2">Generated Cards</p>
                    <div className="flex items-end gap-1">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-4 bg-primary/60 rounded-sm" 
                          style={{ height: `${h * 0.4}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Sample flashcard */}
                  <div className="bg-background rounded-xl border border-border p-4 shadow-sm">
                    <p className="text-xs font-bold text-primary mb-1">Q1</p>
                    <p className="text-sm font-medium mb-2">What is mitochondria?</p>
                    <p className="text-xs text-muted-foreground">The powerhouse of the cell...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements - subtle blobs instead of gradient block */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-full h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Three simple steps to transform your study materials
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: FileText,
              title: "1. Upload",
              description: "Drop a PDF, paste text, or upload any document."
            },
            {
              icon: Brain,
              title: "2. Generate",
              description: "AI creates Q&A pairs optimized for spaced repetition."
            },
            {
              icon: Download,
              title: "3. Export",
              description: "Download as .apkg and import directly into Anki."
            }
          ].map((feature, index) => (
            <div key={index} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who's it for Section */}
      <section id="who" className="container py-24 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Learners</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Perfect for anyone using spaced repetition to learn
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: Microscope, title: "Med Students", description: "Anatomy, pharmacology, pathology" },
            { icon: GraduationCap, title: "Students", description: "Exam prep, lectures, textbooks" },
            { icon: BookOpen, title: "Law Students", description: "Case briefs, statutes, terms" },
            { icon: Briefcase, title: "Professionals", description: "Certifications, skills, training" }
          ].map((item, index) => (
            <div key={index} className="p-5 rounded-xl border border-border/50 hover:border-primary/50 transition-colors bg-card hover:bg-accent/5">
              <item.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-24">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />
            
            <h2 className="text-3xl font-bold mb-4 mt-8">Free to Use</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Completely free. Support development if you find it useful!
            </p>
            
            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold text-foreground mb-1">$0</div>
              <p className="text-sm text-muted-foreground">No credit card required</p>
            </div>
            
            <a 
              href="https://buymeacoffee.com/htclodkzgo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:bg-foreground/90 transition-colors"
            >
              ☕ Buy Me a Coffee
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
