import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowRight, Cloud, Lock, Share2, Smartphone, Zap, HardDrive } from "lucide-react";

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
              <span className="mr-2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Yeni Nesil Bulut Depolama
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl">
              Tüm dosyalarınız tek bir <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">güvenli merkezde.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              CloudStorage ile dosyalarınızı şifreleyin, yedekleyin ve dilediğiniz yerden erişin. 
              Karmaşık arayüzlere veda edin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {session ? (
                <Link href="/storage">
                  <Button size="lg" className="h-14 px-8 rounded-full text-lg gap-2 shadow-lg shadow-primary/20">
                    Depoya Git <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/authentication">
                    <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-lg shadow-primary/20">
                      Ücretsiz Başla
                    </Button>
                  </Link>
                  <Link href="#bento">
                    <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg bg-background/50 backdrop-blur-sm">
                      Nasıl Çalışır?
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Abstract Hero Visual */}
          <div className="mt-20 relative mx-auto max-w-5xl aspect-[16/9] rounded-2xl border bg-muted/20 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5" />
            
            {/* Mock UI Elements */}
            <div className="absolute top-8 left-8 right-8 bottom-0 bg-background rounded-t-xl border shadow-sm p-4">
               <div className="flex items-center gap-4 mb-6 border-b pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  </div>
                  <div className="h-2 w-32 bg-muted rounded-full" />
               </div>
               <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square rounded-lg bg-muted/30 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section id="bento" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Neden CloudStorage?</h2>
            <p className="text-muted-foreground">Modern ihtiyaçlar için tasarlanmış özellikler.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            
            {/* Large Card */}
            <div className="md:col-span-2 row-span-1 rounded-3xl border bg-background p-8 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cloud className="w-64 h-64" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="p-3 w-fit rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Sınırsız Depolama Alanı</h3>
                  <p className="text-muted-foreground max-w-md">
                    İhtiyacınız olan alan kadar ödeyin. Fotoğraflarınız, videolarınız ve belgeleriniz için asla yer sıkıntısı çekmeyin.
                  </p>
                </div>
              </div>
            </div>

            {/* Tall Card */}
            <div className="md:col-span-1 md:row-span-2 rounded-3xl border bg-background p-8 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="p-3 w-fit rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-auto">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-2">Mobil Uyumlu</h3>
                  <p className="text-muted-foreground">
                    iOS ve Android uygulamalarımızla dosyalarınız her an cebinizde. Senkronizasyon anlık gerçekleşir.
                  </p>
                </div>
                <div className="mt-8 flex justify-center">
                   <div className="w-32 h-48 border-4 border-muted rounded-2xl bg-background shadow-xl" />
                </div>
              </div>
            </div>

            {/* Medium Card */}
            <div className="rounded-3xl border bg-background p-8 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="p-3 w-fit rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Uçtan Uca Şifreleme</h3>
                  <p className="text-muted-foreground text-sm">
                    Verileriniz sunucularımıza ulaşmadan önce şifrelenir. Anahtar sadece sizde.
                  </p>
                </div>
              </div>
            </div>

            {/* Medium Card */}
            <div className="rounded-3xl border bg-background p-8 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="p-3 w-fit rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Işık Hızında Transfer</h3>
                  <p className="text-muted-foreground text-sm">
                    Optimize edilmiş CDN ağımız sayesinde dosya yükleme ve indirme işlemleri maksimum hızda.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Cloud className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg">CloudStorage</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 CloudStorage Inc. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Gizlilik</Link>
            <Link href="#" className="hover:text-primary transition-colors">Şartlar</Link>
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
