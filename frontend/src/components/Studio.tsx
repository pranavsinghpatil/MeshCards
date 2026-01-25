import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, X, Download, RefreshCw, ChevronDown, Copy, Check, Settings, Sparkles, BookOpen, ExternalLink, ArrowRight, Heart, ShieldCheck, Zap, Image as ImageIcon, Shield, Activity, Lock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const { session, user, isSponsor } = useAuth();
  const [text, setText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [showSponsorBanner, setShowSponsorBanner] = useState(true);
  const [cardCount, setCardCount] = useState(25);
  const [aiModel, setAiModel] = useState("gemini-3-pro"); 
  const [currentProvider, setCurrentProvider] = useState<string>("gemini");
  const [cardStyle, setCardStyle] = useState("qa");
  const [difficulty, setDifficulty] = useState("balanced");
  const [deckName, setDeckName] = useState("MeshCards");
  const [isDragging, setIsDragging] = useState(false);
  const [dailyCount, setDailyCount] = useState<number | null>(null);
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  // Store all keys in a dict: { gemini: "...", novita: "...", etc }
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
      try {
          return JSON.parse(localStorage.getItem("mesh_api_keys") || "{}");
      } catch {
          return {};
      }
  });

  const [geminiMode, setGeminiMode] = useState<string>("shared"); 
  const [novitaAccessMode, setNovitaAccessMode] = useState<string>("sponsors_only"); 
  const [modelTab, setModelTab] = useState<"standard" | "high_logic">("standard");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STANDARD_PROVIDERS = [
    { id: "gemini-3-pro", name: "Gemini 3 Pro", model: "gemini-3-pro", provider: "gemini", desc: "Ultimate logical reasoning & research depth." },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", model: "gemini-2.5-flash", provider: "gemini", desc: "High-speed multimodal intelligence." },
    { id: "gemini-3-flash", name: "Gemini 3 Flash", model: "gemini-3-flash", provider: "gemini", desc: "Balanced speed & intelligence (Multimodal)." },
    { id: "llama-3.3-70b-groq", name: "Llama 3.3 70B (Groq)", model: "llama-3.3-70b-versatile", provider: "groq", desc: "Near-instant high-logic generation." }
  ];

  const FRONTIER_MODELS = [
    { id: "kimi-k2", name: "Kimi K2 (Ultra Context)", model: "kimi-k2", provider: "novita" },
    { id: "deepseek-v3", name: "DeepSeek V3 (Reasoning)", model: "deepseek-v3", provider: "novita" },
    { id: "openai/gpt-4o", name: "GPT-4o (OpenAI Premium)", model: "openai/gpt-4o", provider: "novita" },
    { id: "anthropic/claude-3-5-sonnet", name: "Claude 3.5 Sonnet", model: "anthropic/claude-3-5-sonnet", provider: "novita" },
    { id: "mixtral-8x7b-32768", name: "Mistral Small (Fast - Groq)", model: "mixtral-8x7b-32768", provider: "groq" },
    { id: "qwen/qwen-2.5-7b-instruct", name: "Qwen 2.5 (Complex specialist)", model: "qwen/qwen-2.5-7b-instruct", provider: "novita" }
  ];

  const handleModelTabChange = (newTab: "standard" | "high_logic") => {
    setModelTab(newTab);
    
    // Auto-select first model in new tab if current model doesn't belong there
    if (newTab === "standard") {
        const defaultModel = STANDARD_PROVIDERS[0];
        setAiModel(defaultModel.model);
        setCurrentProvider(defaultModel.provider);
    } else {
        if (!isSponsor) {
            setAiModel(""); // High reasoning models require sponsorship - show placeholder
            setCurrentProvider("novita");
        } else if (!FRONTIER_MODELS.some(m => m.id === aiModel)) {
            setAiModel(FRONTIER_MODELS[0].id);
            setCurrentProvider("novita");
        }
    }
  };

  // Fetch usage on mount & session change
  useEffect(() => {
    if (session?.user) {
        const fetchUsage = async () => {
            const sb = getSupabase();
            if(!sb) return;
            
            const { data: profileData } = await sb.from('profiles')
                .select('daily_count')
                .eq('id', session.user.id)
                .maybeSingle();
            
            if(profileData) {
                setDailyCount(profileData.daily_count);
            } else {
                setDailyCount(0);
            }
        };
        fetchUsage();
    }
  }, [session]);

  // Sponsor Default Selection
  useEffect(() => {
    if (isSponsor) {
        setModelTab("high_logic");
        setAiModel(FRONTIER_MODELS[0].model);
        setCurrentProvider(FRONTIER_MODELS[0].provider);
    }
  }, [isSponsor]);

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
          // Auto-switch tab if sponsor and using a high reasoning model
          if (FRONTIER_MODELS.some(m => m.id === aiModel)) {
              setModelTab("high_logic");
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
              const error = data.error || "Unknown Error";
              const errorLower = error.toLowerCase();

              // 🚫 Quota/Limit Errors
              if (errorLower.includes('quota') || errorLower.includes('limit exceeded') || errorLower.includes('2/2')) {
                  throw new Error(`QUOTA_LIMIT|${error}|Daily Limit Reached. MeshCards is community-funded and free, so we have a small daily limit to keep things running!`);
              }
              
              // 🔑 API Key Errors
              if (errorLower.includes('api key') || errorLower.includes('invalid') || errorLower.includes('401') || errorLower.includes('403')) {
                  throw new Error(`AUTH_ERROR|${error}|Your API key seems invalid or restricted. Please double-check it in the settings.`);
              }
              
              // 📄 Document/Content Errors
              if (errorLower.includes('pdf') || errorLower.includes('corrupt') || errorLower.includes('no content')) {
                  throw new Error(`CONTENT_ERROR|${error}|We couldn't read your file correctly. Make sure it's not password-protected and contains actual text.`);
              }

              // ⚠️ LLM Errors
              if (errorLower.includes('hallucin') || errorLower.includes('safety') || errorLower.includes('refused')) {
                  throw new Error(`AI_SAFETY|${error}|The model refused to process this content due to safety filters or complexity.`);
              }

              // Fallback for everything else
              throw new Error(`SERVER_FAIL|${error}|The engine encountered an unexpected hiccup. Please try again in a few seconds.`);
          }
          
          attempts++;
      }
      throw new Error("TIMEOUT|The task took too long.|Please try a smaller document or refresh the page.");
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
          if (error.message === "API_LIMIT_PROMPT") return;
          
          const parts = error.message.split('|');
          let title = "Generation Error";
          let description = error.message;

          if (parts.length === 3) {
              // Priority 1: Our custom structured error
              title = `${parts[0].replace('_', ' ')} (${parts[1]})`.replace(/\w\S*/g, (txt: any) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
              description = parts[2];
              console.error(`ERROR CODE: ${parts[0]} | DETAIL: ${parts[1]}`);
          } else {
              // Priority 2: Generic error parsing (e.g. from backend/main.py log_error_to_github)
              if (description.includes("| Title:")) {
                  const bits = description.split("| Title:");
                  title = bits[1].trim();
                  description = `Tech Info: ${bits[0].trim()}`;
              } else {
                  title = "Backend Interaction Failed"; 
              }
          }

          toast({ 
              title: title, 
              description: description, 
              variant: "destructive",
              duration: 6000
          });
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

    if (!text.trim()) {
      toast({ 
          title: "Prompt Required", 
          description: uploadedFiles.length > 0 
            ? "Please provide a Focus Area or instructions in the prompt area. Guidance is mandatory for large files." 
            : "Please paste your content or instructions in the prompt area.", 
          variant: "destructive" 
      });
      return;
    }
    
    // Get the key for the current provider
    const activeKey = apiKeys[currentProvider] || "";

    // Check for Access/Key Requirements
    // Rule: Non-Sponsors must provide their own key for Standard providers (Gemini/Groq).
    if (!isSponsor && !activeKey) {
        setShowApiKeyDialog(true);
        toast({ 
            title: "API Key Required", 
            description: `Free Tier users must provide a ${currentProvider === 'gemini' ? 'Gemini' : 'Groq'} API key. Sponsors get free model access!`,
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
        // If files are present, 'text' acts as custom instructions
        if (uploadedFiles.length > 0) {
            payload.append("custom_instructions", text);
        }
        
        // Add user API key if provided
        if (activeKey) {
            payload.append("api_key", activeKey);
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
  
  const handleApiKeysUpdate = (newKeys: Record<string, string>) => {
      setApiKeys(newKeys);
      toast({
          title: "API Configuration Saved",
          description: "Your keys have been updated. Retrying generation...",
          duration: 3000
      });
      
      // Retry if we were stuck
      if (isGenerating) {
        // Giving state a moment to settle
        setTimeout(() => handleGenerate(), 500);
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
    <div className="min-h-screen flex flex-col transition-colors duration-700 bg-background">
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

          {isSponsor && (
            <div className="max-w-6xl mx-auto w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-foreground rounded-3xl p-6 shadow-[8px_8px_0_0_#000] relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <ShieldCheck className="w-24 h-24 text-foreground" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-pink-500 text-white border-2 border-foreground shadow-[2px_2px_0_0_#000] uppercase font-black text-[10px]">Verified Sponsor</Badge>
                                <Badge className="bg-emerald-500 text-white border-2 border-foreground shadow-[2px_2px_0_0_#000] uppercase font-black text-[10px]">Intelligence Unlocked</Badge>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">You're using <span className="text-pink-600 underline decoration-4 underline-offset-4 decoration-pink-200">High-Capacity System Keys</span></h2>
                            <p className="text-muted-foreground font-medium max-w-2xl">
                                No personal API keys required for any model. We've enabled your zero-config experience for being an early supporter.
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-2 min-w-[180px]">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white/50 border-2 border-foreground rounded-xl shadow-[4px_4px_0_0_#000]">
                                <div className="p-1 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Zero-Config Enabled</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-white/50 border-2 border-foreground rounded-xl shadow-[4px_4px_0_0_#000]">
                                <div className="p-1 bg-pink-500 rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-widest">All Models Free</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}

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

                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                             <Sparkles className="w-4 h-4 text-primary" />
                             {uploadedFiles.length > 0 ? "Focus Area / Instructions" : "Source Content / Prompt"}
                             <Badge className="bg-primary text-primary-foreground text-[10px] ml-2">Mandatory</Badge>
                        </label>
                        {uploadedFiles.some(f => f.size > 2 * 1024 * 1024) && (
                            <Badge variant="destructive" className="animate-pulse shadow-sm">Large File: Guide Required</Badge>
                        )}
                    </div>

                    <div className="relative group flex-1">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={uploadedFiles.length > 0 
                            ? "Example: 'Focus on Chapter 4 definitions', 'Only extract formulas', etc." 
                            : "Paste your content, notes, or specific instructions for the AI here..."
                        }
                        className={`w-full h-[500px] resize-none rounded-xl border-2 p-4 text-sm focus:outline-none transition-all font-mono
                            ${uploadedFiles.length > 0 && !text.trim() ? "border-primary ring-2 ring-primary/10" : "border-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/20"}
                        `}
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                        {text.length} characters
                    </span>
                    </div>

                    {uploadedFiles.length > 0 && !text.trim() && (
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-relaxed">
                                Please tell the AI exactly what part of your {uploadedFiles.length} file(s) to focus on.
                            </p>
                        </div>
                    )}
                </div>
                </div>

                <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl border-2 border-foreground p-6 shadow-[4px_4px_0_0_hsl(var(--foreground))] h-full">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Configuration
                    </h2>
                    
                    {/* Sponsor Thank You Badge */}
                    {isSponsor && showSponsorBanner && (
                        <div className="mb-6 relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-background to-pink-500/10 p-5 shadow-[4px_4px_0_0_hsl(var(--primary)/0.2)] group/banner">
                            <button 
                                onClick={() => setShowSponsorBanner(false)}
                                className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all z-20 opacity-0 group-hover/banner:opacity-100"
                                title="Dismiss"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
                                <Sparkles className="w-24 h-24 text-primary" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex -space-x-1">
                                        <div className="bg-primary p-1.5 rounded-lg shadow-lg">
                                            <Heart className="w-5 h-5 text-white fill-current" />
                                        </div>
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-widest bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
                                        Verified Sponsor
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-foreground mb-1 leading-tight">
                                    Intelligence Unlocked
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium mb-4">
                                    You're using **High-Capacity System Keys**. No personal API keys required for any model.
                                </p>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-bold bg-primary/5 uppercase">Zero-Config Enabled</Badge>
                                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-bold bg-primary/5 uppercase">All Models Free</Badge>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Deck Name</label>
                        <input type="text" value={deckName} onChange={(e) => setDeckName(e.target.value)} className="w-full bg-background border-2 border-foreground/30 rounded-lg px-3 py-2 text-sm font-bold" />
                    </div>

                    <div>
                        <label className="block text-sm font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center justify-between">
                            <span>Intelligence Engine</span>
                            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-foreground/10">
                                {modelTab === "standard" ? "Core" : "High Reasoning"}
                            </Badge>
                        </label>
                        
                        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border-2 border-foreground/5 mb-4">
                            <button 
                                onClick={() => handleModelTabChange("standard")}
                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center gap-2
                                    ${modelTab === 'standard' ? 'bg-primary text-primary-foreground border-foreground shadow-[2px_2px_0_0_#000]' : 'bg-background border-foreground/10 text-muted-foreground hover:border-foreground/20'}
                                `}
                            >
                                <Shield className="w-3 h-3" />
                                Standard
                            </button>
                            <div className="relative flex-1">
                                <button 
                                    onClick={() => handleModelTabChange("high_logic")}
                                    className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center gap-2
                                        ${modelTab === 'high_logic' ? 'bg-pink-500 text-white border-foreground shadow-[2px_2px_0_0_#000]' : 'bg-background border-foreground/10 text-muted-foreground hover:border-foreground/20'}
                                    `}
                                >
                                    <Sparkles className={`w-3 h-3 ${modelTab === 'high_logic' ? 'fill-current text-white' : 'text-primary'}`} />
                                    Frontier Engines
                                </button>
                                {!isSponsor && modelTab === 'high_logic' && (
                                    <div className="absolute -top-2 -right-1 bg-gradient-to-r from-pink-500 to-indigo-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full rotate-12 shadow-sm pointer-events-none uppercase tracking-tighter">
                                        Support ✨
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative min-h-[50px]">
                            <div className="">
                                <div className="space-y-3">
                                    {(modelTab === "high_logic" && !isSponsor && novitaAccessMode === 'sponsors_only') && (
                                        <div className="px-3 py-2 rounded-lg bg-pink-500/5 border border-pink-500/20 mb-3 flex items-center gap-2">
                                            <Heart className="w-3 h-3 text-pink-500 fill-current" />
                                            <p className="text-[9px] text-pink-500 font-black uppercase tracking-tighter">Community Supporters Spotlight</p>
                                        </div>
                                    )}
                                    <div className="relative group">
                                        <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors ${modelTab === 'standard' ? 'text-muted-foreground group-focus-within:text-primary' : 'text-primary'}`}>
                                            {modelTab === 'standard' ? <Shield className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                                        </div>
                                        <select 
                                            value={modelTab === 'standard' 
                                                ? (STANDARD_PROVIDERS.find(m => m.model === aiModel && m.provider === currentProvider)?.id || STANDARD_PROVIDERS[0].id)
                                                : (FRONTIER_MODELS.find(m => m.model === aiModel && m.provider === currentProvider)?.id || "")
                                            } 
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const model = (modelTab === 'standard' ? STANDARD_PROVIDERS : FRONTIER_MODELS).find(m => m.id === val);
                                                if (model) {
                                                    setAiModel(model.model);
                                                    setCurrentProvider(model.provider);
                                                }
                                            }} 
                                            className={`w-full bg-background border-2 rounded-xl pl-10 pr-10 py-3 text-sm font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer
                                                ${modelTab === 'standard' ? 'border-foreground/10 hover:border-foreground/20' : 'border-primary/20 shadow-[0_4px_15px_rgba(var(--primary),0.1)]'}
                                            `}
                                            disabled={isGenerating}
                                        >
                                            {modelTab === 'high_logic' && <option value="" disabled>Select Model</option>}
                                            {modelTab === 'standard' ? (
                                                 STANDARD_PROVIDERS.map(p => (
                                                     <option key={p.id} value={p.id}>{p.name}</option>
                                                 ))
                                             ) : (
                                                 FRONTIER_MODELS.map(m => (
                                                     <option key={m.id} value={m.id} disabled={!isSponsor}>
                                                         {m.name}
                                                     </option>
                                                 ))
                                             )}
                                        </select>
                                        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${modelTab === 'standard' ? 'text-muted-foreground' : 'text-primary/50'}`} />
                                    </div>
                                    
                                    {/* API Key Input Section - Only for standard models and non-sponsors */}
                                    {(!isSponsor && modelTab === 'standard') && (
                                        <div className="mt-4 p-4 rounded-2xl bg-muted/30 border-2 border-foreground/5 shadow-inner">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                    <Key className="w-3 h-3" />
                                                    {currentProvider} API Key
                                                </label>
                                            </div>
                                            <div className="relative group/key">
                                                <input 
                                                    type="password"
                                                    value={apiKeys[currentProvider] || ""}
                                                    onChange={(e) => {
                                                        const newVal = e.target.value.trim();
                                                        const newKeys = { ...apiKeys, [currentProvider]: newVal };
                                                        setApiKeys(newKeys);
                                                        localStorage.setItem("mesh_api_keys", JSON.stringify(newKeys));
                                                    }}
                                                    placeholder={`Paste ${currentProvider} key here...`}
                                                    className="w-full bg-background border-2 border-foreground/10 rounded-xl px-4 py-2 text-xs font-mono focus:border-primary outline-none transition-all pr-10"
                                                />
                                                {apiKeys[currentProvider] ? (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                                        <Check className="w-3 h-3" strokeWidth={3} />
                                                    </div>
                                                ) : (
                                                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                                                        <Lock className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                             <div className="mt-2 flex items-center justify-between gap-2">
                                                 <p className="text-[9px] text-muted-foreground leading-relaxed">
                                                     {currentProvider === 'gemini' ? (
                                                         <>Get yours for <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary hover:underline underline-offset-2 font-bold">free at Google AI Studio</a>.</>
                                                     ) : currentProvider === 'groq' ? (
                                                         <>Get yours from <a href="https://console.groq.com/keys" target="_blank" className="text-primary hover:underline underline-offset-2 font-bold">Groq Console</a>.</>
                                                     ) : (
                                                         <>Choose a provider above to get started.</>
                                                     )}
                                                 </p>
                                                 <button 
                                                    onClick={() => setShowApiKeyDialog(true)}
                                                    className="text-[9px] font-black uppercase tracking-tighter text-primary hover:text-primary/80 transition-colors shrink-0"
                                                 >
                                                     Manage all your keys 
                                                 </button>
                                             </div>
                                        </div>
                                    )}

                                    {modelTab === "standard" ? (
                                        <p className="text-[10px] text-muted-foreground font-medium px-1 italic">
                                            {STANDARD_PROVIDERS.find(p => p.id === currentProvider)?.desc}
                                        </p>
                                    ) : (
                                        <>
                                            {(!isSponsor) ? (
                                                <div className="p-3 rounded-xl border-2 border-dashed border-pink-500/20 bg-pink-500/5 text-center mt-2">
                                                     <p className="text-[10px] text-muted-foreground mb-2 font-medium">
                                                         MeshCards is free and open for everyone. These extra engines are enabled by the love of our community supporters.
                                                     </p>
                                                     <Button 
                                                         variant="ghost" 
                                                         size="sm" 
                                                         className="h-7 text-[10px] font-black uppercase tracking-widest text-pink-600 hover:bg-pink-500/5 hover:text-pink-500 transition-all"
                                                         onClick={() => {
                                                             const sponsorBtn = document.querySelector('[data-sponsor-trigger]') as HTMLElement;
                                                             if (sponsorBtn) sponsorBtn.click();
                                                             else window.open('https://buymeacoffee.com/htclodkzgo', '_blank');
                                                         }}
                                                     >
                                                         <Sparkles className="w-3 h-3 mr-1" />
                                                         Support 
                                                     </Button>
                                                 </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-2 py-1 bg-primary/5 border border-primary/10 rounded-full w-fit">
                                                    <ShieldCheck className="w-3 h-3 text-primary fill-current" />
                                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">Intelligence Unlocked</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Card Style</label>
                        <div className="relative">
                        <select value={cardStyle} onChange={(e) => setCardStyle(e.target.value)} className="w-full appearance-none bg-background border-2 border-foreground/30 rounded-lg px-3 py-2 text-sm cursor-pointer">
                            <option value="qa">Basic Q&A (Standard)</option>
                            <option value="cloze">Fill Gaps (Cloze Deletion)</option>
                            <option value="definition">Key Concepts / Definitions</option>
                            <option value="true_false">True / False Facts</option>
                            <option value="multiple_choice">Exam Prep (MCQs)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Voice & Tone</label>
                        <div className="relative">
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full appearance-none bg-background border-2 border-foreground/30 rounded-lg px-3 py-2 text-sm cursor-pointer">
                            <option value="balanced">Balanced (Recommended)</option>
                            <option value="simple">Simplified (Beginner)</option>
                            <option value="detailed">Academic Depth (Pro)</option>
                            <option value="creative">Creative / Conceptual</option>
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
                            onClick={() => isSponsor && setShowApiKeyDialog(true)}
                            className={`text-center text-sm font-medium mb-2 transition-opacity ${isSponsor ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        >
                             {isSponsor ? (
                                  <div className="space-y-1">
                                    <span className="text-primary flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        {`Daily Quota: ${Math.max(0, 5 - dailyCount)} / 5 decks left`}
                                    </span>
                                </div>
                            ) : (
                                <span className={`${dailyCount >= (isSponsor ? 5 : 2) ? "text-red-500 font-black" : "text-primary"}`}>
                                     {dailyCount >= (isSponsor ? 5 : 2) 
                                         ? "⚠️ Daily Limit Reached" 
                                         : `Daily Limit: ${Math.max(0, (isSponsor ? 5 : 2) - dailyCount)} / ${isSponsor ? 5 : 2} decks left`}
                                </span>
                            )}
                        </div>
                    )}
                    
                    <Button 
                        onClick={handleGenerate} 
                        disabled={isGenerating || !text.trim() || (modelTab === 'high_logic' && (!isSponsor || !aiModel))} 
                        className={`w-full py-6 rounded-xl font-bold transition-all shadow-[4px_4px_0_0_#000] border-2 border-foreground hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none
                            ${isGenerating ? "opacity-90 cursor-wait" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                        `}
                    >
                        {isGenerating ? (
                            <><RefreshCw className="mr-2 animate-spin h-5 w-5" /> Processing...</>
                        ) : (
                            "Generate Flashcards"
                        )}
                    </Button>
                    
                    {false && (
                        <p className="text-[10px] text-center mt-3 text-muted-foreground italic">
                            {isSponsor 
                                ? "Daily sponsor limit reached. Upgrade to absolute unlimited by contacting us!" 
                                : "Daily limit reached. Sponsor the project to continue!"}
                        </p>
                    )}

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
        onClose={() => setShowApiKeyDialog(false)}
        onKeysUpdate={handleApiKeysUpdate}
        defaultProvider={currentProvider}
        isByokRequired={
            !isSponsor // Free users always need a key now
        }
      />
    </div>
  );
};

export default Studio;
