import { useMemo, useState } from "react";
import {
    CheckCircle2,
    ChevronRight,
    Hourglass,
    Loader2,
    ShoppingCart,
    XCircle,
} from "lucide-react";

import { useKitchenBoardOrders } from "../../hooks/useKitchenBoardOrders";
import type { OrderResponse } from "../../types/cartTypes";
import {
    countByStatus,
    formatOrderClock,
    formatRelativeTr,
    itemCountLabel,
    sortKitchenOrdersForKitchenView,
    statusBadgeConfig,
    summarizeOrderItems,
    todayIsoDate,
} from "./kitchenOrderUi";

type DashboardOrderFilter = "all" | "preparing" | "ready" | "cancelled";

function filterDashboardOrders(
    orders: OrderResponse[],
    filter: DashboardOrderFilter
): OrderResponse[] {
    if (filter === "all") {
        return sortKitchenOrdersForKitchenView(orders);
    }

    if (filter === "preparing") {
        return sortKitchenOrdersForKitchenView(
            orders.filter((order) => order.status === "PREPARING")
        );
    }

    if (filter === "ready") {
        return sortKitchenOrdersForKitchenView(
            orders.filter((order) => order.status === "READY")
        );
    }

    if (filter === "cancelled") {
        return sortKitchenOrdersForKitchenView(
            orders.filter((order) => order.status === "CANCELLED")
        );
    }

    return sortKitchenOrdersForKitchenView(orders);
}

function orderCreatedDate(order: OrderResponse): string | null {
    return order.receivedAt || order.createdAt || order.updatedAt || null;
}

function safeMoney(value?: number | null): string {
    return `${Number(value ?? 0).toFixed(2)} ₺`;
}

