import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, Sparkles } from "lucide-react";

import { formatGuestOrderNo } from "../../utils/formatGuestOrderNo";

type OrderPlacedCelebrationModalProps = {
    isOpen: boolean;
    orderNo: string;
    onClose: () => void;
    onGoToOrders: () => void;
    onGoToMenu: () => void;
};

const OrderPlacedCelebrationModal = ({
    isOpen,
    orderNo,
    onClose,
    onGoToOrders,
    onGoToMenu,
}: OrderPlacedCelebrationModalProps) => {
    useEffect(() => {
        if (!isOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!isOpen || typeof document === "undefined") {
        return null;
    }

    const panel = (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-celebration-title"
        >
            <button
                type="button"
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                aria-label="Kapat"
                onClick={onClose}
            />

            <div className="relative z-[1] w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-50 via-white to-emerald-50/90 p-8 pb-10 pt-12 text-center shadow-2xl ring-2 ring-emerald-300/50">
                <Sparkles
                    className="pointer-events-none absolute left-5 top-5 h-6 w-6 text-emerald-500/75"
                    aria-hidden
                />
                <Sparkles
                    className="pointer-events-none absolute right-6 top-7 h-5 w-5 text-green-500/65"
                    aria-hidden
                />
                <Sparkles
                    className="pointer-events-none absolute bottom-32 left-7 h-5 w-5 text-emerald-400/55"
                    aria-hidden
                />
                <Sparkles
                    className="pointer-events-none absolute bottom-36 right-5 h-6 w-6 text-green-400/60"
                    aria-hidden
                />

                <div className="flex items-center justify-center gap-1 sm:gap-3">
                    <Sparkles
                        className="h-9 w-9 shrink-0 animate-pulse text-emerald-500 sm:h-11 sm:w-11"
                        aria-hidden
                    />
                    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-xl shadow-emerald-700/30 sm:h-32 sm:w-32">
                        <Check
                            className="h-14 w-14 text-white sm:h-16 sm:w-16"
                            strokeWidth={2.8}
                            aria-hidden
                        />
                    </div>
                    <Sparkles
                        className="h-9 w-9 shrink-0 animate-pulse text-emerald-500 [animation-delay:200ms] sm:h-11 sm:w-11"
                        aria-hidden
                    />
                </div>

                <h2
                    id="order-celebration-title"
                    className="mt-7 font-headline text-2xl font-bold leading-tight text-emerald-950 sm:text-[1.65rem]"
                >
                    Siparişiniz oluşturuldu
                </h2>
                <p className="mt-3 text-sm font-medium text-emerald-900/75">Sipariş numaranız</p>
                <p className="mt-1 font-mono text-lg font-bold tracking-wide text-primary sm:text-xl">
                    {formatGuestOrderNo(orderNo)}
                </p>

                <button
                    type="button"
                    onClick={onGoToOrders}
                    className="mt-9 w-full rounded-full bg-gradient-to-r from-emerald-600 to-green-700 py-3.5 font-sans text-label-bold text-white shadow-lg shadow-emerald-800/20 transition hover:opacity-95 active:scale-[0.99]"
                >
                    Siparişlerime git
                </button>
                <button
                    type="button"
                    onClick={onGoToMenu}
                    className="mt-3 w-full py-2 text-center text-sm font-semibold text-emerald-900/70 underline-offset-2 transition hover:text-emerald-950 hover:underline"
                >
                    Menüye dön
                </button>
            </div>
        </div>
    );

    return createPortal(panel, document.body);
};

export default OrderPlacedCelebrationModal;
