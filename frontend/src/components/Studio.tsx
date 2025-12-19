import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, X, Download, RefreshCw, ChevronDown, Copy, Check, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getSupabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";
import Header from "./Header";
import SimpleFooter from "./SimpleFooter";

interface GeneratedCard {
  id: string;
  front: string;
  back: string;
}

const Studio = () => {
  const { session } = useAuth();
  const [text, setText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [cardCount, setCardCount] = useState(25);
  const [aiModel, setAiModel] = useState("gemini-2.5-flash"); 
  const [cardStyle, setCardStyle] = useState("qa");
  const [difficulty, setDifficulty] = useState("balanced");
  const [deckName, setDeckName] = useState("MeshCards");
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState<number | null>(null);
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
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [".pdf", ".txt", ".docx"];
      const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
      if (!validTypes.includes(fileExt)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, TXT, or DOCX file.",
          variant: "destructive",
        });
        return;
      }
      setUploadedFile(file);
      toast({ title: "File uploaded", description: `${file.name} ready.` });
    }
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
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      toast({ title: "File uploaded", description: `${file.name} ready.` });
    }
  }, []);

  const pollJob = async (jobId: string) => {
      const maxRetries = 60;
      let attempts = 0;

      while (attempts < maxRetries) {
          await new Promise(r => setTimeout(r, 2000));
          const res = await fetch(getApiUrl(`/status/${jobId}`));
          if (!res.ok) throw new Error("Status check failed");

          const data = await res.json();
          if (data.status === 'completed') return true;
          if (data.status === 'failed') throw new Error(data.error || "Generation failed");
          attempts++;
      }
      throw new Error("Timeout waiting for generation");
  };

  const handleGenerate = async () => {
    if (!session) {
        toast({
            title: "Sign In Required",
            description: "Please sign in to generate flashcards.",
            variant: "destructive",
        });
        return;
    }

    if (!text && !uploadedFile) {
      toast({
        title: "No content",
        description: "Please paste text or upload a file first.",
        variant: "destructive",
        
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedCards([]);
    
    try {
        const payload = new FormData();
        if (uploadedFile) {
            payload.append("file", uploadedFile);
        } else {
            payload.append("text", text);
        }

        // Map AI Model to provider/model
        // Trust the user's selection since they provided a specific list of available models.
        let provider = "gemini";
        let model = aiModel; // Pass the selected model/version directly to backend

        payload.append("provider", provider);
        payload.append("model", model);
        payload.append("max_cards", cardCount.toString());
        payload.append("difficulty", difficulty);
        payload.append("style", cardStyle);
        payload.append("difficulty", difficulty);
        payload.append("style", cardStyle);
        // payload.append("custom_instructions", focusArea); // Removed as per user request (included in prompt)
        payload.append("deck_name", deckName || (uploadedFile ? uploadedFile.name.split('.')[0] : "Generated Deck"));

        const res = await fetch(getApiUrl('/generate'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            },
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
        toast({ title: "Processing", description: "AI is generating your cards..." });

        await pollJob(job_id);

        toast({ title: "Success!", description: "Deck generated successfully. Downloading..." });

        const downloadLink = document.createElement('a');
        downloadLink.href = getApiUrl(`/download/${job_id}`);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
         setGeneratedCards([{
            id: 'success',
            front: 'Deck Generated Successfully!',
            back: 'Check your downloads folder for the .apkg file. Import it into Anki to study.'
        }]);


    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Something went wrong",
            variant: "destructive"
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleExport = () => {
      toast({ title: "Check Downloads", description: "File was downloaded automatically." });
  };

  const copyCard = (card: GeneratedCard) => {
    navigator.clipboard.writeText(`Q: ${card.front}\nA: ${card.back}`);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearAll = () => {
    setText("");
    setUploadedFile(null);
    setGeneratedCards([]);
  };

  const hasContent = text.length > 0 || uploadedFile !== null;

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
          </div>

          <div className="grid lg:grid-cols-5 gap-6 max-w-6xl mx-auto mb-10">
            
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
                    ${uploadedFile ? "border-primary bg-primary/5" : ""}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !uploadedFile && fileInputRef.current?.click()}
                >
                  {uploadedFile ? (
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 border-2 border-foreground flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                        className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-14 h-14 rounded-xl bg-muted border-2 border-foreground/30 flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="font-semibold text-sm mb-1">Drop your file here</p>
                      <p className="text-xs text-muted-foreground">or click to browse • PDF, TXT, DOCX</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt,.docx"
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs font-medium text-muted-foreground px-2">Prompt Text or Comment</span>
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

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Deck Name</label>
                    <input
                      type="text"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      placeholder="e.g. Biology Ch 1"
                      className="w-full bg-background border-2 border-foreground/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">AI Model</label>
                    <div className="relative">
                      <select
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                        className="w-full appearance-none bg-background border-2 border-foreground/30 rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer focus:outline-none focus:border-primary"
                      >
                        <option value="gemini-3-pro">Gemini 3 Pro (Most Advanced)</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Balanced)</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                        <option value="gpt-4.1">GPT-4.1 (OpenAI)</option>
                        <option value="claude-opus-4.5">Claude Opus 4.5 (Anthropic)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Card Style</label>
                    <div className="relative">
                      <select
                        value={cardStyle}
                        onChange={(e) => setCardStyle(e.target.value)}
                        className="w-full appearance-none bg-background border-2 border-foreground/30 rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer focus:outline-none focus:border-primary"
                      >
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
                    <label className="block text-sm font-medium mb-2">Voice & Tone</label>
                    <div className="relative">
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full appearance-none bg-background border-2 border-foreground/30 rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer focus:outline-none focus:border-primary"
                      >
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
                    <label className="block text-sm font-medium mb-2">
                      Number of Cards: <span className="text-primary font-bold">{cardCount}</span>
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="150"
                      value={cardCount}
                      onChange={(e) => setCardCount(Number(e.target.value))}
                      className="w-full accent-primary h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>15</span>
                      <span>150</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border space-y-3">
                  {dailyCount !== null && (
                      <div className="text-center text-sm font-medium mb-2">
                          <span className={`${dailyCount >= 2 ? "text-red-500" : "text-primary"}`}>
                              Daily Limit: {Math.max(0, 2 - dailyCount)} / 2 remaining
                          </span>
                      </div>
                  )}
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !hasContent || (dailyCount !== null && dailyCount >= 2)}
                    className="w-full bg-foreground text-background hover:bg-foreground/90 hover:text-background py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Cards
                      </>
                    )}
                  </Button>
                  
                  {hasContent && (
                    <Button
                      onClick={clearAll}
                      variant="outline"
                      className="w-full border-2 border-foreground/30 rounded-xl"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {generatedCards.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-card rounded-2xl border-2 border-foreground p-6 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Generated Cards ({generatedCards.length})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const all = generatedCards.map(c => `Q: ${c.front}\nA: ${c.back}`).join("\n\n");
                        navigator.clipboard.writeText(all);
                        toast({ title: "Copied all cards!" });
                      }}
                      className="text-sm font-medium px-4 py-2 rounded-lg border-2 border-foreground/30 hover:bg-muted transition-colors"
                    >
                      Copy All
                    </button>
                    <button
                      onClick={handleExport}
                      className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export .apkg
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {generatedCards.map((card, i) => (
                    <div
                      key={card.id}
                      className="bg-background border-2 border-foreground/20 rounded-xl p-4 hover:border-foreground/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {card.id !== 'success' && <div className="text-xs font-bold text-primary mb-2">Card {i + 1}</div>}
                          <p className="text-sm font-medium mb-2">{card.front}</p>
                          <p className="text-sm text-muted-foreground">{card.back}</p>
                        </div>
                        {card.id !== 'success' && (
                        <button
                          onClick={() => copyCard(card)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
                        >
                          {copiedId === card.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                        )}
                      </div>
                    </div>
                  ))}
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
