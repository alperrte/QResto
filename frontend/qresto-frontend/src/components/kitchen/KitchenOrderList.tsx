import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
    CheckCircle2,
    ChevronDown,
    Hourglass,
    ImageOff,
    Loader2,
    Search,
    ShoppingCart,
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
    countByStatus,
    statusBadgeConfig,
    summarizeOrderItems,
    type KitchenPipelineStatus,
    type KitchenTab,
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
    showSelectedDetail?: boolean;
    initialTab?: KitchenTab;
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
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (!open) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setReason("");
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
                    placeholder="İptal nedenini yazın"
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

function normalizeSearch(value?: string | number | null): string {
    return String(value ?? "").toLocaleLowerCase("tr-TR").trim();
}

function orderMatchesSearch(order: OrderResponse, query: string): boolean {
    if (!query) {
        return true;
    }

    const searchableText = [
        order.tableName,
        order.tableId,
        order.orderNo,
        order.id,
        ...(order.items ?? []).flatMap((item) => [
            item.productName,
            item.note,
            item.addedIngredients,
            item.removedIngredients,
        ]),
    ]
        .map(normalizeSearch)
        .join(" ");

    return searchableText.includes(query);
}

export default function KitchenOrderList({
                                             orders,
                                             loading,
                                             error,
                                             enableStatusControls,
                                             onMutateSuccess,
                                             listTitle = "Sipariş Listesi",
                                             showSelectedDetail = true,
                                             initialTab = "all",
                                         }: KitchenOrderListProps) {
    const [tab, setTab] = useState<KitchenTab>(initialTab);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [cancelTarget, setCancelTarget] = useState<OrderResponse | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const counts = useMemo(() => countByStatus(orders), [orders]);
    const normalizedSearchQuery = useMemo(
        () => normalizeSearch(searchQuery),
        [searchQuery]
    );

    const visible = useMemo(
        () =>
            filterOrdersForKitchenView(orders, tab, "all").filter((order) =>
                orderMatchesSearch(order, normalizedSearchQuery)
            ),
        [orders, tab, normalizedSearchQuery]
    );

    const selectedOrder = useMemo(
        () => visible.find((order) => order.id === expandedId) ?? null,
        [visible, expandedId]
    );

    const filterTabs = [
        { key: "received", label: "Aktif Siparişler", count: counts.received + counts.preparing },
        { key: "preparing", label: "Hazırlanıyor", count: counts.preparing },
        { key: "ready", label: "Hazır", count: counts.ready },
        { key: "cancelled", label: "İptal Edilen", count: counts.cancelledToday },
        { key: "all", label: "Tümü", count: orders.length },
    ] as const;

    const toggleRow = (id: number) => {
        setExpandedId((currentId) => (currentId === id ? null : id));
    };

    const handleStatusChange = async (
        order: OrderResponse,
        next: KitchenPipelineStatus
    ) => {
        if (order.status === "CANCELLED" || order.status === "READY") {
            return;
        }

        if (next === "PREPARING" && order.status !== "RECEIVED") {
            return;
        }

        if (next === "READY" && order.status !== "PREPARING") {
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
            "inline-flex h-8 min-w-[76px] items-center justify-center gap-1 rounded-xl border px-2 text-[11px] font-black shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60";
        if (tone === "preparing") {
            return active
                ? `${base} border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/25`
                : `${base} border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:border-blue-600 hover:bg-blue-600`;
        }

        if (tone === "ready") {
            return active
                ? `${base} border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25`
                : `${base} border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:border-emerald-600 hover:bg-emerald-600`;
        }

        return `${base} border-[var(--qresto-border)] bg-[var(--qresto-bg)] text-[var(--qresto-text)] hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]`;
    };

    return (
        <section className="overflow-hidden rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 border-b border-[var(--qresto-border)] bg-[var(--qresto-bg)]/45 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl font-black text-[var(--qresto-text)] md:text-2xl">
                        {listTitle}
                    </h2>
                </div>

                <label className="flex w-full items-center gap-3 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-4 py-3 text-sm font-semibold text-[var(--qresto-text)] transition focus-within:border-[var(--qresto-primary)] focus-within:ring-4 focus-within:ring-orange-500/10 md:w-[360px]">
                    <Search size={19} className="shrink-0 text-[var(--qresto-primary)]" />
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Masa ara"
                        className="min-w-0 flex-1 bg-transparent font-bold outline-none placeholder:text-[var(--qresto-muted)]"
                    />
                </label>
            </div>

            <div className="border-b border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-6 py-4">
                <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-1">
                    {filterTabs.map((filter) => {
                        const active = tab === filter.key;

                    return (
                        <button
                            key={filter.key}
                            type="button"
                            onClick={() => setTab(filter.key)}
                            className={`flex min-w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                                filter.key === "all" ? "ml-auto" : ""
                            } ${
                                active
                                    ? "bg-[var(--qresto-surface)] text-[var(--qresto-primary)] shadow-sm"
                                    : "text-[var(--qresto-muted)] hover:bg-[var(--qresto-surface)] hover:text-[var(--qresto-text)]"
                            }`}
                        >
                            <span>{filter.label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                                active
                                    ? "bg-[var(--qresto-primary)] text-white"
                                    : "bg-[var(--qresto-surface)] text-[var(--qresto-muted)]"
                            }`}>
                                {filter.count}
                            </span>
                        </button>
                        );
                    })}
                </div>
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

            <div
                className="grid gap-4 bg-[var(--qresto-bg)]/35 p-4"
            >
            <ul className="space-y-3">
                {visible.map((order) => {
                    const cfg = statusBadgeConfig(order.status);
                    const Icon = cfg.Icon;
                    const expanded = expandedId === order.id;
                    const selected = showSelectedDetail && selectedOrder?.id === order.id;
                    const busy = busyId === order.id;
                    const firstItem = order.items?.[0];
                    const createdDate = orderCreatedDate(order);
                    const showActions =
                        enableStatusControls &&
                        order.status !== "CANCELLED" &&
                        order.status !== "READY";

                    return (
                        <li
                            key={order.id}
                            className={`overflow-hidden rounded-2xl border border-l-4 bg-[var(--qresto-surface)] shadow-[0_8px_22px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] ${
                                expanded || selected
                                    ? "border-orange-500/35 border-l-[var(--qresto-primary)] ring-4 ring-orange-500/10"
                                    : "border-[var(--qresto-border)] border-l-[var(--qresto-primary)]/70"
                            }`}
                        >
                            <div
                                className={`grid cursor-pointer gap-3 bg-gradient-to-r from-orange-500/[0.035] via-transparent to-transparent px-3 py-3 md:px-4 ${
                                    showActions
                                        ? "lg:grid-cols-[auto_minmax(150px,0.9fr)_minmax(220px,1.3fr)_110px_95px_115px_auto_auto] lg:items-center"
                                        : "lg:grid-cols-[auto_minmax(150px,0.9fr)_minmax(220px,1.4fr)_110px_95px_115px_auto] lg:items-center"
                                }`}
                                onClick={() => {
                                    toggleRow(order.id);
                                }}
                            >
                                <ProductImageThumb
                                    imageUrl={firstItem?.productImageUrl}
                                    productName={firstItem?.productName}
                                    fallbackIcon={Icon}
                                    fallbackClassName={cfg.iconWrap}
                                />

                                <div className="min-w-0">
                                    <p className="truncate text-base font-black text-[var(--qresto-text)]">
                                        {order.tableName || `Masa #${order.tableId}`}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs font-bold text-[var(--qresto-muted)]">
                                        #{order.orderNo || order.id}
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-bold text-[var(--qresto-muted)]">
                                        <span className="rounded-full bg-[var(--qresto-bg)] px-2 py-0.5 ring-1 ring-[var(--qresto-border)]">
                                            Masa
                                        </span>
                                        <span className="rounded-full bg-[var(--qresto-bg)] px-2 py-0.5 ring-1 ring-[var(--qresto-border)]">
                                            {itemCountLabel(order)}
                                        </span>
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-black text-[var(--qresto-text)]">
                                        {itemCountLabel(order)}
                                    </p>

                                    <p className="mt-1 line-clamp-2 text-xs font-semibold text-[var(--qresto-muted)]">
                                        {summarizeOrderItems(order)}
                                    </p>
                                </div>

                                <div className="text-sm font-black text-[var(--qresto-primary)] lg:text-left">
                                    {safeMoney(order.totalAmount)}
                                </div>

                                <div className="text-xs font-bold text-[var(--qresto-muted)] lg:text-left">
                                    <p className="font-black text-[var(--qresto-text)]">
                                        {formatOrderClock(createdDate)}
                                    </p>

                                    <p className="mt-1">
                                        {formatRelativeTr(createdDate)}
                                    </p>
                                </div>

                                <div className="lg:text-left">
        <span
            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-black tracking-wide ${cfg.className}`}
        >
            {cfg.label}
        </span>
                                </div>

                                {showActions ? (
                                    <div
                                        className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-1.5"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={busy || order.status !== "RECEIVED"}
                                                onClick={() => void handleStatusChange(order, "PREPARING")}
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
                                                disabled={busy || order.status !== "PREPARING"}
                                                onClick={() => void handleStatusChange(order, "READY")}
                                                className={statusActionClass(false, "ready")}
                                            >
                                                <CheckCircle2 size={14} />
                                                Hazır
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={busy || order.status === "CANCELLED" || order.status === "READY"}
                                            onClick={() => setCancelTarget(order)}
                                            className="inline-flex h-8 min-w-[82px] items-center justify-center gap-1.5 rounded-xl border border-red-500 bg-red-500 px-3 text-xs font-black text-white shadow-lg shadow-red-500/20 transition hover:border-red-600 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <XCircle size={14} />
                                            İptal et
                                        </button>
                                    </div>
                                ) : null}

                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        toggleRow(order.id);
                                    }}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] text-[var(--qresto-muted)] transition hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)]"
                                    aria-label={expanded ? "Detayı kapat" : "Detayı aç"}
                                >
                                    <ChevronDown
                                        size={18}
                                        className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                                    />
                                </button>
                            </div>

                            {!showSelectedDetail && expanded ? (
                                <div className="border-t border-[var(--qresto-border)] bg-[var(--qresto-bg)]/70 px-4 py-4 md:px-6">
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
                                                className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-4 text-sm shadow-[0_6px_18px_rgba(15,23,42,0.04)]"
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
                                                            <p className="mt-2 rounded-xl bg-sky-500/10 px-3 py-2 text-xs font-black text-sky-950 ring-1 ring-sky-500/25 dark:text-sky-200">
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

                                </div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>

            {showSelectedDetail && selectedOrder ? (
            <div
                className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4"
                onClick={() => setExpandedId(null)}
            >
            <aside
                className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-4 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-[var(--qresto-text)]">
                        Seçili Sipariş Detayı
                    </h3>
                    <button
                        type="button"
                        onClick={() => setExpandedId(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--qresto-bg)] text-[var(--qresto-muted)] transition hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)]"
                        aria-label="Detayı kapat"
                    >
                        <XCircle size={18} />
                    </button>
                </div>

                    <div className="mt-4 space-y-4">
                        {(() => {
                            const cfg = statusBadgeConfig(selectedOrder.status);
                            const createdDate = orderCreatedDate(selectedOrder);
                            const progressIndex = selectedOrder.status === "READY"
                                ? 3
                                : selectedOrder.status === "PREPARING"
                                    ? 2
                                    : selectedOrder.status === "RECEIVED"
                                        ? 1
                                        : 0;
                            const progressSteps = [
                                { number: 1, label: "Alındı" },
                                { number: 2, label: "Hazırlanıyor" },
                                { number: 3, label: "Hazır" },
                            ] as const;

                            return (
                                <>
                                    <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                                        <div className="flex items-start gap-3">
                                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${cfg.iconWrap}`}>
                                                <ShoppingCart size={20} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-base font-black text-[var(--qresto-text)]">
                                                            {selectedOrder.tableName || `Masa #${selectedOrder.tableId}`}
                                                        </p>
                                                        <p className="mt-0.5 truncate text-xs font-bold text-[var(--qresto-muted)]">
                                                            #{selectedOrder.orderNo || selectedOrder.id}
                                                        </p>
                                                    </div>
                                                    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${cfg.className}`}>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-xs font-bold text-[var(--qresto-muted)]">
                                                    {formatRelativeTr(createdDate)} · {formatOrderClock(createdDate)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[var(--qresto-border)] p-4">
                                        <p className="text-xs font-black uppercase tracking-wide text-[var(--qresto-primary)]">
                                            Sipariş Süreci
                                        </p>

                                        <div className="mt-4 flex items-start">
                                            {progressSteps.map((step, index) => {
                                                const complete = progressIndex >= step.number;
                                                const isLast = index === progressSteps.length - 1;

                                                return (
                                                    <div
                                                        key={step.number}
                                                        className="flex flex-1 items-start"
                                                    >
                                                        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                                                            <span
                                                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition ${
                                                                    complete
                                                                        ? "bg-[var(--qresto-primary)] text-white shadow-[0_8px_18px_rgba(249,115,22,0.22)]"
                                                                        : "bg-[var(--qresto-bg)] text-[var(--qresto-muted)] ring-1 ring-[var(--qresto-border)]"
                                                                }`}
                                                            >
                                                                {complete ? (
                                                                    <CheckCircle2 size={17} />
                                                                ) : (
                                                                    step.number
                                                                )}
                                                            </span>
                                                            <span
                                                                className={`mt-2 text-[11px] font-black ${
                                                                    complete
                                                                        ? "text-[var(--qresto-text)]"
                                                                        : "text-[var(--qresto-muted)]"
                                                                }`}
                                                            >
                                                                {step.label}
                                                            </span>
                                                        </div>

                                                        {!isLast ? (
                                                            <span
                                                                className={`mt-4 h-0.5 flex-1 rounded-full ${
                                                                    progressIndex > step.number
                                                                        ? "bg-[var(--qresto-primary)]"
                                                                        : "bg-[var(--qresto-border)]"
                                                                }`}
                                                            />
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {selectedOrder.status === "CANCELLED" ? (
                                            <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600">
                                                Bu sipariş iptal edildiği için hazırlık süreci durduruldu.
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="rounded-2xl border border-[var(--qresto-border)] p-4">
                                        <p className="text-xs font-black uppercase tracking-wide text-[var(--qresto-primary)]">
                                            Sipariş İçeriği
                                        </p>
                                        <ul className="mt-3 space-y-3">
                                            {(selectedOrder.items ?? []).map((line, index) => (
                                                <li
                                                    key={lineKey(line, index)}
                                                    className="flex items-start justify-between gap-3 text-sm"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="font-black text-[var(--qresto-text)]">
                                                            {line.quantity}x {line.productName}
                                                        </p>
                                                        {line.addedIngredients ? (
                                                            <p className="mt-0.5 text-xs font-semibold text-[var(--qresto-muted)]">
                                                                {line.addedIngredients}
                                                            </p>
                                                        ) : null}
                                                        {line.note ? (
                                                            <p className="mt-0.5 text-xs font-semibold text-[var(--qresto-muted)]">
                                                                Not: {line.note}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    <span className="shrink-0 font-black text-[var(--qresto-primary)]">
                                                        {safeMoney(line.lineTotal)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl bg-[var(--qresto-bg)] px-4 py-3">
                                            <p className="text-xs font-bold text-[var(--qresto-muted)]">Ürün</p>
                                            <p className="mt-1 font-black text-[var(--qresto-text)]">
                                                {itemCountLabel(selectedOrder)}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-[var(--qresto-bg)] px-4 py-3">
                                            <p className="text-xs font-bold text-[var(--qresto-muted)]">Toplam</p>
                                            <p className="mt-1 font-black text-[var(--qresto-primary)]">
                                                {safeMoney(selectedOrder.totalAmount)}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                

            </aside>
            </div>
            ) : null}
            </div>

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
