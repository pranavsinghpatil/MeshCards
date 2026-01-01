import { AlertTriangle, RefreshCw, Coffee, Info, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorExplanationProps {
  error: string;
  onRetry?: () => void;
}

export default function ErrorExplanation({ error, onRetry }: ErrorExplanationProps) {
  const isRateLimitError = error.toLowerCase().includes('rate limit') || 
                          error.toLowerCase().includes('quota') || 
                          error.toLowerCase().includes('429');
  
  const isQuotaError = error.toLowerCase().includes('daily quota') || 
                       error.toLowerCase().includes('2/2 decks');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Main Error Alert */}
      <Alert className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        <AlertTitle className="font-bold text-red-900 dark:text-red-100">
          Generation Failed
        </AlertTitle>
        <AlertDescription className="text-red-800 dark:text-red-200">
          <p className="text-sm mt-1">{error}</p>
        </AlertDescription>
      </Alert>

      {/* Rate Limit Explanation */}
      {isRateLimitError && (
        <Alert className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="font-bold text-blue-900 dark:text-blue-100">
            What does this mean?
          </AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200 space-y-3">
            <p className="text-sm">
              <strong>API Rate Limit Reached</strong> - This happens when too many requests are made to the AI service in a short time.
            </p>
            
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 space-y-2">
              <p className="text-sm font-semibold">Why this happens:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>MeshCards uses <strong>free AI APIs</strong> with usage limits</li>
                <li>Multiple users generating decks simultaneously</li>
                <li>Large documents requiring many API tokens</li>
                <li>Temporary high traffic on the service</li>
              </ul>
            </div>

            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 space-y-2">
              <p className="text-sm font-semibold">What you can do:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li><strong>Wait 1-2 minutes</strong> and try again</li>
                <li>The system automatically retries, so it may succeed on next attempt</li>
                <li>Try during off-peak hours (early morning/late night)</li>
                <li>Reduce document size if possible</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Daily Quota Explanation */}
      {isQuotaError && (
        <Alert className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
          <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <AlertTitle className="font-bold text-purple-900 dark:text-purple-100">
            Daily Limit Reached
          </AlertTitle>
          <AlertDescription className="text-purple-800 dark:text-purple-200 space-y-3">
            <p className="text-sm">
              You've used your <strong>2 free decks for today</strong>. This limit helps us keep MeshCards free for everyone!
            </p>
            
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 space-y-2">
              <p className="text-sm font-semibold">Why we have limits:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>AI APIs cost money per request</li>
                <li>Limits ensure fair access for all students</li>
                <li>Prevents abuse and keeps the service sustainable</li>
                <li>Your quota resets daily at <strong>12:00 AM IST</strong></li>
              </ul>
            </div>

            <p className="text-sm">
              ⏰ Come back tomorrow for 2 more free decks, or support us to get higher limits!
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Why Free Service Has Limits */}
      <Alert className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
        <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="font-bold text-yellow-900 dark:text-yellow-100">
          Why does a free service have limits?
        </AlertTitle>
        <AlertDescription className="text-yellow-800 dark:text-yellow-200 space-y-2">
          <p className="text-sm">
            MeshCards is <strong>completely free</strong> because we believe education should be accessible to everyone. However:
          </p>
          <ul className="text-sm space-y-1 ml-4 list-disc">
            <li><strong>AI APIs aren't free</strong> - Each generation costs us money</li>
            <li><strong>Server hosting costs</strong> - We pay for reliable uptime</li>
            <li><strong>Rate limits exist</strong> - AI providers limit free tier usage</li>
            <li><strong>Fair distribution</strong> - Limits ensure everyone gets access</li>
          </ul>
          <p className="text-sm mt-2">
            We're a <strong>student project</strong> running on minimal resources to help fellow students. 
            Your understanding and support mean everything! 💙
          </p>
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="flex-1 border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        
        <a
          href="https://www.buymeacoffee.com/htclodkzgo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button
            variant="outline"
            className="w-full border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
          >
            <Coffee className="w-4 h-4 mr-2" />
            Support MeshCards
          </Button>
        </a>
      </div>

      {/* Help Links */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Need help?</p>
        <div className="flex flex-col gap-2">
          <a
            href="/guide"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Read the Guide
          </a>
          <a
            href="/feedback"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Report an Issue
          </a>
          <a
            href="mailto:talktopranav@cc.cc"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
