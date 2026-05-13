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
import { formatExtraDeltaTry, parsePriceAffectingPaidExtras } from "../../utils/parseOrderPaidExtras";

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

        try {
            const response = await markTableSessionOrdersPaid(tableSessionId);

            setPaidOrders(response);
            setPaymentDone(true);
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
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 border-b border-[var(--qresto-border)] px-5 py-4">
                    <span
                        className="pointer-events-none invisible inline-flex h-10 w-10 shrink-0 select-none"
                        aria-hidden
                    />
                    <h2 className="min-w-0 text-center text-xl font-extrabold text-[var(--qresto-text)]">
                        {paymentDone ? "Değerlendirme & Yorum" : "Hesap Ödeme"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPaying}
                        className="flex h-10 w-10 shrink-0 items-center justify-center justify-self-end rounded-full border border-[var(--qresto-border)] transition hover:bg-[var(--qresto-hover)] disabled:pointer-events-none disabled:opacity-50"
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
                        <div
                            className={`rounded-2xl p-4 ${
                                paymentDone
                                    ? "border-0 bg-transparent"
                                    : "border border-[var(--qresto-border)] bg-[var(--qresto-bg)]"
                            }`}
                        >
                            <div
                                className={
                                    paymentDone
                                        ? "mb-3 flex justify-center"
                                        : "flex items-center justify-end sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-x-4"
                                }
                                role="group"
                                aria-label="Masa özeti"
                            >
                                {paymentDone ? null : (
                                    <h3 className="hidden min-w-0 justify-self-start truncate text-lg font-extrabold leading-tight tracking-tight text-[var(--qresto-text)] sm:block sm:text-xl">
                                        {bill.tableName || "Masa hesabı"}
                                    </h3>
                                )}

                                <div
                                    className={`flex shrink-0 items-center gap-2 rounded-full bg-[#22c55e] px-4 py-2 text-sm font-bold text-white shadow-sm ${
                                        paymentDone
                                            ? ""
                                            : "hidden justify-self-center sm:flex"
                                    }`}
                                    role="status"
                                >
                                    {paymentDone ? (
                                        <>
                                            <CheckCircle2
                                                className="h-4 w-4 shrink-0 text-emerald-100"
                                                aria-hidden
                                            />
                                            <span>Ödendi</span>
                                        </>
                                    ) : (
                                        <>
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#bbf7d0] ring-2 ring-white/40"
                                                aria-hidden
                                            />
                                            <span>Online Ödeme</span>
                                        </>
                                    )}
                                </div>

                                {paymentDone ? null : (
                                    <p className="min-w-0 justify-self-end text-right text-2xl font-extrabold leading-none tabular-nums text-[var(--qresto-primary)]">
                                        {formatPrice(bill.totalAmount)}
                                    </p>
                                )}
                            </div>

                            <div className={paymentDone ? "hidden" : "mt-4 space-y-3"}>
                                {billItems.map((item) => {
                                    const paidRows = parsePriceAffectingPaidExtras(
                                        item.addedIngredients
                                    );
                                    return (
                                    <div
                                        key={`${item.orderId}-${item.id}`}
                                        className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 py-3"
                                    >
                                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1.5">
                                            <p
                                                className="col-start-1 font-bold leading-snug text-[var(--qresto-text)]"
                                                style={{ gridRow: 1 }}
                                            >
                                                {item.productName}
                                                <span className="font-semibold text-[var(--qresto-muted)]">
                                                    {" "}
                                                    · {item.quantity} adet
                                                </span>
                                            </p>
                                            <p
                                                className="col-start-2 shrink-0 justify-self-end text-right text-base font-extrabold leading-none tabular-nums text-[var(--qresto-primary)]"
                                                style={{ gridRow: 1 }}
                                            >
                                                {formatPrice(item.lineTotal)}
                                            </p>
                                            <p
                                                className="col-start-1 text-xs leading-snug text-[var(--qresto-muted)]"
                                                style={{ gridRow: 2 }}
                                            >
                                                Sipariş No: {item.orderNo}
                                            </p>
                                            <span
                                                className="col-start-2 block min-h-[1.125rem] shrink-0"
                                                style={{ gridRow: 2 }}
                                                aria-hidden
                                            />
                                            {paidRows.flatMap((row, i) => {
                                                const rowNum = 3 + i;
                                                return [
                                                    <span
                                                        key={`${item.id}-opt-l-${i}`}
                                                        className="col-start-1 text-[13px] leading-snug text-[var(--qresto-muted)]"
                                                        style={{ gridRow: rowNum }}
                                                    >
                                                        - {row.label}
                                                    </span>,
                                                    <span
                                                        key={`${item.id}-opt-r-${i}`}
                                                        className="col-start-2 shrink-0 justify-self-end text-right text-[13px] font-semibold leading-none tabular-nums text-[var(--qresto-text)]"
                                                        style={{ gridRow: rowNum }}
                                                    >
                                                        {formatExtraDeltaTry(row.extraTry)}
                                                    </span>,
                                                ];
                                            })}
                                        </div>
                                    </div>
                                    );
                                })}
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
                                <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-700">
                                    <CheckCircle2 className="shrink-0" size={19} />
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

