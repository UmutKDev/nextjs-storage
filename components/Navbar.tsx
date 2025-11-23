"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const isLoggedIn = status === "authenticated" && !!session?.user;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between p-2 px-6 rounded-full border border-border/40 bg-background/80 backdrop-blur-md shadow-sm w-[90%] max-w-3xl">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          MyApp
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground hover:bg-accent px-4 py-2 rounded-full"
          >
            Anasayfa
          </Link>
          <Link
            href="/depo"
            className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground hover:bg-accent px-4 py-2 rounded-full"
          >
            Depo
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {status === "loading" ? (
          // Show a small disabled spinner while session is loading
          <Button
            variant="ghost"
            className="h-8 w-8 rounded-full"
            disabled
            aria-busy
          >
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
            <span className="sr-only">Loading session</span>
          </Button>
        ) : isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session?.user?.image ?? "/avatars/01.png"}
                    alt={session?.user?.name ?? "@user"}
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name ?? "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email ?? ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await signOut({ callbackUrl: "/" });
                  // ensure a client-side navigation update in case signOut doesn't redirect immediately
                  router.push("/");
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/authentication">
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
