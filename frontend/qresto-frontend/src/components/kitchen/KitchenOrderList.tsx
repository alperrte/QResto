import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronRight } from "lucide-react";
import {
    cancelKitchenOrder,
    updateKitchenOrderStatus,
} from "../../services/kitchenService";
import type { OrderResponse } from "../../types/cartTypes";
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
            <div className="w-full max-w-md rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-2xl">
                <h3 className="text-lg font-black text-[var(--qresto-text)]">Siparişi iptal et</h3>
                <p className="mt-2 text-sm text-[var(--qresto-muted)]">
                    İptal nedeni zorunludur; kayıt order servisinde saklanır.
                </p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="mt-4 w-full resize-none rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-3 py-2 text-sm text-[var(--qresto-text)] outline-none focus:border-[var(--qresto-primary)]"
                />
                <div className="mt-4 flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="flex-1 rounded-xl border border-[var(--qresto-border)] py-2.5 text-sm font-bold text-[var(--qresto-text)] disabled:opacity-50"
                    >
                        Vazgeç
                    </button>
                    <button
                        type="button"
                        disabled={busy || !reason.trim()}
                        onClick={() => onConfirm(reason.trim())}
                        className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                    >
                        {busy ? "İptal ediliyor…" : "İptal et"}
                    </button>
                </div>
            </div>
        </div>
    );
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

    const handleStatusChange = async (order: OrderResponse, next: KitchenPipelineStatus) => {
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

    const statusOptionsFor = (order: OrderResponse): { value: KitchenPipelineStatus; label: string }[] => {
        if (order.status === "CANCELLED") {
            return [];
        }
        const opts: { value: KitchenPipelineStatus; label: string }[] = [];
        if (order.status !== "RECEIVED") {
            opts.push({ value: "RECEIVED", label: "Yeni (beklemede)" });
        }
        if (order.status !== "PREPARING") {
            opts.push({ value: "PREPARING", label: "Hazırlanıyor" });
        }
        if (order.status !== "READY") {
            opts.push({ value: "READY", label: "Hazır" });
        }
        return opts;
    };

    return (
        <section className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 border-b border-[var(--qresto-border)] px-6 py-5 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-black text-[var(--qresto-text)]">{listTitle}</h2>

                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-3 py-2 text-sm font-semibold text-[var(--qresto-text)]">
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
                            className="appearance-none rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] py-2.5 pl-4 pr-10 text-sm font-semibold text-[var(--qresto-text)] outline-none focus:border-[var(--qresto-primary)]"
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

            <div className="flex gap-6 border-b border-[var(--qresto-border)] px-6">
                {(["all", "received", "preparing", "ready"] as const).map((t) => {
                    const active = tab === t;
                    return (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`relative pb-3 pt-3 text-sm font-bold transition-colors ${
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
                <p className="px-6 py-8 text-center text-sm font-medium text-red-600">{error}</p>
            ) : null}

            {!error && loading && orders.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm font-medium text-[var(--qresto-muted)]">
                    Siparişler yükleniyor…
                </p>
            ) : null}

            {!error && !loading && visible.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm font-medium text-[var(--qresto-muted)]">
                    Bu filtrede gösterilecek sipariş yok.
                </p>
            ) : null}

            <ul className="divide-y divide-[var(--qresto-border)]">
                {visible.map((order) => {
                    const cfg = statusBadgeConfig(order.status);
                    const Icon = cfg.Icon;
                    const expanded = expandedId === order.id;
                    const busy = busyId === order.id;

                    return (
                        <li key={order.id} className="bg-[var(--qresto-surface)]">
                            <div className="flex items-stretch gap-2 px-4 py-4 md:gap-3 md:px-6">
                                <button
                                    type="button"
                                    aria-expanded={expanded}
                                    aria-label={expanded ? "Detayı gizle" : "Detayı göster"}
                                    onClick={() => toggleRow(order.id)}
                                    className="flex w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-[var(--qresto-muted)] transition hover:border-[var(--qresto-border)] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)]"
                                >
                                    <ChevronRight
                                        size={20}
                                        className={`transition-transform ${expanded ? "rotate-90" : ""}`}
                                    />
                                </button>

                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.iconWrap}`}
                                >
                                    <Icon size={20} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="text-base font-black text-[var(--qresto-text)]">
                                                {order.tableName || `Masa #${order.tableId}`}
                                            </p>
                                            <p className="text-xs font-semibold text-[var(--qresto-muted)]">
                                                #{order.orderNo || order.id}
                                            </p>
                                        </div>
                                        <span
                                            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-black tracking-wide ${cfg.className}`}
                                        >
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm font-bold text-[var(--qresto-text)]">
                                        {itemCountLabel(order)}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-xs font-medium text-[var(--qresto-muted)]">
                                        {summarizeOrderItems(order)}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-[var(--qresto-muted)]">
                                        <span className="text-[var(--qresto-text)]">
                                            {formatOrderClock(order.createdAt)}
                                        </span>
                                        <span>{formatRelativeTr(order.createdAt)}</span>
                                    </div>
                                </div>

                                {enableStatusControls && order.status !== "CANCELLED" ? (
                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        <select
                                            disabled={busy}
                                            value={order.status}
                                            onChange={(e) =>
                                                void handleStatusChange(
                                                    order,
                                                    e.target.value as KitchenPipelineStatus
                                                )
                                            }
                                            className="max-w-[11rem] rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-2 py-2 text-xs font-bold text-[var(--qresto-text)] outline-none focus:border-[var(--qresto-primary)] disabled:opacity-50"
                                        >
                                            <option value={order.status}>
                                                {order.status === "RECEIVED"
                                                    ? "Yeni"
                                                    : order.status === "PREPARING"
                                                      ? "Hazırlanıyor"
                                                      : order.status === "READY"
                                                        ? "Hazır"
                                                        : order.status}
                                            </option>
                                            {statusOptionsFor(order).map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() => setCancelTarget(order)}
                                            className="text-xs font-bold text-red-600 underline-offset-2 hover:underline disabled:opacity-50"
                                        >
                                            İptal et
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            {expanded ? (
                                <div className="border-t border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-4 py-4 md:px-10">
                                    <p className="text-xs font-black uppercase tracking-wide text-[var(--qresto-primary)]">
                                        Sipariş detayı
                                    </p>
                                    <ul className="mt-3 space-y-3">
                                        {order.items.map((line) => (
                                            <li
                                                key={line.id}
                                                className="rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-3 text-sm"
                                            >
                                                <div className="flex flex-wrap justify-between gap-2">
                                                    <span className="font-black text-[var(--qresto-text)]">
                                                        {line.quantity}x {line.productName}
                                                    </span>
                                                    <span className="font-bold text-[var(--qresto-muted)]">
                                                        {Number(line.lineTotal).toFixed(2)} ₺
                                                    </span>
                                                </div>
                                                {line.note ? (
                                                    <p className="mt-1 text-xs text-[var(--qresto-muted)]">
                                                        Not: {line.note}
                                                    </p>
                                                ) : null}
                                                {line.removedIngredients ? (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        Çıkarılan: {line.removedIngredients}
                                                    </p>
                                                ) : null}
                                                {line.addedIngredients ? (
                                                    <p className="mt-1 text-xs text-emerald-700">
                                                        Eklenen: {line.addedIngredients}
                                                    </p>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-[var(--qresto-border)] pt-3 text-sm">
                                        <span className="font-bold text-[var(--qresto-muted)]">Ara toplam</span>
                                        <span className="font-black text-[var(--qresto-text)]">
                                            {Number(order.subtotalAmount).toFixed(2)} ₺
                                        </span>
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
