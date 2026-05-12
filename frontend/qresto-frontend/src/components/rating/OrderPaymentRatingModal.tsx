import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, X } from "lucide-react";

import type { OrderResponse } from "../../types/cartTypes";
import { demoPayment } from "../../services/orderService";

import OrderRatingForm from "./OrderRatingForm";

type OrderPaymentRatingModalProps = {
    order: OrderResponse;
    onClose: () => void;
};

const formatPrice = (price: number) => `₺${price.toFixed(2)}`;

const OrderPaymentRatingModal = ({ order, onClose }: OrderPaymentRatingModalProps) => {
    const [paidOrder, setPaidOrder] = useState<OrderResponse>(order);
    const [isPaying, setIsPaying] = useState(false);
    const [paymentDone, setPaymentDone] = useState(order.status === "PAID");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setPaidOrder(order);
        setPaymentDone(order.status === "PAID");
        setSuccessMessage("");
        setErrorMessage("");
        setIsPaying(false);
    }, [order]);

    const handleDemoPayment = async () => {
        setIsPaying(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await demoPayment(order.id, order.guestSessionId);
            setPaidOrder(response);
            setPaymentDone(true);
            setSuccessMessage("Demo ödeme başarıyla tamamlandı.");
        } catch (error) {
            console.error("Demo ödeme hatası:", error);
            setErrorMessage("Demo ödeme yapılırken hata oluştu.");
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
            <div className="relative max-h-[92vh] w-full max-w-[560px] overflow-hidden rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--qresto-border)] px-5 py-4">
                    <div>
                        <h2 className="text-xl font-extrabold">Sipariş ve Değerlendirme</h2>
                        <p className="text-sm text-[var(--qresto-muted)]">Sipariş No: {paidOrder.orderNo}</p>
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
                    <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-[var(--qresto-muted)]">Toplam Tutar</p>
                                <p className="text-2xl font-extrabold text-[var(--qresto-primary)]">
                                    {formatPrice(paidOrder.totalAmount)}
                                </p>
                            </div>
                            <div className="rounded-full bg-[var(--qresto-hover)] px-4 py-2 text-sm font-bold text-[var(--qresto-primary)]">
                                {paidOrder.status}
                            </div>
                        </div>

                        {!paymentDone ? (
                            <button
                                type="button"
                                onClick={handleDemoPayment}
                                disabled={isPaying}
                                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--qresto-primary)] font-bold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CreditCard size={19} />
                                {isPaying ? "Ödeme yapılıyor..." : "Demo Ödeme Yap"}
                            </button>
                        ) : (
                            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                                <CheckCircle2 size={19} />
                                Ödeme tamamlandı. Şimdi değerlendirme yapabilirsiniz.
                            </div>
                        )}
                    </div>

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
                            <OrderRatingForm order={paidOrder} onClose={onClose} />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default OrderPaymentRatingModal;
