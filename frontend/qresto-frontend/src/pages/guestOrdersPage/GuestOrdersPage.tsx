import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

import AppHeader from "../../components/layout/AppHeader";
import HeaderIconButton from "../../components/ui/HeaderIconButton";
import { getOrdersByTableSession } from "../../services/orderService";
import type { OrderItemResponse, OrderResponse } from "../../types/cartTypes";
import { formatGuestOrderNo } from "../../utils/formatGuestOrderNo";
import { formatOrderDateTimeTr, parseBackendLocalDateTime } from "../../utils/parseBackendLocalDateTime";

import "./guestOrdersPage.css";

const ORDER_STATUS_TR: Record<string, string> = {
    RECEIVED: "Alındı",
    PREPARING: "Hazırlanıyor",
    READY: "Hazır",
    SERVED: "Servis edildi",
    COMPLETED: "Tamamlandı",
    PAYMENT_PENDING: "Ödeme bekleniyor",
    PAID: "Ödendi",
    CANCELLED: "İptal edildi",
};

const formatPrice = (n: number) => `₺${n.toFixed(2)}`;

type ParsedPaidExtra = { label: string; extraTry: number | null };

const parsePaidIngredientSegment = (segment: string): ParsedPaidExtra => {
    const s = segment.trim();
    if (!s) return { label: "", extraTry: null };
    let m = s.match(/\s+\+₺([\d.]+)$/);
    if (m != null && m.index != null) {
        return { label: s.slice(0, m.index).trim(), extraTry: Number(m[1]) };
    }
    m = s.match(/\s+-₺([\d.]+)$/);
    if (m != null && m.index != null) {
        return { label: s.slice(0, m.index).trim(), extraTry: -Number(m[1]) };
    }
    return { label: s, extraTry: null };
};

const parsePaidIngredientsFromOrderField = (
    raw: string | null | undefined
): ParsedPaidExtra[] => {
    if (!raw?.trim()) return [];
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(parsePaidIngredientSegment)
        .filter((x) => x.label.length > 0);
};

const formatExtraDeltaTry = (n: number | null): string | null => {
    if (n == null || Number.isNaN(n)) return null;
    if (n >= 0) return `+₺${n.toFixed(2)}`;
    return `-₺${Math.abs(n).toFixed(2)}`;
};

/** `addedIngredients` menüden yalnızca ücretli ekleri içerir (virgülle ayrılmış). */
const orderLineHasPaidExtras = (line: OrderItemResponse): boolean =>
    parsePaidIngredientsFromOrderField(line.addedIngredients).length > 0;

const readTableSessionId = (): number | null => {
    const raw =
        sessionStorage.getItem("qresto_table_session_id") ||
        localStorage.getItem("qresto_table_session_id");
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
};

/** Sağda sepet göstermemek için: AppHeader `rightAction` yoksa varsayılan Cart gelir. */
const headerRightSpacer = <span className="inline-block h-10 w-10 shrink-0" aria-hidden />;

const GuestOrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedLineKey, setExpandedLineKey] = useState<string | null>(null);
    const sessionId = readTableSessionId();

    const goToWelcomePaymentChoice = () => {
        navigate("/welcome", { state: { openPayChoice: true } });
    };

    const load = useCallback(async () => {
        if (!sessionId) {
            setLoading(false);
            setOrders([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const list = await getOrdersByTableSession(sessionId);
            const sorted = [...list].sort(
                (a, b) =>
                    parseBackendLocalDateTime(b.createdAt).getTime() -
                    parseBackendLocalDateTime(a.createdAt).getTime()
            );
            setOrders(sorted);
            setExpandedLineKey(null);
        } catch (e) {
            console.error(e);
            setError("Siparişler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div className="app-surface-page min-h-screen font-sans text-body-lg pb-stack-md route-enter-from-right">
            <AppHeader
                className="sticky top-0 z-40 shadow-sm"
                leftAction={
                    <HeaderIconButton
                        icon="arrow_back"
                        label="Karşılama ekranına dön"
                        onClick={() => navigate("/welcome")}
                        className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 flex h-10 w-10 items-center justify-center rounded-full"
                    />
                }
                rightAction={headerRightSpacer}
            />

            <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-container-margin pb-stack-lg pt-10 md:pt-12">
                <header className="flex flex-col gap-2 pb-2">
                    <h1 className="mx-auto text-display-sm font-bold text-on-surface md:text-display-md">
                        Siparişlerim
                    </h1>
                    <p className="mx-auto text-body-sm text-on-surface-variant leading-relaxed">
                        Bu masadaki oturumda verdiğiniz siparişlerin listesi. Sepet
                        burada yer almaz; ürün eklemek için menüyü kullanın.
                    </p>
                </header>

                {sessionId && !loading && !error ? (
                    <section className="mx-auto rounded-3xl border border-transparent bg-[var(--qresto-surface)] p-6 shadow-md ring-1 ring-black/[0.04] dark:border-[var(--qresto-border)] dark:shadow-sm dark:ring-0">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                            <div className="min-w-0 mx-auto">
                                <h2 className="text-title-md font-bold text-on-surface">
                                    Ödeme ve hesap
                                </h2>
                                <p className="mx-auto mt-2 text-body-sm text-on-surface-variant leading-relaxed">
                                    Online ödeme veya hesap iste seçenekleri için karşılama
                                    ekranındaki ödeme adımına yönlendirilirsiniz.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={goToWelcomePaymentChoice}
                                className="flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[var(--qresto-primary)] px-6 py-3.5 font-sans text-label-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:w-auto sm:rounded-full sm:py-3"
                            >
                                <span className="material-symbols-outlined text-[22px]">payments</span>
                                Öde / hesap
                            </button>
                        </div>
                    </section>
                ) : null}

                {!sessionId ? (
                    <section
                        className="rounded-3xl border border-transparent bg-[var(--qresto-surface)] p-6 text-center shadow-md ring-1 ring-black/[0.04] dark:border-[var(--qresto-border)] dark:shadow-sm dark:ring-0"
                        aria-live="polite"
                    >
                        <p className="text-body-sm text-on-surface-variant leading-relaxed">
                            Sipariş geçmişini görmek için önce masanızdaki menüyü açın.
                        </p>
                    </section>
                ) : null}

                {sessionId && loading ? (
                    <p className="py-10 text-center text-body-sm text-on-surface-variant">
                        Yükleniyor…
                    </p>
                ) : null}

                {sessionId && error ? (
                    <section className="flex flex-col items-center gap-4 rounded-3xl border border-transparent bg-[var(--qresto-surface)] p-6 shadow-md ring-1 ring-black/[0.04] dark:border-[var(--qresto-border)] dark:shadow-sm dark:ring-0">
                        <p className="text-center text-body-sm text-on-surface-variant">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={() => void load()}
                            className="rounded-full bg-primary-container px-6 py-2.5 font-sans text-label-bold text-on-primary-container transition-opacity hover:opacity-90"
                        >
                            Tekrar dene
                        </button>
                    </section>
                ) : null}

                {sessionId && !loading && !error && orders.length === 0 ? (
                    <section className="rounded-3xl border border-dashed border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-8 text-center shadow-sm dark:bg-[var(--qresto-bg)]">
                        <p className="text-body-sm text-on-surface-variant leading-relaxed">
                            Bu oturumda henüz sipariş yok. Menüden ürün seçip
                            sipariş verdikten sonra burada görünecek.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/menu")}
                            className="mt-6 rounded-full bg-[var(--qresto-primary)] px-6 py-3 font-sans text-label-bold text-white shadow-sm transition hover:opacity-90"
                        >
                            Menüye git
                        </button>
                    </section>
                ) : null}

                {sessionId && !loading && !error && orders.length > 0 ? (
                    <ol className="flex list-none flex-col gap-6 p-0">
                        {orders.map((order, orderIndex) => (
                            <li
                                key={order.id}
                                className="guest-orders-card-enter flex flex-col gap-3 rounded-3xl border border-transparent bg-[var(--qresto-surface)] p-5 shadow-md ring-1 ring-black/[0.04] dark:border-[var(--qresto-border)] dark:p-5 dark:shadow-sm dark:ring-0 sm:p-6"
                                style={{ "--go-idx": orderIndex } as CSSProperties}
                            >
                                <div className="rounded-2xl bg-[var(--qresto-hover)] px-4 py-4 dark:bg-white/[0.06]">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-mono text-label-bold tracking-wide text-on-surface">
                                                {formatGuestOrderNo(order.orderNo)}
                                            </p>
                                            <p className="mt-1 text-body-xs text-on-surface-variant">
                                                {formatOrderDateTimeTr(order.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span
                                                className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-label-bold text-white shadow-sm ${
                                                    order.status === "PAID"
                                                        ? "bg-[#25D366]"
                                                        : "bg-[var(--qresto-primary)]"
                                                }`}
                                            >
                                                {ORDER_STATUS_TR[order.status] ??
                                                    order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {order.items?.length ? (
                                    <ul className="m-0 flex list-none flex-col gap-2 p-0">
                                        {order.items.map((line) => {
                                            const lineKey = `${order.id}-${line.id}`;
                                            const hasPaidExtras = orderLineHasPaidExtras(line);
                                            const isOpen = expandedLineKey === lineKey;
                                            const linePrice = formatPrice(
                                                line.lineTotal ??
                                                    line.productPrice * line.quantity
                                            );
                                            const paidExtraRows = parsePaidIngredientsFromOrderField(
                                                line.addedIngredients
                                            );
                                            const removedText =
                                                line.removedIngredients?.trim() ?? "";

                                            const titleBlock = (
                                                <>
                                                    <span className="font-semibold text-on-surface">
                                                        {line.quantity}×
                                                    </span>{" "}
                                                    <span className="text-on-surface">
                                                        {line.productName}
                                                    </span>
                                                    {removedText ? (
                                                        <p className="mt-0.5 text-body-xs text-on-surface-variant">
                                                            Çıkarılanlar: {removedText}
                                                        </p>
                                                    ) : null}
                                                    {line.note ? (
                                                        <p className="mt-0.5 text-body-xs text-on-surface-variant">
                                                            Not: {line.note}
                                                        </p>
                                                    ) : null}
                                                </>
                                            );

                                            return (
                                                <li
                                                    key={line.id}
                                                    className="overflow-hidden rounded-xl border border-transparent bg-[var(--qresto-bg)] dark:border-[var(--qresto-border)]"
                                                >
                                                    {hasPaidExtras ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                aria-expanded={isOpen}
                                                                aria-label={`${line.productName} ücretli ekler`}
                                                                className="guest-orders-line-trigger flex h-auto min-h-0 w-full cursor-pointer items-start justify-between gap-2 border-0 bg-transparent px-3 py-1.5 text-left font-sans text-body-lg font-normal leading-snug text-on-surface transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                                                                onClick={() =>
                                                                    setExpandedLineKey((k) =>
                                                                        k === lineKey ? null : lineKey
                                                                    )
                                                                }
                                                            >
                                                                <div className="min-w-0 flex-1">
                                                                    {titleBlock}
                                                                </div>
                                                                <span className="flex shrink-0 items-center gap-1 self-start leading-none">
                                                                    <span className="font-semibold tabular-nums text-on-surface">
                                                                        {linePrice}
                                                                    </span>
                                                                    <span
                                                                        className={`material-symbols-outlined flex size-5 shrink-0 items-center justify-center text-[20px] text-on-surface-variant transition-transform duration-200 ease-out ${
                                                                            isOpen ? "rotate-180" : ""
                                                                        }`}
                                                                        aria-hidden
                                                                    >
                                                                        expand_more
                                                                    </span>
                                                                </span>
                                                            </button>
                                                            <div
                                                                className={`guest-orders-line-details ${
                                                                    isOpen
                                                                        ? "guest-orders-line-details--open"
                                                                        : ""
                                                                }`}
                                                                aria-hidden={!isOpen}
                                                            >
                                                                <div className="guest-orders-line-details-inner">
                                                                    <div className="border-t border-[var(--qresto-border)] px-3 pb-2 pt-1.5 dark:border-[var(--qresto-border)]">
                                                                        <p className="text-[10px] font-medium uppercase tracking-wide text-on-surface-variant">
                                                                            Fiyata yansıyanlar
                                                                        </p>
                                                                        <div className="mt-1 flex flex-col gap-0.5 text-[13px] leading-snug text-on-surface">
                                                                            {paidExtraRows.map((row, i) => {
                                                                                const extraLabel =
                                                                                    formatExtraDeltaTry(
                                                                                        row.extraTry
                                                                                    );
                                                                                return (
                                                                                    <div
                                                                                        key={`${line.id}-paid-${i}`}
                                                                                        className="flex items-baseline justify-between gap-3"
                                                                                    >
                                                                                        <span className="min-w-0 text-on-surface-variant">
                                                                                            - {row.label}
                                                                                        </span>
                                                                                        {extraLabel ? (
                                                                                            <span className="shrink-0 tabular-nums font-medium text-on-surface">
                                                                                                {extraLabel}
                                                                                            </span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-start justify-between gap-2 px-3 py-1.5 font-sans text-body-lg font-normal leading-snug text-on-surface">
                                                            <div className="min-w-0 flex-1">
                                                                {titleBlock}
                                                            </div>
                                                            <span className="shrink-0 self-start leading-none font-semibold tabular-nums text-on-surface">
                                                                {linePrice}
                                                            </span>
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p className="rounded-xl bg-[var(--qresto-bg)] px-4 py-3 text-body-sm text-on-surface-variant dark:border dark:border-[var(--qresto-border)]">
                                        Satır detayı yok.
                                    </p>
                                )}

                                <div className="flex min-h-0 flex-nowrap items-center justify-between gap-3 border-t border-[var(--qresto-border)] pt-2 dark:border-[var(--qresto-border)]">
                                    <span className="shrink-0 text-body-xs font-medium leading-none text-on-surface-variant">
                                        Toplam
                                    </span>
                                    <span className="shrink-0 text-right text-title-md font-bold leading-none tabular-nums text-primary">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ol>
                ) : null}
            </main>
        </div>
    );
};

export default GuestOrdersPage;
