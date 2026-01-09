import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, X, Download, RefreshCw, ChevronDown, Copy, Check, Settings, Sparkles, BookOpen, ExternalLink, ArrowRight, Heart, ShieldCheck, Zap, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getSupabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";
import Header from "./Header";
import SimpleFooter from "./SimpleFooter";
import AdComponent from "./AdComponent";
import { ApiKeyDialog } from "./ApiKeyDialog";

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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-500 rounded-2xl select-none border-2 border-primary/20">
            <div className="relative mb-8">
                {/* Glowing Mesh Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary via-purple-500 to-pink-500 blur-3xl opacity-30 animate-pulse rounded-full" />
                
                {/* Card Animation */}
                <div className="relative bg-card border-4 border-foreground w-40 h-56 rounded-3xl shadow-[8px_8px_0_0_hsl(var(--foreground))] flex flex-col items-center justify-center gap-5 animate-bounce">
                    <div className="w-24 h-2.5 bg-primary/20 rounded-full" />
                    <div className="w-20 h-2.5 bg-foreground/10 rounded-full" />
                    <div className="w-28 h-2.5 bg-foreground/10 rounded-full" />
                    <div className="w-16 h-2.5 bg-foreground/10 rounded-full" />
                    
                    <div className="absolute bottom-8 flex items-center justify-center">
                         <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
                         <RefreshCw className="w-8 h-8 text-primary animate-spin relative z-10" />
                    </div>
                </div>
            </div>
            
            <h3 className="text-3xl font-black mb-3 tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {text}
            </h3>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full border border-border animate-pulse">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Forging your knowledge deck...</p>
            </div>
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
  const { session, user } = useAuth();
  const [text, setText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [cardCount, setCardCount] = useState(25);
  const [aiModel, setAiModel] = useState("gemini-2.0-flash"); 
  const [cardStyle, setCardStyle] = useState("qa");
  const [difficulty, setDifficulty] = useState("balanced");
  const [deckName, setDeckName] = useState("MeshCards");
  const [isDragging, setIsDragging] = useState(false);
  const [dailyCount, setDailyCount] = useState<number | null>(null);
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string>(() => localStorage.getItem("mesh_user_api_key") || "");
  const [currentProvider, setCurrentProvider] = useState<string>("gemini");
  const [issponsor, setIssponsor] = useState(false);
  const [sponsorTier, setSponsorTier] = useState<string | null>(null);
  const [geminiMode, setGeminiMode] = useState<string>("shared"); // "shared" or "byok"
  const [novitaAccessMode, setNovitaAccessMode] = useState<string>("sponsors_only"); // "all" or "sponsors_only"
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
        const fetchProfile = async () => {
            const sb = getSupabase();
            if(!sb) return;
            
            // Fetch profile data (including daily count and manual sponsor flag)
            const { data: profileData } = await sb.from('profiles')
                .select('daily_count, is_sponsor, sponsor_tier')
                .eq('id', session.user.id)
                .maybeSingle();
            
            if(profileData) {
                setDailyCount(profileData.daily_count);
                if (profileData.is_sponsor) {
                    setIssponsor(true);
                    setSponsorTier(profileData.sponsor_tier || "Premium");
                    return; // Already verified as sponsor via profiles
                }
            }
            
            // Fallback: Check dedicated sponsors table
            try {
                const { data: sponsorData } = await sb.from('sponsors')
                    .select('is_active, tier')
                    .eq('user_id', session.user.id)
                    .maybeSingle();
                
                if (sponsorData?.is_active) {
                    setIssponsor(true);
                    setSponsorTier(sponsorData.tier || "Supporter");
                }
            } catch (e) {
                console.error("Sponsor check failed catch:", e);
            }
        };
        fetchProfile();
    }
  }, [session]);

  // Fetch access control config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(getApiUrl('/api/config'));
        if (response.ok) {
          const config = await response.json();
          if (config.gemini_mode) {
            setGeminiMode(config.gemini_mode);
          }
          if (config.novita_access_mode) {
            setNovitaAccessMode(config.novita_access_mode);
          }
        }
      } catch (error) {
        console.error("Failed to fetch config:", error);
      }
    };
    fetchConfig();

    // Listen for global API Settings event
    const handleOpenSettings = () => setShowApiKeyDialog(true);
    window.addEventListener('mesh_open_api_settings', handleOpenSettings);
    return () => window.removeEventListener('mesh_open_api_settings', handleOpenSettings);
  }, []);

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
          
          // Check for API limit exceeded - prompt for user key
          if (data.status === 'api_limit_exceeded' || data.status === 'byok_required') {
              setStatusMessage(data.status === 'api_limit_exceeded' ? "⚠️ API Limit Reached" : "🔑 API Key Required");
              setShowApiKeyDialog(true);
              throw new Error("API_LIMIT_PROMPT"); // Special error to stop polling
          }
          
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

          // Success Logic - Only download if job actually succeeded
          
          // Check job status one more time before downloading
          const finalStatus = await fetch(getApiUrl(`/status/${jobId}`));
          const finalData = await finalStatus.json();
          
          if (finalData.status === 'completed') {
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
          }
          
          setGenerationSuccess(true);
          
          // Clear active job marker
          localStorage.removeItem("mesh_active_job");
          
          // Update Quota
          const sb = getSupabase();
          if (sb && session?.user) {
              const { data } = await sb.from('profiles').select('daily_count').eq('id', session.user.id).single();
              if (data) setDailyCount(data.daily_count);
          }

      } catch (error: any) {
          // Don't show error toast if it's just prompting for API key
          if (error.message === "API_LIMIT_PROMPT") {
              // Keep generating state, wait for user to provide key
              return;
          }
          
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
          setIsGenerating(false);
      } finally {
          // Don't clear these if waiting for API key
          if (!showApiKeyDialog) {
              setIsGenerating(false);
              localStorage.removeItem("mesh_active_job");
          }
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

    // Check for BYOK mode - prompt for API key if using Gemini in BYOK mode
    if (currentProvider === "gemini" && geminiMode === "byok" && !userApiKey) {
        setCurrentProvider("gemini");
        setShowApiKeyDialog(true);
        toast({ 
            title: "API Key Required", 
            description: "This service requires you to use your own Gemini API key.",
            variant: "default"
        });
        return;
    }

    setIsGenerating(true);
    setGenerationSuccess(false);
    
    try {
        const payload = new FormData();
        payload.append("text", text);
        uploadedFiles.forEach(file => { payload.append("files", file); });

        // Use selected model directly
        payload.append("provider", currentProvider); 
        payload.append("model", aiModel);
        payload.append("max_cards", cardCount.toString());
        payload.append("difficulty", difficulty);
        payload.append("style", cardStyle);
        
        // Add user API key if provided
        if (userApiKey) {
            payload.append("api_key", userApiKey);
        }
        
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
            title: "Started! Keep Tab Open", 
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
  
  const handleApiKeySubmit = async (apiKey: string) => {
      if (!apiKey) {
          // Clearing the key
          setUserApiKey("");
          localStorage.removeItem("mesh_user_api_key");
          toast({ title: "API Key Cleared", description: "You are now using the shared free quota." });
          return;
      }

      setUserApiKey(apiKey);
      localStorage.setItem("mesh_user_api_key", apiKey);
      setShowApiKeyDialog(false);
      
      toast({
          title: "API Key Saved",
          description: "Your key is saved locally for this browser. Retrying generation...",
          duration: 3000
      });
      
      // Retry generation with user's key if it was a retry-action
      if (isGenerating) {
        await handleGenerate();
      }
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
        // Only warn if actually generating (not just any active job)
        if (isGenerating) {
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
                    
                    {/* Sponsor Thank You Badge */}
                    {issponsor && (
                        <div className="mb-6 relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-4">
                            {/* Animated background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex items-center gap-1">
                                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                        <Heart className="w-4 h-4 text-pink-500 shadow-sm fill-pink-500 animate-pulse" />
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-wider bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                        {sponsorTier || 'Premium Sponsor'}
                                    </span>
                                    <span className="text-xl">💎</span>
                                </div>
                                <p className="text-sm font-black text-foreground mb-1">
                                    Thank you for your support, {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Explorer'}! 🎉
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Your **{sponsorTier || 'Premium'}** status gives you **10 decks/day** and access to a massive selection of premium models. We're glad to have you!
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Deck Name</label>
                        <input type="text" value={deckName} onChange={(e) => setDeckName(e.target.value)} className="w-full bg-background border-2 border-foreground/30 rounded-lg px-3 py-2 text-sm font-bold" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">AI Model</label>
                        <div className="relative">
                        <select 
                            value={aiModel} 
                            onChange={(e) => {
                                const selectedModel = e.target.value;
                                setAiModel(selectedModel);
                                
                                // Update provider based on model selection
                                if (selectedModel.startsWith('llama') || selectedModel.startsWith('mistral') || selectedModel.startsWith('qwen')) {
                                    setCurrentProvider('novita');
                                } else {
                                    setCurrentProvider('gemini');
                                }
                            }} 
                            className="w-full appearance-none bg-background border-2 border-foreground/30 rounded-lg px-3 py-2 text-sm cursor-pointer font-bold"
                        >
                            <optgroup label="Gemini (Standard)">
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash — Best Balance (Next Gen)</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro — Highest Intelligence</option>
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash — Fast & Reliable</option>
                                <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash-8B — Lightweight</option>
                                
                                <option disabled>─────────────────────────</option>
                                <option value="gemini-3-pro">Gemini 3 Pro (Experimental Ultra)</option>
                                <option value="gemini-3-flash">Gemini 3 Flash (Experimental Speed)</option>
                            </optgroup>
                            {(issponsor || novitaAccessMode === 'all') ? (
                                <optgroup label={issponsor ? "🌟 Premium Models (Sponsor Choice) 💎" : "🌟 Premium Models"}>
                                    <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B — Best Value! ⭐</option>
                                    <option value="qwen/qwen-2.5-7b-instruct">Qwen 2.5 7B — Ultra Cheap! 💰</option>
                                    <option value="mistralai/mistral-small-2409">Mistral Small — Balanced</option>
                                    <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B — Reliable</option>
                                </optgroup>
                            ) : (
                                <optgroup label="🔒 Premium Models (Sponsors Only)">
                                    <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B (Locked 🔒)</option>
                                    <option value="qwen/qwen-2.5-7b-instruct">Qwen 2.5 7B (Locked 🔒)</option>
                                    <option value="mistralai/mistral-small-2409">Mistral Small (Locked 🔒)</option>
                                </optgroup>
                            )}
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
                        <div 
                            onClick={() => setShowApiKeyDialog(true)}
                            className="text-center text-sm font-medium mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                             {(userApiKey || issponsor) ? (
                                 <div className="space-y-1">
                                    <span className="text-primary flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        {userApiKey ? "Using Private API Key (Unlimited)" : `Sponsor Mode: ${Math.max(0, 10 - dailyCount)} / 10 daily quota remaining`}
                                    </span>
                                </div>
                            ) : (
                               <span className={`${(dailyCount >= (issponsor ? 10 : 2) && !userApiKey) ? "text-red-500 font-black" : "text-primary"}`}>
                                    {(dailyCount >= (issponsor ? 10 : 2) && !userApiKey) 
                                        ? "⚠️ Daily Limit Reached" 
                                        : `Daily Limit: ${Math.max(0, (issponsor ? 10 : 2) - dailyCount)} / ${issponsor ? 10 : 2} remaining`}
                                    <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">
                                        {issponsor ? "Thanks for sponsoring! Click to use private API key" : "Click to use your own API key & bypass limit"}
                                    </p>
                                </span>
                            )}
                        </div>
                    )}
                    
                    <Button 
                        onClick={handleGenerate} 
                        disabled={isGenerating || !hasContent || (dailyCount !== null && dailyCount >= (issponsor ? 10 : 2) && !userApiKey)} 
                        className={`w-full py-6 rounded-xl font-bold transition-all shadow-[4px_4px_0_0_hsl(var(--foreground))] border-2 border-foreground hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none
                            ${(dailyCount !== null && dailyCount >= (issponsor ? 10 : 2) && !userApiKey) ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                        `}
                    >
                        {isGenerating ? (
                            <><RefreshCw className="mr-2 animate-spin h-5 w-5" /> Generating...</>
                        ) : (dailyCount !== null && dailyCount >= (issponsor ? 10 : 2) && !userApiKey) ? (
                            "Limit Reached - Use Own Key"
                        ) : issponsor && currentProvider === 'novita' ? (
                            <><Zap className="mr-2 h-5 w-5 fill-yellow-400 text-yellow-500" /> Premium Core Generation</>
                        ) : (
                            "Generate Flashcards"
                        )}
                    </Button>
                    
                    {(dailyCount !== null && dailyCount >= (issponsor ? 10 : 2) && !userApiKey) && (
                        <p className="text-[10px] text-center mt-3 text-muted-foreground italic">
                            {issponsor 
                                ? "Sponsor limit (10/day) reached. Add your own key for absolute unlimited access!" 
                                : "Free limit (2/day) reached. Sponsor or use own API key to continue!"}
                        </p>
                    )}

                    <div className="mt-4 flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5 opacity-60">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">AI Images</span>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">
                            Sponsors Only (Coming Soon 🚧)
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            )}

        </div>
      </main>
      <SimpleFooter />
      
      {/* API Key Modal */}
      <ApiKeyDialog 
        open={showApiKeyDialog} 
        onClose={() => {
            setShowApiKeyDialog(false);
            setIsGenerating(false);
        }}
        onSubmit={handleApiKeySubmit}
        provider={currentProvider}
        isByokRequired={statusMessage.includes("Required") || geminiMode === "byok"}
      />
    </div>
  );
};

export default Studio;
