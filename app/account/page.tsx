"use client";

import React, { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  User,
  Shield,
  CreditCard,
  Activity,
  Mail,
  Phone,
  Lock,
  Loader2,
  Camera,
  CheckCircle2,
  AlertCircle,
  Hash,
  Calendar,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import PasskeyManager from "@/components/Authentication/PasskeyManager";
import TwoFactorManager from "@/components/Authentication/TwoFactorManager";
import useAccountProfile from "@/hooks/useAccountProfile";
import { accountApiFactory } from "@/Service/Factories";
import type {
  AccountChangePasswordRequestModel,
  AccountPutBodyRequestModel,
} from "@/Service/Generates/api";

// --- Constants ---

type TabId = "profile" | "security" | "billing" | "activity";

const TABS: {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    id: "profile",
    label: "Profil Bilgileri",
    icon: User,
    description: "Kişisel bilgilerinizi ve görünümünüzü yönetin.",
  },
  {
    id: "security",
    label: "Güvenlik",
    icon: Shield,
    description: "Şifre, 2FA ve Passkey ayarlarınız.",
  },
  {
    id: "billing",
    label: "Abonelik & Plan",
    icon: CreditCard,
    description: "Abonelik durumu, limitler ve faturalandırma.",
  },
  {
    id: "activity",
    label: "Hesap Geçmişi",
    icon: Activity,
    description: "Son girişler ve hesap aktiviteleri.",
  },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  ACTIVE: {
    label: "Aktif",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  INACTIVE: { label: "Pasif", color: "text-amber-500", bg: "bg-amber-500/10" },
  PENDING: { label: "Beklemede", color: "text-blue-500", bg: "bg-blue-500/10" },
  SUSPENDED: {
    label: "Askıya Alındı",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  APPROVAL: {
    label: "Onay Bekliyor",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
};

// --- Helper Components ---

function ProfileSectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <Separator className="mt-4" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: "text-muted-foreground",
    bg: "bg-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.color,
      )}
    >
      {config.label}
    </span>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType;
  label: string;
  value?: string | React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span className="text-sm font-medium">{value || "-"}</span>
    </div>
  );
}

