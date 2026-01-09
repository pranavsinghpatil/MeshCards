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
import { ExternalLink, Key, AlertCircle, ShieldCheck } from "lucide-react";

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  provider: string;
  isByokRequired?: boolean;
}

export function ApiKeyDialog({ open, onClose, onSubmit, provider, isByokRequired }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("mesh_user_api_key") || "");

  useEffect(() => {
    if (open) {
      setApiKey(localStorage.getItem("mesh_user_api_key") || "");
    }
  }, [open]);

  const handleSubmit = () => {
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  const getInstructions = () => {
    switch (provider.toLowerCase()) {
      case "gemini":
        return {
          title: "Get your free Gemini API key",
          steps: [
            "Visit Google AI Studio",
            "Sign in with your Google account",
            "Click 'Get API Key' and create a new key",
            "Copy and paste it below"
          ],
          link: "https://aistudio.google.com/app/apikey"
        };
      case "openai":
        return {
          title: "Get your OpenAI API key",
          steps: [
            "Visit OpenAI Platform",
            "Sign in or create an account",
            "Navigate to API Keys section",
            "Create a new secret key and copy it"
          ],
          link: "https://platform.openai.com/api-keys"
        };
      default:
        return {
          title: "Get your API key",
          steps: ["Visit the provider's website", "Create an API key"],
          link: "#"
        };
    }
  };

  const instructions = getInstructions();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            {isByokRequired ? (
               <>
                 <ShieldCheck className="w-5 h-5 text-primary" />
                 API Key Required
               </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-orange-500" />
                API Limit Reached
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isByokRequired 
              ? `This service is currently in BYOK (Bring Your Own Key) mode for ${provider}.`
              : `Our free ${provider} API quota is temporarily exhausted due to high demand.`}
            {" "}Please provide your own API key to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border">
            <Label className="text-sm font-black uppercase tracking-wider text-muted-foreground">{instructions.title}</Label>
            <ol className="text-sm text-foreground/80 space-y-2 list-decimal list-inside font-medium">
              {instructions.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 font-bold border-primary/30 hover:bg-primary/10 text-primary"
              onClick={() => window.open(instructions.link, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open {provider} Dashboard
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center gap-2 font-bold">
              <Key className="w-4 h-4 text-primary" />
              Your {provider} API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder={`PASTE KEY HERE (starts with ${provider === "gemini" ? "AIzaSy..." : "sk-..."})`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="font-mono text-sm border-2 border-foreground/20 focus:border-primary"
            />
            <p className="text-[10px] text-muted-foreground leading-tight">
              Your API key is saved locally in your browser. It is sent directly to the server for processing and is NEVER stored in our database.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
          <div className="flex-1 flex justify-start">
            {localStorage.getItem("mesh_user_api_key") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  localStorage.removeItem("mesh_user_api_key");
                  onSubmit(""); // Use empty key to signal clearing
                  onClose();
                }} 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold px-2"
              >
                Clear Stored Key
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} className="font-bold">
                Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!apiKey.trim()} className="font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] border-2 border-foreground hover:translate-y-[1px] hover:shadow-none transition-all">
                Continue with My Key
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
