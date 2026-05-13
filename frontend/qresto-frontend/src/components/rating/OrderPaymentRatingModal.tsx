import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, X } from "lucide-react";

import type { OrderResponse, TableSessionBillResponse } from "../../types/cartTypes";
import {
    getTableSessionBill,
    markTableSessionOrdersPaid,
} from "../../services/orderService";
import { getRatingSettings } from "../../services/ratingService";

import OrderRatingForm from "./OrderRatingForm";
import { isOrderRatingFlowEnabled } from "./orderRatingFlowGate";

type OrderPaymentRatingModalProps = {
    tableSessionId: number;
    onClose: () => void;
};

const formatPrice = (price: number) => `₺${Number(price || 0).toFixed(2)}`;

const OrderPaymentRatingModal = ({
                                     tableSessionId,
                                     onClose,
                                 }: OrderPaymentRatingModalProps) => {
    const [bill, setBill] = useState<TableSessionBillResponse | null>(null);
    const [paidOrders, setPaidOrders] = useState<OrderResponse[]>([]);

    const [isLoadingBill, setIsLoadingBill] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [ratingGateResolved, setRatingGateResolved] = useState(false);
    const [ratingFlowAllowed, setRatingFlowAllowed] = useState(false);
    const [ratingFlowRevoked, setRatingFlowRevoked] = useState(false);

    const billItems = useMemo(() => {
        return bill?.orders.flatMap((order) =>
            (order.items ?? [])
                .filter((item) => item.status === "ACTIVE")
                .map((item) => ({
                    ...item,
                    orderId: order.id,
                    orderNo: order.orderNo,
                }))
        ) ?? [];
    }, [bill]);

    useEffect(() => {
        let cancelled = false;

        const loadBill = async () => {
            setIsLoadingBill(true);
            setErrorMessage("");
            setSuccessMessage("");
            setPaymentDone(false);
            setPaidOrders([]);
            setRatingGateResolved(false);
            setRatingFlowAllowed(false);
            setRatingFlowRevoked(false);

            try {
                const response = await getTableSessionBill(tableSessionId);

                if (cancelled) return;

                setBill(response);
            } catch (error) {
                console.error("Masa hesabı yüklenemedi:", error);

                if (cancelled) return;

                setErrorMessage(
                    "Bu masa oturumu için ödenecek sipariş bulunamadı. Önce sipariş verdiğinizden emin olun."
                );
            } finally {
                if (!cancelled) {
                    setIsLoadingBill(false);
                }
            }
        };

        void loadBill();

        return () => {
            cancelled = true;
        };
    }, [tableSessionId]);

    useEffect(() => {
        if (!paymentDone) {
            setRatingGateResolved(false);
            setRatingFlowAllowed(false);
            setRatingFlowRevoked(false);
            return;
        }

        let cancelled = false;

        const resolveRatingGate = async () => {
            try {
                const settings = await getRatingSettings();

                if (cancelled) return;

                setRatingFlowAllowed(isOrderRatingFlowEnabled(settings));
            } catch {
                if (cancelled) return;

                setRatingFlowAllowed(true);
            } finally {
                if (!cancelled) {
                    setRatingGateResolved(true);
                }
            }
        };

        void resolveRatingGate();

        return () => {
            cancelled = true;
        };
    }, [paymentDone]);

    const handleTableSessionPayment = async () => {
        setIsPaying(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await markTableSessionOrdersPaid(tableSessionId);

            setPaidOrders(response);
            setPaymentDone(true);
            setSuccessMessage("Masa hesabı başarıyla ödendi.");


        } catch (error) {
            console.error("Masa hesabı ödeme hatası:", error);
            setErrorMessage("Masa hesabı ödenirken hata oluştu.");
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
            <div className="relative max-h-[92vh] w-full max-w-[620px] overflow-hidden rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--qresto-border)] px-5 py-4">
                    <div>
                        <h2 className="text-xl font-extrabold">Masa Hesabı ve Değerlendirme</h2>
                        <p className="text-sm text-[var(--qresto-muted)]">
                            Masa oturumu: #{tableSessionId}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPaying}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--qresto-border)] transition hover:bg-[var(--qresto-hover)] disabled:pointer-events-none disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-[calc(92vh-90px)] overflow-y-auto p-5">
                    {isLoadingBill ? (
                        <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-4 py-8 text-center">
                            <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                                Masa hesabı yükleniyor…
                            </p>
                        </div>
                    ) : null}

                    {!isLoadingBill && bill ? (
                        <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-[var(--qresto-muted)]">
                                        {bill.tableName || "Masa hesabı"}
                                    </p>
                                    <p className="text-2xl font-extrabold text-[var(--qresto-primary)]">
                                        {formatPrice(bill.totalAmount)}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-[var(--qresto-muted)]">
                                        {bill.orderCount} sipariş tek hesapta toplandı.
                                    </p>
                                </div>

                                <div className="rounded-full bg-[var(--qresto-hover)] px-4 py-2 text-sm font-bold text-[var(--qresto-primary)]">
                                    {paymentDone ? "PAID" : "PAYMENT"}
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                {billItems.map((item) => (
                                    <div
                                        key={`${item.orderId}-${item.id}`}
                                        className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 py-3"
                                    >
                                        <div>
                                            <p className="font-bold">{item.productName}</p>
                                            <p className="text-xs text-[var(--qresto-muted)]">
                                                {item.quantity} adet • Sipariş No: {item.orderNo}
                                            </p>
                                        </div>
                                        <p className="shrink-0 font-extrabold text-[var(--qresto-primary)]">
                                            {formatPrice(item.lineTotal)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {!paymentDone ? (
                                <button
                                    type="button"
                                    onClick={handleTableSessionPayment}
                                    disabled={isPaying || billItems.length === 0}
                                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--qresto-primary)] font-bold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <CreditCard size={19} />
                                    {isPaying ? "Masa hesabı ödeniyor..." : "Masa Hesabını Öde"}
                                </button>
                            ) : (
                                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                                    <CheckCircle2 size={19} />
                                    Masa hesabı ödendi. Şimdi değerlendirme yapabilirsiniz.
                                </div>
                            )}
                        </div>
                    ) : null}

                    {errorMessage ? (
                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                            {errorMessage}
                        </div>
                    ) : null}

                    {successMessage ? (
                        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                            {successMessage}
                        </div>
                    ) : null}

                    {paymentDone ? (
                        <div className="mt-5">
                            {!ratingGateResolved ? (
                                <p className="text-center text-sm text-[var(--qresto-muted)]">
                                    Değerlendirme durumu kontrol ediliyor…
                                </p>
                            ) : ratingFlowAllowed && !ratingFlowRevoked ? (
                                <OrderRatingForm
                                    orders={paidOrders}
                                    onClose={onClose}
                                    onRatingFlowRevoked={() => setRatingFlowRevoked(true)}
                                />
                            ) : (
                                <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-4 py-5 text-center">
                                    <p className="text-sm font-semibold text-[var(--qresto-text)]">
                                        Değerlendirme şu anda kapalı.
                                    </p>
                                    <p className="mt-2 text-sm text-[var(--qresto-muted)]">
                                        Ödemeniz tamamlandı; yönetim panelindeki ayarlardan bu özellik
                                        kapatılmış olabilir.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="mt-5 h-12 w-full rounded-full bg-[var(--qresto-primary)] font-bold text-white shadow-md transition hover:opacity-90 active:scale-95"
                                    >
                                        Tamam
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default OrderPaymentRatingModal;

