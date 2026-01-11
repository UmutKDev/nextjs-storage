import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import Link from "next/link";
import {
  ArrowRight,
  Cloud,
  Lock,
  Smartphone,
  Zap,
  HardDrive,
  FileText,
  Folder,
  Search,
  Grid,
  List,
  MoreHorizontal,
  LayoutGrid,
} from "lucide-react";

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background selection:bg-primary/10">
      {/* Background Grid */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-8 z-10 relative">
            <div className="inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-md shadow-sm ring-1 ring-ring/10">
              <span className="mr-2 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Yeni Nesil Bulut Deneyimi
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground max-w-5xl">
              Dosyalarınız için <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
                akıllı depolama.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed md:text-2xl">
              Güvenli, hızlı ve her yerden erişilebilir. CloudStorage ile
              dijital dünyanızı düzenleyin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {session ? (
                <Link href="/storage">
                  <Button
                    size="lg"
                    className="h-12 px-8 rounded-full text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  >
                    Depoya Git <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/authentication">
                    <Button
                      size="lg"
                      className="h-12 px-8 rounded-full text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                    >
                      Hemen Başla
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Abstract Hero Visual - App Screenshot Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-2xl blur-2xl opacity-50" />

            <div className="relative aspect-video rounded-xl border bg-background/80 backdrop-blur-sm overflow-hidden shadow-2xl ring-1 ring-white/10">
              {/* Window Controls */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-muted/50 border-b flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 flex-1 flex justify-center">
                  <div className="h-5 w-64 bg-background/50 rounded-md border text-[10px] text-muted-foreground flex items-center justify-center">
                    cloudstorage.com/drive
                  </div>
                </div>
              </div>

              {/* App Interface */}
              <div className="absolute top-10 left-0 right-0 bottom-0 flex">
                {/* Sidebar */}
                <div className="w-48 border-r bg-muted/10 p-3 hidden sm:flex flex-col gap-1">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mb-2">
                    Drive
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium">
                    <HardDrive className="w-4 h-4" />
                    Dosyalarım
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground text-sm hover:bg-muted/50">
                    <Cloud className="w-4 h-4" />
                    Paylaşılanlar
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground text-sm hover:bg-muted/50">
                    <Smartphone className="w-4 h-4" />
                    Yedeklemeler
                  </div>
                  <div className="mt-auto">
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[70%] bg-primary" />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>70GB</span>
                      <span>100GB</span>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 flex flex-col gap-4">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Dosyalarım</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Files Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Folder Item */}
                    <div className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-default group">
                      <div className="flex justify-between items-start mb-2">
                        <Folder className="w-8 h-8 text-blue-500 fill-blue-500/20" />
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-sm font-medium truncate">
                        Projeler
                      </div>
                      <div className="text-xs text-muted-foreground">
                        12 items
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-default group">
                      <div className="flex justify-between items-start mb-2">
                        <Folder className="w-8 h-8 text-blue-500 fill-blue-500/20" />
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-sm font-medium truncate">
                        Fotoğraflar
                      </div>
                      <div className="text-xs text-muted-foreground">
                        456 items
                      </div>
                    </div>

                    {/* File Items */}
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-default group"
                      >
                        <div className="aspect-square bg-muted/30 rounded-md mb-2 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <div className="text-sm font-medium truncate">
                          Doküman_{i}.pdf
                        </div>
                        <div className="text-xs text-muted-foreground">
                          2.4 MB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-12 top-12 h-24 w-24 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 rotate-12 blur-sm opacity-20 -z-10" />
            <div className="absolute -left-12 bottom-12 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-500 -rotate-12 blur-sm opacity-20 -z-10" />
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section id="bento" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Neden CloudStorage?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Verilerinizi güvende tutmak ve iş akışınızı hızlandırmak için
              tasarlanmış modern özellikler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Large Card */}
            <div className="md:col-span-2 row-span-1 rounded-3xl border bg-card p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 scale-150 transform translate-x-12 -translate-y-12">
                <Cloud className="w-64 h-64" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="p-3 w-fit rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">
                    Sınırsız Depolama Alanı
                  </h3>
                  <p className="text-muted-foreground max-w-md text-base leading-relaxed">
                    İhtiyacınız olan alan kadar ödeyin. Fotoğraflarınız,
                    videolarınız ve belgeleriniz için genişleyebilir altyapı.
                  </p>
                </div>
              </div>
            </div>

            {/* Tall Card */}
            <div className="md:col-span-1 md:row-span-2 rounded-3xl border bg-card p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-green-50/50 to-transparent dark:from-green-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="p-3 w-fit rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-auto">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-3">Mobil Uyumlu</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    iOS ve Android uygulamalarımızla dosyalarınız her an
                    cebinizde. Tüm cihazlarınızla anlık senkronizasyon.
                  </p>
                </div>
                <div className="mt-8 flex justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-32 h-48 border-[6px] border-slate-900/10 dark:border-slate-100/10 rounded-[2rem] bg-background shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="h-6 w-16 bg-slate-900/10 dark:bg-slate-100/10 mx-auto rounded-b-xl" />
                    <div className="flex-1 bg-muted/30 p-2 space-y-2">
                      <div className="h-2 w-12 bg-muted-foreground/20 rounded-full" />
                      <div className="grid grid-cols-2 gap-1">
                        <div className="aspect-square bg-blue-500/20 rounded-md" />
                        <div className="aspect-square bg-purple-500/20 rounded-md" />
                        <div className="aspect-square bg-green-500/20 rounded-md" />
                        <div className="aspect-square bg-orange-500/20 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Card */}
            <div className="rounded-3xl border bg-card p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="p-3 w-fit rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Uçtan Uca Şifreleme
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Verileriniz sunucularımıza ulaşmadan önce AES-256 ile
                    şifrelenir. Anahtar sadece sizde kalır.
                  </p>
                </div>
              </div>
            </div>

            {/* Medium Card */}
            <div className="rounded-3xl border bg-card p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="p-3 w-fit rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Işık Hızında Transfer
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Global CDN ağımız sayesinde dosya yükleme ve indirme
                    işlemleri maksimum bant genişliğinde.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Cloud className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              CloudStorage
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 CloudStorage Inc. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Gizlilik
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Şartlar
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Twitter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
