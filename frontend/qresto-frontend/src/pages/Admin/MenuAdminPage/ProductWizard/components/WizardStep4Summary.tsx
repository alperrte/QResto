import { AdminStatusBadge } from "../../../components/AdminStatusBadge";
import AdminInfoSpeechBubble from "../../../components/AdminInfoSpeechBubble";
import {
    MENU_ADMIN_CATEGORY_UNCHOSEN,
    type MenuAdminProductDraft,
} from "../../types/menuAdmin.types";
import type { LocalCategory, WizardOptionGroup } from "../types/productWizard.types";
import WizardCustomerOptionPreviewBlocks from "./WizardCustomerOptionPreviewBlocks";
import WizardProductPreview from "./WizardProductPreview";
import WizardQuickPreviewPanel from "./WizardQuickPreviewPanel";

type WizardStep4SummaryProps = {
    draft: MenuAdminProductDraft;
    availableCategories: LocalCategory[];
    summaryPriceLabel: string;
    ingredientChips: string[];
    wizardOptionGroups: WizardOptionGroup[];
    previewImage: string;
    orderNoteHeadingDisplay: string;
    setWizardStep: (step: number) => void;
};

function WizardStep4Summary({
    draft,
    availableCategories,
    summaryPriceLabel,
    ingredientChips,
    wizardOptionGroups,
    previewImage,
    orderNoteHeadingDisplay,
    setWizardStep,
}: WizardStep4SummaryProps) {
    const groupDisplayTitle = (group: WizardOptionGroup) => group.userTitle.trim() || group.metaTitle;

    return (
        <div className="space-y-4 wizard-reveal-stack">
            <div>
                <p className="text-body-md text-secondary max-w-3xl">
                    Ürün ekleme işleminin son adımı. Aşağıdaki özeti kontrol edin; bir adımı düzenlemek için
                    ilgili &quot;Düzenle&quot; ile geri dönebilirsiniz.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 wizard-reveal-cols-2">
                <div className="lg:col-span-8 flex flex-col gap-6 wizard-reveal-stack">
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                        <div className="flex flex-wrap justify-between items-center gap-2 px-4 py-3 border-b border-outline-variant bg-surface-container-low">
                            <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                                <AdminInfoSpeechBubble
                                    ariaLabel="Temel bilgiler özeti hakkında"
                                    tail="left"
                                    triggerSize="md"
                                >
                                    <p className="m-0">
                                        Bu bölümde 1. adımda girdiğiniz ürün adı, kategori, fiyat, görsel ve aktif /
                                        pasif durumu özetlenir. Düzenlemek için sağdaki bağlantıyla 1. adıma dönebilirsiniz.
                                    </p>
                                </AdminInfoSpeechBubble>
                                Temel bilgiler
                            </h2>
                            <button
                                type="button"
                                onClick={() => setWizardStep(1)}
                                className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Düzenle
                            </button>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-body-md wizard-inner-fields-stagger">
                            <div className="flex flex-col gap-1">
                                <span className="text-body-sm text-secondary">Ürün adı</span>
                                <span className="text-body-lg text-on-surface font-medium">
                                    {draft.name.trim() || "—"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-body-sm text-secondary">Kategori</span>
                                <span className="text-body-lg text-on-surface font-medium">
                                    {draft.categoryId.trim() === MENU_ADMIN_CATEGORY_UNCHOSEN
                                        ? "Kategori seçilmedi"
                                        : (availableCategories.find((c) => c.id === draft.categoryId)?.label ??
                                          (draft.categoryId.trim()
                                              ? "—"
                                              : "Kategorisiz (menüde yalnızca Tümü altında)"))}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-body-sm text-secondary">Fiyat</span>
                                <span className="text-body-lg text-on-surface font-medium">{summaryPriceLabel}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-body-sm text-secondary">Durum</span>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                    <AdminStatusBadge active={draft.active} size="md" />
                                    <span className="text-on-surface-variant text-sm">
                                        / {draft.inStock ? "Stokta" : "Stok dışı"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                        <div className="flex flex-wrap justify-between items-center gap-2 px-4 py-3 border-b border-outline-variant bg-surface-container-low">
                            <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary text-[22px]">
                                    description
                                </span>
                                İçerik ve detaylar
                            </h2>
                            <button
                                type="button"
                                onClick={() => setWizardStep(2)}
                                className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Düzenle
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-4 wizard-inner-fields-stagger">
                            <div className="flex flex-col gap-1">
                                <span className="text-body-sm text-secondary">Açıklama</span>
                                <p className="text-body-md text-on-surface whitespace-pre-wrap">
                                    {draft.description.trim() || "—"}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-body-sm text-on-surface border border-outline-variant rounded-lg px-3 py-3 bg-surface-container-low/50">
                                <span
                                    className={`inline-flex items-center gap-1.5 ${
                                        !draft.prepTimeMin.trim() ? "opacity-50" : ""
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                                        schedule
                                    </span>
                                    <span className="text-secondary">Hazırlama:</span>
                                    <span className="font-medium text-on-surface">
                                        {draft.prepTimeMin.trim() ? `${draft.prepTimeMin.trim()} dk` : "—"}
                                    </span>
                                </span>
                                <span
                                    className={`inline-flex items-center gap-1.5 ${
                                        !draft.calorie.trim() ? "opacity-50" : ""
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                                        local_fire_department
                                    </span>
                                    <span className="text-secondary">Kalori:</span>
                                    <span className="font-medium text-on-surface">
                                        {draft.calorie.trim() ? draft.calorie.trim() : "—"}
                                    </span>
                                </span>
                                <span
                                    className={`inline-flex items-center gap-1.5 ${
                                        !draft.gram.trim() ? "opacity-50" : ""
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                                        scale
                                    </span>
                                    <span className="text-secondary">Gram:</span>
                                    <span className="font-medium text-on-surface">
                                        {draft.gram.trim() ? `${draft.gram.trim()} g` : "—"}
                                    </span>
                                </span>
                                <span
                                    className={`inline-flex items-center gap-1.5 text-primary ${
                                        draft.ratingActive ? "" : "opacity-50"
                                    }`}
                                >
                                    <span
                                        className="material-symbols-outlined text-[18px]"
                                        data-weight={draft.ratingActive ? "fill" : undefined}
                                    >
                                        star
                                    </span>
                                    <span className="text-on-surface-variant">Puan (önizleme):</span>
                                    <span className="font-bold text-on-surface">0.0</span>
                                    <AdminStatusBadge active={draft.ratingActive} size="md" />
                                </span>
                                <span className="inline-flex items-center gap-2 w-full sm:w-auto sm:min-w-[12rem]">
                                    <span className="text-on-surface-variant">Ürün menüde:</span>
                                    <AdminStatusBadge active={draft.active} size="md" />
                                </span>
                            </div>
                            {ingredientChips.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    <span className="text-body-sm text-secondary">
                                        İçerik / etiket (virgülle ayırın)
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {ingredientChips.map((chip, chipIdx) => (
                                            <span
                                                key={`${chipIdx}-${chip}`}
                                                className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-900 border border-orange-200 dark:bg-orange-950/55 dark:text-orange-200 dark:border-orange-800/50"
                                            >
                                                {chip}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                        <div className="flex flex-wrap justify-between items-center gap-2 px-4 py-3 border-b border-outline-variant bg-surface-container-low">
                            <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary text-[22px]">tune</span>
                                Seçenekler ve ekstralar
                            </h2>
                            <button
                                type="button"
                                onClick={() => setWizardStep(3)}
                                className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Düzenle
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="border border-outline-variant rounded-lg overflow-hidden">
                                <table className="w-full text-left border-collapse text-body-sm">
                                    <thead className="bg-surface-container-low border-b border-outline-variant">
                                        <tr>
                                            <th className="p-3 text-xs font-semibold text-secondary">
                                                Opsiyon grubu
                                            </th>
                                            <th className="p-3 text-xs font-semibold text-secondary text-right whitespace-nowrap w-[1%]">
                                                Seçenek sayısı
                                            </th>
                                            <th className="p-3 text-xs font-semibold text-secondary whitespace-nowrap w-[1%]">
                                                Önizlemede
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wizardOptionGroups.map((group, idx) => (
                                            <tr
                                                key={group.id}
                                                className={`border-b border-outline-variant ${
                                                    idx % 2 === 0
                                                        ? "bg-surface-container-lowest"
                                                        : "bg-surface-container-low"
                                                }`}
                                            >
                                                <td className="p-3 align-top">
                                                    <span className="text-on-surface font-medium block">
                                                        {groupDisplayTitle(group)}
                                                    </span>
                                                    {group.userTitle.trim() && group.userTitle.trim() !== group.metaTitle ? (
                                                        <span className="text-xs text-on-surface-variant block mt-0.5">
                                                            Şablon: {group.metaTitle}
                                                        </span>
                                                    ) : null}
                                                </td>
                                                <td className="p-3 align-top text-right text-on-surface-variant whitespace-nowrap">
                                                    {group.choices.length} seçenek
                                                </td>
                                                <td className="p-3 align-top">
                                                    <AdminStatusBadge active={group.includedInPreview} size="md" />
                                                </td>
                                            </tr>
                                        ))}
                                        <tr
                                            className={`border-b border-outline-variant last:border-b-0 ${
                                                wizardOptionGroups.length % 2 === 0
                                                    ? "bg-surface-container-lowest"
                                                    : "bg-surface-container-low"
                                            }`}
                                        >
                                            <td className="p-3 align-top">
                                                <span className="text-on-surface font-medium block">
                                                    Sipariş notu
                                                </span>
                                                
                                            </td>
                                            <td className="p-3 align-top text-right text-on-surface-variant whitespace-nowrap">
                                                —
                                            </td>
                                            <td className="p-3 align-top">
                                                <AdminStatusBadge active={draft.orderNoteEnabled} size="md" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <WizardQuickPreviewPanel
                        asideClassName="lg:sticky lg:top-0"
                        footerHint="Müşterinin ürün sayfasında göreceği görünüm; soldaki özetle aynı veridir."
                    >
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
                            optionBlocks={
                                <WizardCustomerOptionPreviewBlocks
                                    wizardOptionGroups={wizardOptionGroups}
                                    orderNoteEnabled={draft.orderNoteEnabled}
                                    orderNoteHeadingDisplay={orderNoteHeadingDisplay}
                                    emptyListingHint="Önizlemede gösterilecek opsiyon veya sipariş notu yok; 3. adımdan Ekle ile ekleyebilirsiniz."
                                />
                            }
                        />
                    </WizardQuickPreviewPanel>
                </div>
            </div>
        </div>
    );
}

export default WizardStep4Summary;
