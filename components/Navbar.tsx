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
import { Cloud, LogOut, Settings, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = status === "authenticated" && !!session?.user;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on authentication pages
  if (pathname?.startsWith("/authentication")) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav
        className={cn(
          "relative flex items-center justify-between w-full max-w-5xl rounded-full border px-4 py-2 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-md shadow-lg border-border"
            : "bg-transparent border-transparent"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 pl-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
            <Cloud className="w-4 h-4" />
          </div>
          <span
            className={cn(
              "font-bold text-lg tracking-tight",
              !isScrolled && "text-foreground"
            )}
          >
            CloudStorage
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <Link href="/">
            <Button
              variant="ghost"
              className="rounded-full h-9 px-4 text-sm font-medium"
            >
              Anasayfa
            </Button>
          </Link>
          <Link href="#features">
            <Button
              variant="ghost"
              className="rounded-full h-9 px-4 text-sm font-medium"
            >
              Özellikler
            </Button>
          </Link>
          <Link href="#pricing">
            <Button
              variant="ghost"
              className="rounded-full h-9 px-4 text-sm font-medium"
            >
              Fiyatlandırma
            </Button>
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 pr-1">
          {isLoggedIn ? (
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
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Ayarlar</span>
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
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-4 right-4 p-4 bg-background/95 backdrop-blur-lg border rounded-3xl shadow-2xl flex flex-col gap-2 md:hidden animate-in fade-in slide-in-from-top-5">
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
    </div>
  );
}
