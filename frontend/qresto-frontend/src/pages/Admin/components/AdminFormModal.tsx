import type { ReactNode } from "react";

export type AdminFormModalProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    primaryLabel: string;
    onPrimary: () => void | Promise<void>;
    primaryDisabled?: boolean;
    primaryBusy?: boolean;
    secondaryLabel?: string;
};

/**
 * Basit form diyaloğu (kategori ekle / düzenle vb.).
 */
const AdminFormModal = ({
    open,
    title,
    onClose,
    children,
    primaryLabel,
    onPrimary,
    primaryDisabled = false,
    primaryBusy = false,
    secondaryLabel = "Vazgeç",
}: AdminFormModalProps) => {
    if (!open) return null;

    const busy = primaryBusy;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <button
                type="button"
                aria-label="Pencereyi kapat"
                onClick={busy ? undefined : onClose}
                className="absolute inset-0 bg-black/45 disabled:cursor-not-allowed"
                disabled={busy}
            />
            <div
                className="relative z-10 w-full max-w-md rounded-xl p-6 shadow-xl bg-surface-container-lowest border border-outline-variant"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-form-modal-title"
            >
                <h3
                    id="admin-form-modal-title"
                    className="text-lg font-bold text-on-surface mb-4"
                >
                    {title}
                </h3>
                <div className="text-on-surface">{children}</div>
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="px-4 py-2 rounded-lg border text-on-surface hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {secondaryLabel}
                    </button>
                    <button
                        type="button"
                        onClick={() => void onPrimary()}
                        disabled={busy || primaryDisabled}
                        className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {busy ? "Kaydediliyor…" : primaryLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminFormModal;
