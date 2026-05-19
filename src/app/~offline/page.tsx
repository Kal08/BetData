import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <WifiOff className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">You&apos;re offline</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        BetData needs a connection for sign-in and saving entries. Cached pages
        may still be available when you reconnect.
      </p>
      <Button asChild>
        <Link href="/">Try again</Link>
      </Button>
    </div>
  );
}
