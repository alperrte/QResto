import { ArrowRight, Package2, Receipt, Star, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";

import type { OrderAdminSummaryResponse } from "../../../../types/cartTypes";
import type { RatingSummaryResponse } from "../../../../types/ratingTypes";

type DashboardKpiCardsProps = {
    summary: OrderAdminSummaryResponse;
    ratingSummary: RatingSummaryResponse | null;
    productRatingSummary: RatingSummaryResponse | null;
    loading: boolean;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

function StarDisplay({ rating }: { rating: number }) {
    const filled = Math.min(5, Math.max(0, Math.round(rating)));

    return (
        <div className="flex gap-0.5 text-amber-400" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
                <Star
                    key={i}
                    size={20}
                    className={
                        i < filled
                            ? "fill-amber-400 text-amber-400"
                            : "text-amber-400/30"
                    }
                />
            ))}
        </div>
    );
}

function DashboardKpiCards({
    summary,
    ratingSummary,
    productRatingSummary,
    loading,
}: DashboardKpiCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((k) => (
                    <div
                        key={k}
                        className="dashboard-card-surface dashboard-ambient-shadow h-[200px] animate-pulse rounded-[24px] p-6"
                    />
                ))}
            </div>
        );
    }

    const avg = ratingSummary?.averageRating;
    const hasRating = ratingSummary != null && typeof avg === "number";

    const productAvg = productRatingSummary?.averageRating;
    const hasProductRating =
        productRatingSummary != null && typeof productAvg === "number";

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <article className="dashboard-card-surface dashboard-ambient-shadow flex flex-col justify-between rounded-[24px] p-6">
                <div className="mb-4 flex items-start justify-between">
                    <div className="dashboard-soft-ring flex h-12 w-12 items-center justify-center rounded-full">
                        <Receipt size={22} strokeWidth={2.2} />
                    </div>
                    {summary.operationDensity > 0 ? (
                        <span className="rounded-full bg-[var(--qresto-hover)] px-2 py-1 text-xs font-bold text-[var(--qresto-primary)]">
                            Yoğunluk %{summary.operationDensity}
                        </span>
                    ) : null}
                </div>
                <div>
                    <h3 className="mb-1 text-base font-medium text-[var(--qresto-muted)]">
                        Günlük Sipariş Sayısı
                    </h3>
                    <p className="dashboard-display mb-2 text-4xl font-extrabold tracking-tight text-[var(--qresto-text)]">
                        {summary.totalOrderCount}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            Tamamlanan: {summary.completedOrderCount}
                        </span>
                        <span className="font-medium text-amber-700 dark:text-amber-400">
                            Aktif sipariş: {summary.activeOrderCount}
                        </span>
                    </div>
                </div>
            </article>

            <article className="dashboard-card-surface dashboard-ambient-shadow flex flex-col justify-between rounded-[24px] p-6">
                <div className="mb-4 flex items-start justify-between">
                    <div className="dashboard-soft-ring flex h-12 w-12 items-center justify-center rounded-full">
                        <Wallet size={22} strokeWidth={2.2} />
                    </div>
                </div>
                <div>
                    <h3 className="mb-1 text-base font-medium text-[var(--qresto-muted)]">
                        Günlük Toplam Ciro
                    </h3>
                    <p className="dashboard-display mb-2 text-4xl font-extrabold tracking-tight text-[var(--qresto-text)]">
                        {formatCurrency(summary.todayRevenue)}
                    </p>
                    <p className="text-sm text-[var(--qresto-muted)]">
                        Tamamlanan / ödenen siparişler üzerinden
                    </p>
                </div>
            </article>

            <article className="dashboard-card-surface dashboard-ambient-shadow relative flex flex-col justify-between overflow-hidden rounded-[24px] p-6">
                <div
                    className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-50"
                    style={{ background: "var(--qresto-hover)" }}
                />
                <div className="relative z-10 mb-4 flex items-start justify-between">
                    <div className="dashboard-soft-ring flex h-12 w-12 items-center justify-center rounded-full">
                        <Star size={22} strokeWidth={2.2} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="mb-1 text-base font-medium text-[var(--qresto-muted)]">
                        Restoran puanı
                    </h3>
                    <div className="mb-2 flex items-end gap-2">
                        <span className="dashboard-display text-4xl font-extrabold tracking-tight text-[var(--qresto-text)]">
                            {hasRating ? avg.toFixed(1) : "—"}
                        </span>
                        <span className="pb-2 text-lg text-[var(--qresto-muted)]">/ 5.0</span>
                    </div>
                    <p className="mb-2 text-xs text-[var(--qresto-muted)]">
                        Restoran ortalaması ·{" "}
                        {ratingSummary?.totalRatingCount ?? 0} değerlendirme
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                        {hasRating ? (
                            <StarDisplay rating={avg} />
                        ) : (
                            <span className="text-sm text-[var(--qresto-muted)]">
                                Veri yok veya servis kapalı
                            </span>
                        )}
                        <NavLink
                            to="/app/rating-service/restaurant-ratings"
                            className="flex shrink-0 items-center gap-1 text-sm font-bold text-[var(--qresto-primary)] hover:underline"
                        >
                            Detay
                            <ArrowRight size={16} />
                        </NavLink>
                    </div>
                </div>
            </article>

            <article className="dashboard-card-surface dashboard-ambient-shadow relative flex flex-col justify-between overflow-hidden rounded-[24px] p-6">
                <div
                    className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-50"
                    style={{ background: "var(--qresto-hover)" }}
                />
                <div className="relative z-10 mb-4 flex items-start justify-between">
                    <div className="dashboard-soft-ring flex h-12 w-12 items-center justify-center rounded-full">
                        <Package2 size={22} strokeWidth={2.2} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="mb-1 text-base font-medium text-[var(--qresto-muted)]">
                        Ürün puanı
                    </h3>
                    <div className="mb-2 flex items-end gap-2">
                        <span className="dashboard-display text-4xl font-extrabold tracking-tight text-[var(--qresto-text)]">
                            {hasProductRating ? productAvg.toFixed(1) : "—"}
                        </span>
                        <span className="pb-2 text-lg text-[var(--qresto-muted)]">/ 5.0</span>
                    </div>
                    <p className="mb-2 text-xs text-[var(--qresto-muted)]">
                        Tüm ürünler ortalaması ·{" "}
                        {productRatingSummary?.totalRatingCount ?? 0} değerlendirme
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                        {hasProductRating ? (
                            <StarDisplay rating={productAvg} />
                        ) : (
                            <span className="text-sm text-[var(--qresto-muted)]">
                                Veri yok veya servis kapalı
                            </span>
                        )}
                        <NavLink
                            to="/app/rating-service/product-ratings"
                            className="flex shrink-0 items-center gap-1 text-sm font-bold text-[var(--qresto-primary)] hover:underline"
                        >
                            Detay
                            <ArrowRight size={16} />
                        </NavLink>
                    </div>
                </div>
            </article>
        </div>
    );
}

export default DashboardKpiCards;
