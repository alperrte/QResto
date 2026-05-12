import { ImageOff, MoreVertical, Package } from "lucide-react";
import { useState } from "react";

import type { OrderAdminTopProductResponse } from "../../../../types/cartTypes";

type DashboardTopProductsProps = {
    items: OrderAdminTopProductResponse[];
    loading: boolean;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

function menuPublicOrigin(): string {
    const raw =
        import.meta.env.VITE_MENU_SERVICE_URL ?? "http://localhost:7073/api";

    try {
        const u = new URL(raw);
        return `${u.protocol}//${u.host}`;
    } catch {
        return "http://localhost:7073";
    }
}

function resolveProductImageUrl(raw: string | null | undefined): string | null {
    if (!raw || !raw.trim()) return null;

    const t = raw.trim();
    if (t.startsWith("http://") || t.startsWith("https://")) return t;

    const path = t.startsWith("/") ? t : `/${t}`;
    return `${menuPublicOrigin()}${path}`;
}

function ProductThumb({
    productName,
    imageUrl,
}: {
    productName: string;
    imageUrl: string | null;
}) {
    const [broken, setBroken] = useState(false);

    if (!imageUrl || broken) {
        return (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                <Package size={22} strokeWidth={2} aria-hidden />
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={productName}
            className="h-12 w-12 shrink-0 rounded-xl object-cover"
            draggable={false}
            onError={() => setBroken(true)}
        />
    );
}

function DashboardTopProducts({ items, loading }: DashboardTopProductsProps) {
    return (
        <article className="dashboard-card-surface dashboard-ambient-shadow rounded-[32px] p-6">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="dashboard-display text-xl font-bold text-[var(--qresto-text)]">
                    En Çok Satan Ürünler
                </h3>
                <button
                    type="button"
                    className="rounded-full p-2 text-[var(--qresto-muted)] transition-colors hover:bg-[var(--qresto-hover)]"
                    aria-label="Daha fazla"
                >
                    <MoreVertical size={20} />
                </button>
            </div>
            <p className="mb-4 text-xs text-[var(--qresto-muted)]">
                Bugün ödenen / tamamlanan siparişlerdeki satırlara göre (ciro).
            </p>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((k) => (
                        <div
                            key={k}
                            className="flex animate-pulse items-center gap-4 rounded-2xl p-3"
                        >
                            <div className="h-12 w-12 shrink-0 rounded-xl bg-[var(--qresto-hover)]" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-4 w-3/4 max-w-[180px] rounded bg-[var(--qresto-hover)]" />
                            </div>
                            <div className="h-10 w-16 shrink-0 rounded bg-[var(--qresto-hover)]" />
                        </div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-4 py-10 text-center">
                    <ImageOff className="text-[var(--qresto-muted)]" size={28} />
                    <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                        Bugün için henüz satış kaydı yok.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((row) => (
                        <div
                            key={row.productId}
                            className="flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-[var(--qresto-hover)]"
                        >
                            <ProductThumb
                                productName={row.productName}
                                imageUrl={resolveProductImageUrl(row.productImageUrl)}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-bold text-[var(--qresto-text)]">
                                    {row.productName}
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <div className="text-sm font-bold text-[var(--qresto-text)]">
                                    {Math.round(Number(row.quantitySold ?? 0))} Adet
                                </div>
                                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(Number(row.revenue ?? 0))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </article>
    );
}

export default DashboardTopProducts;
