import type { Dispatch, DragEvent, SetStateAction } from "react";

import type { MenuAdminProductDraft } from "../../types/menuAdmin.types";
import { DEFAULT_ORDER_NOTE_HEADING } from "../services/wizardConstants";
import type { WizardOptionGroup } from "../types/productWizard.types";
import WizardCustomerOptionPreviewBlocks from "./WizardCustomerOptionPreviewBlocks";
import WizardOptionGroupCard from "./WizardOptionGroupCard";
import WizardProductPreview from "./WizardProductPreview";
import WizardQuickPreviewPanel from "./WizardQuickPreviewPanel";

type WizardStep3OptionsProps = {
    draft: MenuAdminProductDraft;
    setDraftField: <K extends keyof MenuAdminProductDraft>(key: K, value: MenuAdminProductDraft[K]) => void;
    wizardOptionGroups: WizardOptionGroup[];
    setWizardOptionGroups: Dispatch<SetStateAction<WizardOptionGroup[]>>;
    orderNoteHeadingDisplay: string;
    previewImage: string;
    summaryPriceLabel: string;
    onOpenGroupModal: (group: WizardOptionGroup) => void;
    onOpenOrderNoteModal: () => void;
    onGroupDragStart: (groupId: string) => (event: DragEvent<HTMLElement>) => void;
    onGroupDragOver: (event: DragEvent<HTMLElement>) => void;
    onGroupDrop: (dropId: string) => (event: DragEvent<HTMLElement>) => void;
};

function WizardStep3Options({
    draft,
    setDraftField,
    wizardOptionGroups,
    setWizardOptionGroups,
    orderNoteHeadingDisplay,
    previewImage,
    summaryPriceLabel,
    onOpenGroupModal,
    onOpenOrderNoteModal,
    onGroupDragStart,
    onGroupDragOver,
    onGroupDrop,
}: WizardStep3OptionsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start wizard-reveal-cols-2">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg border border-surface-variant shadow-sm p-6 flex flex-col gap-6 min-w-0 wizard-reveal-stack">
                <div className="border-b border-surface-variant pb-3">
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">Opsiyon grupları</h2>
                </div>
                <div className="flex flex-col gap-3">
                    {wizardOptionGroups.length === 0 ? (
                        <p className="text-body-sm text-secondary py-6 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-low">
                            Henüz opsiyon grubu yok.
                        </p>
                    ) : null}
                    {wizardOptionGroups.map((group, groupIndex) => (
                        <WizardOptionGroupCard
                            key={group.id}
                            motionIndex={groupIndex}
                            group={group}
                            onEdit={() => onOpenGroupModal(group)}
                            onTogglePreview={() =>
                                setWizardOptionGroups((prev) =>
                                    prev.map((g) =>
                                        g.id === group.id ? { ...g, includedInPreview: !g.includedInPreview } : g
                                    )
                                )
                            }
                            onDragStart={onGroupDragStart(group.id)}
                            onDragOver={onGroupDragOver}
                            onDrop={onGroupDrop(group.id)}
                        />
                    ))}
                    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h4 className="font-semibold text-on-surface">Sipariş notu</h4>
                                <p className="text-body-sm text-secondary mt-0.5">
                                    Müşterinin özel istek yazabileceği alan (ürün detayında).
                                </p>
                                <p className="text-body-sm text-secondary mt-1">
                                    Önizlemede göstermek için Ekle düğmesine basın. Başlığı kalem simgesiyle
                                    değiştirin; boş bırakırsanız &quot;{DEFAULT_ORDER_NOTE_HEADING}&quot; kullanılır.
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={onOpenOrderNoteModal}
                                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container-low"
                                    aria-label="Sipariş notu başlığını düzenle"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDraftField("orderNoteEnabled", !draft.orderNoteEnabled)}
                                    className={`h-9 px-3 rounded-lg text-body-sm font-semibold text-white shadow-sm transition-colors border ${
                                        draft.orderNoteEnabled
                                            ? "bg-[#991b1b] hover:bg-[#7f1d1d] border-[#7f1d1d] dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-500"
                                            : "bg-green-600 hover:bg-green-700 border-green-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:border-emerald-400"
                                    }`}
                                >
                                    {draft.orderNoteEnabled ? "Kaldır" : "Ekle"}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <WizardQuickPreviewPanel
                asideClassName="lg:sticky lg:top-0"
                footerHint="Soldan Ekle düğmesiyle opsiyonları ve sipariş notunu kartın altındaki önizlemede gösterin; ürün görseli ve başlık üstte kalır."
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
                            emptyListingHint="Önizlemede göstermek için soldan opsiyon grubuna veya sipariş notuna Ekle düğmesine basın."
                        />
                    }
                />
            </WizardQuickPreviewPanel>
        </div>
    );
}

export default WizardStep3Options;
