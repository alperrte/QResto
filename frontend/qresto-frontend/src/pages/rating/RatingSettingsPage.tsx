import {
    CalendarDays,
    LayoutGrid,
    MessageSquareText,
    PackageCheck,
    Power,
    Star,
    Store,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";

import RatingPageHero from "./components/RatingPageHero";
import type { RatingSettingsResponse } from "../../types/ratingTypes";
import {
    getRatingSettings,
    toggleProductComments,
    toggleProductRatings,
    toggleRatingService,
    toggleRestaurantComments,
    toggleRestaurantRatings,
} from "../../services/ratingService";

type SettingKey =
    | "ratingServiceEnabled"
    | "restaurantRatingsEnabled"
    | "restaurantCommentsEnabled"
    | "productRatingsEnabled"
    | "productCommentsEnabled";

type SettingItem = {
    key: SettingKey;
    title: string;
    description: string;
    Icon: ElementType;
};

const settings: SettingItem[] = [
    {
        key: "ratingServiceEnabled",
        title: "Değerlendirme Servisi",
        description: "Tüm değerlendirme sistemini aktif veya pasif hale getirir.",
        Icon: Power,
    },
    {
        key: "restaurantRatingsEnabled",
        title: "Restoran Değerlendirmeleri",
        description: "Müşterilerin restorana yıldız puanı vermesini yönetir.",
        Icon: Store,
    },
    {
        key: "restaurantCommentsEnabled",
        title: "Restoran Yorumları",
        description: "Restoran değerlendirmelerinde yorum yazılmasını yönetir.",
        Icon: MessageSquareText,
    },
    {
        key: "productRatingsEnabled",
        title: "Ürün Değerlendirmeleri",
        description: "Müşterilerin ürünlere yıldız puanı vermesini yönetir.",
        Icon: Star,
    },
    {
        key: "productCommentsEnabled",
        title: "Ürün Yorumları",
        description: "Ürün değerlendirmelerinde yorum yazılmasını yönetir.",
        Icon: PackageCheck,
    },
];

function RatingSettingsPage() {
    const [settingsData, setSettingsData] =
        useState<RatingSettingsResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<SettingKey | null>(null);
    const [pendingKey, setPendingKey] = useState<SettingKey | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const loadSettings = async () => {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await getRatingSettings();
            setSettingsData(response);
        } catch (error) {
            console.error("Rating ayarları alınırken hata oluştu:", error);
            setErrorMessage("Değerlendirme ayarları alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const executeToggle = async (key: SettingKey) => {
        if (!settingsData) return;

        const nextValue = !settingsData[key];

        setSavingKey(key);
        setErrorMessage("");

        try {
            let response: RatingSettingsResponse;

            if (key === "ratingServiceEnabled") {
                response = await toggleRatingService(nextValue);
            } else if (key === "restaurantRatingsEnabled") {
                response = await toggleRestaurantRatings(nextValue);
            } else if (key === "restaurantCommentsEnabled") {
                response = await toggleRestaurantComments(nextValue);
            } else if (key === "productRatingsEnabled") {
                response = await toggleProductRatings(nextValue);
            } else {
                response = await toggleProductComments(nextValue);
            }

            setSettingsData(response);
        } catch (error) {
            console.error("Rating ayarı güncellenirken hata oluştu:", error);
            setErrorMessage("Ayar güncellenirken hata oluştu.");
        } finally {
            setSavingKey(null);
            setPendingKey(null);
        }
    };

    const requestToggle = (key: SettingKey) => {
        setPendingKey(key);
    };

    const pendingSetting = settings.find((setting) => setting.key === pendingKey);

    const pendingNextValue =
        pendingKey && settingsData ? !settingsData[pendingKey] : false;

    const getActionText = (nextValue: boolean) => {
        return nextValue ? "açmak" : "kapatmak";
    };

    const getConfirmDescription = () => {
        if (!pendingSetting) return "";

        return `${pendingSetting.title} özelliğini ${getActionText(
            pendingNextValue
        )} istiyor musunuz?`;
    };

    const formatTurkeyDateTime = (value?: string | null) => {
        if (!value) return "-";

        const hasTimezone =
            value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value);

        const normalizedValue = hasTimezone ? value : `${value}Z`;

        return new Intl.DateTimeFormat("tr-TR", {
            timeZone: "Europe/Istanbul",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(normalizedValue));
    };

    const stats = useMemo(() => {
        if (!settingsData) {
            return {
                activeModuleCount: 0,
                totalModuleCount: 5,
                activeCommentCount: 0,
                totalCommentCount: 2,
                moduleStatusText: "Modül bilgisi bekleniyor",
                commentStatusText: "Yorum bilgisi bekleniyor",
                lastUpdatedText: "-",
            };
        }

        const activeModuleCount = [
            settingsData.ratingServiceEnabled,
            settingsData.restaurantRatingsEnabled,
            settingsData.restaurantCommentsEnabled,
            settingsData.productRatingsEnabled,
            settingsData.productCommentsEnabled,
        ].filter(Boolean).length;

        const activeCommentCount = [
            settingsData.restaurantCommentsEnabled,
            settingsData.productCommentsEnabled,
        ].filter(Boolean).length;

        const lastDate = settingsData.updatedAt ?? settingsData.createdAt ?? null;

        const lastUpdatedText = formatTurkeyDateTime(lastDate);

        return {
            activeModuleCount,
            totalModuleCount: 5,
            activeCommentCount,
            totalCommentCount: 2,
            moduleStatusText:
                activeModuleCount === 5
                    ? "Tüm modüller aktif"
                    : `${activeModuleCount} modül aktif`,
            commentStatusText:
                activeCommentCount === 2
                    ? "Tüm yorumlar aktif"
                    : `${activeCommentCount} yorum ayarı aktif`,
            lastUpdatedText,
        };
    }, [settingsData]);

    const getStatusBadge = (active: boolean) => {
        return (
            <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    active
                        ? "bg-green-500/15 text-green-500"
                        : "bg-red-500/15 text-red-500"
                }`}
            >
                {active ? "Aktif" : "Pasif"}
            </span>
        );
    };

    return (
        <div className="space-y-5">
            <RatingPageHero
                title="Değerlendirme Servisi Ayarları"
                description="Ürün ve restoran değerlendirme akışlarını bu sayfadan yönetin."
            />

            {errorMessage && (
                <section className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-500">
                    {errorMessage}
                </section>
            )}

            {loading ? (
                <section className="rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 text-sm font-semibold text-[var(--qresto-muted)] shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                    Ayarlar yükleniyor...
                </section>
            ) : settingsData ? (
                <>
                    <section className="grid gap-4 rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:grid-cols-3">
                        <article className="flex items-center gap-4 md:border-r md:border-[var(--qresto-border)] md:pr-5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                <LayoutGrid size={24} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                                    Aktif Modül
                                </p>

                                <p className="mt-2 text-[30px] font-black leading-none text-[var(--qresto-text)]">
                                    {stats.activeModuleCount} / {stats.totalModuleCount}
                                </p>

                                <p className="mt-2 text-xs font-semibold text-green-500">
                                    {stats.moduleStatusText}
                                </p>
                            </div>
                        </article>

                        <article className="flex items-center gap-4 md:border-r md:border-[var(--qresto-border)] md:px-5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                <MessageSquareText size={24} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                                    Yorum Ayarları
                                </p>

                                <p className="mt-2 text-[30px] font-black leading-none text-[var(--qresto-text)]">
                                    {stats.activeCommentCount} / {stats.totalCommentCount}
                                </p>

                                <p className="mt-2 text-xs font-semibold text-green-500">
                                    {stats.commentStatusText}
                                </p>
                            </div>
                        </article>

                        <article className="flex items-center gap-4 md:pl-5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                <CalendarDays size={24} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                                    Son Güncelleme
                                </p>

                                <p className="mt-2 text-[30px] font-black leading-none text-[var(--qresto-text)]">
                                    {stats.lastUpdatedText}
                                </p>
                            </div>
                        </article>
                    </section>

                    <section className="grid gap-4 lg:grid-cols-2">
                        {settings.map((setting) => {
                            const active = settingsData[setting.key];
                            const isSaving = savingKey === setting.key;

                            return (
                                <article
                                    key={setting.key}
                                    className="rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-[1px]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 gap-4">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                                <setting.Icon size={24} />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="text-xl font-black leading-tight text-[var(--qresto-text)]">
                                                    {setting.title}
                                                </h3>

                                                <p className="mt-2 text-sm font-medium leading-6 text-[var(--qresto-muted)]">
                                                    {setting.description}
                                                </p>

                                                <div className="mt-4">
                                                    {getStatusBadge(active)}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => requestToggle(setting.key)}
                                            disabled={isSaving}
                                            className={`relative mt-1 h-8 w-16 shrink-0 rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                                                active
                                                    ? "bg-[var(--qresto-primary)]"
                                                    : "bg-[var(--qresto-border-strong)]"
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200 ${
                                                    active ? "left-9" : "left-1"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                </>
            ) : null}

            {pendingSetting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 text-[var(--qresto-text)] shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black">
                                    Emin misiniz?
                                </h3>

                                <p className="mt-2 text-sm font-medium leading-6 text-[var(--qresto-muted)]">
                                    {getConfirmDescription()}
                                </p>

                                {pendingSetting.key === "ratingServiceEnabled" &&
                                    !pendingNextValue && (
                                        <p className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-500">
                                            Değerlendirme Servisi kapatılırsa restoran değerlendirmeleri,
                                            restoran yorumları, ürün değerlendirmeleri ve ürün yorumları da
                                            devre dışı bırakılacaktır.
                                        </p>
                                    )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setPendingKey(null)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--qresto-border)] transition hover:bg-[var(--qresto-hover)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPendingKey(null)}
                                className="h-11 rounded-full border border-[var(--qresto-border)] text-sm font-bold text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)]"
                            >
                                Vazgeç
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (pendingKey) {
                                        executeToggle(pendingKey);
                                    }
                                }}
                                disabled={savingKey !== null}
                                className="h-11 rounded-full bg-[var(--qresto-primary)] text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {savingKey ? "Kaydediliyor..." : "Onayla"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RatingSettingsPage;