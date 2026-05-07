import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-12 w-12 text-slate-400" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">You're Offline</h1>
        <p className="text-slate-500 mb-8">
          It looks like you've lost your internet connection. Please check your connection and try again.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full h-12 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <Link href="/(student)/dashboard">
            <Button variant="outline" className="w-full h-12 gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Quran Academy requires an internet connection for live classes and audio playback.
        </p>
      </div>
    </div>
  );
}
