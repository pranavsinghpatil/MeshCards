import { Coffee, Wrench, Clock, Heart, Mail, ArrowRight, Zap, Shield, Sparkles, Users, Star, StarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MaintenancePage() {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Main Card - Landscape Layout */}
        <div className="bg-card rounded-2xl border-2 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] overflow-hidden">
          <div className="grid md:grid-cols-[320px_1fr] gap-0">
            {/* Left Side - Icon & Title */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 border-r-2 border-foreground flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-background rounded-full border-2 border-foreground flex items-center justify-center mb-4 animate-bounce">
                <Wrench className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-2">Under Maintenance</h1>
              <p className="text-sm text-muted-foreground mb-4">Making MeshCards better</p>
              
              
              <img 
                src="/maintenance.gif" 
                alt="Maintenance in progress" 
                className="w-full max-w-[200px] rounded-lg border-2 border-border shadow-lg"
              />

              {/* Stats */}
              <div className="w-full space-y-3 mt-4">
                <div className="bg-background/50 rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-bold">63%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '63%' }}></div>
                  </div>
                </div>
                {/* <div className="bg-background/50 rounded-lg p-2 border border-border text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ETA</span>
                    <span className="font-bold">~</span>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="p-8 space-y-5">
              
              {/* Quick Links */}
              <div className="bg-muted/20 rounded-lg p-4 border-2 border-border">
                <h3 className="text-sm font-bold mb-3 text-center">Quick Links</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <a
                    href="/guide"
                    className="text-xs text-center py-2 px-3 bg-card hover:bg-muted rounded-lg border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))] transition-all font-bold"
                  >
                    Import Guide
                  </a>
                  <a
                    href="/legal?section=disclaimer"
                    className="text-xs text-center py-2 px-3 bg-card hover:bg-muted rounded-lg border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))] transition-all font-bold"
                  >
                     Disclaimer
                  </a>
                  <a
                    href="/legal?section=terms"
                    className="text-xs text-center py-2 px-3 bg-card hover:bg-muted rounded-lg border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))] transition-all font-bold"
                  >
                     Terms & Conditions
                  </a>
                  <a
                    href="/legal?section=privacy"
                    className="text-xs text-center py-2 px-3 bg-card hover:bg-muted rounded-lg border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))] transition-all font-bold"
                  >
                     Privacy Policy
                  </a>
                  
                </div>
              </div>
              
              {/* Quote */}
              <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg p-5 border-2 border-primary/20">
                <p className="text-base italic text-foreground/90 mb-2">
                  "Building tools that make learning easier is my passion. Every line of code is written with students in mind."
                </p>
                <p className="text-sm text-muted-foreground font-semibold">— PranavSingh, Developer</p>
              </div>

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Left Column - Status & Features */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      What's Happening:
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <span className="text-xl">🚀</span>
                        <div>
                          <p className="text-xs font-semibold">Performance Upgrades</p>
                          <p className="text-xs text-muted-foreground">Faster load times</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <span className="text-xl">✨</span>
                        <div>
                          <p className="text-xs font-semibold">New Features</p>
                          <p className="text-xs text-muted-foreground">Enhanced UI/UX</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                        <span className="text-xl">🔧</span>
                        <div>
                          <p className="text-xs font-semibold">Bug Fixes</p>
                          <p className="text-xs text-muted-foreground">Stability improvements</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Proof */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Trusted by students worldwide</p>
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-3 h-3 fill-green-500 text-green-500" />
                      ))}
                    </div>
                  </div>

                  {/* Why We're Great */}
                  {/* <div className="bg-muted/30 rounded-lg p-4 border-2 border-border">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Why MeshCards?
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-green-500" />
                        <span>100% Free</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span>AI-Powered Flashcards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-blue-500" />
                        <span>Built for Students</span>
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Right Column - Support & Contact */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-lg border-2 border-yellow-300 dark:border-yellow-700 p-5">
                    <div className="flex items-center gap-2 mb-0">
                      <Coffee className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="text-base font-bold text-yellow-900 dark:text-yellow-100">Support This Project</h3>
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                      MeshCards is free forever. Your support helps me keep it running and add new features!
                    </p>
                    <a
                      href="https://www.buymeacoffee.com/htclodkzgo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-5 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md text-sm w-full justify-center"
                    >
                      <Coffee className="w-4 h-4" />
                      Buy Me a Coffee
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Contact */}
                  <div className="bg-muted/30 rounded-lg p-4 border-2 border-border">
                    <h3 className="text-sm font-bold mb-0">Need Help?</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      For urgent issues or questions, reach out directly:
                    </p>
                    <a
                      href="mailto:talktopranav@cc.cc"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold bg-primary/10 px-4 py-2 rounded-lg w-full justify-center transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      talktopranav@cc.cc
                    </a>
                  </div>

                  
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>Thank you for your patience!</span>
                </div>
                <span>We'll be back soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Last updated: 31/12/2025, 1:02:38 am IST
        </p>
      </div>
    </div>
  );
}