function KitchenDashboardPage() {
    const { orders, loading, error } = useKitchenBoardOrders();
    const [selectedFilter, setSelectedFilter] =
        useState<DashboardOrderFilter>("all");
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    const counts = countByStatus(orders, todayIsoDate());

    const visibleOrders = useMemo(
        () => filterDashboardOrders(orders, selectedFilter),
        [orders, selectedFilter]
    );

    const kitchenCards = [
        {
            title: "Yeni Siparişler",
            value: counts.received,
            description: "Bekleyen yeni sipariş",
            Icon: ShoppingCart,
            tone: "orange",
        },
        {
            title: "Hazırlanıyor",
            value: counts.preparing,
            description: "Hazırlanan sipariş",
            Icon: Hourglass,
            tone: "blue",
        },
        {
            title: "Hazır",
            value: counts.ready,
            description: "Teslime hazır",
            Icon: CheckCircle2,
            tone: "green",
        },
        {
            title: "İptal Edilen",
            value: counts.cancelledToday,
            description: "Bugün iptal edilen",
            Icon: XCircle,
            tone: "purple",
        },
    ] as const;

    const dashboardTabs = [
        { key: "all", label: "Tümü" },
        { key: "preparing", label: "Hazırlanıyor" },
        { key: "ready", label: "Hazır" },
        { key: "cancelled", label: "İptal Edilen" },
    ] as const;

    const toneClass = {
        orange: {
            card: "bg-orange-500/5",
            icon: "bg-orange-500/15 text-orange-600",
        },
        blue: {
            card: "bg-sky-500/5",
            icon: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
        },
        green: {
            card: "bg-emerald-500/5",
            icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
        },
        purple: {
            card: "bg-violet-500/5",
            icon: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
        },
    } as const;

    return (
        <div className="space-y-6">
            {error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-600">
                    {error}
                </div>
            ) : null}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {kitchenCards.map((card) => {
                    const tone = toneClass[card.tone];

                    return (
                        <article
                            key={card.title}
                            className={`rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_8px_22px_rgba(15,23,42,0.07)] transition-transform duration-200 hover:-translate-y-1 ${tone.card}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-black text-[var(--qresto-text)]">
                                        {card.title}
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-[var(--qresto-muted)]">
                                        {card.description}
                                    </p>
                                </div>

                                <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.icon}`}
                                >
                                    <card.Icon size={20} />
                                </span>
                            </div>

                            <p className="mt-4 text-3xl font-black text-[var(--qresto-text)]">
                                {loading ? "..." : card.value}
                            </p>
                        </article>
                    );
                })}
            </section>

            <section className="overflow-hidden rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                <div className="border-b border-[var(--qresto-border)] px-6 py-5">
                    <h2 className="text-xl font-black text-[var(--qresto-text)]">
                        Sipariş Listesi
                    </h2>
                </div>

                <div className="flex gap-6 overflow-x-auto border-b border-[var(--qresto-border)] px-6">
                    {dashboardTabs.map((tab) => {
                        const active = selectedFilter === tab.key;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setSelectedFilter(tab.key)}
                                className={`relative whitespace-nowrap pb-3 pt-3 text-sm font-black transition-colors ${
                                    active
                                        ? "text-[var(--qresto-primary)]"
                                        : "text-[var(--qresto-muted)] hover:text-[var(--qresto-text)]"
                                }`}
                            >
                                {tab.label}

                                {active ? (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--qresto-primary)]" />
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                {loading && orders.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm font-bold text-[var(--qresto-muted)]">
                        <Loader2
                            size={18}
                            className="animate-spin text-[var(--qresto-primary)]"
                        />
                        Siparişler yükleniyor…
                    </div>
                ) : null}

                {!loading && visibleOrders.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm font-bold text-[var(--qresto-muted)]">
                        Bu filtrede gösterilecek sipariş yok.
                    </p>
                ) : null}

                <ul className="divide-y divide-[var(--qresto-border)]">
                    {visibleOrders.map((order) => {
                        const cfg = statusBadgeConfig(order.status);
                        const Icon = cfg.Icon;
                        const createdDate = orderCreatedDate(order);
                        const expanded = expandedOrderId === order.id;

                        return (
                            <li
                                key={order.id}
                                className="bg-[var(--qresto-surface)] transition-colors hover:bg-[var(--qresto-hover)]/45"
                            >
                                <div className="grid grid-cols-[auto_1.2fr_1.4fr_auto_auto_auto] items-center gap-4 px-6 py-4">
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${cfg.iconWrap}`}
                                    >
                                        <Icon size={20} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-base font-black text-[var(--qresto-text)]">
                                            {order.tableName || `Masa #${order.tableId}`}
                                        </p>

                                        <p className="mt-1 truncate text-xs font-bold text-[var(--qresto-muted)]">
                                            #{order.orderNo || order.id}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-[var(--qresto-text)]">
                                            {itemCountLabel(order)}
                                        </p>

                                        <p className="mt-1 line-clamp-2 text-xs font-semibold text-[var(--qresto-muted)]">
                                            {summarizeOrderItems(order)}
                                        </p>
                                    </div>

                                    <span
                                        className={`inline-flex shrink-0 -translate-x-6 items-center justify-center rounded-full px-3 py-1 text-[11px] font-black tracking-wide ${cfg.className}`}
                                    >
                                        {cfg.label}
                                    </span>

                                    <div className="shrink-0 text-right">
                                        <p className="text-xs font-black text-[var(--qresto-text)]">
                                            {formatOrderClock(createdDate)}
                                        </p>

                                        <p className="mt-1 text-[11px] font-bold text-[var(--qresto-muted)]">
                                            {formatRelativeTr(createdDate)}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedOrderId((prev) =>
                                                prev === order.id ? null : order.id
                                            )
                                        }
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--qresto-muted)] transition hover:bg-[var(--qresto-bg)] hover:text-[var(--qresto-primary)]"
                                        aria-label={
                                            expanded
                                                ? "Sipariş detayını gizle"
                                                : "Sipariş detayını göster"
                                        }
                                    >
                                        <ChevronRight
                                            size={20}
                                            className={`transition-transform duration-200 ${
                                                expanded ? "rotate-90" : ""
                                            }`}
                                        />
                                    </button>
                                </div>

                                {expanded ? (
                                    <div className="border-t border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-6 py-5">
                                        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-wide text-[var(--qresto-primary)]">
                                                    Ürün Detayları
                                                </p>

                                                <ul className="mt-3 space-y-3">
                                                    {(order.items ?? []).map((item, index) => (
                                                        <li
                                                            key={
                                                                item.id ??
                                                                `${item.productId}-${index}`
                                                            }
                                                            className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-4"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                    <p className="font-black text-[var(--qresto-text)]">
                                                                        {item.quantity}x{" "}
                                                                        {item.productName}
                                                                    </p>

                                                                    {item.note ? (
                                                                        <p className="mt-1 text-xs font-semibold text-[var(--qresto-muted)]">
                                                                            Not: {item.note}
                                                                        </p>
                                                                    ) : null}
                                                                </div>

                                                                <p className="shrink-0 text-sm font-black text-[var(--qresto-primary)]">
                                                                    {safeMoney(item.lineTotal)}
                                                                </p>
                                                            </div>

                                                            {item.removedIngredients ? (
                                                                <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600">
                                                                    Çıkarılan:{" "}
                                                                    {item.removedIngredients}
                                                                </p>
                                                            ) : null}

                                                            {item.addedIngredients ? (
                                                                <p className="mt-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700">
                                                                    Eklenen:{" "}
                                                                    {item.addedIngredients}
                                                                </p>
                                                            ) : null}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-4">
                                                <p className="text-xs font-black uppercase tracking-wide text-[var(--qresto-primary)]">
                                                    Sipariş Özeti
                                                </p>

                                                <div className="mt-4 space-y-3 text-sm">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="font-bold text-[var(--qresto-muted)]">
                                                            Masa
                                                        </span>
                                                        <span className="font-black text-[var(--qresto-text)]">
                                                            {order.tableName ||
                                                                `Masa #${order.tableId}`}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="font-bold text-[var(--qresto-muted)]">
                                                            Sipariş No
                                                        </span>
                                                        <span className="font-black text-[var(--qresto-text)]">
                                                            #{order.orderNo || order.id}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="font-bold text-[var(--qresto-muted)]">
                                                            Durum
                                                        </span>
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-[11px] font-black ${cfg.className}`}
                                                        >
                                                            {cfg.label}
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

                                                        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[var(--qresto-bg)] px-3 py-2">
                                                            <span className="font-black text-[var(--qresto-text)]">
                                                                Toplam
                                                            </span>
                                                            <span className="font-black text-[var(--qresto-primary)]">
                                                                {safeMoney(order.totalAmount)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
}

export default KitchenDashboardPage;
