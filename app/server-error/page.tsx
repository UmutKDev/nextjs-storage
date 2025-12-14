import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ServerErrorPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Service Unavailable
        </h1>
        <p className="text-muted-foreground">
          We are currently experiencing technical difficulties. Please try again
          later.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/">Go Home</Link>
        </Button>
        <Button asChild>
          <Link href="/server-error">Try Again</Link>
        </Button>
      </div>
    </div>
  );
}
