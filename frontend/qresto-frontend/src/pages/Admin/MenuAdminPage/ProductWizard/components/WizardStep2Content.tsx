import { AdminStatusBadge } from "../../../components/AdminStatusBadge";
import type { MenuAdminProductDraft } from "../../types/menuAdmin.types";
import WizardProductPreview from "./WizardProductPreview";
import WizardQuickPreviewPanel from "./WizardQuickPreviewPanel";

type WizardStep2ContentProps = {
    draft: MenuAdminProductDraft;
    setDraftField: <K extends keyof MenuAdminProductDraft>(key: K, value: MenuAdminProductDraft[K]) => void;
    previewImage: string;
    summaryPriceLabel: string;
};

function WizardStep2Content({
    draft,
    setDraftField,
    previewImage,
    summaryPriceLabel,
}: WizardStep2ContentProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start wizard-reveal-cols-2">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg border border-surface-variant shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 wizard-inner-fields-stagger">
                    <label className="flex flex-col gap-1 md:col-span-2">
                        <span className="text-body-sm text-secondary inline-flex items-center gap-1">
                            Açıklama
                            <abbr title="Zorunlu alan" className="text-red-600 no-underline font-bold">
                                *
                            </abbr>
                        </span>
                        <textarea
                            value={draft.description}
                            onChange={(event) => setDraftField("description", event.target.value)}
                            aria-required="true"
                            className="rounded-lg border border-outline-variant px-3 py-2 bg-surface min-h-[72px]"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-body-sm text-secondary">
                            Hazırlama (dk){" "}
                            <span className="text-on-surface-variant font-normal">(isteğe bağlı)</span>
                        </span>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                                schedule
                            </span>
                            <input
                                type="number"
                                min="0"
                                value={draft.prepTimeMin}
                                onChange={(event) => setDraftField("prepTimeMin", event.target.value)}
                                className="h-10 w-full rounded-lg border border-outline-variant pl-10 pr-3 bg-surface"
                            />
                        </div>
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-body-sm text-secondary">
                            Kalori <span className="text-on-surface-variant font-normal">(isteğe bağlı)</span>
                        </span>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                                local_fire_department
                            </span>
                            <input
                                type="number"
                                min="0"
                                value={draft.calorie}
                                onChange={(event) => setDraftField("calorie", event.target.value)}
                                className="h-10 w-full rounded-lg border border-outline-variant pl-10 pr-3 bg-surface"
                            />
                        </div>
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-body-sm text-secondary">
                            Gram <span className="text-on-surface-variant font-normal">(isteğe bağlı)</span>
                        </span>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                                scale
                            </span>
                            <input
                                type="number"
                                min="0"
                                value={draft.gram}
                                onChange={(event) => setDraftField("gram", event.target.value)}
                                className="h-10 w-full rounded-lg border border-outline-variant pl-10 pr-3 bg-surface"
                            />
                        </div>
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-body-sm text-secondary">Ürün puanı (değerlendirme)</span>
                        <div className="h-10 rounded-lg border border-outline-variant px-3 bg-surface-container-low inline-flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-on-surface">
                                <span className="material-symbols-outlined text-[16px] text-primary">star</span>
                                0.0
                            </span>
                            <button
                                type="button"
                                onClick={() => setDraftField("ratingActive", !draft.ratingActive)}
                                className="inline-flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-full"
                                aria-label={
                                    draft.ratingActive
                                        ? "Değerlendirme gösterimini pasifleştir"
                                        : "Değerlendirme gösterimini aktifleştir"
                                }
                            >
                                <AdminStatusBadge active={draft.ratingActive} size="md" />
                            </button>
                        </div>
                        <p className="text-body-sm text-secondary">
                            Puan müşteri yorumlarıyla güncellenir; bu rozet yalnızca önizleme içindir.
                        </p>
                    </label>
                </div>
            </div>

            <WizardQuickPreviewPanel footerHint="Bu alan müşterilerinize ürünün nasıl görüneceğini gösterir.">
                <WizardProductPreview
                    mode="step2"
                    imageUrl={previewImage}
                    name={draft.name}
                    description={draft.description}
                    priceFormatted={summaryPriceLabel}
                    prepTimeMin={draft.prepTimeMin}
                    calorie={draft.calorie}
                    gram={draft.gram}
                    active={draft.active}
                    ratingActive={draft.ratingActive}
                />
            </WizardQuickPreviewPanel>
        </div>
    );
}

export default WizardStep2Content;
