import { useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Star, X } from "lucide-react";

import type { OrderResponse } from "../../types/cartTypes";
import { demoPayment } from "../../services/orderService";
import {
    createProductRating,
    createRestaurantRating,
} from "../../services/ratingService";

type OrderPaymentRatingModalProps = {
    order: OrderResponse;
    onClose: () => void;
};

type ProductRatingState = Record<
    number,
    {
        rating: number;
        comment: string;
    }
>;

const OrderPaymentRatingModal = ({
                                     order,
                                     onClose,
                                 }: OrderPaymentRatingModalProps) => {
    const [paidOrder, setPaidOrder] = useState<OrderResponse>(order);
    const [isPaying, setIsPaying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentDone, setPaymentDone] = useState(order.status === "PAID");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const initialProductRatings = useMemo(() => {
        return order.items.reduce<ProductRatingState>((acc, item) => {
            acc[item.id] = {
                rating: 5,
                comment: "",
            };

            return acc;
        }, {});
    }, [order.items]);

    const [productRatings, setProductRatings] =
        useState<ProductRatingState>(initialProductRatings);

    const [restaurantRating, setRestaurantRating] = useState(5);
    const [restaurantComment, setRestaurantComment] = useState("");

    const formatPrice = (price: number) => {
        return `₺${price.toFixed(2)}`;
    };

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

    const updateProductRating = (
        orderItemId: number,
        field: "rating" | "comment",
        value: number | string
    ) => {
        setProductRatings((prev) => ({
            ...prev,
            [orderItemId]: {
                ...prev[orderItemId],
                [field]: value,
            },
        }));
    };

    const renderStars = (
        value: number,
        onChange: (nextValue: number) => void
    ) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`transition ${
                            star <= value
                                ? "text-[var(--qresto-primary)]"
                                : "text-[var(--qresto-border-strong)]"
                        }`}
                    >
                        <Star
                            size={22}
                            fill={star <= value ? "currentColor" : "none"}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const handleSubmitRatings = async () => {
        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const activeItems = paidOrder.items.filter(
                (item) => item.status === "ACTIVE"
            );

            for (const item of activeItems) {
                const ratingData = productRatings[item.id];

                await createProductRating({
                    orderId: paidOrder.id,
                    orderItemId: item.id,
                    guestSessionId: paidOrder.guestSessionId,
                    rating: ratingData?.rating ?? 5,
                    comment: ratingData?.comment ?? "",
                });
            }

            await createRestaurantRating({
                orderId: paidOrder.id,
                guestSessionId: paidOrder.guestSessionId,
                rating: restaurantRating,
                comment: restaurantComment,
            });

            setSuccessMessage("Değerlendirmeniz başarıyla kaydedildi.");

            window.setTimeout(() => {
                onClose();
            }, 900);
        } catch (error) {
            console.error("Değerlendirme gönderilirken hata oluştu:", error);
            setErrorMessage(
                "Değerlendirme gönderilirken hata oluştu. Daha önce değerlendirme yapmış olabilirsiniz."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
            <div className="max-h-[92vh] w-full max-w-[560px] overflow-hidden rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--qresto-border)] px-5 py-4">
                    <div>
                        <h2 className="text-xl font-extrabold">
                            Sipariş ve Değerlendirme
                        </h2>

                        <p className="text-sm text-[var(--qresto-muted)]">
                            Sipariş No: {paidOrder.orderNo}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--qresto-border)] transition hover:bg-[var(--qresto-hover)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-[calc(92vh-90px)] overflow-y-auto p-5">
                    <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-[var(--qresto-muted)]">
                                    Toplam Tutar
                                </p>

                                <p className="text-2xl font-extrabold text-[var(--qresto-primary)]">
                                    {formatPrice(paidOrder.totalAmount)}
                                </p>
                            </div>

                            <div className="rounded-full bg-[var(--qresto-hover)] px-4 py-2 text-sm font-bold text-[var(--qresto-primary)]">
                                {paidOrder.status}
                            </div>
                        </div>

                        {!paymentDone && (
                            <button
                                type="button"
                                onClick={handleDemoPayment}
                                disabled={isPaying}
                                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--qresto-primary)] font-bold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CreditCard size={19} />
                                {isPaying ? "Ödeme yapılıyor..." : "Demo Ödeme Yap"}
                            </button>
                        )}

                        {paymentDone && (
                            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                                <CheckCircle2 size={19} />
                                Ödeme tamamlandı. Şimdi değerlendirme yapabilirsiniz.
                            </div>
                        )}
                    </div>

                    {errorMessage && (
                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                            {successMessage}
                        </div>
                    )}

                    {paymentDone && (
                        <div className="mt-5 space-y-5">
                            <div>
                                <h3 className="text-lg font-extrabold">
                                    Ürünleri Değerlendir
                                </h3>

                                <p className="text-sm text-[var(--qresto-muted)]">
                                    Siparişinizdeki ürünlere 1-5 arası puan verin.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {paidOrder.items
                                    .filter((item) => item.status === "ACTIVE")
                                    .map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-bold">
                                                        {item.productName}
                                                    </p>

                                                    <p className="text-sm text-[var(--qresto-muted)]">
                                                        {item.quantity} adet •{" "}
                                                        {formatPrice(item.lineTotal)}
                                                    </p>
                                                </div>

                                                {renderStars(
                                                    productRatings[item.id]?.rating ?? 5,
                                                    (nextValue) =>
                                                        updateProductRating(
                                                            item.id,
                                                            "rating",
                                                            nextValue
                                                        )
                                                )}
                                            </div>

                                            <textarea
                                                value={
                                                    productRatings[item.id]?.comment ??
                                                    ""
                                                }
                                                onChange={(event) =>
                                                    updateProductRating(
                                                        item.id,
                                                        "comment",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Ürün hakkında yorum yazabilirsiniz..."
                                                className="mt-3 min-h-20 w-full resize-none rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--qresto-primary)]"
                                            />
                                        </div>
                                    ))}
                            </div>

                            <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-extrabold">
                                            Restoranı Değerlendir
                                        </h3>

                                        <p className="text-sm text-[var(--qresto-muted)]">
                                            Genel deneyiminizi puanlayın.
                                        </p>
                                    </div>

                                    {renderStars(restaurantRating, setRestaurantRating)}
                                </div>

                                <textarea
                                    value={restaurantComment}
                                    onChange={(event) =>
                                        setRestaurantComment(event.target.value)
                                    }
                                    placeholder="Restoran deneyiminiz hakkında yorum yazabilirsiniz..."
                                    className="mt-3 min-h-20 w-full resize-none rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--qresto-primary)]"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmitRatings}
                                disabled={isSubmitting}
                                className="h-12 w-full rounded-full bg-[var(--qresto-primary)] font-bold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting
                                    ? "Değerlendirme gönderiliyor..."
                                    : "Değerlendirmeyi Gönder"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderPaymentRatingModal;