import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Hourglass,
    ImageOff,
    Loader2,
    XCircle,
} from "lucide-react";

import {
    cancelKitchenOrder,
    updateKitchenOrderStatus,
} from "../../services/kitchenService";

import type { OrderItemResponse, OrderResponse } from "../../types/cartTypes";

import {
    filterOrdersForKitchenView,
    formatOrderClock,
    formatRelativeTr,
    itemCountLabel,
    statusBadgeConfig,
    summarizeOrderItems,
    tabLabel,
    type KitchenPipelineStatus,
    type KitchenTab,
    uniqueTableNames,
} from "../../pages/kitchen/kitchenOrderUi";

const MENU_SERVICE_BASE_URL =
    (import.meta.env.VITE_MENU_SERVICE_URL || "http://localhost:7073").replace(/\/api\/?$/, "");

function resolveProductImageUrl(imageUrl?: string | null): string | null {
    if (!imageUrl) {
        return null;
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
        return `${MENU_SERVICE_BASE_URL}${imageUrl}`;
    }

    return `${MENU_SERVICE_BASE_URL}/${imageUrl}`;
}

type KitchenOrderListProps = {
    orders: OrderResponse[];
    loading: boolean;
    error: string | null;
    enableStatusControls: boolean;
    onMutateSuccess: () => void | Promise<void>;
    listTitle?: string;
    dateKey: string;
    onDateChange: (iso: string) => void;
};

type ProductImageThumbProps = {
    imageUrl?: string | null;
    productName?: string | null;
    fallbackIcon?: ComponentType<{ size?: number; className?: string }>;
    fallbackClassName?: string;
    size?: "sm" | "md";
};

