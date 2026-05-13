import {
    ArrowLeft,
    CalendarDays,
    ChevronRight,
    MessageSquareText,
    Star,
    Store,
    TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import RatingPageHero from "./components/RatingPageHero";
import type {
    RatingSummaryResponse,
    RestaurantRatingResponse,
} from "../../types/ratingTypes";
import {
    getRestaurantRatings,
    getRestaurantRatingSummary,
} from "../../services/ratingService";

function RestaurantRatingsPage() {
    const [ratings, setRatings] = useState<RestaurantRatingResponse[]>([]);
    const [summary, setSummary] = useState<RatingSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [showAllComments, setShowAllComments] = useState(false);

    const loadRestaurantRatings = async () => {
        setLoading(true);
        setErrorMessage("");

        try {
            const [ratingsResponse, summaryResponse] = await Promise.all([
                getRestaurantRatings(),
                getRestaurantRatingSummary(),
            ]);

            setRatings(ratingsResponse);
            setSummary(summaryResponse);
        } catch (error) {
            console.error("Restoran değerlendirmeleri alınırken hata oluştu:", error);
            setErrorMessage("Restoran değerlendirmeleri alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRestaurantRatings();
    }, []);

    const formatAverage = (value: number | undefined) => {
        if (value === undefined || Number.isNaN(value)) return "0.0";

        return value.toFixed(1);
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

    const totalCommentCount = useMemo(() => {
        return ratings.filter(
            (rating) => rating.comment && rating.comment.trim().length > 0
        ).length;
    }, [ratings]);

    const lastRating = ratings[0];

    const ratingDistribution = useMemo(() => {
        const total = ratings.length;

        return [5, 4, 3, 2, 1].map((star) => {
            const count = ratings.filter((rating) => rating.rating === star).length;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return {
                star,
                count,
                percentage,
            };
        });
    }, [ratings]);

    const visibleComments = useMemo(() => {
        return ratings.slice(0, 6);
    }, [ratings]);

    const cards = [
        {
            title: "Ortalama Restoran Puanı",
            value: formatAverage(summary?.averageRating),
            helper: "5 üzerinden",
            Icon: Star,
        },
        {
            title: "Toplam Değerlendirme",
            value: String(summary?.totalRatingCount ?? 0),
            helper: "Tüm zamanlar",
            Icon: TrendingUp,
        },
        {
            title: "Toplam Yorum",
            value: String(totalCommentCount),
            helper: "Yorum bırakan müşteri",
            Icon: MessageSquareText,
        },
        {
            title: "Son Masa",
            value: lastRating?.tableName ?? "-",
            helper: lastRating
                ? formatTurkeyDateTime(lastRating.createdAt)
                : "Henüz veri yok",
            Icon: Store,
        },
    ];

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5 text-[var(--qresto-primary)]">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        fill={star <= rating ? "currentColor" : "none"}
                        className={
                            star <= rating
                                ? "text-[var(--qresto-primary)]"
                                : "text-[var(--qresto-border-strong)]"
                        }
                    />
                ))}
            </div>
        );
    };

    const renderCommentCard = (rating: RestaurantRatingResponse) => {
        return (
            <article
                key={rating.id}
                className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4 transition hover:bg-[var(--qresto-hover)]"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--qresto-primary)] text-base font-black text-white">
                            {rating.tableName?.charAt(0)?.toUpperCase() ?? "R"}
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-black text-[var(--qresto-text)]">
                                    {rating.tableName || "Masa"}
                                </p>

                                {renderStars(rating.rating)}
                            </div>

                            <p className="mt-2 text-sm font-medium leading-6 text-[var(--qresto-muted)]">
                                {rating.comment?.trim()
                                    ? rating.comment
                                    : "Yorum bırakılmadı."}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--qresto-muted)]">
                                <span className="inline-flex items-center gap-1">
                                    <CalendarDays size={14} />
                                    {formatTurkeyDateTime(rating.createdAt)}
                                </span>

                                <span>Order ID: {rating.orderId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 rounded-full bg-[var(--qresto-hover)] px-3 py-1 text-sm font-black text-[var(--qresto-primary)]">
                        {rating.rating}/5
                    </div>
                </div>
            </article>
        );
    };

    if (showAllComments) {
        return (
            <div className="space-y-5">
                <section className="rounded-[26px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowAllComments(false)}
                                className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--qresto-border)] px-4 py-2 text-sm font-bold text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)]"
                            >
                                <ArrowLeft size={17} />
                                Geri Dön
                            </button>

                            <h2 className="text-3xl font-black tracking-tight text-[var(--qresto-text)]">
                                Tüm Restoran Yorumları
                            </h2>

                            <p className="mt-2 text-sm font-medium text-[var(--qresto-muted)]">
                                Müşteriler tarafından bırakılan tüm restoran değerlendirmelerini görüntüleyin.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-[var(--qresto-hover)] px-5 py-4 text-center">
                            <p className="text-sm font-bold text-[var(--qresto-muted)]">
                                Toplam Yorum
                            </p>

                            <p className="mt-1 text-3xl font-black text-[var(--qresto-primary)]">
                                {totalCommentCount}
                            </p>
                        </div>
                    </div>
                </section>

                {ratings.length === 0 ? (
                    <section className="rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 text-sm font-semibold text-[var(--qresto-muted)]">
                        Henüz restoran değerlendirmesi yok.
                    </section>
                ) : (
                    <section className="grid gap-4 xl:grid-cols-2">
                        {ratings.map((rating) => renderCommentCard(rating))}
                    </section>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <RatingPageHero
                title="Restoran Değerlendirmeleri"
                description="Restoran puanlarını, müşteri yorumlarını ve genel memnuniyet seviyesini tek ekrandan takip edin."
            />

            {errorMessage && (
                <section className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-500">
                    {errorMessage}
                </section>
            )}

            {loading ? (
                <section className="rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 text-sm font-semibold text-[var(--qresto-muted)] shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                    Restoran değerlendirmeleri yükleniyor...
                </section>
            ) : (
                <>
                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {cards.map((card) => (
                            <article
                                key={card.title}
                                className="rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-[1px]"
                            >
                                <div className="flex min-w-0 gap-4">
                                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                        <card.Icon size={24} />
                                    </span>

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                                            {card.title}
                                        </p>

                                        <p className="mt-2 truncate text-[30px] font-black leading-none text-[var(--qresto-text)]">
                                            {card.value}
                                        </p>

                                        <p className="mt-2 text-xs font-semibold text-[var(--qresto-muted)]">
                                            {card.helper}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>

                    <section className="rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-black text-[var(--qresto-text)]">
                                    Genel Puan Özeti
                                </h3>

                                <p className="mt-1 text-sm font-medium text-[var(--qresto-muted)]">
                                    Restoranın genel müşteri memnuniyeti.
                                </p>
                            </div>

                            <Star
                                size={24}
                                className="text-[var(--qresto-primary)]"
                                fill="currentColor"
                            />
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-[180px_1fr]">
                            <div className="flex flex-col items-center justify-center rounded-2xl bg-[var(--qresto-bg)] p-5 text-center">
                                <p className="text-5xl font-black text-[var(--qresto-text)]">
                                    {formatAverage(summary?.averageRating)}
                                </p>

                                <div className="mt-3">
                                    {renderStars(Math.round(summary?.averageRating ?? 0))}
                                </div>

                                <p className="mt-2 text-xs font-semibold text-[var(--qresto-muted)]">
                                    5 üzerinden
                                </p>
                            </div>

                            <div className="space-y-3">
                                {ratingDistribution.map((item) => (
                                    <div
                                        key={item.star}
                                        className="grid grid-cols-[36px_1fr_72px] items-center gap-3"
                                    >
                                        <div className="flex items-center gap-1 text-sm font-bold text-[var(--qresto-text)]">
                                            {item.star}
                                            <Star
                                                size={13}
                                                fill="currentColor"
                                                className="text-[var(--qresto-primary)]"
                                            />
                                        </div>

                                        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--qresto-hover)]">
                                            <div
                                                className="h-full rounded-full bg-[var(--qresto-primary)] transition-all"
                                                style={{
                                                    width: `${item.percentage}%`,
                                                }}
                                            />
                                        </div>

                                        <p className="text-right text-xs font-bold text-[var(--qresto-muted)]">
                                            {item.count} ({item.percentage}%)
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-lg font-black text-[var(--qresto-text)]">
                                    Son Yorumlar
                                </h3>

                                <p className="mt-1 text-sm font-medium text-[var(--qresto-muted)]">
                                    Müşterilerin restoran hakkında bıraktığı son geri bildirimler.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowAllComments(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--qresto-border)] px-4 py-2 text-sm font-bold text-[var(--qresto-primary)] transition hover:bg-[var(--qresto-hover)]"
                            >
                                Tüm Yorumları Görüntüle
                                <ChevronRight size={17} />
                            </button>
                        </div>

                        {visibleComments.length === 0 ? (
                            <div className="mt-5 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-5 text-sm font-semibold text-[var(--qresto-muted)]">
                                Henüz restoran değerlendirmesi yok.
                            </div>
                        ) : (
                            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                {visibleComments.map((rating) =>
                                    renderCommentCard(rating)
                                )}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default RestaurantRatingsPage;