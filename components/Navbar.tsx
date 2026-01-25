"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Cloud, LogOut, Settings, User, Menu, X, Loader2 } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = status === "authenticated" && !!session?.user;

  // Hide navbar on authentication pages
  if (pathname?.startsWith("/authentication")) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Cloud className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            CloudStorage
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Anasayfa
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Özellikler
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Fiyatlandırma
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="flex items-center gap-2">
              <Button
                disabled
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/70" />
              </Button>
              <div className="hidden sm:block h-9 w-9 rounded-full bg-muted/30 animate-pulse border" />
            </div>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link href="/storage" className="hidden sm:block">
                <Button size="sm" className="rounded-full px-4">
                  Depoya Git
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0 overflow-hidden border"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt={session?.user?.name || ""}
                      />
                      <AvatarFallback>
                        {session?.user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account"
                      className="flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account#security"
                      className="flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ayarlar</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/authentication" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/authentication">
                <Button size="sm" className="rounded-full px-5">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 border-t bg-background/95 backdrop-blur-lg p-4 shadow-lg md:hidden animate-in fade-in slide-in-from-top-2">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start rounded-xl">
              Anasayfa
            </Button>
          </Link>
          <Link href="#features" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start rounded-xl">
              Özellikler
            </Button>
          </Link>
          <Link href="/storage" onClick={() => setMobileMenuOpen(false)}>
            <Button
              variant="secondary"
              className="w-full justify-start rounded-xl"
            >
              Depoya Git
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
