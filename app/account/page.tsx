"use client";

import { useMemo, useState, useCallback } from "react";
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
import {
  BadgeCheck,
  Copy,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import useAccountProfile from "@/hooks/useAccountProfile";
import { accountApiFactory } from "@/Service/Factories";
import type {
  AccountChangePasswordRequestModel,
  AccountProfileResponseModel,
  AccountPutBodyRequestModel,
  AuthenticationTwoFactorGenerateResponseModel,
} from "@/Service/Generates/api";
import { toast } from "react-hot-toast";

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
    Math.floor(Math.log(bytes) / Math.log(1024))
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
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [twoFactorSetup, setTwoFactorSetup] =
    useState<AuthenticationTwoFactorGenerateResponseModel | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [disableTwoFactorCode, setDisableTwoFactorCode] = useState("");

  const initialProfileValues = useMemo(
    () => ({
      fullName: profile?.fullName ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
    }),
    [profile?.fullName, profile?.phoneNumber]
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
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
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
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
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
    if (!profile?.subscription) return null;
    const subscription = profile.subscription;
    const plan = subscription.subscription;

    return {
      name: plan?.name ?? "Özel Plan",
      status:
        plan?.status === "ACTIVE"
          ? "Aktif"
          : plan?.status === "INACTIVE"
          ? "Pasif"
          : "Bilinmiyor",
      endAt: subscription.endAt,
      startAt: subscription.startAt,
      storageLimit: plan?.storageLimitBytes,
      billingCycle: plan?.billingCycle
        ? BILLING_LABELS[plan.billingCycle] ?? plan.billingCycle
        : undefined,
    };
  }, [profile?.subscription]);

  const handleProfileFieldChange = (
    field: keyof AccountPutBodyRequestModel,
    value: string
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
            <AvatarImage src={data.image || ""} alt={data.fullName} />
            <AvatarFallback>
              {data.fullName?.[0]?.toUpperCase() ||
                data.email?.[0]?.toUpperCase() ||
                "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold leading-none">
                {data.fullName}
              </p>
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {ROLE_LABELS[data.role] ?? data.role}
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Mail className="h-4 w-4 text-muted-foreground/70" />
              {data.email}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Phone className="h-4 w-4 text-muted-foreground/70" />
              {data.phoneNumber || "-"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
            {STATUS_LABELS[data.status] ?? data.status}
          </span>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            ID: {data.id}
          </span>
        </div>
      </div>
    );
  };

  const handleCopy = useCallback((value: string, label?: string) => {
    if (!value) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("Tarayıcınız kopyalamayı desteklemiyor");
      return;
    }
    navigator.clipboard
      .writeText(value)
      .then(() => {
        toast.success(`${label ?? "Bilgi"} kopyalandı`);
      })
      .catch(() => {
        toast.error("Kopyalama başarısız oldu");
      });
  }, []);

  const generateTwoFactorMutation = useMutation({
    mutationFn: async () => {
      const res = await accountApiFactory.generateTwoFactorSecret();
      return res.data?.result;
    },
    onSuccess: (result) => {
      if (result) {
        setTwoFactorSetup(result);
        setTwoFactorCode("");
      }
    },
  });

  const enableTwoFactorMutation = useMutation({
    mutationFn: async (code: string) => {
      await accountApiFactory.enableTwoFactor({
        authenticationTwoFactorVerifyRequestModel: { code },
      });
    },
    onSuccess: async () => {
      setTwoFactorSetup(null);
      setTwoFactorCode("");
      await invalidate();
    },
  });

  const disableTwoFactorMutation = useMutation({
    mutationFn: async (code: string) => {
      await accountApiFactory.disableTwoFactor({
        authenticationTwoFactorVerifyRequestModel: { code },
      });
    },
    onSuccess: async () => {
      setDisableTwoFactorCode("");
      await invalidate();
    },
  });

  const handleEnableTwoFactorSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) return;
    try {
      await enableTwoFactorMutation.mutateAsync(twoFactorCode.trim());
    } catch {
      /* handled globally */
    }
  };

  const handleDisableTwoFactorSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!disableTwoFactorCode.trim()) return;
    try {
      await disableTwoFactorMutation.mutateAsync(disableTwoFactorCode.trim());
    } catch {
      /* handled globally */
    }
  };

  const isTwoFactorEnabled = !!profile?.isTwoFactorEnabled;

  const twoFactorOtpauthUrl = twoFactorSetup?.otpauthUrl ?? null;

  const twoFactorQrUrl = useMemo(() => {
    if (!twoFactorOtpauthUrl) return null;
    const params = new URLSearchParams({
      size: "220x220",
      data: twoFactorOtpauthUrl,
      ecc: "M",
      margin: "1",
    });
    return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
  }, [twoFactorOtpauthUrl]);

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
                        profile?.subscription?.subscription?.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : profile?.subscription?.subscription?.status ===
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
                      {STATUS_LABELS[profile.status] ?? profile.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Oluşturulma: {formatDate(profile.date?.created)}</p>
                    <p>Son giriş: {formatDate(profile.date?.lastLogin)}</p>
                    <p>Son güncelleme: {formatDate(profile.date?.updated)}</p>
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
                      name="fullName"
                      placeholder="Adınızı girin"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        handleProfileFieldChange("fullName", e.target.value)
                      }
                      disabled={disabledForms || !profile}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Telefon</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+90 555 000 00 00"
                      value={profileForm.phoneNumber}
                      onChange={(e) =>
                        handleProfileFieldChange("phoneNumber", e.target.value)
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
                    value={profile?.email ?? ""}
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
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          current_password: e.target.value,
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
                        value={passwordForm.new_password}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            new_password: e.target.value,
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
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            new_password_confirmation: e.target.value,
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

            <Card id="two-factor">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>İki Aşamalı Doğrulama</CardTitle>
                    <CardDescription>
                      Authenticator uygulamalarıyla ekstra güvenlik katmanı ekle
                    </CardDescription>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      isTwoFactorEnabled
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {isTwoFactorEnabled ? (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Aktif
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4" />
                        Pasif
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 w-3/5 bg-muted rounded" />
                    <div className="h-3 w-4/5 bg-muted rounded" />
                    <div className="h-3 w-2/3 bg-muted rounded" />
                  </div>
                ) : twoFactorSetup ? (
                  <form
                    onSubmit={handleEnableTwoFactorSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>1. Authenticator uygulamasında yeni hesap ekle.</p>
                      <p>
                        2. Aşağıdaki gizli anahtarı manuel olarak gir ya da
                        bağlantıyı cihazına gönder.
                      </p>
                      <p>
                        3. Uygulamanın ürettiği 6 haneli kodu doğrula ve
                        kurulumu tamamla.
                      </p>
                    </div>
                    {twoFactorQrUrl && (
                      <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/20 p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={twoFactorQrUrl}
                          alt="2FA QR kodu"
                          className="h-48 w-48 rounded-lg border bg-white p-2"
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          QR kodu telefonundaki authenticator uygulamasıyla
                          tarayabilirsin.
                        </p>
                      </div>
                    )}
                    <div className="rounded-xl border bg-muted/10 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Gizli Anahtar
                          </p>
                          <p className="font-mono text-lg">
                            {twoFactorSetup.secret}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleCopy(twoFactorSetup.secret, "Gizli anahtar")
                          }
                        >
                          <Copy className="h-4 w-4" />
                          Kopyala
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Otomatik kurulum bağlantısı
                        </p>
                        <div className="flex items-center gap-2">
                          <Input value={twoFactorSetup.otpauthUrl} readOnly />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCopy(
                                twoFactorSetup.otpauthUrl,
                                "Kurulum bağlantısı"
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twoFactorCode">Doğrulama Kodu</Label>
                      <Input
                        id="twoFactorCode"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="123456"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        maxLength={6}
                        autoComplete="one-time-code"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setTwoFactorSetup(null);
                          setTwoFactorCode("");
                        }}
                        disabled={enableTwoFactorMutation.isPending}
                      >
                        İptal Et
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          enableTwoFactorMutation.isPending ||
                          twoFactorCode.trim().length < 6
                        }
                      >
                        {enableTwoFactorMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Kurulumu Tamamla
                      </Button>
                    </div>
                  </form>
                ) : isTwoFactorEnabled ? (
                  <form
                    onSubmit={handleDisableTwoFactorSubmit}
                    className="space-y-4"
                  >
                    <p className="text-sm text-muted-foreground">
                      Authenticator uygulamasındaki aktif kodu girerek iki
                      aşamalı doğrulamayı devre dışı bırakabilirsin.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="disableTwoFactorCode">
                        Doğrulama Kodu
                      </Label>
                      <Input
                        id="disableTwoFactorCode"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="123456"
                        value={disableTwoFactorCode}
                        onChange={(e) =>
                          setDisableTwoFactorCode(e.target.value)
                        }
                        maxLength={6}
                        autoComplete="one-time-code"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Güvenliği kapatmak için kodu doğrulamalısın.
                      </div>
                      <Button
                        type="submit"
                        variant="destructive"
                        disabled={
                          disableTwoFactorMutation.isPending ||
                          disableTwoFactorCode.trim().length < 6
                        }
                      >
                        {disableTwoFactorMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Devre Dışı Bırak
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Hesabına her girişte ikinci bir doğrulama adımı ekleyerek
                      yetkisiz erişimleri engelle.
                    </p>
                    <Button
                      type="button"
                      onClick={() => generateTwoFactorMutation.mutate()}
                      disabled={generateTwoFactorMutation.isPending}
                    >
                      {generateTwoFactorMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Hazırlanıyor...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Kurulumu Başlat
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
