import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

export const LoadingOverlay = ({ statusMessage }: { statusMessage?: string }) => {
    const [text, setText] = useState("Initializing AI...");
    
    useEffect(() => {
        if (statusMessage) {
            setText(statusMessage);
            return;
        }

        const messages = [
            "Reading your documents...",
            "Identifying key concepts...",
            "Generating Question & Answer pairs...",
            "Verifying accuracy...",
            "Packaging into .apkg...",
            "Starting download..."
        ];
        let i = 0;
        const timer = setInterval(() => {
            setText(messages[i % messages.length]);
            i++;
        }, 3000);
        return () => clearInterval(timer);
    }, [statusMessage]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md rounded-2xl select-none border-2 border-primary/20">
            <div className="relative mb-8">
                {/* Glowing Mesh Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary via-purple-500 to-pink-500 blur-3xl opacity-30 rounded-full" />
                
                {/* Card Animation */}
                <div className="relative bg-card border-4 border-foreground w-40 h-56 rounded-3xl shadow-[8px_8px_0_0_hsl(var(--foreground))] flex flex-col items-center justify-center gap-5">
                    <div className="w-24 h-2.5 bg-primary/20 rounded-full" />
                    <div className="w-20 h-2.5 bg-foreground/10 rounded-full" />
                    <div className="w-28 h-2.5 bg-foreground/10 rounded-full" />
                    <div className="w-16 h-2.5 bg-foreground/10 rounded-full" />
                    
                    <div className="absolute bottom-8 flex items-center justify-center">
                         <RefreshCw className="w-8 h-8 text-primary animate-spin relative z-10" />
                    </div>
                </div>
            </div>
            
            <h3 className="text-3xl font-black mb-3 tracking-tighter text-foreground">
                {text}
            </h3>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full border border-border">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Forging your knowledge deck...</p>
            </div>
        </div>
    );
};
