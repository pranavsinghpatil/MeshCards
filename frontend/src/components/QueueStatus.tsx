import { Info, Clock, Users, Zap, Heart, Coffee } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QueueStatusProps {
  position: number;
  queueLength: number;
  estimatedWaitSeconds: number;
}

export default function QueueStatus({ position, queueLength, estimatedWaitSeconds }: QueueStatusProps) {
  const minutes = Math.floor(estimatedWaitSeconds / 60);
  const seconds = estimatedWaitSeconds % 60;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Main Queue Status */}
      <Alert className="border-2 border-primary bg-primary/5">
        <Clock className="h-5 w-5 text-primary" />
        <AlertTitle className="text-lg font-bold">Your Request is in Queue</AlertTitle>
        <AlertDescription className="space-y-2">
          <div className="flex items-center justify-between mt-2">
            <span className="text-base font-semibold">Position in Queue:</span>
            <span className="text-2xl font-bold text-primary">{position} of {queueLength}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">Estimated Wait:</span>
            <span className="text-xl font-bold">
              {minutes > 0 && `${minutes}m `}{seconds}s
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500 animate-pulse"
                style={{ width: `${((queueLength - position + 1) / queueLength) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Processing {queueLength - position} of {queueLength} requests
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Why Queue? Explanation */}
      <Alert className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="font-bold text-blue-900 dark:text-blue-100">
          Why am I waiting?
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200 space-y-2">
          <p className="text-sm">
            MeshCards is <strong>100% FREE</strong> and runs on limited API resources to keep it accessible to everyone.
          </p>
          <div className="grid gap-2 mt-2">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                <strong>Multiple users:</strong> When many students generate decks simultaneously, we queue requests to prevent API limits.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                <strong>API limits:</strong> Free AI APIs have rate limits. We process one request at a time to ensure everyone succeeds.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                <strong>Fair system:</strong> First-come, first-served ensures everyone gets their turn, no matter how busy we are.
              </span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Keep Tab Open */}
      <Alert className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
        <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          <p className="text-sm font-semibold">
             Please keep this tab open while waiting. Your position updates automatically!
          </p>
        </AlertDescription>
      </Alert>

      {/* Support Message */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-800 p-4">
        <div className="flex items-start gap-3">
          <Coffee className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
              Love MeshCards? Help us grow! 💜
            </p>
            <p className="text-xs text-purple-800 dark:text-purple-200 mb-2">
              Your support helps us upgrade to faster servers and higher API limits, reducing wait times for everyone.
            </p>
            <a
              href="https://www.buymeacoffee.com/htclodkzgo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Coffee className="w-3 h-3" />
              Support MeshCards
            </a>
          </div>
        </div>
      </div>

      {/* Live Updates */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Live updates • Refreshing every 2 seconds</span>
      </div>
    </div>
  );
}