// --- Main Page Component ---

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const { accountProfileQuery, invalidate } = useAccountProfile();
  const profile = accountProfileQuery.data;
  const isLoading = accountProfileQuery.isLoading;

  const [profileFormDraft, setProfileFormDraft] =
    useState<AccountPutBodyRequestModel | null>(null);
  const [passwordForm, setPasswordForm] =
    useState<AccountChangePasswordRequestModel>({
      CurrentPassword: "",
      NewPassword: "",
      NewPasswordConfirmation: "",
    });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // -- Computations --

  const initialProfileValues = useMemo(
    () => ({
      FullName: profile?.FullName ?? "",
      PhoneNumber: profile?.PhoneNumber ?? "",
    }),
    [profile?.FullName, profile?.PhoneNumber],
  );

  const profileForm = profileFormDraft ?? initialProfileValues;

  const subscriptionInfo = useMemo(() => {
    if (!profile?.Subscription) return null;
    const sub = profile.Subscription;
    const plan = sub.Subscription;
    return {
      name: plan?.Name ?? "Özel Plan",
      rawStatus: plan?.Status,
      endAt: sub.EndAt,
      startAt: sub.StartAt,
      limit: plan?.StorageLimitBytes,
      cycle: plan?.BillingCycle,
    };
  }, [profile?.Subscription]);

  // -- Mutations --

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: AccountPutBodyRequestModel) =>
      await accountApiFactory.edit({ accountPutBodyRequestModel: payload }),
    onSuccess: async () => {
      setProfileFormDraft(null);
      await invalidate();
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: AccountChangePasswordRequestModel) =>
      await accountApiFactory.changePassword({
        accountChangePasswordRequestModel: payload,
      }),
    onSuccess: () => {
      setPasswordForm({
        CurrentPassword: "",
        NewPassword: "",
        NewPasswordConfirmation: "",
      });
    },
  });

  // -- Handlers --

  const handleProfileFieldChange = (
    field: keyof AccountPutBodyRequestModel,
    value: string,
  ) => {
    setProfileFormDraft((prev) => ({
      ...(prev ?? initialProfileValues),
      [field]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await updateProfileMutation.mutateAsync(profileForm);
    } catch {
      /* Handled globally */
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.NewPassword !== passwordForm.NewPasswordConfirmation) {
      setPasswordError("Yeni şifreler eşleşmiyor.");
      return;
    }
    setPasswordError(null);
    try {
      await changePasswordMutation.mutateAsync(passwordForm);
    } catch {
      /* Handled globally */
    }
  };

  const isFormLoading =
    updateProfileMutation.isPending ||
    changePasswordMutation.isPending ||
    isLoading;

  // -- Render Tab Contents --

  const renderProfileTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProfileSectionHeader
        title="Profil Bilgileri"
        description="Hesap bilgilerinizi buradan görüntüleyebilir ve güncelleyebilirsiniz."
      />

      {/* Profile Card */}
      <Card className="border-muted/50 shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex flex-col items-center gap-6 w-full lg:w-auto">
              <div className="relative group">
                <Avatar className="h-40 w-40 border-4 border-background shadow-xl">
                  <AvatarImage
                    src={profile?.Image || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl bg-primary/5 text-primary">
                    {profile?.FullName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl">{profile?.FullName}</h3>
                <p className="text-sm text-muted-foreground">
                  {profile?.Email}
                </p>
                <div className="mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest border px-2 py-0.5 rounded-md inline-block">
                  {profile?.Role}
                </div>
              </div>
            </div>

            <Separator
              orientation="vertical"
              className="hidden md:block h-auto"
            />
            <Separator className="md:hidden" />

            <form
              onSubmit={handleProfileSubmit}
              className="flex-1 space-y-8 w-full"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label
                    htmlFor="fullName"
                    className="flex items-center gap-2 text-base"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Ad Soyad
                  </Label>
                  <Input
                    id="fullName"
                    value={profileForm.FullName}
                    onChange={(e) =>
                      handleProfileFieldChange("FullName", e.target.value)
                    }
                    disabled={isFormLoading}
                    className="bg-muted/30 h-11"
                  />
                </div>
                <div className="space-y-3 px-0">
                  <Label
                    htmlFor="phoneNumber"
                    className="flex items-center gap-2 text-base"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Telefon Numarası
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={profileForm.PhoneNumber}
                    onChange={(e) =>
                      handleProfileFieldChange("PhoneNumber", e.target.value)
                    }
                    disabled={isFormLoading}
                    placeholder="+90 ..."
                    className="bg-muted/30 h-11"
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-base"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    E-posta Adresi
                  </Label>
                  <Input
                    value={profile?.Email || ""}
                    disabled
                    className="bg-muted/50 h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Güvenlik nedenleriyle e-posta adresi değiştirilemez.
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isFormLoading || !profileFormDraft}
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Değişiklikleri Kaydet
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProfileSectionHeader
        title="Güvenlik"
        description="Şifrenizi güncelleyin ve iki faktörlü kimlik doğrulamayı yönetin."
      />

      {/* Password Change */}
      <Card className="border-muted/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Şifre Değiştir</CardTitle>
              <CardDescription>
                Hesabınızın güvenliği için güçlü bir şifre kullanın.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mevcut Şifre</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.CurrentPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    CurrentPassword: e.target.value,
                  }))
                }
                disabled={isFormLoading}
                className="bg-muted/30"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.NewPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      NewPassword: e.target.value,
                    }))
                  }
                  disabled={isFormLoading}
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newConfirm">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="newConfirm"
                  type="password"
                  value={passwordForm.NewPasswordConfirmation}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      NewPasswordConfirmation: e.target.value,
                    }))
                  }
                  disabled={isFormLoading}
                  className="bg-muted/30"
                />
              </div>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {passwordError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isFormLoading || !passwordForm.CurrentPassword}
                variant="secondary"
              >
                {changePasswordMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Şifreyi Güncelle
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2FA & Passkey */}
      <div className="grid gap-12 grid-cols-1">
        <div className="h-full">
          <TwoFactorManager />
        </div>
        <div className="h-full">
          <PasskeyManager />
        </div>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProfileSectionHeader
        title="Abonelik ve Plan"
        description="Mevcut planınızı görüntüleyin ve depolama limitlerinizi kontrol edin."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Subscription Card */}
        <Card className="md:col-span-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-primary">
                  {subscriptionInfo?.name || "Yükleniyor..."}
                </CardTitle>
                <CardDescription>
                  {subscriptionInfo?.cycle === "MONTHLY"
                    ? "Aylık Faturalandırma"
                    : "Plan Detayları"}
                </CardDescription>
              </div>
              {subscriptionInfo && (
                <StatusBadge status={subscriptionInfo.rawStatus || "UNKNOWN"} />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Depolama Kullanımı</span>
                {subscriptionInfo?.limit && (
                  <span>
                    TODO /{" "}
                    {(subscriptionInfo.limit / (1024 * 1024 * 1024)).toFixed(0)}{" "}
                    GB
                  </span>
                )}
              </div>
              {/* Placeholder progress - in a real app this would come from a usage hook */}
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/4 rounded-full" />
              </div>
              <p className="text-xs text-muted-foreground">
                Kullanılan alan verisi henüz bu sayfada gösterilmiyor.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <InfoItem
                icon={Calendar}
                label="Başlangıç Tarihi"
                value={
                  subscriptionInfo?.startAt
                    ? new Date(subscriptionInfo.startAt).toLocaleDateString(
                        "tr-TR",
                      )
                    : "-"
                }
              />
              <InfoItem
                icon={Calendar}
                label="Yenilenme Tarihi"
                value={
                  subscriptionInfo?.endAt
                    ? new Date(subscriptionInfo.endAt).toLocaleDateString(
                        "tr-TR",
                      )
                    : "-"
                }
              />
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 border-t border-primary/10 p-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-primary/20 hover:bg-primary/10"
            >
              Planı Yönet
            </Button>
          </CardFooter>
        </Card>

        {/* Benefits Card */}
        <Card className="border-muted/50 shadow-sm h-full">
          <CardHeader>
            <CardTitle className="text-base">Plan Özellikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "Sınırsız Klasörleme",
                "Yüksek Hızlı Yükleme",
                "Gelişmiş Güvenlik",
                "7/24 Destek",
              ].map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProfileSectionHeader
        title="Hesap Geçmişi"
        description="Hesabınızla ilgili önemli tarihçeler ve durum bilgileri."
      />

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-blue-500" />
              Aktivite Zaman Çizelgesi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative pl-6 border-l-2 border-muted space-y-8">
              <div className="relative">
                <span className="absolute -left-[31px] bg-background p-1">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Son Giriş</span>
                  <span className="text-xs text-muted-foreground">
                    {profile?.Date?.LastLogin
                      ? new Date(profile.Date.LastLogin).toLocaleString("tr-TR")
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] bg-background p-1">
                  <div className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Son Güncelleme</span>
                  <span className="text-xs text-muted-foreground">
                    {profile?.Date?.Updated
                      ? new Date(profile.Date.Updated).toLocaleString("tr-TR")
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] bg-background p-1">
                  <div className="h-3 w-3 rounded-full bg-muted-foreground ring-4 ring-muted/20" />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Hesap Oluşturma</span>
                  <span className="text-xs text-muted-foreground">
                    {profile?.Date?.Created
                      ? new Date(profile.Date.Created).toLocaleString("tr-TR")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hash className="h-5 w-5 text-purple-500" />
              Teknik Detaylar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/40 border space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Hesap ID
              </p>
              <div className="font-mono text-sm bg-background p-2 rounded border flex items-center justify-between">
                <span className="truncate">{profile?.Id}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/40 border space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Hesap Durumu
              </p>
              <div className="pt-1">
                {profile?.Status && <StatusBadge status={profile.Status} />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 pb-12 pt-24">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Hesap Ayarları</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Kişisel profilinizi ve hesap tercihlerinizi tek bir yerden yönetin.
          </p>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
          {/* Sidebar Navigation */}
          <aside className="lg:w-72 flex-shrink-0">
            <nav className="flex lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 sticky top-28">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl transition-all whitespace-nowrap lg:whitespace-normal",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground",
                      )}
                    />
                    <div className="text-left">
                      <div
                        className={cn("text-base", isActive && "font-semibold")}
                      >
                        {tab.label}
                      </div>
                      {isActive && (
                        <div className="text-[10px] opacity-80 mt-1 font-normal hidden lg:block line-clamp-1">
                          {tab.description}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 hidden lg:block opacity-50" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {isLoading || !profile ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Profil yükleniyor...</p>
              </div>
            ) : (
              <>
                {activeTab === "profile" && renderProfileTab()}
                {activeTab === "security" && renderSecurityTab()}
                {activeTab === "billing" && renderBillingTab()}
                {activeTab === "activity" && renderActivityTab()}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
