import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Star } from "lucide-react";

import type { OrderResponse } from "../../types/cartTypes";
import {
    createProductRating,
    createRestaurantRating,
    getRatingSettings,
} from "../../services/ratingService";
import { isOrderRatingFlowEnabled } from "./orderRatingFlowGate";

type ProductRatingState = Record<
    number,
    {
        rating: number;
        comment: string;
    }
>;

type OrderRatingFormProps = {
    order: OrderResponse;
    onClose: () => void;
    /** Ayarlar kaynaklı kapatma (ör. ödeme modalında yalnızca değerlendirme kısmını kaldırmak için) */
    onRatingFlowRevoked?: () => void;
};

const formatPrice = (price: number) => `₺${price.toFixed(2)}`;

const POLL_MS = 10_000;

const OrderRatingForm = ({
    order,
    onClose,
    onRatingFlowRevoked,
}: OrderRatingFormProps) => {
    const [paidOrder, setPaidOrder] = useState<OrderResponse>(order);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showRatingThankYou, setShowRatingThankYou] = useState(false);

    const initialProductRatings = useMemo(() => {
        return order.items.reduce<ProductRatingState>((acc, item) => {
            acc[item.id] = { rating: 5, comment: "" };
            return acc;
        }, {});
    }, [order.items]);

    const [productRatings, setProductRatings] =
        useState<ProductRatingState>(initialProductRatings);
    const [restaurantRating, setRestaurantRating] = useState(5);
    const [restaurantComment, setRestaurantComment] = useState("");
    /** `null`: ayar henüz gelmedi — yorum alanı gösterme (yanlış UI önleme) */
    const [productCommentsAllowed, setProductCommentsAllowed] = useState<boolean | null>(null);
    const [restaurantCommentsAllowed, setRestaurantCommentsAllowed] = useState<boolean | null>(
        null
    );

    const revokeRef = useRef(onRatingFlowRevoked ?? onClose);
    revokeRef.current = onRatingFlowRevoked ?? onClose;

    useEffect(() => {
        let cancelled = false;

        const verifyRatingStillAllowed = async () => {
            try {
                const settings = await getRatingSettings();
                if (cancelled) return;
                setProductCommentsAllowed(Boolean(settings.productCommentsEnabled));
                setRestaurantCommentsAllowed(Boolean(settings.restaurantCommentsEnabled));
                if (!isOrderRatingFlowEnabled(settings)) {
                    revokeRef.current();
                }
            } catch {
                /* ağ hatasında mevcut ekranı koru */
            }
        };

        void verifyRatingStillAllowed();

        const intervalId = window.setInterval(() => {
            void verifyRatingStillAllowed();
        }, POLL_MS);

        const onVisibility = () => {
            if (document.visibilityState === "visible") {
                void verifyRatingStillAllowed();
            }
        };

        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, []);

    useEffect(() => {
        setPaidOrder(order);
        setProductRatings(
            order.items.reduce<ProductRatingState>((acc, item) => {
                acc[item.id] = { rating: 5, comment: "" };
                return acc;
            }, {})
        );
        setRestaurantRating(5);
        setRestaurantComment("");
        setErrorMessage("");
        setShowRatingThankYou(false);
        setIsSubmitting(false);
    }, [order]);

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

    const renderStars = (value: number, onChange: (nextValue: number) => void) => (
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
                    <Star size={22} fill={star <= value ? "currentColor" : "none"} />
                </button>
            ))}
        </div>
    );

    const handleSubmitRatings = async () => {
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const activeItems = paidOrder.items.filter((item) => item.status === "ACTIVE");
            const sendProductComment = productCommentsAllowed === true;
            const sendRestaurantComment = restaurantCommentsAllowed === true;

            for (const item of activeItems) {
                const ratingData = productRatings[item.id];
                await createProductRating({
                    orderId: paidOrder.id,
                    orderItemId: item.id,
                    guestSessionId: paidOrder.guestSessionId,
                    rating: ratingData?.rating ?? 5,
                    comment: sendProductComment ? (ratingData?.comment ?? "") : "",
                });
            }

            await createRestaurantRating({
                orderId: paidOrder.id,
                guestSessionId: paidOrder.guestSessionId,
                rating: restaurantRating,
                comment: sendRestaurantComment ? restaurantComment : "",
            });

            setShowRatingThankYou(true);
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
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-extrabold">Ürünleri Değerlendir</h3>
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
                                    <p className="font-bold">{item.productName}</p>
                                    <p className="text-sm text-[var(--qresto-muted)]">
                                        {item.quantity} adet • {formatPrice(item.lineTotal)}
                                    </p>
                                </div>
                                {renderStars(
                                    productRatings[item.id]?.rating ?? 5,
                                    (nextValue) =>
                                        updateProductRating(item.id, "rating", nextValue)
                                )}
                            </div>
                            {productCommentsAllowed === true ? (
                                <textarea
                                    value={productRatings[item.id]?.comment ?? ""}
                                    onChange={(event) =>
                                        updateProductRating(item.id, "comment", event.target.value)
                                    }
                                    placeholder="Ürün hakkında yorum yazabilirsiniz..."
                                    className="mt-3 min-h-20 w-full resize-none rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--qresto-primary)]"
                                />
                            ) : null}
                        </div>
                    ))}
            </div>

            <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="font-extrabold">Restoranı Değerlendir</h3>
                        <p className="text-sm text-[var(--qresto-muted)]">
                            Genel deneyiminizi puanlayın.
                        </p>
                    </div>
                    {renderStars(restaurantRating, setRestaurantRating)}
                </div>
                {restaurantCommentsAllowed === true ? (
                    <textarea
                        value={restaurantComment}
                        onChange={(event) => setRestaurantComment(event.target.value)}
                        placeholder="Restoran deneyiminiz hakkında yorum yazabilirsiniz..."
                        className="mt-3 min-h-20 w-full resize-none rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--qresto-primary)]"
                    />
                ) : null}
            </div>

            {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {errorMessage}
                </div>
            ) : null}

            <button
                type="button"
                onClick={handleSubmitRatings}
                disabled={isSubmitting}
                className="h-12 w-full rounded-full bg-[var(--qresto-primary)] font-bold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? "Değerlendirme gönderiliyor..." : "Değerlendirmeyi Gönder"}
            </button>

            {showRatingThankYou ? (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-6 backdrop-blur-[2px]"
                    aria-live="polite"
                >
                    <div className="w-full max-w-sm rounded-3xl border border-green-200 bg-gradient-to-b from-green-50 to-white px-8 py-10 text-center shadow-xl">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-4 ring-green-200/60">
                            <CheckCircle2 className="text-green-600" size={40} strokeWidth={2.2} />
                        </div>
                        <h3 className="text-xl font-extrabold text-green-900">
                            Değerlendirme gönderildi
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-green-800/90">
                            Görüşleriniz bizim için çok değerli. Bu deneyimi paylaştığınız için teşekkür
                            ederiz; iyi günler dileriz.
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-8 h-12 w-full rounded-full bg-green-600 font-bold text-white shadow-md transition hover:bg-green-700 active:scale-[0.98]"
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default OrderRatingForm;
