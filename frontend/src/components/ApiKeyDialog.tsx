import { useState } from "react";
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
import { ExternalLink, Key, AlertCircle } from "lucide-react";

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  provider: string;
}

export function ApiKeyDialog({ open, onClose, onSubmit, provider }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = () => {
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
      setApiKey("");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            API Limit Reached
          </DialogTitle>
          <DialogDescription>
            Our free {provider} API quota is temporarily exhausted. You can continue by providing your own API key.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold">{instructions.title}</Label>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              {instructions.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => window.open(instructions.link, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open {provider} Dashboard
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Your {provider} API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder={`sk-...${provider === "gemini" ? "AIzaSy..." : ""}`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Your API key is only used for this generation and never stored.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!apiKey.trim()}>
            Continue with My Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
