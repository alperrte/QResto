import type { ReactNode } from "react";

export type AdminCountdownConfirmStep = "confirm" | "success";

export type AdminCountdownConfirmModalProps = {
    open: boolean;
    onClose: () => void;
    busy?: boolean;
    step: AdminCountdownConfirmStep;
    /** Onay adımı başlığı (varsayılan: UYARI) */
    confirmHeading?: string;
    /** Başlık rengi: kategori sil gibi kırmızı veya kategori durum gibi nötr */
    confirmHeadingTone?: "danger" | "neutral";
    /** Ana açıklama metni */
    confirmDescription: ReactNode;
    /** Geri sayımın üstünde, ek bilgi (ör. sonuç uyarısı) */
    confirmBeforeCountdown?: ReactNode;
    /** Geri sayım satırının yanındaki açıklama (tam cümle veya parça) */
    countdownCaption: ReactNode;
    countdown: number;
    /** Geri sayım satırının altında, butonların hemen üstünde gösterilen hata metni */
    errorMessage?: string | null;
    cancelLabel?: string;
    confirmLabel: string;
    confirmBusyLabel?: string;
    onConfirm: () => void | Promise<void>;
    confirmButtonClassName: string;
    /** Onay butonu: geri sayım veya busy ile pasif */
    confirmDisabled?: boolean;
    successHeading?: string;
    successBody: ReactNode;
    successFooterNote?: string;
};

const headingToneClass: Record<NonNullable<AdminCountdownConfirmModalProps["confirmHeadingTone"]>, string> = {
    danger: "text-red-700",
    neutral: "text-on-surface",
};

/**
 * Admin onay pencereleri için ortak düzen: metinler üstte, geri sayım altta (aksiyonların hemen üstünde),
 * isteğe bağlı hata kutusu, sonra Vazgeç / Onayla.
 */
const AdminCountdownConfirmModal = ({
    open,
    onClose,
    busy = false,
    step,
    confirmHeading = "UYARI",
    confirmHeadingTone = "danger",
    confirmDescription,
    confirmBeforeCountdown,
    countdownCaption,
    countdown,
    errorMessage,
    cancelLabel = "Vazgeç",
    confirmLabel,
    confirmBusyLabel,
    onConfirm,
    confirmButtonClassName,
    confirmDisabled,
    successHeading = "ONAYLANDI",
    successBody,
    successFooterNote = "Pencere kısa süre sonra kapanacaktır.",
}: AdminCountdownConfirmModalProps) => {
    if (!open) return null;

    const confirmBtnDisabled = Boolean(busy || confirmDisabled);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <button
                type="button"
                aria-label="Onay penceresini kapat"
                onClick={busy ? undefined : onClose}
                className="absolute inset-0 bg-black/45 disabled:cursor-not-allowed"
                disabled={busy}
            />
            <div className="relative z-10 w-full max-w-md rounded-xl p-6 shadow-xl bg-surface-container-lowest border border-outline-variant">
                {step === "confirm" ? (
                    <>
                        <h3
                            className={`text-lg font-bold mb-2 ${headingToneClass[confirmHeadingTone]}`}
                        >
                            {confirmHeading}
                        </h3>
                        <div className="text-sm text-on-surface mb-3">{confirmDescription}</div>

                        {confirmBeforeCountdown ? (
                            <div className="text-sm text-on-surface mb-4">{confirmBeforeCountdown}</div>
                        ) : null}

                        <div className="rounded-lg border border-outline-variant/80 bg-surface-container-low/40 px-3 py-3 mb-3">
                            <div className="flex items-center justify-start gap-3">
                                <div className="text-3xl font-extrabold text-red-700 leading-none tabular-nums shrink-0">
                                    {countdown}
                                </div>
                                <div className="text-sm text-on-surface min-w-0">{countdownCaption}</div>
                            </div>
                        </div>

                        {errorMessage ? (
                            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                                {errorMessage}
                            </p>
                        ) : null}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={busy}
                                className="px-4 py-2 rounded-lg border text-on-surface hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={() => void onConfirm()}
                                disabled={confirmBtnDisabled}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonClassName}`}
                            >
                                {busy && confirmBusyLabel ? confirmBusyLabel : confirmLabel}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-lg font-bold text-green-700 mb-2">{successHeading}</h3>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-green-700 text-3xl shrink-0">
                                check_circle
                            </span>
                            <div className="text-sm text-on-surface-variant min-w-0">{successBody}</div>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-0">{successFooterNote}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminCountdownConfirmModal;
