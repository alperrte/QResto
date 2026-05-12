import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

import AppHeader from "../../components/layout/AppHeader";
import HeaderIconButton from "../../components/ui/HeaderIconButton";
import { getOrdersByTableSession } from "../../services/orderService";
import type { OrderResponse } from "../../types/cartTypes";
import { formatGuestOrderNo } from "../../utils/formatGuestOrderNo";

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

const readTableSessionId = (): number | null => {
    const raw = localStorage.getItem("qresto_table_session_id");
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
    const sessionId = readTableSessionId();

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
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
            setOrders(sorted);
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

            <main className="mx-auto flex w-full max-w-lg flex-col gap-stack-lg px-container-margin py-stack-lg">
                <header className="flex flex-col gap-2 border-b border-[var(--qresto-border)] pb-stack-md">
                    <h1 className="text-display-sm font-bold text-on-surface md:text-display-md">
                        Siparişlerim
                    </h1>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        Bu masadaki oturumda verdiğiniz siparişlerin listesi. Sepet
                        burada yer almaz; ürün eklemek için menüyü kullanın.
                    </p>
                </header>

                {!sessionId ? (
                    <section
                        className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 text-center"
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
                    <section className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6">
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
                    <section className="rounded-2xl border border-dashed border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-8 text-center">
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
                    <ol className="flex list-none flex-col gap-stack-md p-0">
                        {orders.map((order, orderIndex) => (
                            <li
                                key={order.id}
                                className="guest-orders-card-enter overflow-hidden rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] shadow-sm"
                                style={{ "--go-idx": orderIndex } as CSSProperties}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4">
                                    <div className="min-w-0">
                                        <p className="font-mono text-label-bold tracking-wide text-on-surface">
                                            {formatGuestOrderNo(order.orderNo)}
                                        </p>
                                        <p className="mt-1 text-body-xs text-on-surface-variant">
                                            {new Date(order.createdAt).toLocaleString(
                                                "tr-TR",
                                                {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                }
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="rounded-full bg-primary-container px-3 py-1 text-label-bold text-on-primary-container">
                                            {ORDER_STATUS_TR[order.status] ??
                                                order.status}
                                        </span>
                                        <p className="text-title-md font-bold text-primary">
                                            {formatPrice(order.totalAmount)}
                                        </p>
                                    </div>
                                </div>

                                {order.items?.length ? (
                                    <ul className="m-0 list-none space-y-0 divide-y divide-[var(--qresto-border)] p-0">
                                        {order.items.map((line) => (
                                            <li
                                                key={line.id}
                                                className="flex justify-between gap-4 px-5 py-3 text-body-sm"
                                            >
                                                <div className="min-w-0 text-on-surface">
                                                    <span className="font-semibold text-on-surface">
                                                        {line.quantity}×
                                                    </span>{" "}
                                                    {line.productName}
                                                    {line.note ? (
                                                        <p className="mt-1 text-body-xs text-on-surface-variant">
                                                            Not: {line.note}
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <span className="shrink-0 font-semibold tabular-nums text-on-surface">
                                                    {formatPrice(
                                                        line.lineTotal ??
                                                            line.productPrice *
                                                                line.quantity
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="px-5 py-4 text-body-sm text-on-surface-variant">
                                        Satır detayı yok.
                                    </p>
                                )}
                            </li>
                        ))}
                    </ol>
                ) : null}
            </main>
        </div>
    );
};

export default GuestOrdersPage;