function ProductImageThumb({
                               imageUrl,
                               productName,
                               fallbackIcon: FallbackIcon = ImageOff,
                               fallbackClassName = "bg-[var(--qresto-hover)] text-[var(--qresto-primary)]",
                               size = "sm",
                           }: ProductImageThumbProps) {
    const [failed, setFailed] = useState(false);
    const resolvedUrl = resolveProductImageUrl(imageUrl);

    useEffect(() => {
        setFailed(false);
    }, [imageUrl]);

    const sizeClass = size === "md" ? "h-16 w-16" : "h-12 w-12";

    if (!resolvedUrl || failed) {
        return (
            <div
                className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl ${fallbackClassName}`}
            >
                <FallbackIcon size={size === "md" ? 24 : 20} />
            </div>
        );
    }

    return (
        <div
            className={`${sizeClass} shrink-0 overflow-hidden rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-hover)]`}
        >
            <img
                src={resolvedUrl}
                alt={productName || "Ürün görseli"}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => setFailed(true)}
            />
        </div>
    );
}

function CancelOrderModal({
                              open,
                              onClose,
                              onConfirm,
                              busy,
                              instanceKey,
                          }: {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    busy: boolean;
    instanceKey: string;
}) {
    const [reason, setReason] = useState("Mutfak iptali");

    useEffect(() => {
        if (!open) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setReason("Mutfak iptali");
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [open, instanceKey]);

    if (!open) {
        return null;
    }

    return (
        <div
            key={instanceKey}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
        >
            <div className="w-full max-w-md rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-2xl">
                <h3 className="text-lg font-black text-[var(--qresto-text)]">
                    Siparişi iptal et
                </h3>

                <p className="mt-2 text-sm font-medium text-[var(--qresto-muted)]">
                    İptal nedeni zorunludur. Bu bilgi operasyon kaydı için saklanır.
                </p>

                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="mt-4 w-full resize-none rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-4 py-3 text-sm font-medium text-[var(--qresto-text)] outline-none transition focus:border-[var(--qresto-primary)] focus:ring-4 focus:ring-orange-500/10"
                />

                <div className="mt-5 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="flex-1 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] py-2.5 text-sm font-black text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)] disabled:opacity-50"
                    >
                        Vazgeç
                    </button>

                    <button
                        type="button"
                        disabled={busy || !reason.trim()}
                        onClick={() => onConfirm(reason.trim())}
                        className="flex-1 rounded-2xl bg-red-600 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                        {busy ? "İptal ediliyor…" : "İptal et"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function orderCreatedDate(order: OrderResponse): string | null {
    return (
        order.receivedAt ||
        order.createdAt ||
        order.updatedAt ||
        null
    );
}

function safeMoney(value?: number | null): string {
    return `${Number(value ?? 0).toFixed(2)} ₺`;
}

function lineKey(line: OrderItemResponse, index: number): string {
    return String(line.id ?? `${line.productId}-${index}`);
}

export default function KitchenOrderList({
                                             orders,
                                             loading,
                                             error,
                                             enableStatusControls,
                                             onMutateSuccess,
                                             listTitle = "Sipariş Listesi",
                                             dateKey,
                                             onDateChange,
                                         }: KitchenOrderListProps) {
    const [tab, setTab] = useState<KitchenTab>("all");
    const [tableFilter, setTableFilter] = useState<string>("all");
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [cancelTarget, setCancelTarget] = useState<OrderResponse | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const tables = useMemo(() => uniqueTableNames(orders), [orders]);

    const visible = useMemo(
        () => filterOrdersForKitchenView(orders, tab, tableFilter, dateKey),
        [orders, tab, tableFilter, dateKey]
    );

    const toggleRow = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleStatusChange = async (
        order: OrderResponse,
        next: KitchenPipelineStatus
    ) => {
        if (order.status === "CANCELLED") {
            return;
        }

        setBusyId(order.id);

        try {
            await updateKitchenOrderStatus(order.id, next);
            await onMutateSuccess();
        } catch (e) {
            console.error(e);
            alert("Durum güncellenemedi.");
        } finally {
            setBusyId(null);
        }
    };

    const handleCancelConfirm = async (reason: string) => {
        if (!cancelTarget) {
            return;
        }

        setBusyId(cancelTarget.id);

        try {
            await cancelKitchenOrder(cancelTarget.id, reason);
            setCancelTarget(null);
            await onMutateSuccess();
        } catch (e) {
            console.error(e);
            alert("Sipariş iptal edilemedi.");
        } finally {
            setBusyId(null);
        }
    };

    const statusActionClass = (active: boolean, tone: "preparing" | "ready") => {
        const base =
            "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60";

        if (active && tone === "preparing") {
            return `${base} border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-300`;
        }

        if (active && tone === "ready") {
            return `${base} border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300`;
        }

        return `${base} border-[var(--qresto-border)] bg-[var(--qresto-bg)] text-[var(--qresto-text)] hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]`;
    };

    return (
        <section className="overflow-hidden rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 border-b border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl font-black text-[var(--qresto-text)]">
                        {listTitle}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-[var(--qresto-muted)]">
                        Gelen siparişleri takip edin, durumu güncelleyin ve ürün detaylarını görüntüleyin.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-3 py-2 text-sm font-semibold text-[var(--qresto-text)] transition focus-within:border-[var(--qresto-primary)] focus-within:ring-4 focus-within:ring-orange-500/10">
                        <CalendarDays size={18} className="text-[var(--qresto-primary)]" />
                        <input
                            type="date"
                            value={dateKey}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="bg-transparent font-medium outline-none"
                        />
                    </label>

                    <div className="relative">
                        <select
                            value={tableFilter}
                            onChange={(e) => setTableFilter(e.target.value)}
                            className="appearance-none rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] py-2.5 pl-4 pr-10 text-sm font-bold text-[var(--qresto-text)] outline-none transition focus:border-[var(--qresto-primary)] focus:ring-4 focus:ring-orange-500/10"
                        >
                            <option value="all">Tüm Masalar</option>
                            {tables.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>

                        <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--qresto-muted)]"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto border-b border-[var(--qresto-border)] px-6">
                {(["all", "preparing", "ready", "cancelled"] as const).map((t) => {
                    const active = tab === t;

                    return (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`relative whitespace-nowrap pb-3 pt-3 text-sm font-black transition-colors ${
                                active
                                    ? "text-[var(--qresto-primary)]"
                                    : "text-[var(--qresto-muted)] hover:text-[var(--qresto-text)]"
                            }`}
                        >
                            {tabLabel(t)}
                            {active ? (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--qresto-primary)]" />
                            ) : null}
                        </button>
                    );
                })}
            </div>

            {error ? (
                <p className="px-6 py-8 text-center text-sm font-bold text-red-600">
                    {error}
                </p>
            ) : null}

            {!error && loading && orders.length === 0 ? (
                <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm font-bold text-[var(--qresto-muted)]">
                    <Loader2 size={18} className="animate-spin text-[var(--qresto-primary)]" />
                    Siparişler yükleniyor…
                </div>
            ) : null}

            {!error && !loading && visible.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm font-bold text-[var(--qresto-muted)]">
                    Bu filtrede gösterilecek sipariş yok.
                </p>
            ) : null}

            <ul className="divide-y divide-[var(--qresto-border)]">
                {visible.map((order) => {
                    const cfg = statusBadgeConfig(order.status);
                    const Icon = cfg.Icon;
                    const expanded = expandedId === order.id;
                    const busy = busyId === order.id;
                    const firstItem = order.items?.[0];
                    const createdDate = orderCreatedDate(order);

                    return (
                        <li
                            key={order.id}
                            className="bg-[var(--qresto-surface)] transition-colors hover:bg-[var(--qresto-hover)]/45"
                        >
                            <div className="flex items-stretch gap-3 px-4 py-4 md:px-6">
                                <button
                                    type="button"
                                    aria-expanded={expanded}
                                    aria-label={expanded ? "Detayı gizle" : "Detayı göster"}
                                    onClick={() => toggleRow(order.id)}
                                    className="flex w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-[var(--qresto-muted)] transition hover:border-[var(--qresto-border)] hover:bg-[var(--qresto-surface)] hover:text-[var(--qresto-primary)]"
                                >
                                    <ChevronRight
                                        size={20}
                                        className={`transition-transform duration-200 ${
                                            expanded ? "rotate-90" : ""
                                        }`}
                                    />
                                </button>

                                <ProductImageThumb
                                    imageUrl={firstItem?.productImageUrl}
                                    productName={firstItem?.productName}
                                    fallbackIcon={Icon}
                                    fallbackClassName={cfg.iconWrap}
                                />

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-base font-black text-[var(--qresto-text)]">
                                                {order.tableName || `Masa #${order.tableId}`}
                                            </p>

                                            <p className="mt-0.5 truncate text-xs font-bold text-[var(--qresto-muted)]">
                                                #{order.orderNo || order.id}
                                            </p>
                                        </div>

                                        <span
                                            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-black tracking-wide ${cfg.className}`}
                                        >
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-sm font-black text-[var(--qresto-text)]">
                                            {itemCountLabel(order)}
                                        </p>

                                        <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-[var(--qresto-muted)]">
                                            {summarizeOrderItems(order)}
                                        </p>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-[var(--qresto-muted)]">
                                        <span className="rounded-full bg-[var(--qresto-bg)] px-2.5 py-1 text-[var(--qresto-text)]">
                                            {formatOrderClock(createdDate)}
                                        </span>

                                        <span>{formatRelativeTr(createdDate)}</span>

                                        <span className="text-[var(--qresto-primary)]">
                                            Toplam: {safeMoney(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                {enableStatusControls && order.status !== "CANCELLED" ? (
                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        <div className="flex w-36 flex-col gap-2">
                                            <button
                                                type="button"
                                                disabled={busy || order.status === "PREPARING"}
                                                onClick={() =>
                                                    void handleStatusChange(order, "PREPARING")
                                                }
                                                className={statusActionClass(
                                                    order.status === "PREPARING",
                                                    "preparing"
                                                )}
                                            >
                                                <Hourglass size={14} />
                                                Hazırlanıyor
                                            </button>

                                            <button
                                                type="button"
                                                disabled={busy || order.status === "READY"}
                                                onClick={() =>
                                                    void handleStatusChange(order, "READY")
                                                }
                                                className={statusActionClass(
                                                    order.status === "READY",
                                                    "ready"
                                                )}
                                            >
                                                <CheckCircle2 size={14} />
                                                Hazır
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() => setCancelTarget(order)}
                                            className="inline-flex h-9 w-36 items-center justify-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/5 px-3 text-xs font-black text-red-600 transition hover:bg-red-500/10 disabled:opacity-50"
                                        >
                                            <XCircle size={14} />
                                            İptal et
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            {expanded ? (
                                <div className="border-t border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-4 py-4 md:px-10">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-black uppercase tracking-wide text-[var(--qresto-primary)]">
                                            Sipariş detayı
                                        </p>

                                        <p className="text-xs font-bold text-[var(--qresto-muted)]">
                                            {order.items?.length ?? 0} satır ürün
                                        </p>
                                    </div>

                                    <ul className="mt-3 space-y-3">
                                        {(order.items ?? []).map((line, index) => (
                                            <li
                                                key={lineKey(line, index)}
                                                className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-3 text-sm shadow-[0_6px_18px_rgba(15,23,42,0.04)]"
                                            >
                                                <div className="flex gap-3">
                                                    <ProductImageThumb
                                                        imageUrl={line.productImageUrl}
                                                        productName={line.productName}
                                                        fallbackIcon={ImageOff}
                                                        size="md"
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap justify-between gap-2">
                                                            <span className="font-black text-[var(--qresto-text)]">
                                                                {line.quantity}x {line.productName}
                                                            </span>

                                                            <span className="font-black text-[var(--qresto-primary)]">
                                                                {safeMoney(line.lineTotal)}
                                                            </span>
                                                        </div>

                                                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold text-[var(--qresto-muted)]">
                                                            <span>
                                                                Birim: {safeMoney(line.productPrice)}
                                                            </span>

                                                            {line.vatIncluded ? (
                                                                <span>KDV dahil</span>
                                                            ) : null}
                                                        </div>

                                                        {line.note ? (
                                                            <p className="mt-2 rounded-xl bg-[var(--qresto-bg)] px-3 py-2 text-xs font-semibold text-[var(--qresto-muted)]">
                                                                Not: {line.note}
                                                            </p>
                                                        ) : null}

                                                        {line.removedIngredients ? (
                                                            <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600">
                                                                Çıkarılan: {line.removedIngredients}
                                                            </p>
                                                        ) : null}

                                                        {line.addedIngredients ? (
                                                            <p className="mt-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700">
                                                                Eklenen: {line.addedIngredients}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-4 grid gap-2 border-t border-[var(--qresto-border)] pt-4 text-sm md:grid-cols-2">
                                        <div className="rounded-2xl bg-[var(--qresto-surface)] px-4 py-3">
                                            <p className="text-xs font-bold text-[var(--qresto-muted)]">
                                                Ara toplam
                                            </p>
                                            <p className="mt-1 font-black text-[var(--qresto-text)]">
                                                {safeMoney(order.subtotalAmount)}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-[var(--qresto-surface)] px-4 py-3">
                                            <p className="text-xs font-bold text-[var(--qresto-muted)]">
                                                Genel toplam
                                            </p>
                                            <p className="mt-1 font-black text-[var(--qresto-primary)]">
                                                {safeMoney(order.totalAmount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>

            <CancelOrderModal
                open={Boolean(cancelTarget)}
                instanceKey={cancelTarget ? String(cancelTarget.id) : "closed"}
                busy={Boolean(cancelTarget && busyId === cancelTarget.id)}
                onClose={() => setCancelTarget(null)}
                onConfirm={(reason) => void handleCancelConfirm(reason)}
            />
        </section>
    );
}
