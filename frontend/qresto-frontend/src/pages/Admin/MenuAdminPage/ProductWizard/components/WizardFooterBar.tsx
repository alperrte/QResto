import type { Dispatch, SetStateAction } from "react";

type WizardFooterBarProps = {
    wizardStep: number;
    isEditRoute: boolean;
    canProceedCurrentStep: boolean;
    summaryAcknowledged: boolean;
    setSummaryAcknowledged: (value: boolean) => void;
    setWizardStep: Dispatch<SetStateAction<number>>;
    onCancel: () => void;
    onPublish: () => Promise<void>;
};

function WizardFooterBar({
    wizardStep,
    isEditRoute,
    canProceedCurrentStep,
    summaryAcknowledged,
    setSummaryAcknowledged,
    setWizardStep,
    onCancel,
    onPublish,
}: WizardFooterBarProps) {
    return (
        <footer className="wizard-footer-enter fixed bottom-0 left-[250px] right-0 border-t border-outline-variant bg-surface-container-lowest p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(15,23,42,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.35)]">
            <div
                className={`max-w-7xl mx-auto ${
                    wizardStep === 4
                        ? "flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4"
                        : "flex justify-between items-center"
                }`}
            >
                {wizardStep === 4 ? (
                    <>
                        <label className="flex items-start gap-3 cursor-pointer group max-w-xl">
                            <input
                                type="checkbox"
                                checked={summaryAcknowledged}
                                onChange={(event) => setSummaryAcknowledged(event.target.checked)}
                                className="mt-1 h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary accent-primary shrink-0"
                            />
                            <span className="text-body-md text-on-surface group-hover:text-primary transition-colors select-none">
                                Tüm bilgilerin doğruluğunu onaylıyorum.
                            </span>
                        </label>
                        <div className="flex flex-wrap items-center gap-2 justify-end w-full lg:w-auto">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2.5 text-label-bold text-secondary hover:bg-surface-container-low rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSummaryAcknowledged(false);
                                    setWizardStep(3);
                                }}
                                className="px-4 py-2.5 text-label-bold text-on-surface bg-surface-container-low border border-outline-variant hover:bg-surface-container-high rounded-lg transition-colors"
                            >
                                Geri dön
                            </button>
                            <button
                                type="button"
                                disabled={!summaryAcknowledged}
                                onClick={() => void onPublish()}
                                className="px-6 py-2.5 text-label-bold text-on-primary bg-primary-container hover:opacity-90 rounded-lg shadow-sm transition-colors disabled:opacity-45 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">publish</span>
                                {isEditRoute ? "Değişiklikleri kaydet" : "Ürünü oluştur ve yayınla"}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-label-bold text-secondary hover:bg-surface-container-low rounded-md transition-colors"
                        >
                            İptal
                        </button>
                        <div className="flex gap-4">
                            {wizardStep < 4 ? (
                                <button
                                    type="button"
                                    disabled={!canProceedCurrentStep}
                                    onClick={() => {
                                        if (wizardStep === 3) {
                                            setSummaryAcknowledged(false);
                                        }
                                        setWizardStep((step) => Math.min(4, step + 1));
                                    }}
                                    className="px-6 py-2 text-label-bold text-on-primary bg-primary-container hover:opacity-90 rounded-md shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                                >
                                    İleri
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            ) : null}
                        </div>
                    </>
                )}
            </div>
        </footer>
    );
}

export default WizardFooterBar;
