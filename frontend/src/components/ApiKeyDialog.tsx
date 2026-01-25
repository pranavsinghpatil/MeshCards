import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Key, AlertCircle, ShieldCheck, Check, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
  onKeysUpdate: (keys: Record<string, string>) => void;
  defaultProvider?: string;
  isByokRequired?: boolean;
}

const PROVIDERS = [
    { 
        id: "gemini", 
        name: "Google Gemini", 
        desc: "Powers Gemini Pro & Flash models", 
        link: "https://aistudio.google.com/app/apikey",
        prefix: "AIza"
    },
    { 
        id: "novita", 
        name: "Novita AI", 
        desc: "Powers Llama 3.3, Qwen 2.5, & Mistral", 
        link: "https://novita.ai",
        prefix: "" 
    },
    { 
        id: "openai", 
        name: "OpenAI", 
        desc: "Powers GPT-4o models", 
        link: "https://platform.openai.com/api-keys",
        prefix: "sk-" 
    },
    { 
        id: "anthropic", 
        name: "Anthropic", 
        desc: "Powers Claude 3.5 Sonnet", 
        link: "https://console.anthropic.com/settings/keys",
        prefix: "sk-ant" 
    }
];

export function ApiKeyDialog({ open, onClose, onKeysUpdate, defaultProvider = "gemini", isByokRequired }: ApiKeyDialogProps) {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>(defaultProvider);

  useEffect(() => {
    if (open) {
      // Load all keys
      try {
          const stored = localStorage.getItem("mesh_api_keys");
          if (stored) {
              setKeys(JSON.parse(stored));
          }
      } catch (e) {
          console.error("Failed to parse api keys", e);
      }
      setActiveTab(defaultProvider);
    }
  }, [open, defaultProvider]);

  const handleSave = () => {
    localStorage.setItem("mesh_api_keys", JSON.stringify(keys));
    onKeysUpdate(keys);
    onClose();
  };

  const updateKey = (provider: string, value: string) => {
      setKeys(prev => ({ ...prev, [provider]: value.trim() }));
  };

  const currentProviderInfo = PROVIDERS.find(p => p.id === activeTab) || PROVIDERS[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-2 border-primary/20 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Key className="w-5 h-5 text-primary" />
            API Key Management
          </DialogTitle>
          <DialogDescription className="text-base">
            Configure your own API keys to bypass rate limits and access premium models without restrictions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden gap-6 py-4">
            {/* Sidebar */}
            <div className="w-1/3 flex flex-col gap-1 border-r pr-4">
                {PROVIDERS.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setActiveTab(p.id)}
                        className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${
                            activeTab === p.id 
                                ? "bg-primary/10 text-primary font-bold" 
                                : "hover:bg-muted text-foreground/70"
                        }`}
                    >
                        {p.name}
                        {keys[p.id] && <Check className="w-3 h-3 text-green-500" />}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                <div className="space-y-4">
                    <div className="bg-muted/40 p-4 rounded-xl border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-base font-bold">{currentProviderInfo.name}</Label>
                            {keys[activeTab] ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Configured</Badge>
                            ) : (
                                <Badge variant="outline" className="text-muted-foreground">Not Set</Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                            {currentProviderInfo.desc}
                        </p>
                        
                        <div className="space-y-3">
                             <div className="relative">
                                <Input
                                    type="password"
                                    placeholder={`Paste ${currentProviderInfo.name} API Key`}
                                    value={keys[activeTab] || ""}
                                    onChange={(e) => updateKey(activeTab, e.target.value)}
                                    className="font-mono text-sm pr-10"
                                />
                                {keys[activeTab] && (
                                    <div className="absolute right-3 top-2.5 text-green-500">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                             </div>
                             
                             <div className="flex justify-between items-center">
                                <a 
                                    href={currentProviderInfo.link} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs flex items-center gap-1 text-primary hover:underline font-medium"
                                >
                                    Get Key <ExternalLink className="w-3 h-3" />
                                </a>
                                {keys[activeTab] && (
                                    <button 
                                        onClick={() => updateKey(activeTab, "")}
                                        className="text-xs text-red-500 hover:underline"
                                    >
                                        Clear Key
                                    </button>
                                )}
                             </div>
                        </div>
                    </div>

                    <div className="flex gap-2 items-start p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">
                            Keys are stored <strong>locally in your browser</strong>. They are sent to our server only when you generate content and are never saved in our database.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={onClose} className="font-bold">
              Cancel
          </Button>
          <Button onClick={handleSave} className="font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] border-2 border-foreground hover:translate-y-[1px] hover:shadow-none transition-all">
              Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
