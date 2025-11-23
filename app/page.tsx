import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Hoş Geldiniz
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Modern, hızlı ve güvenilir bir başlangıç noktası. Projelerinizi
              bir üst seviyeye taşıyın.
            </p>
          </div>
          <div className="space-x-4">
            {session ? (
              <Link href="/depo">
                <Button variant="outline" size="lg" className="h-11 px-8">
                  Depoya Git
                </Button>
              </Link>
            ) : (
              <Link href="/authentication">
                <Button size="lg" className="h-11 px-8">
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
