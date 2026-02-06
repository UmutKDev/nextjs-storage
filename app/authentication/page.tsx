"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { Login } from "@/components/Authentication/Login";
import { Cloud, Loader2 } from "lucide-react";

function LoginFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
    </div>
  );
}

export default function LoginForm() {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* ========== LEFT PANEL ========== */}
      <div className="relative hidden h-full flex-col bg-zinc-950 p-10 text-white lg:flex overflow-hidden">
        {/* Layer 1: Radial gradient mesh */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.15), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255, 119, 198, 0.12), transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(78, 154, 241, 0.1), transparent 50%)",
          }}
        />

        {/* Layer 2: Slow-spinning conic gradient */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(120, 119, 198, 0.3) 60deg, transparent 120deg, rgba(78, 154, 241, 0.2) 180deg, transparent 240deg, rgba(255, 119, 198, 0.15) 300deg, transparent 360deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Layer 3: Dot pattern overlay */}
        <div
          className="absolute inset-0 z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Floating decorative shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-2/3 left-1/2 h-56 w-56 rounded-full bg-pink-500/8 blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />

        {/* Logo */}
        <motion.div
          className="relative z-20 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <Cloud className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            CloudStorage
          </span>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          className="relative z-20 mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <div className="mb-4 text-4xl font-serif text-white/20">
            &ldquo;
          </div>
          <blockquote className="space-y-4">
            <p className="text-lg font-light leading-relaxed text-white/90">
              Bu platform sayesinde tüm dosyalarım güvende ve her an elimin
              altında. İş akışımı inanılmaz hızlandırdı.
            </p>
            <footer className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-sm font-semibold">
                SD
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  Sofia Davis
                </div>
                <div className="text-xs text-white/50">Product Manager</div>
              </div>
            </footer>
          </blockquote>
        </motion.div>
      </div>

      {/* ========== RIGHT PANEL ========== */}
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
        {/* Mobile gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 lg:hidden" />

        {/* Mobile floating shapes */}
        <motion.div
          className="absolute top-1/4 -left-20 h-40 w-40 rounded-full bg-violet-500/8 blur-3xl lg:hidden"
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 h-32 w-32 rounded-full bg-blue-500/8 blur-3xl lg:hidden"
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Mobile branding header */}
        <div className="absolute top-0 left-0 right-0 p-6 lg:hidden z-20">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/5">
              <Cloud className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">
              CloudStorage
            </span>
          </motion.div>
        </div>

        {/* Glassmorphism card */}
        <motion.div
          className="relative z-10 w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        >
          {/* Inner glow overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent" />

          <div className="relative flex flex-col space-y-6">
            {/* Title */}
            <motion.div
              className="flex flex-col space-y-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Hesabınıza Giriş Yapın
              </h1>
              <p className="text-sm text-zinc-400">
                Devam etmek için e-posta adresinizi ve şifrenizi girin
              </p>
            </motion.div>

            <Suspense fallback={<LoginFallback />}>
              <Login />
            </Suspense>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
