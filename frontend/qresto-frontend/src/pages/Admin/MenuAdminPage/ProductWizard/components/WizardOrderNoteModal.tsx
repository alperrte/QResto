import { DEFAULT_ORDER_NOTE_HEADING } from "../services/wizardConstants";

type WizardOrderNoteModalProps = {
    orderNoteTitleDraft: string;
    setOrderNoteTitleDraft: (value: string) => void;
    onClose: () => void;
    onSave: () => void;
};

function WizardOrderNoteModal({
    orderNoteTitleDraft,
    setOrderNoteTitleDraft,
    onClose,
    onSave,
}: WizardOrderNoteModalProps) {
    return (
        <div
            role="presentation"
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-note-modal-title"
                className="bg-surface-container-lowest rounded-xl shadow-xl max-w-md w-full p-6 border border-outline-variant"
                onClick={(event) => event.stopPropagation()}
            >
                <h3 id="order-note-modal-title" className="text-title-md font-semibold text-on-surface mb-4">
                            Sipariş notu başlığı
                </h3>
                <label className="flex flex-col gap-1 mb-6">
                    <span className="text-body-sm text-secondary">
                                Müşterinin göreceği başlık (boş bırakılırsa &quot;{DEFAULT_ORDER_NOTE_HEADING}&quot;)
                    </span>
                    <input
                        type="text"
                        value={orderNoteTitleDraft}
                        onChange={(event) => setOrderNoteTitleDraft(event.target.value)}
                        placeholder={DEFAULT_ORDER_NOTE_HEADING}
                        className="h-10 rounded-lg border border-outline-variant px-3 bg-surface"
                    />
                </label>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 px-4 rounded-lg border border-outline-variant text-body-sm font-semibold text-on-surface hover:bg-surface-container-low"
                    >
                                İptal
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        className="h-10 px-4 rounded-lg bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90"
                    >
                        Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WizardOrderNoteModal;
