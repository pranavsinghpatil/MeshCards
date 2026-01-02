import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, X, Download, RefreshCw, ChevronDown, Copy, Check, Settings, Sparkles, BookOpen, ExternalLink, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getSupabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";
import Header from "./Header";
import SimpleFooter from "./SimpleFooter";
import AdComponent from "./AdComponent";

const LoadingOverlay = ({ statusMessage }: { statusMessage?: string }) => {
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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] animate-in fade-in duration-500 rounded-2xl select-none">
            <div className="relative mb-8">
                {/* Glowing Mesh Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-500 blur-2xl opacity-40 animate-pulse rounded-full" />
                
                {/* Card Animation */}
                <div className="relative bg-card border-2 border-primary/20 w-32 h-44 rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-4 animate-bounce">
                    <div className="w-20 h-2 bg-primary/20 rounded-full" />
                    <div className="w-16 h-2 bg-foreground/10 rounded-full" />
                    <div className="w-24 h-2 bg-foreground/10 rounded-full" />
                    <div className="w-12 h-2 bg-foreground/10 rounded-full" />
                    
                    <RefreshCw className="w-6 h-6 text-primary animate-spin absolute bottom-6" />
                </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2 tracking-tight">{text}</h3>
            <p className="text-muted-foreground text-sm">Forging your knowledge deck...</p>
        </div>
    );
};

const SuccessView = ({ onReset, jobId, deckName }: { onReset: () => void, jobId: string | null, deckName: string }) => {
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
                    className="group relative cursor-pointer border px-4 py-3 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all rounded-xl flex items-center gap-4"
                >
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                         <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">How to import into Anki?</p>
                         <p className="text-xs text-muted-foreground">Don't know how to import content into your flashcard app? Click for step-by-step guide</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-muted/50 border-t-2 border-border p-3 grid grid-cols-2 divide-x divide-border">
                 <button 
                    className="flex items-center justify-center gap-2 text-xs font-semibold text-pink-600 hover:text-pink-500 py-1 transition-colors"
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
        {/* Educational Ad Slot */}
        <div className="w-full max-w-3xl mx-auto mt-8">
            <AdComponent 
                dataAdSlot="2267661918" 
                className="min-h-[100px]"
            />
            {/* <p className="text-[10px] text-center text-muted-foreground/40 mt-1">
                Sponsored
            </p> */}
        </div>
    </div>
  )
};

