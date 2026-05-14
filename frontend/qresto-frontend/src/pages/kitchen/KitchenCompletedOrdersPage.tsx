import { useEffect, useMemo, useState } from "react";
import {
    ArchiveX,
    BadgeCheck,
    CalendarClock,
    ChevronDown,
    CircleDollarSign,
    ClipboardList,
    Loader2,
    ReceiptText,
    Utensils,
} from "lucide-react";

import { getKitchenCompletedOrders } from "../../services/kitchenService";
import type { OrderResponse } from "../../types/cartTypes";
import {
    formatOrderClock,
    formatRelativeTr,
    summarizeOrderItems,
} from "./kitchenOrderUi";

type CompletedOrderGroup = {
    id: string;
    tableId: number;
    tableName: string;
    tableSessionId: number | null;
    orders: OrderResponse[];
    completedAt: string | null;
    totalAmount: number;
    itemCount: number;
    paidCount: number;
    servedCount: number;
};

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

function formatCompletedDate(iso?: string | null): string {
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

function completionTime(order: OrderResponse): string | null {
    return (
        order.paidAt ||
        order.completedAt ||
        order.servedAt ||
        order.updatedAt ||
        order.createdAt ||
        null
    );
}

function orderSortTime(order: OrderResponse): number {
    return parseBackendDate(completionTime(order))?.getTime() ?? 0;
}

function groupSortTime(group: CompletedOrderGroup): number {
    return parseBackendDate(group.completedAt)?.getTime() ?? 0;
}

function groupCompletedOrders(orders: OrderResponse[]): CompletedOrderGroup[] {
    const groups = new Map<string, OrderResponse[]>();

    for (const order of orders) {
        const key = order.tableSessionId
            ? `session-${order.tableSessionId}`
            : `table-${order.tableId}`;
        const group = groups.get(key) ?? [];
        group.push(order);
        groups.set(key, group);
    }

    return [...groups.entries()]
        .map(([id, groupOrders]) => {
            const sorted = [...groupOrders].sort((a, b) => orderSortTime(b) - orderSortTime(a));
            const first = sorted[0];
            const completedAt = sorted
                .map(completionTime)
                .filter(Boolean)
                .sort((a, b) => (parseBackendDate(b)?.getTime() ?? 0) - (parseBackendDate(a)?.getTime() ?? 0))[0] ?? null;

            return {
                id,
                tableId: first.tableId,
                tableName: first.tableName || `Masa #${first.tableId}`,
                tableSessionId: first.tableSessionId ?? null,
                orders: sorted,
                completedAt,
                totalAmount: sorted.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0),
                itemCount: sorted.reduce(
                    (sum, order) =>
                        sum + (order.items ?? []).reduce((lineSum, item) => lineSum + (item.quantity ?? 0), 0),
                    0
                ),
                paidCount: sorted.filter((order) => order.status === "PAID" || order.status === "COMPLETED").length,
                servedCount: sorted.filter((order) => order.status === "SERVED").length,
            };
        })
        .sort((a, b) => groupSortTime(b) - groupSortTime(a));
}

export default function KitchenCompletedOrdersPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadCompletedOrders() {
            try {
                setError(null);
                const data = await getKitchenCompletedOrders();

                if (!cancelled) {
                    setOrders(data);
                }
            } catch (e) {
                console.error(e);

                if (!cancelled) {
                    setError("Tamamlanmış siparişler yüklenemedi.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadCompletedOrders();

        return () => {
            cancelled = true;
        };
    }, []);

    const groups = useMemo(() => groupCompletedOrders(orders), [orders]);

    const paidTotal = useMemo(
        () => groups.reduce((sum, group) => sum + group.totalAmount, 0),
        [groups]
    );

    const itemTotal = useMemo(
        () => groups.reduce((sum, group) => sum + group.itemCount, 0),
        [groups]
    );

    const servedTableCount = useMemo(
        () => groups.filter((group) => group.servedCount > 0).length,
        [groups]
    );

    return (
        <div className="space-y-5">
            <section className="grid gap-4 xl:grid-cols-4">
                <article className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-[var(--qresto-surface)] to-[var(--qresto-surface)] p-5 shadow-[0_10px_30px_rgba(16,185,129,0.10)]">
                    <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                            <BadgeCheck size={25} />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[var(--qresto-text)]">
                                Tamamlanmış Masalar
                            </p>
                            <p className="mt-1 text-3xl font-black text-emerald-600">
                                {loading ? "..." : groups.length}
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-[var(--qresto-muted)]">
                                Masa hesabı bazında
                            </p>
                        </div>
                    </div>
                </article>

                <article className="overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[var(--qresto-surface)] to-[var(--qresto-surface)] p-5 shadow-[0_10px_30px_rgba(249,115,22,0.10)]">
                    <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-[var(--qresto-primary)]">
                            <CircleDollarSign size={25} />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[var(--qresto-text)]">
                                Ödeme Alınan
                            </p>
                            <p className="mt-1 text-3xl font-black text-[var(--qresto-text)]">
                                {safeMoney(paidTotal)}
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-[var(--qresto-muted)]">
                                Toplam hesap
                            </p>
                        </div>
                    </div>
                </article>

                <article className="overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-[var(--qresto-surface)] to-[var(--qresto-surface)] p-5 shadow-[0_10px_30px_rgba(37,99,235,0.10)]">
                    <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                            <Utensils size={25} />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[var(--qresto-text)]">
                                Servis Edilen
                            </p>
                            <p className="mt-1 text-3xl font-black text-blue-600">
                                {servedTableCount}
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-[var(--qresto-muted)]">
                                Masa kaydı
                            </p>
                        </div>
                    </div>
                </article>

                <article className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-[var(--qresto-surface)] to-[var(--qresto-surface)] p-5 shadow-[0_10px_30px_rgba(124,58,237,0.10)]">
                    <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
                            <ClipboardList size={25} />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[var(--qresto-text)]">
                                Ürün Toplamı
                            </p>
                            <p className="mt-1 text-3xl font-black text-violet-600">
                                {itemTotal}
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-[var(--qresto-muted)]">
                                Tüm siparişler
                            </p>
                        </div>
                    </div>
                </article>
            </section>

            {error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-600">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="flex items-center justify-center gap-2 rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-6 py-12 text-sm font-bold text-[var(--qresto-muted)]">
                    <Loader2 size={18} className="animate-spin text-[var(--qresto-primary)]" />
                    Tamamlanmış siparişler yükleniyor...
                </div>
            ) : null}

            {!loading && !error && groups.length === 0 ? (
                <div className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-6 py-12 text-center">
                    <ArchiveX size={34} className="mx-auto text-[var(--qresto-muted)]" />
                    <p className="mt-3 text-sm font-black text-[var(--qresto-text)]">
                        Henüz tamamlanmış sipariş yok.
                    </p>
                </div>
            ) : null}

            {!loading && !error && groups.length > 0 ? (
                <section className="space-y-3">
                    {groups.map((group) => {
                        const expanded = expandedGroupId === group.id;

                        return (
                            <article
                                key={group.id}
                                className={`overflow-hidden rounded-2xl border shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition ${
                                    expanded
                                        ? "border-emerald-500/35 bg-emerald-500/5 ring-4 ring-emerald-500/10"
                                        : "border-[var(--qresto-border)] bg-[var(--qresto-surface)] hover:border-emerald-500/25"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setExpandedGroupId(expanded ? null : group.id)}
                                    className="grid w-full gap-3 border-0 bg-gradient-to-r from-emerald-500/[0.08] via-[var(--qresto-surface)] to-orange-500/[0.06] px-5 py-4 text-left transition hover:from-emerald-500/[0.12] hover:to-orange-500/[0.10] md:grid-cols-[minmax(180px,1.2fr)_minmax(120px,0.75fr)_minmax(120px,0.75fr)_minmax(120px,0.75fr)_auto] md:items-center"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                            <BadgeCheck size={20} />
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="truncate text-base font-black text-[var(--qresto-text)]">
                                                {group.tableName}
                                            </h3>
                                            <p className="mt-0.5 truncate text-xs font-bold text-[var(--qresto-muted)]">
                                                {group.orders.length} sipariş
                                            </p>
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="flex items-center gap-2 text-xs font-bold text-[var(--qresto-muted)]">
                                            <CalendarClock size={14} />
                                            Tamamlanma
                                        </p>
                                        <p className="mt-0.5 truncate text-sm font-black text-[var(--qresto-text)]">
                                            {formatCompletedDate(group.completedAt)} · {formatOrderClock(group.completedAt)}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="flex items-center gap-2 text-xs font-bold text-[var(--qresto-muted)]">
                                            <ReceiptText size={14} />
                                            İçerik
                                        </p>
                                        <p className="mt-0.5 truncate text-sm font-black text-[var(--qresto-text)]">
                                            {group.itemCount} ürün
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="flex items-center gap-2 text-xs font-bold text-[var(--qresto-muted)]">
                                            <CircleDollarSign size={14} />
                                            Toplam
                                        </p>
                                        <p className="mt-0.5 truncate text-sm font-black text-[var(--qresto-primary)]">
                                            {safeMoney(group.totalAmount)}
                                        </p>
                                    </div>

                                    <span className="flex h-9 w-9 items-center justify-center justify-self-end rounded-xl bg-[var(--qresto-bg)] text-emerald-600 ring-1 ring-emerald-500/15">
                                        <ChevronDown
                                            size={18}
                                            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                                        />
                                    </span>
                                </button>

                                {expanded ? (
                                    <div className="border-t border-emerald-500/15 bg-gradient-to-br from-[var(--qresto-bg)] via-emerald-500/[0.04] to-orange-500/[0.05] px-5 py-4">
                                        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-black">
                                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700">
                                                {group.paidCount} ödenen sipariş
                                            </span>
                                            {group.servedCount > 0 ? (
                                                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-700">
                                                    {group.servedCount} servis edilen sipariş
                                                </span>
                                            ) : null}
                                            <span className="rounded-full bg-[var(--qresto-surface)] px-3 py-1 text-[var(--qresto-muted)]">
                                                {formatRelativeTr(group.completedAt)}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {group.orders.map((order) => (
                                                <section
                                                    key={order.id}
                                                    className="rounded-2xl border border-emerald-500/15 bg-[var(--qresto-surface)] p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-black text-[var(--qresto-text)]">
                                                                #{order.orderNo || order.id}
                                                            </p>
                                                            <p className="mt-0.5 text-xs font-bold text-[var(--qresto-muted)]">
                                                                {formatOrderClock(completionTime(order))} · {summarizeOrderItems(order, 80)}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm font-black text-[var(--qresto-primary)]">
                                                            {safeMoney(order.totalAmount)}
                                                        </p>
                                                    </div>

                                                    <ul className="mt-3 grid gap-2 lg:grid-cols-2">
                                                        {(order.items ?? []).map((item, index) => (
                                                            <li
                                                                key={item.id ?? `${item.productId}-${index}`}
                                                                className="rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-3 py-2 text-sm"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className="font-black text-[var(--qresto-text)]">
                                                                            {item.quantity}x {item.productName}
                                                                        </p>
                                                                        {item.note ? (
                                                                            <p className="mt-0.5 text-xs font-semibold text-[var(--qresto-muted)]">
                                                                                Not: {item.note}
                                                                            </p>
                                                                        ) : null}
                                                                    </div>
                                                                    <span className="shrink-0 font-black text-[var(--qresto-text)]">
                                                                        {safeMoney(item.lineTotal)}
                                                                    </span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </section>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </article>
                        );
                    })}
                </section>
            ) : null}
        </div>
    );
}
