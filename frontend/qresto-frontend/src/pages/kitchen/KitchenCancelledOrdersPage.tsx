import { useEffect, useMemo, useState } from "react";
import {
    ArchiveX,
    CalendarClock,
    Clock3,
    Loader2,
    PackageX,
    Search,
    Table2,
    XCircle,
} from "lucide-react";

import { getAdminCancelledOrders } from "../../services/orderService";
import type { OrderResponse } from "../../types/cartTypes";
import {
    formatOrderClock,
    formatRelativeTr,
    itemCountLabel,
} from "./kitchenOrderUi";
import "../../styles/adminPageAnimations.css";

function parseBackendDate(iso?: string | null): Date | null {
    if (!iso) {
        return null;
    }

    const normalizedIso = iso.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(iso)
        ? iso
        : `${iso}Z`;
    const date = new Date(normalizedIso);

    return Number.isNaN(date.getTime()) ? null : date;
}

function formatCancelledDate(iso?: string | null): string {
    const date = parseBackendDate(iso);

    if (!date) {
        return "-";
    }

    return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Istanbul",
    });
}

function cancelledSortTime(order: OrderResponse): number {
    return (
        parseBackendDate(order.cancelledAt)?.getTime() ||
        parseBackendDate(order.updatedAt)?.getTime() ||
        parseBackendDate(order.createdAt)?.getTime() ||
        0
    );
}

function cancelledAtForOrder(order: OrderResponse): string | null {
    return order.cancelledAt || order.updatedAt || order.createdAt || null;
}

function cancelledReasonForOrder(order: OrderResponse): string {
    return order.cancelReason?.trim() || "İptal nedeni belirtilmedi";
}

function orderProductsText(order: OrderResponse, limit = 2): string {
    const items = order.items ?? [];

    if (items.length === 0) {
        return "Ürün bilgisi yok";
    }

    const visibleItems = items
        .slice(0, limit)
        .map((item) => `${item.quantity}x ${item.productName}`);
    const hiddenCount = items.length - visibleItems.length;

    return hiddenCount > 0
        ? `${visibleItems.join(", ")} +${hiddenCount} ürün`
        : visibleItems.join(", ");
}

function normalizeSearch(value?: string | number | null): string {
    return String(value ?? "").toLocaleLowerCase("tr-TR").trim();
}

export default function KitchenCancelledOrdersPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");


    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setError(null);
                const data = await getAdminCancelledOrders();

                if (!cancelled) {
                    setOrders(data);
                }
            } catch (e) {
                console.error(e);

                if (!cancelled) {
                    setError("İptal edilen siparişler yüklenemedi.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    const sortedOrders = useMemo(
        () => [...orders].sort((a, b) => cancelledSortTime(b) - cancelledSortTime(a)),
        [orders]
    );

    const filteredOrders = useMemo(() => {
        const query = normalizeSearch(searchQuery);

        return sortedOrders.filter((order) => {
            const tableName = order.tableName || `Masa #${order.tableId}`;
            const reason = cancelledReasonForOrder(order);

            const searchableText = [
                order.orderNo,
                order.id,
                tableName,
                reason,
                ...(order.items ?? []).flatMap((item) => [
                    item.productName,
                    item.note,
                    item.addedIngredients,
                    item.removedIngredients,
                ]),
            ].map(normalizeSearch).join(" ");

            return !query || searchableText.includes(query);
        });
    }, [searchQuery, sortedOrders]);

    const cancelledItemCount = useMemo(
        () => sortedOrders.reduce((sum, order) => sum + (order.items?.length ?? 0), 0),
        [sortedOrders]
    );


    const affectedTableCount = useMemo(
        () =>
            new Set(
                sortedOrders.map((order) => order.tableName || `Masa #${order.tableId}`)
            ).size,
        [sortedOrders]
    );


    const summaryCards = [
        {
            title: "Toplam İptal",
            value: sortedOrders.length,
            description: "Kayıtlı iptal",
            Icon: XCircle,
            className: "bg-red-500/10 text-red-600 ring-red-500/15 dark:text-red-300",
        },
        {
            title: "İptal Edilen Ürün",
            value: cancelledItemCount,
            description: "Toplam ürün",
            Icon: PackageX,
            className: "bg-orange-500/10 text-[var(--qresto-primary)] ring-orange-500/15",
        },
        {
            title: "Etkilenen Masa",
            value: affectedTableCount,
            description: "Farklı masa",
            Icon: Table2,
            className: "bg-sky-500/10 text-sky-600 ring-sky-500/15 dark:text-sky-300",
        },
    ] as const;

    return (
        <div className="admin-page-enter min-h-full space-y-5">
            <section className="flex flex-col gap-4 rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)] lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-black text-[var(--qresto-text)] md:text-3xl">
                        İptal Edilen Siparişler
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-[var(--qresto-muted)]">
                        İptal edilen siparişleri, nedenlerini ve detaylarını görüntüleyin.
                    </p>
                </div>

            </section>

            <section className="grid gap-4 md:grid-cols-3">
                {summaryCards.map((card) => (
                    <article
                        key={card.title}
                        className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-[var(--qresto-border-strong)] hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]"
                    >
                        <div className="flex items-center gap-4">
                            <span className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ring-1 ${card.className}`}>
                                <card.Icon size={24} />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-black text-[var(--qresto-text)]">
                                    {card.title}
                                </p>
                                <p className="mt-1 text-3xl font-black text-[var(--qresto-text)]">
                                    {loading ? "..." : card.value}
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-[var(--qresto-muted)]">
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    </article>
                ))}
            </section>

            <section className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                <div className="max-w-md">
                    <label className="block">
            <span className="mb-1.5 block text-xs font-black text-[var(--qresto-muted)]">
                Arama
            </span>

                        <span className="flex h-12 items-center gap-2 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-3 transition focus-within:border-[var(--qresto-primary)] focus-within:ring-4 focus-within:ring-orange-500/10">
                <Search size={17} className="shrink-0 text-[var(--qresto-primary)]" />

                <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Sipariş No, Masa No, Ürün Ara..."
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)]"
                />
            </span>
                    </label>
                </div>
            </section>
            {error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-600">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="flex items-center justify-center gap-2 rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-6 py-12 text-sm font-bold text-[var(--qresto-muted)]">
                    <Loader2 size={18} className="animate-spin text-[var(--qresto-primary)]" />
                    İptal edilen siparişler yükleniyor...
                </div>
            ) : null}

            {!loading && !error && sortedOrders.length === 0 ? (
                <div className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-6 py-12 text-center">
                    <ArchiveX size={34} className="mx-auto text-[var(--qresto-muted)]" />
                    <p className="mt-3 text-sm font-black text-[var(--qresto-text)]">
                        Henüz iptal edilen sipariş yok.
                    </p>
                </div>
            ) : null}

            {!loading && !error && sortedOrders.length > 0 ? (
                <section className="overflow-hidden rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] shadow-[0_14px_36px_rgba(15,23,42,0.06)]">


                    <div className="divide-y divide-[var(--qresto-border)]">
                        {filteredOrders.map((order, index) => {
                            const cancelledAt = cancelledAtForOrder(order);
                            const reason = cancelledReasonForOrder(order);

                            return (
                                <article
                                    key={order.id}
                                    className="grid gap-4 bg-[var(--qresto-surface)] px-4 py-4 transition hover:bg-[var(--qresto-hover)] lg:grid-cols-[minmax(220px,1.1fr)_minmax(260px,1.2fr)_minmax(220px,1fr)_minmax(190px,0.85fr)] lg:items-center lg:px-5"
                                    style={{ "--admin-page-item-delay": `${index * 28}ms` } as React.CSSProperties}
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 ring-1 ring-red-500/20 dark:text-red-300">
                                            <XCircle size={19} />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-black text-[var(--qresto-text)]">
                                                #{order.orderNo || order.id}
                                            </p>
                                            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--qresto-muted)]">
                                                <Table2 size={13} />
                                                {order.tableName || `Masa #${order.tableId}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="min-w-0 truncate text-sm font-black text-[var(--qresto-text)]">
                                                {orderProductsText(order, 2)}
                                            </p>
                                            <span className="shrink-0 rounded-full bg-[var(--qresto-bg)] px-2.5 py-1 text-[11px] font-black text-[var(--qresto-text)] ring-1 ring-[var(--qresto-border)]">
                                                {itemCountLabel(order)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <span className="inline-flex max-w-full rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-black text-red-600 ring-1 ring-red-500/15 dark:text-red-300">
                                            <span className="truncate">İptal nedeni</span>
                                        </span>
                                        <p className="mt-1.5 line-clamp-2 text-xs font-semibold text-[var(--qresto-muted)]">
                                            {reason}
                                        </p>
                                    </div>

                                    <div className="text-xs font-bold text-[var(--qresto-muted)]">
                                        <p className="inline-flex items-center gap-1.5 font-black text-[var(--qresto-text)]">
                                            <CalendarClock size={14} className="text-[var(--qresto-primary)]" />
                                            {formatCancelledDate(cancelledAt)} - {formatOrderClock(cancelledAt)}
                                        </p>
                                        <p className="mt-1 inline-flex items-center gap-1.5 text-red-600 dark:text-red-300">
                                            <Clock3 size={13} />
                                            {formatRelativeTr(cancelledAt)}
                                        </p>
                                    </div>

                                </article>
                            );
                        })}
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <ArchiveX size={34} className="mx-auto text-[var(--qresto-muted)]" />
                            <p className="mt-3 text-sm font-black text-[var(--qresto-text)]">
                                Filtrelere uygun iptal siparişi bulunamadı.
                            </p>
                        </div>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-sm font-bold text-[var(--qresto-muted)]">
                        <span>{filteredOrders.length} iptal siparişi gösteriliyor</span>
                        <span>Toplam kayıt: {sortedOrders.length}</span>
                    </div>
                </section>
            ) : null}

        </div>
    );
}