const Studio = () => {
  const { session } = useAuth();
  const [text, setText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [cardCount, setCardCount] = useState(25);
  const [aiModel, setAiModel] = useState("gemini-2.5-flash"); 
  const [cardStyle, setCardStyle] = useState("qa");
  const [difficulty, setDifficulty] = useState("balanced");
  const [deckName, setDeckName] = useState("MeshCards");
  const [isDragging, setIsDragging] = useState(false);
  const [dailyCount, setDailyCount] = useState<number | null>(null);
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
        const fetchProfile = async () => {
            const sb = getSupabase();
            if(!sb) return;
            const { data } = await sb.from('profiles').select('daily_count').eq('id', session.user.id).single();
            if(data) {
                setDailyCount(data.daily_count);
            }
        };
        fetchProfile();
    }
  }, [session]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
      const validTypes = [".pdf", ".txt", ".docx", ".png", ".jpg", ".jpeg", ".webp"];
      const allowed = newFiles.filter(file => {
          const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
          return validTypes.includes(fileExt);
      });
      
      if (allowed.length < newFiles.length) {
          toast({ title: "Invalid files ignored", description: "Only PDF, TXT, DOCX, Images allowed.", variant: "destructive" });
      }

      setUploadedFiles(prev => {
          const combined = [...prev, ...allowed];
          if (combined.length > 3) {
             toast({ title: "Limit Reached", description: "Maximum 3 files allowed.", variant: "destructive" });
             return combined.slice(0, 3);
          }
          return combined;
      });
  };

  const removeFile = (index: number) => {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const pollJob = async (jobId: string) => {
      const maxRetries = 60;
      let attempts = 0;
      let lastStatus = '';

      while (attempts < maxRetries) {
          await new Promise(r => setTimeout(r, 2000));
          const res = await fetch(getApiUrl(`/status/${jobId}`));
          if (!res.ok) throw new Error("Status check failed");

          const data = await res.json();
          
          // Show queue status
          if (data.status === 'queued') {
              const position = data.position || 0;
              const queueLength = data.queue_length || 0;
              const waitTime = data.estimated_wait_seconds || 0;
              const minutes = Math.floor(waitTime / 60);
              const seconds = waitTime % 60;
              
              const msg = `⏳ In Queue (Position ${position}/${queueLength}) - Wait ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
              setStatusMessage(msg);
              
              if (lastStatus !== 'queued') {
                  toast({ 
                      title: msg,
                      description: `MeshCards is FREE - we queue requests to prevent API limits.`
                  });
                  lastStatus = 'queued';
              }
          }
          
          // Show processing status
          if (data.status === 'processing') {
              const loadingMsg = data.message ? `🔄 ${data.message}` : "🔄 Processing Your Deck...";
              setStatusMessage(loadingMsg);
              
              if (lastStatus !== 'processing') {
                  toast({ 
                      title: "🔄 Processing Your Deck",
                      description: "AI is generating your flashcards..."
                  });
                  lastStatus = 'processing';
              }
          }
          
          if (data.status === 'completed') return true;
          
          if (data.status === 'failed') {
              const error = data.error || "Generation failed";
              // Check if it's a quota error
              if (error.toLowerCase().includes('quota') || error.toLowerCase().includes('2/2')) {
                  throw new Error(`📊 ${error}\n\nMeshCards is FREE with a 2-deck daily limit. This helps us keep it accessible to everyone!`);
              }
              // Check if it's a rate limit error
              if (error.toLowerCase().includes('rate limit') || error.toLowerCase().includes('429')) {
                  throw new Error(`⚠️ ${error}\n\nToo many students are generating decks right now. Please wait 1-2 minutes and try again.`);
              }
              
              // Check for PDF/Input errors (User Error)
              if (error.includes('Invalid Elementary Object') || error.includes('PDF')) {
                  throw new Error(`📄 PDF Error: The file seems corrupted or encrypted. Please try a different PDF or copy-paste the text instead.`);
              }
              
              if (error.includes('No cards generated') || error.includes('No input')) {
                  throw new Error(`📝 No Content Found: We couldn't extract enough text to generate flashcards. Please try adding more text or a clearer document.`);
              }
              
              // Generic error (Server Error)
              throw new Error(error);
          }
          
          attempts++;
      }
      throw new Error("Timeout waiting for generation");
  };

  const monitorJob = async (jobId: string, name: string) => {
      try {
          setIsGenerating(true);
          setLastJobId(jobId);
          setDeckName(name); // Restore name context
          setStatusMessage("Processing...");
          
          // Persist job state
          localStorage.setItem("mesh_active_job", JSON.stringify({id: jobId, name: name}));

          await pollJob(jobId);

          // Success Logic
          
          // Check if already downloaded to prevent duplicates on reload/nav
          if (!localStorage.getItem(`mesh_downloaded_${jobId}`)) {
              toast({ title: "Success!", description: "Deck generated successfully. Downloading..." });
              
              const downloadLink = document.createElement('a');
              downloadLink.href = getApiUrl(`/download/${jobId}`);
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              
              localStorage.setItem(`mesh_downloaded_${jobId}`, "true");
          } else {
               toast({ title: "Ready!", description: "Your deck is ready." });
          }
          
          setGenerationSuccess(true);
          
          // Update Quota
          const sb = getSupabase();
          if (sb && session?.user) {
              const { data } = await sb.from('profiles').select('daily_count').eq('id', session.user.id).single();
              if (data) setDailyCount(data.daily_count);
          }

      } catch (error: any) {
          let title = "Error";
          let description = error.message || "Something went wrong";
          if (description.includes("| Title:")) {
              const parts = description.split("| Title:");
              if (parts.length === 2) {
                  const codePart = parts[0].split("Error Code:");
                  if (codePart.length === 2) {
                      title = parts[1].trim();
                      description = `Code: ${codePart[1].trim()}`;
                  }
              }
          }
          toast({ title: title, description: description, variant: "destructive" });
      } finally {
          setIsGenerating(false);
          localStorage.removeItem("mesh_active_job");
      }
  };

  const handleGenerate = async () => {
    if (!session) {
        toast({ title: "Sign In Required", description: "Please sign in to generate flashcards.", variant: "destructive" });
        return;
    }

    if (!text && uploadedFiles.length === 0) {
      toast({ title: "No content", description: "Please paste text or upload a file first.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGenerationSuccess(false);
    
    try {
        const payload = new FormData();
        payload.append("text", text);
        uploadedFiles.forEach(file => { payload.append("files", file); });

        // Use selected model directly
        payload.append("provider", "gemini"); 
        payload.append("model", aiModel);
        payload.append("max_cards", cardCount.toString());
        payload.append("difficulty", difficulty);
        payload.append("style", cardStyle);
        // Default deck name to first file if present
        const defaultName = uploadedFiles.length > 0 ? uploadedFiles[0].name.split('.')[0] : "Generated Deck";
        const finalName = deckName || defaultName;
        payload.append("deck_name", finalName);

        const res = await fetch(getApiUrl('/generate'), {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}` },
            body: payload,
        });

        if (!res.ok) {
            const errText = await res.text();
            let errMsg = "Generation failed";
            try {
                const json = JSON.parse(errText);
                if (json.detail) errMsg = json.detail;
            } catch (e) { }
            throw new Error(errMsg);
        }

        const { job_id } = await res.json();
        
        toast({ 
            title: "Started! ⚠️ Keep Tab Open", 
            description: "Large files take time. Switching pages might interrupt progress.",
            duration: 6000 
        });
        
        // Hand off to monitor
        await monitorJob(job_id, finalName);

    } catch (error: any) {
         toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" });
         setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setText("");
    setUploadedFiles([]);
    setGenerationSuccess(false);
  };
  
  // Restore active job on mount
  useEffect(() => {
    const saved = localStorage.getItem("mesh_active_job");
    if (saved && !generationSuccess && !isGenerating) {
        try {
            const { id, name } = JSON.parse(saved);
            if (id) {
                setStatusMessage("Restoring active session...");
                monitorJob(id, name);
            }
        } catch (e) {
            localStorage.removeItem("mesh_active_job");
        }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (localStorage.getItem("mesh_active_job")) {
            e.preventDefault();
            e.returnValue = ""; // Chrome requires this
        }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasContent = text.length > 0 || uploadedFiles.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-0 pb-16">
        <div className="container">
          <div className="text-center mt-6 mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Flashcard <span className="text-primary">Studio</span>
            </h1>
            <p className="text-muted-foreground">
              Upload your content and configure settings to generate cards
            </p>
            {/* Debug Button */}
            {/* <button 
                onClick={() => setGenerationSuccess(true)}
                className="mt-2 text-xs text-muted-foreground/50 hover:text-primary transition-colors opacity-50 hover:opacity-100"
            >
                [Debug] View Success Page
            </button> */}
          </div>

          {generationSuccess ? (
             <SuccessView jobId={lastJobId} onReset={clearAll} deckName={deckName || "Generated Deck"} />
          ) : (
            <div className="grid lg:grid-cols-5 gap-6 max-w-6xl mx-auto mb-10 relative">
                {isGenerating && <LoadingOverlay statusMessage={statusMessage} />}
                
                <div className="lg:col-span-3">
                <div className="bg-card rounded-2xl border-2 border-foreground p-6 shadow-[4px_4px_0_0_hsl(var(--foreground))] h-full">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Content Input
                    </h2>
                    
                    <div
                    className={`
                        relative rounded-xl border-2 border-dashed transition-all mb-4 cursor-pointer
                        ${isDragging ? "border-primary bg-primary/10" : "border-foreground/30 hover:border-foreground/50"}
                        ${uploadedFiles.length > 0 ? "border-primary bg-primary/5" : ""}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => uploadedFiles.length < 3 && fileInputRef.current?.click()}
                    >
                    <div className="p-4">
                        {uploadedFiles.length > 0 ? (
                            <div className="space-y-3">
                                {uploadedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-background/50 p-2 rounded-lg border border-foreground/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-medium text-sm truncate max-w-[150px]">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="p-1 hover:bg-foreground/10 rounded">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {uploadedFiles.length < 3 && (
                                    <div className="text-center text-xs text-muted-foreground pt-2 border-t border-dashed border-foreground/20">
                                        + Add more files (Max 3)
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                                <p className="font-semibold text-sm">Drop Files & Images</p>
                                <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, PNG, JPG (Max 3)</p>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                    />
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs font-medium text-muted-foreground px-2">Prompt</span>
                    <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="relative flex-1">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your content, notes, or specific instructions for the AI here..."
                        className="w-full h-[500px] resize-none rounded-xl border-2 border-foreground/30 bg-background p-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                        {text.length} characters
                    </span>
                    </div>
                </div>
                </div>

                <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl border-2 border-foreground p-6 shadow-[4px_4px_0_0_hsl(var(--foreground))] h-full">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Configuration
                    </h2>

                    <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Deck Name</label>
                        <input type="text" value={deckName} onChange={(e) => setDeckName(e.target.value)} className="w-full bg-background border-2 border-foreground/30 rounded-lg px-3 py-2 text-sm font-bold" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">AI Model</label>
                        <div className="relative">
                        <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} className="w-full appearance-none bg-background border-2 border-foreground/30 rounded-lg px-3 py-2 text-sm cursor-pointer">
                            <option value="gemini-3-pro">Gemini 3 Pro (Best)</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            <option value="gpt-4.1">GPT-4.1</option>
                            <option value="claude-opus-4.5">Claude Opus 4.5</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Card Style</label>
                        <div className="relative">
                        <select value={cardStyle} onChange={(e) => setCardStyle(e.target.value)} className="w-full appearance-none bg-background border-2 border-foreground/30 rounded-lg px-3 py-2 text-sm cursor-pointer">
                            <option value="qa">Question & Answer</option>
                            <option value="cloze">Cloze Deletion</option>
                            <option value="definition">Definition</option>
                            <option value="true_false">True / False</option>
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="scenario">Scenario Based</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Voice & Tone</label>
                        <div className="relative">
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full appearance-none bg-background border-2 border-foreground/30 rounded-lg px-3 py-2 text-sm cursor-pointer">
                            <option value="balanced">Standard</option>
                            <option value="simple">Simple</option>
                            <option value="detailed">Detailed</option>
                            <option value="creative">Creative</option>
                            <option value="humorous">Humorous</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                        Number of Cards: <span className="text-primary font-bold">~{cardCount}</span>
                        </label>
                        <input type="range" min="15" max="150" value={cardCount} onChange={(e) => setCardCount(Number(e.target.value))} className="w-full accent-primary h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>15</span>
                        <span>150</span>
                        </div>
                    </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border">
                    {dailyCount !== null && (
                        <div className="text-center text-sm font-medium mb-2">
                            <span className={`${dailyCount >= 2 ? "text-red-500" : "text-primary"}`}>
                                Daily Limit: {Math.max(0, 2 - dailyCount)} / 2 remaining
                            </span>
                        </div>
                    )}
                    <Button onClick={handleGenerate} disabled={isGenerating || !hasContent || (dailyCount !== null && dailyCount >= 2)} className="w-full bg-foreground text-background py-3 rounded-xl font-bold disabled:opacity-50">
                        {isGenerating ? <><RefreshCw className="mr-2 animate-spin" /> Generating...</> : "Generate Cards"}
                    </Button>
                    </div>
                </div>
                </div>
            </div>
            )}

        </div>
      </main>
      <SimpleFooter />
    </div>
  );
};

export default Studio;
