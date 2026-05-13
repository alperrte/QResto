import { useEffect, useMemo, useState } from "react";
import {
    ArchiveX,
    CalendarClock,
    CircleDollarSign,
    ClipboardList,
    Loader2,
    MapPin,
    PackageX,
} from "lucide-react";

import { getAdminCancelledOrders } from "../../services/orderService";
import type { OrderItemResponse, OrderResponse } from "../../types/cartTypes";
import {
    formatOrderClock,
    formatRelativeTr,
    itemCountLabel,
    summarizeOrderItems,
} from "./kitchenOrderUi";

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

function safeMoney(value?: number | null): string {
    return `${Number(value ?? 0).toFixed(2)} ₺`;
}

function cancelledSortTime(order: OrderResponse): number {
    return (
        parseBackendDate(order.cancelledAt)?.getTime() ||
        parseBackendDate(order.updatedAt)?.getTime() ||
        parseBackendDate(order.createdAt)?.getTime() ||
        0
    );
}

function cancelledReasonForOrder(order: OrderResponse): string {
    return order.cancelReason?.trim() || "İptal nedeni belirtilmedi.";
}

function cancelledReasonForItem(
    item: OrderItemResponse,
    order: OrderResponse
): string {
    return item.cancelReason?.trim() || order.cancelReason?.trim() || "İptal nedeni belirtilmedi.";
}

export default function KitchenCancelledOrdersPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadCancelledOrders() {
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

        void loadCancelledOrders();

        return () => {
            cancelled = true;
        };
    }, []);

    const sortedOrders = useMemo(
        () => [...orders].sort((a, b) => cancelledSortTime(b) - cancelledSortTime(a)),
        [orders]
    );

    const totalCancelledAmount = useMemo(
        () => sortedOrders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0),
        [sortedOrders]
    );

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[var(--qresto-primary)]">
                            Mutfak kayıtları
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-[var(--qresto-text)] md:text-3xl">
                            İptal Edilen Siparişler
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm font-medium text-[var(--qresto-muted)]">
                            Hangi masanın siparişinin iptal edildiğini, iptal nedenini ve siparişteki ürünleri buradan takip edin.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-red-500/15 bg-red-500/5 px-4 py-3">
                            <p className="text-xs font-bold text-[var(--qresto-muted)]">İptal sayısı</p>
                            <p className="mt-1 text-2xl font-black text-red-600">{sortedOrders.length}</p>
                        </div>
                        <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-4 py-3">
                            <p className="text-xs font-bold text-[var(--qresto-muted)]">İptal tutarı</p>
                            <p className="mt-1 text-2xl font-black text-[var(--qresto-text)]">
                                {safeMoney(totalCancelledAmount)}
                            </p>
                        </div>
                    </div>
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
                <section className="space-y-4">
                    {sortedOrders.map((order) => {
                        const cancelledAt = order.cancelledAt || order.updatedAt || order.createdAt;
                        const reason = cancelledReasonForOrder(order);

                        return (
                            <article
                                key={order.id}
                                className="overflow-hidden rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
                            >
                                <div className="grid gap-4 border-b border-[var(--qresto-border)] bg-red-500/5 px-6 py-5 lg:grid-cols-[1fr_auto] lg:items-start">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                                                <PackageX size={20} />
                                            </span>
                                            <div className="min-w-0">
                                                <h3 className="truncate text-lg font-black text-[var(--qresto-text)]">
                                                    {order.tableName || `Masa #${order.tableId}`}
                                                </h3>
                                                <p className="mt-0.5 text-xs font-bold text-[var(--qresto-muted)]">
                                                    #{order.orderNo || order.id}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-2xl border border-red-500/15 bg-red-500/10 px-4 py-3">
                                            <p className="text-xs font-black uppercase tracking-wide text-red-600">
                                                İptal nedeni
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-[var(--qresto-text)]">
                                                {reason}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-sm sm:grid-cols-2 lg:min-w-80 lg:grid-cols-1">
                                        <div className="flex items-center gap-2 rounded-2xl bg-[var(--qresto-surface)] px-4 py-3">
                                            <CalendarClock size={18} className="text-[var(--qresto-primary)]" />
                                            <div>
                                                <p className="text-xs font-bold text-[var(--qresto-muted)]">
                                                    İptal zamanı
                                                </p>
                                                <p className="font-black text-[var(--qresto-text)]">
                                                    {formatCancelledDate(cancelledAt)} - {formatOrderClock(cancelledAt)}
                                                </p>
                                                <p className="text-xs font-bold text-[var(--qresto-muted)]">
                                                    {formatRelativeTr(cancelledAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 rounded-2xl bg-[var(--qresto-surface)] px-4 py-3">
                                            <CircleDollarSign size={18} className="text-[var(--qresto-primary)]" />
                                            <div>
                                                <p className="text-xs font-bold text-[var(--qresto-muted)]">
                                                    Sipariş tutarı
                                                </p>
                                                <p className="font-black text-[var(--qresto-text)]">
                                                    {safeMoney(order.totalAmount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-5 px-6 py-5 lg:grid-cols-[1.2fr_1fr]">
                                    <div>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs font-black uppercase tracking-wide text-[var(--qresto-primary)]">
                                                İptal edilen ürünler
                                            </p>
                                            <span className="rounded-full bg-[var(--qresto-bg)] px-3 py-1 text-xs font-black text-[var(--qresto-text)]">
                                                {itemCountLabel(order)}
                                            </span>
                                        </div>

                                        <ul className="mt-3 space-y-3">
                                            {(order.items ?? []).map((item, index) => (
                                                <li
                                                    key={item.id ?? `${item.productId}-${index}`}
                                                    className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="font-black text-[var(--qresto-text)]">
                                                                {item.quantity}x {item.productName}
                                                            </p>
                                                            <p className="mt-1 text-xs font-bold text-[var(--qresto-muted)]">
                                                                Ürün iptal nedeni: {cancelledReasonForItem(item, order)}
                                                            </p>
                                                        </div>
                                                        <p className="shrink-0 text-sm font-black text-red-600">
                                                            {safeMoney(item.lineTotal)}
                                                        </p>
                                                    </div>

                                                    {item.note ? (
                                                        <p className="mt-2 rounded-xl bg-[var(--qresto-surface)] px-3 py-2 text-xs font-semibold text-[var(--qresto-muted)]">
                                                            Not: {item.note}
                                                        </p>
                                                    ) : null}

                                                    {item.addedIngredients ? (
                                                        <p className="mt-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700">
                                                            Eklenen: {item.addedIngredients}
                                                        </p>
                                                    ) : null}

                                                    {item.removedIngredients ? (
                                                        <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600">
                                                            Çıkarılan: {item.removedIngredients}
                                                        </p>
                                                    ) : null}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                                        <p className="text-xs font-black uppercase tracking-wide text-[var(--qresto-primary)]">
                                            Sipariş özeti
                                        </p>

                                        <div className="mt-4 space-y-3 text-sm">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="inline-flex items-center gap-2 font-bold text-[var(--qresto-muted)]">
                                                    <MapPin size={16} />
                                                    Masa
                                                </span>
                                                <span className="font-black text-[var(--qresto-text)]">
                                                    {order.tableName || `Masa #${order.tableId}`}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <span className="inline-flex items-center gap-2 font-bold text-[var(--qresto-muted)]">
                                                    <ClipboardList size={16} />
                                                    İçerik
                                                </span>
                                                <span className="text-right font-black text-[var(--qresto-text)]">
                                                    {summarizeOrderItems(order, 48)}
                                                </span>
                                            </div>

                                            <div className="border-t border-[var(--qresto-border)] pt-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="font-bold text-[var(--qresto-muted)]">
                                                        Ara toplam
                                                    </span>
                                                    <span className="font-black text-[var(--qresto-text)]">
                                                        {safeMoney(order.subtotalAmount)}
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[var(--qresto-surface)] px-3 py-2">
                                                    <span className="font-black text-[var(--qresto-text)]">
                                                        İptal edilen toplam
                                                    </span>
                                                    <span className="font-black text-red-600">
                                                        {safeMoney(order.totalAmount)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </section>
            ) : null}
        </div>
    );
}
