import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Ghost, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />
      
      <div className="text-center px-4 max-w-md animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block mb-8">
            <Ghost className="w-24 h-24 text-primary animate-bounce" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-foreground/10 rounded-full blur-sm" />
        </div>
        
        <h1 className="text-7xl font-black tracking-tighter mb-2 text-foreground">404</h1>
        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto mb-6">
            PAGE LOST IN SPACE
        </div>
        
        <h2 className="text-2xl font-bold mb-4">You've reached a ghost deck.</h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          The path <code className="bg-muted px-2 py-0.5 rounded text-primary font-mono text-sm">{location.pathname}</code> doesn't exist in our study library.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
                <Button size="lg" className="rounded-xl font-bold h-12 px-8 flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    <Home className="w-4 h-4" />
                    Back to Home
                </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => window.history.back()} className="rounded-xl font-bold h-12 px-8 border-2 border-foreground/10 hover:border-foreground/50 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
            </Button>
        </div>
      </div>
      
      {/* Decorative footer text */}
      <p className="absolute bottom-10 text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">
        MeshCards — Study Smarter Not Harder
      </p>
    </div>
  );
};

export default NotFound;
