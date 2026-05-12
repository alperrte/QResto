import { Search, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import type { OrderAdminProductSalesRowResponse } from "../../../../types/cartTypes";

type DashboardProductSalesTableProps = {
    rows: OrderAdminProductSalesRowResponse[];
    loading: boolean;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

function TrendCell({ trend }: { trend: "up" | "down" | "flat" }) {
    if (trend === "up") {
        return (
            <span className="inline-flex text-emerald-600 dark:text-emerald-400" title="Yükseliş">
                <TrendingUp size={22} />
            </span>
        );
    }
    if (trend === "down") {
        return (
            <span className="inline-flex text-red-500 dark:text-red-400" title="Düşüş">
                <TrendingDown size={22} />
            </span>
        );
    }
    return (
        <span className="inline-flex text-[var(--qresto-muted)]" title="Stabil">
            <span className="text-lg font-bold">—</span>
        </span>
    );
}

function normalizeTrend(t: string | undefined): "up" | "down" | "flat" {
    if (t === "up" || t === "down" || t === "flat") return t;
    return "flat";
}

function DashboardProductSalesTable({ rows, loading }: DashboardProductSalesTableProps) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => r.productName.toLowerCase().includes(q));
    }, [query, rows]);

    return (
        <article className="dashboard-card-surface dashboard-ambient-shadow flex w-full flex-col overflow-hidden rounded-[32px] p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="dashboard-display text-xl font-bold text-[var(--qresto-text)]">
                    Ürün Bazlı Satış Raporu
                </h3>
                <div className="relative w-full sm:w-64">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--qresto-muted)]"
                        aria-hidden
                    />
                    <input
                        className="dashboard-input w-full rounded-xl py-2 pl-10 pr-4 text-sm"
                        placeholder="Ürün ara..."
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Ürün ara"
                        disabled={loading}
                    />
                </div>
            </div>
            <p className="mb-4 text-xs text-[var(--qresto-muted)]">
                Bugün ödenen / tamamlanan siparişler; trend dünkü ürün cirosuna göre (±%5 eşik).
            </p>
            <div className="min-h-0 flex-1 overflow-x-auto">
                {loading ? (
                    <div className="space-y-2 px-2 py-4">
                        {[1, 2, 3, 4, 5].map((k) => (
                            <div
                                key={k}
                                className="flex animate-pulse gap-4 rounded-xl border border-transparent py-3"
                            >
                                <div className="h-5 flex-1 rounded bg-[var(--qresto-hover)]" />
                                <div className="h-5 w-16 rounded bg-[var(--qresto-hover)]" />
                                <div className="h-5 w-24 rounded bg-[var(--qresto-hover)]" />
                                <div className="h-5 w-16 rounded bg-[var(--qresto-hover)]" />
                                <div className="h-5 w-10 rounded bg-[var(--qresto-hover)]" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <table className="w-full min-w-[520px] border-collapse text-left">
                        <thead>
                            <tr className="border-b-2 border-[var(--qresto-border)] text-[13px] font-bold uppercase tracking-wide text-[var(--qresto-muted)]">
                                <th className="px-4 py-3">Ürün Adı</th>
                                <th className="px-4 py-3 text-right">Satılan Adet</th>
                                <th className="px-4 py-3 text-right">Ciro</th>
                                <th className="px-4 py-3 text-right">Sipariş Sayısı</th>
                                <th className="px-4 py-3 text-center">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--qresto-border)] text-[var(--qresto-text)]">
                            {filtered.map((row) => (
                                <tr
                                    key={row.productId}
                                    className="transition-colors hover:bg-[var(--qresto-hover)]"
                                >
                                    <td className="px-4 py-4 font-medium">{row.productName}</td>
                                    <td className="px-4 py-4 text-right tabular-nums">
                                        {Math.round(Number(row.quantitySold ?? 0))}
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium tabular-nums">
                                        {formatCurrency(Number(row.revenue ?? 0))}
                                    </td>
                                    <td className="px-4 py-4 text-right tabular-nums">
                                        {Math.round(Number(row.orderCount ?? 0))}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <TrendCell trend={normalizeTrend(row.trend)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && filtered.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[var(--qresto-muted)]">
                        {rows.length === 0
                            ? "Bugün için ürün satış kaydı yok."
                            : "Aramanızla eşleşen ürün yok."}
                    </p>
                ) : null}
            </div>
        </article>
    );
}

export default DashboardProductSalesTable;
