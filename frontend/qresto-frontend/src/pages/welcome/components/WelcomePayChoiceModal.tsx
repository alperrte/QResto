type WelcomePayChoiceModalProps = {
    isOpen: boolean;
    tableName: string | null;
    loadingOnline: boolean;
    errorMessage?: string | null;
    onClose: () => void;
    onSelectOnlinePay: () => void;
    onSelectBillRequest: () => void;
};

const WelcomePayChoiceModal = ({
    isOpen,
    tableName,
    loadingOnline,
    errorMessage,
    onClose,
    onSelectOnlinePay,
    onSelectBillRequest,
}: WelcomePayChoiceModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <button
                type="button"
                aria-label="Kapat"
                onClick={() => {
                    if (!loadingOnline) onClose();
                }}
                className="absolute inset-0 bg-black/45"
                disabled={loadingOnline}
            />
            <div className="relative z-10 w-full max-w-sm rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-xl">
                <h3 className="text-lg font-bold text-on-surface mb-1">Ödeme</h3>
                <p className="text-sm text-on-surface-variant mb-4">
                    Masa: <span className="font-semibold text-on-surface">{tableName ?? "—"}</span>
                </p>
                <p className="text-sm text-on-surface-variant mb-5">
                    Nasıl devam etmek istersiniz?
                </p>
                {errorMessage ? (
                    <div
                        className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
                        role="alert"
                    >
                        {errorMessage}
                    </div>
                ) : null}
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onSelectOnlinePay}
                        disabled={loadingOnline}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--qresto-primary)] px-4 py-3.5 font-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span className="material-symbols-outlined text-[22px]">payments</span>
                        {loadingOnline ? "Yükleniyor…" : "Online öde"}
                    </button>
                    <button
                        type="button"
                        onClick={onSelectBillRequest}
                        disabled={loadingOnline}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-4 py-3.5 font-bold text-on-surface transition hover:bg-[var(--qresto-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span className="material-symbols-outlined text-primary text-[22px]">
                            receipt_long
                        </span>
                        Hesap iste
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loadingOnline}
                        className="mt-1 w-full py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                    >
                        Vazgeç
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomePayChoiceModal;
