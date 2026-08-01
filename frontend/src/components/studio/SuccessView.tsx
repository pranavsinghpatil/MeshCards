import { Check, Download, Sparkles, BookOpen, ArrowRight, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api";
import AdComponent from "../AdComponent";
import ShinyText from "../ui/ShinyText";

export const SuccessView = ({ onReset, jobId, deckName }: { onReset: () => void, jobId: string | null, deckName: string }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-full max-w-3xl mx-auto border-2 border-primary rounded-3xl bg-card shadow-[4px_4px_0_0_hsl(var(--primary))] overflow-hidden">
            {/* Top Confetti / Header Area */}
            <div className="bg-primary/5 border-b-2 border-primary/20 p-6 text-center relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                            <Check className="w-6 h-6" strokeWidth={4} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Deck Generated!</h2>
                    </div>
                    <p className="text-muted-foreground text-base">
                        Your file <strong className="text-foreground bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{deckName}.apkg</strong> has been downloaded.
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Check your downloads folder.</p>
                </div>
            </div>

            <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                     {/* Primary Action: Download Again (now Outline style) */}
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-12 text-lg font-bold border-2 border-foreground/20 hover:border-foreground/50 hover:bg-muted hover:text-foreground"
                        onClick={() => {
                            if (jobId) {
                                const link = document.createElement('a');
                                link.href = getApiUrl(`/download/${jobId}`);
                                link.click();
                            } else {
                                toast({ description: "No job ID available (Test Mode)", duration: 2000 });
                            }
                        }}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download Again
                    </Button>

                     {/* Secondary Action: Generate Another (now Primary/Shadow style) */}
                    <Button
                        size="lg"
                        className="w-full h-12 text-lg font-bold border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-y-[1px] hover:shadow-none transition-all"
                        onClick={onReset}
                    >
                         <Sparkles className="mr-2 h-4 w-4" />
                        Generate Another
                    </Button>
                </div>

                {/* Guide Section */}
                <div 
                    onClick={() => window.open('/guide', '_blank')}
                    className="group relative cursor-pointer border-2 border-primary/10 px-5 py-5 bg-gradient-to-br from-primary/5 via-transparent to-transparent hover:from-primary/10 hover:border-primary/20 transition-all rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-md"
                >
                    <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-[4px_4px_0_0_hsl(var(--foreground))] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                        <BookOpen className="w-5 h-5" />
                    </div>
                     <div className="flex-1 text-left">
                          <p className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-tight mb-1">How to import into Anki?</p>
                          <ShinyText 
                            text="Don't know how to import content into your flashcard app? Click for step-by-step guide" 
                            disabled={false}
                            speed={5}
                            spread={120}
                            color="hsl(var(--muted-foreground))"
                            shineColor="hsl(var(--primary))"
                            className="text-xs font-semibold leading-relaxed"
                          />
                     </div>
                     <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                     </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-muted/50 border-t-2 border-border p-3 grid grid-cols-2 divide-x divide-border">
                  <button 
                    className="flex items-center justify-center gap-2 text-xs font-semibold text-pink-600 hover:text-pink-500 hover:bg-pink-500/5 py-2 transition-all rounded-xl"
                    onClick={() => window.open('https://buymeacoffee.com/htclodkzgo', '_blank')}
                  >
                    <Heart className="w-3 h-3 fill-current" />
                    Sponsor Project
                  </button>
                 <button 
                    className="group flex items-center justify-center gap-2 text-xs font-bold text-primary hover:text-primary/80 py-1 transition-colors"
                    onClick={() => window.open('/feedback', '_blank')}
                 >
                    <Settings className="w-3 h-3 group-hover:rotate-45 transition-transform duration-500" />
                    <span className="relative">
                        Give Feedback
                        <span className="absolute -bottom-0.5 left-0 w-full h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </span>
                 </button>
            </div>
        </div>
        
        {/* Educational Ad Slot */}
        <div className="w-full max-w-3xl mx-auto mt-8">
            <AdComponent 
                dataAdSlot="2267661918" 
                className="min-h-[100px]"
            />
        </div>
    </div>
  )
};
