import { Github, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const SimpleFooter = () => {
  return (
    <footer className="border-t border-border bg-background py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Copyright & Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-1">MeshCards</h3>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MeshCards. All rights reserved.
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-foreground/80">
            <Link to="/" className="hover:text-primary transition-colors font-semibold">Home</Link>
            <Link to="/legal" className="hover:text-primary transition-colors">Disclaimer</Link>
            <Link to="/legal" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/legal" className="hover:text-primary transition-colors">Privacy</Link>
          </div>

          {/* Action / Contact */}
          <div className="flex items-center gap-4">
            <a 
              href="/feedback" 
              className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
            >
              Contact Us
            </a>
            <div className="flex gap-2">
                <a href="https://github.com/pranavsinghpatil" target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Github className="w-5 h-5" />
                </a>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
