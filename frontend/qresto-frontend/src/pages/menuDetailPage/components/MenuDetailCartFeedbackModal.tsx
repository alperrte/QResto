import { useEffect } from "react";
import { createPortal } from "react-dom";

export type MenuDetailCartFeedbackVariant = "error" | "info";

type MenuDetailCartFeedbackModalProps = {
    isOpen: boolean;
    variant: MenuDetailCartFeedbackVariant;
    /** Boşsa varsayılan: hata için «Bir sorun oluştu», bilgi için «Bilgi». */
    title?: string;
    message: string;
    onClose: () => void;
};

const MenuDetailCartFeedbackModal = ({
    isOpen,
    variant,
    title: titleProp,
    message,
    onClose,
}: MenuDetailCartFeedbackModalProps) => {
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen || typeof document === "undefined") {
        return null;
    }

    const isError = variant === "error";

    const title =
        titleProp?.trim() ||
        (isError ? "Bir sorun oluştu" : "Bilgi");

    const panel = (
        <div
            className="fixed inset-0 z-[200] flex w-full items-center justify-center overflow-y-auto overscroll-y-contain px-4 py-10 sm:py-12"
            style={{ minHeight: "100dvh" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-detail-cart-feedback-title"
        >
            <button
                type="button"
                className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
                aria-label="Kapat"
                onClick={onClose}
            />

            <div
                className={`relative z-[1] my-auto w-full max-w-[min(100%,22rem)] max-h-[min(calc(100dvh-5rem),32rem)] overflow-y-auto overflow-x-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-2xl outline-none ${
                    isError
                        ? "ring-1 ring-red-200/60"
                        : "ring-1 ring-amber-200/70"
                }`}
            >
                <div
                    className={
                        isError
                            ? "bg-gradient-to-b from-red-50/95 via-orange-50/40 to-[var(--color-surface-container-lowest)] px-6 pt-8 pb-1 text-center"
                            : "bg-gradient-to-b from-amber-50/95 to-[var(--color-surface-container-lowest)] px-6 pt-8 pb-1 text-center"
                    }
                >
                    <div
                        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg ${
                            isError
                                ? "bg-gradient-to-br from-red-500 to-orange-700 shadow-red-600/25"
                                : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-600/20"
                        }`}
                    >
                        <span className="material-symbols-outlined text-[32px]" aria-hidden>
                            {isError ? "error" : "info"}
                        </span>
                    </div>

                    <h2
                        id="menu-detail-cart-feedback-title"
                        className="font-headline text-headline-md text-on-surface"
                    >
                        {title}
                    </h2>
                </div>

                <div className="px-6 pb-6 pt-3 text-center">
                    <p className="text-body-sm leading-relaxed text-on-surface-variant">{message}</p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-6 w-full rounded-full bg-[var(--color-surface-container-high)] py-3.5 font-sans text-label-bold text-on-surface transition hover:bg-[var(--color-surface-container-highest)] hover:opacity-95 active:scale-[0.98]"
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(panel, document.body);
};

export default MenuDetailCartFeedbackModal;
