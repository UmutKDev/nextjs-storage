"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Loader2, Mail, Phone, Shield } from "lucide-react";
import PasskeyManager from "@/components/Authentication/PasskeyManager";
import TwoFactorManager from "@/components/Authentication/TwoFactorManager";
import { useMutation } from "@tanstack/react-query";
import useAccountProfile from "@/hooks/useAccountProfile";
import { accountApiFactory } from "@/Service/Factories";
import type {
  AccountChangePasswordRequestModel,
  AccountProfileResponseModel,
  AccountPutBodyRequestModel,
} from "@/Service/Generates/api";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Yönetici",
  USER: "Kullanıcı",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Pasif",
  PENDING: "Beklemede",
  SUSPENDED: "Askıya Alındı",
  APPROVAL: "Onay Bekliyor",
};

const BILLING_LABELS: Record<string, string> = {
  MONTHLY: "Aylık",
  YEARLY: "Yıllık",
  ONETIME: "Tek Sefer",
  TRIAL: "Deneme",
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${units[i]}`;
};

export default function AccountPage() {
  const { accountProfileQuery, invalidate } = useAccountProfile();
  const profile = accountProfileQuery.data;
  const profileLoading = accountProfileQuery.isLoading && !profile;
  const refetchingProfile = accountProfileQuery.isFetching && !!profile;

  const [profileFormDraft, setProfileFormDraft] =
    useState<AccountPutBodyRequestModel | null>(null);
  const [passwordForm, setPasswordForm] =
    useState<AccountChangePasswordRequestModel>({
      CurrentPassword: "",
      NewPassword: "",
      NewPasswordConfirmation: "",
    });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const initialProfileValues = useMemo(
    () => ({
      FullName: profile?.FullName ?? "",
      PhoneNumber: profile?.PhoneNumber ?? "",
    }),
    [profile?.FullName, profile?.PhoneNumber],
  );

  const profileForm = profileFormDraft ?? initialProfileValues;

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: AccountPutBodyRequestModel) =>
      await accountApiFactory.edit({
        accountPutBodyRequestModel: payload,
      }),
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

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await updateProfileMutation.mutateAsync(profileForm);
    } catch {
      // errors handled globally by mutation cache toast
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    if (passwordForm.NewPassword !== passwordForm.NewPasswordConfirmation) {
      setPasswordError("Yeni şifreler eşleşmiyor.");
      return;
    }
    setPasswordError(null);
    try {
      await changePasswordMutation.mutateAsync(passwordForm);
    } catch {
      // handled globally
    }
  };

  const subscriptionInfo = useMemo(() => {
    if (!profile?.Subscription) return null;
    const subscription = profile.Subscription;
    const plan = subscription.Subscription;

    return {
      name: plan?.Name ?? "Özel Plan",
      status:
        plan?.Status === "ACTIVE"
          ? "Aktif"
          : plan?.Status === "INACTIVE"
            ? "Pasif"
            : "Bilinmiyor",
      endAt: subscription.EndAt,
      startAt: subscription.StartAt,
      storageLimit: plan?.StorageLimitBytes,
      billingCycle: plan?.BillingCycle
        ? (BILLING_LABELS[plan.BillingCycle] ?? plan.BillingCycle)
        : undefined,
    };
  }, [profile?.Subscription]);

  const handleProfileFieldChange = (
    field: keyof AccountPutBodyRequestModel,
    value: string,
  ) => {
    setProfileFormDraft((prev) => ({
      ...(prev ?? initialProfileValues),
      [field]: value,
    }));
  };

  const disabledForms =
    profileLoading ||
    updateProfileMutation.isPending ||
    changePasswordMutation.isPending;

  const renderProfileSummary = (data?: AccountProfileResponseModel) => {
    if (profileLoading) {
      return (
        <div className="space-y-4 animate-pulse">
          <div className="h-14 w-14 rounded-full bg-muted" />
          <div className="h-4 w-2/3 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
          <div className="h-3 w-1/3 bg-muted rounded" />
        </div>
      );
    }

    if (!data) {
      return (
        <p className="text-sm text-muted-foreground">
          Profil bilgilerine ulaşılamadı.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border">
            <AvatarImage src={data.Image || ""} alt={data.FullName} />
            <AvatarFallback>
              {data.FullName?.[0]?.toUpperCase() ||
                data.Email?.[0]?.toUpperCase() ||
                "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold leading-none">
                {data.FullName}
              </p>
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {ROLE_LABELS[data.Role] ?? data.Role}
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Mail className="h-4 w-4 text-muted-foreground/70" />
              {data.Email}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Phone className="h-4 w-4 text-muted-foreground/70" />
              {data.PhoneNumber || "-"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
            {STATUS_LABELS[data.Status] ?? data.Status}
          </span>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            ID: {data.Id}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-12 px-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Hesap & Profil
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Profil Ayarları</h1>
          <p className="text-muted-foreground">
            Bilgilerini güncelle, şifreni değiştir ve abonelik durumunu kontrol
            et.
          </p>
        </div>

        {accountProfileQuery.isError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Profil bilgileri yüklenirken bir sorun oluştu. Lütfen daha sonra
            tekrar dene.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Genel Bakış</CardTitle>
              <CardDescription>Hızlı profil özeti</CardDescription>
            </CardHeader>
            <CardContent>{renderProfileSummary(profile)}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Abonelik</CardTitle>
              <CardDescription>Plan ve depolama bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 w-2/3 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
              ) : subscriptionInfo ? (
                <>
                  <div>
                    <p className="text-lg font-semibold">
                      {subscriptionInfo.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionInfo.billingCycle
                        ? `${subscriptionInfo.billingCycle} planı`
                        : "Özel abonelik"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        profile?.Subscription?.Subscription?.Status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : profile?.Subscription?.Subscription?.Status ===
                              "INACTIVE"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-muted/10 text-muted-foreground"
                      }`}
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {subscriptionInfo.status}
                    </span>
                    {subscriptionInfo.storageLimit && (
                      <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {formatBytes(subscriptionInfo.storageLimit)} alan
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Başlangıç: {formatDate(subscriptionInfo.startAt)}</p>
                    <p>Bitiş: {formatDate(subscriptionInfo.endAt)}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aktif bir abonelik bulunamadı. Ücretsiz plan kullanılıyor.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hesap Durumu</CardTitle>
              <CardDescription>Güncel aktivite bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 w-1/2 bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
              ) : profile ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Hesap durumu:{" "}
                    <span className="font-semibold">
                      {STATUS_LABELS[profile.Status] ?? profile.Status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Oluşturulma: {formatDate(profile.Date?.Created)}</p>
                    <p>Son giriş: {formatDate(profile.Date?.LastLogin)}</p>
                    <p>Son güncelleme: {formatDate(profile.Date?.Updated)}</p>
                  </div>

                  <div className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Passkey & 2FA</CardTitle>
                        <CardDescription>
                          Passkey ve 2FA yönetimi
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <TwoFactorManager />
                        <PasskeyManager />
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aktivite bilgisi bulunamadı.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Bilgileri Güncelle</CardTitle>
              <CardDescription>
                Ad-soyad ve iletişim bilgilerini düzenle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Ad Soyad</Label>
                    <Input
                      id="fullName"
                      name="FullName"
                      placeholder="Adınızı girin"
                      value={profileForm.FullName}
                      onChange={(e) =>
                        handleProfileFieldChange("FullName", e.target.value)
                      }
                      disabled={disabledForms || !profile}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Telefon</Label>
                    <Input
                      id="phoneNumber"
                      name="PhoneNumber"
                      type="tel"
                      placeholder="+90 555 000 00 00"
                      value={profileForm.PhoneNumber}
                      onChange={(e) =>
                        handleProfileFieldChange("PhoneNumber", e.target.value)
                      }
                      disabled={disabledForms || !profile}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.Email ?? ""}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    E-posta adresi güvenlik nedeniyle değiştirilemez.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {refetchingProfile
                      ? "Profil bilgileri yenileniyor..."
                      : "Son güncel bilgiler görüntüleniyor."}
                  </p>
                  <Button type="submit" disabled={disabledForms || !profile}>
                    {updateProfileMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Bilgileri Kaydet
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card id="security">
              <CardHeader>
                <CardTitle>Şifreyi Güncelle</CardTitle>
                <CardDescription>
                  Güvenliğin için düzenli aralıklarla şifreni değiştir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.CurrentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          CurrentPassword: e.target.value,
                        }))
                      }
                      disabled={disabledForms || !profile}
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Yeni Şifre</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.NewPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            NewPassword: e.target.value,
                          }))
                        }
                        disabled={disabledForms || !profile}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPasswordConfirm">
                        Yeni Şifre (Tekrar)
                      </Label>
                      <Input
                        id="newPasswordConfirm"
                        type="password"
                        value={passwordForm.NewPasswordConfirmation}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            NewPasswordConfirmation: e.target.value,
                          }))
                        }
                        disabled={disabledForms || !profile}
                        required
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <p className="text-sm font-medium text-destructive">
                      {passwordError}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Şifren en az 8 karakter olmalıdır.
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={
                        disabledForms ||
                        !profile ||
                        changePasswordMutation.isPending
                      }
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
          </div>
        </div>
      </div>
    </div>
  );
}
