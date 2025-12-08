import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Login } from "@/components/Authentication/Login";
import AuthFormProvider from "@/components/Authentication/AuthFormProvider";
import { Cloud } from "lucide-react";

export default function LoginForm() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Cloud className="mr-2 h-6 w-6" />
          CloudStorage
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Bu platform sayesinde tüm dosyalarım güvende ve her an elimin altında. İş akışımı inanılmaz hızlandırdı.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Hesabınıza Giriş Yapın
            </h1>
            <p className="text-sm text-muted-foreground">
              Devam etmek için e-posta adresinizi ve şifrenizi girin
            </p>
          </div>
          
          <AuthFormProvider>
            <Login />
          </AuthFormProvider>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
