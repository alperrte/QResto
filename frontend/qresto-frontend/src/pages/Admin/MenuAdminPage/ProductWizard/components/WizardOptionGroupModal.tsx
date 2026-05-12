import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { WizardOptionGroup } from "../types/productWizard.types";

/** number input: "05" → 5, boş → 0 (baştaki anlamsız sıfırları kaldırır). */
function parsePriceDeltaField(raw: string): number {
    const normalized = raw.replace(",", ".").trim();
    if (normalized === "" || normalized === "-" || normalized === ".") return 0;
    const n = parseFloat(normalized);
    return Number.isNaN(n) ? 0 : n;
}

type WizardOptionGroupModalProps = {
    modalDraft: WizardOptionGroup;
    setModalDraft: Dispatch<SetStateAction<WizardOptionGroup | null>>;
    newChoiceId: () => string;
    onClose: () => void;
    onSave: () => void;
};

function WizardOptionGroupModal({
    modalDraft,
    setModalDraft,
    newChoiceId,
    onClose,
    onSave,
}: WizardOptionGroupModalProps) {
    /** Fiyat 0 iken odakta alanı boş göster; blur’da sıfırla. */
    const [priceEmptyFocusChoiceId, setPriceEmptyFocusChoiceId] = useState<string | null>(null);

    useEffect(() => {
        setPriceEmptyFocusChoiceId(null);
    }, [modalDraft.id]);

    return (
        <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="wizard-option-modal-title"
                className="bg-surface-container-lowest rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-outline-variant"
                onClick={(event) => event.stopPropagation()}
            >
                <h3 id="wizard-option-modal-title" className="text-title-md font-semibold text-on-surface mb-4">
                    Opsiyon grubunu düzenle
                </h3>
                <div className="space-y-4">
                    <label className="flex flex-col gap-1">
                        <span className="text-body-sm text-secondary">Müşteride görünen başlık</span>
                        <span className="text-body-xs text-secondary">
                            Boş bırakırsanız soldaki grup adı (
                            <span className="font-medium text-on-surface">{modalDraft.metaTitle}</span>)
                            kullanılır.
                        </span>
                        <input
                            type="text"
                            value={modalDraft.userTitle}
                            onChange={(event) =>
                                setModalDraft((d) => (d ? { ...d, userTitle: event.target.value } : d))
                            }
                            placeholder={modalDraft.metaTitle}
                            className="h-10 rounded-lg border border-outline-variant px-3 bg-surface"
                        />
                    </label>
                    <div className="space-y-2">
                        <p className="text-body-sm font-medium text-on-surface">Seçenekler</p>
                        {modalDraft.hasPrice ? (
                            <div className="grid grid-cols-[1fr_100px_auto] gap-2 text-body-sm text-secondary">
                                <span>Seçenek adı</span>
                                <span>Ek fiyat (₺)</span>
                                <span />
                            </div>
                        ) : (
                            <div className="grid grid-cols-[1fr_auto] gap-2 text-body-sm text-secondary">
                                <span>Seçenek adı</span>
                                <span />
                            </div>
                        )}
                        {modalDraft.choices.map((choice, choiceIndex) => (
                            <div
                                key={choice.id}
                                className={`grid items-center gap-2 ${
                                    modalDraft.hasPrice ? "grid-cols-[1fr_100px_auto]" : "grid-cols-[1fr_auto]"
                                }`}
                            >
                                <input
                                    type="text"
                                    value={choice.label}
                                    onChange={(event) =>
                                        setModalDraft((d) =>
                                            d
                                                ? {
                                                      ...d,
                                                      choices: d.choices.map((c, i) =>
                                                          i === choiceIndex
                                                              ? { ...c, label: event.target.value }
                                                              : c
                                                      ),
                                                  }
                                                : d
                                        )
                                    }
                                    placeholder={`Seçenek ${choiceIndex + 1}`}
                                    className="h-9 rounded-lg border border-outline-variant px-3 bg-surface"
                                />
                                {modalDraft.hasPrice ? (
                                    <input
                                        type="number"
                                        step="any"
                                        value={
                                            priceEmptyFocusChoiceId === choice.id && choice.priceDelta === 0
                                                ? ""
                                                : Number.isFinite(choice.priceDelta)
                                                  ? choice.priceDelta
                                                  : 0
                                        }
                                        onFocus={() => {
                                            if (choice.priceDelta === 0) {
                                                setPriceEmptyFocusChoiceId(choice.id);
                                            }
                                        }}
                                        onBlur={() => {
                                            setPriceEmptyFocusChoiceId((cur) =>
                                                cur === choice.id ? null : cur
                                            );
                                        }}
                                        onChange={(event) => {
                                            const next = parsePriceDeltaField(event.target.value);
                                            setModalDraft((d) =>
                                                d
                                                    ? {
                                                          ...d,
                                                          choices: d.choices.map((c, i) =>
                                                              i === choiceIndex ? { ...c, priceDelta: next } : c
                                                          ),
                                                      }
                                                    : d
                                            );
                                        }}
                                        className="h-9 rounded-lg border border-outline-variant px-3 bg-surface"
                                    />
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setModalDraft((d) =>
                                            d && d.choices.length > 1
                                                ? {
                                                      ...d,
                                                      choices: d.choices.filter((_, i) => i !== choiceIndex),
                                                  }
                                                : d
                                        )
                                    }
                                    disabled={modalDraft.choices.length <= 1}
                                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 dark:bg-red-600 dark:hover:bg-red-700"
                                    aria-label="Seçeneği kaldır"
                                >
                                    <span className="material-symbols-outlined text-[18px] leading-none text-white">
                                        close
                                    </span>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() =>
                                setModalDraft((d) =>
                                    d
                                        ? {
                                              ...d,
                                              choices: [
                                                  ...d.choices,
                                                  {
                                                      id: newChoiceId(),
                                                      label: "",
                                                      priceDelta: 0,
                                                  },
                                              ],
                                          }
                                        : d
                                )
                            }
                            className="h-9 px-3 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low text-body-sm"
                        >
                            Seçenek ekle
                        </button>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-outline-variant">
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

export default WizardOptionGroupModal;
