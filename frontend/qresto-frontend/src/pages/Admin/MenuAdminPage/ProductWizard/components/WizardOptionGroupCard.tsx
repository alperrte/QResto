import type { CSSProperties, DragEvent } from "react";

import type { WizardOptionGroup } from "../types/productWizard.types";

type WizardOptionGroupCardProps = {
    motionIndex?: number;
    group: WizardOptionGroup;
    onEdit: () => void;
    onTogglePreview: () => void;
    onDragStart: (event: DragEvent<HTMLElement>) => void;
    onDragOver: (event: DragEvent<HTMLElement>) => void;
    onDrop: (event: DragEvent<HTMLElement>) => void;
};

function WizardOptionGroupCard({
    motionIndex = 0,
    group,
    onEdit,
    onTogglePreview,
    onDragStart,
    onDragOver,
    onDrop,
}: WizardOptionGroupCardProps) {
    const displayTitle = group.metaTitle;
    const showDefaultCol =
        group.required &&
        (group.kind === "portion" || (group.kind === "single" && group.id !== "wg-service"));
    const gridTemplate =
        group.hasPrice && showDefaultCol
            ? "grid-cols-[minmax(0,1fr)_100px_88px]"
            : group.hasPrice
              ? "grid-cols-[minmax(0,1fr)_100px]"
              : showDefaultCol
                ? "grid-cols-[minmax(0,1fr)_88px]"
                : "grid-cols-[minmax(0,1fr)]";

    return (
        <section
            onDragOver={onDragOver}
            onDrop={onDrop}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 space-y-3 wizard-op-card-enter"
            style={{ "--wog": motionIndex } as CSSProperties}
        >
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                    <span
                        draggable
                        onDragStart={onDragStart}
                        className="material-symbols-outlined text-[22px] text-on-surface-variant shrink-0 mt-0.5 cursor-grab active:cursor-grabbing select-none"
                        aria-label="Sürükle"
                        role="button"
                        tabIndex={0}
                    >
                        drag_indicator
                    </span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-on-surface truncate">{displayTitle}</h4>
                        </div>
                        <p className="text-body-sm text-secondary mt-0.5">
                            {group.descriptionLine}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container-low"
                        aria-label="Düzenle"
                    >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button
                        type="button"
                        onClick={onTogglePreview}
                        className={`h-9 px-3 rounded-lg text-body-sm font-semibold text-white shadow-sm transition-colors border ${
                            group.includedInPreview
                                ? "bg-[#991b1b] hover:bg-[#7f1d1d] border-[#7f1d1d] dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-500"
                                : "bg-green-600 hover:bg-green-700 border-green-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:border-emerald-400"
                        }`}
                    >
                        {group.includedInPreview ? "Kaldır" : "Ekle"}
                    </button>
                </div>
            </div>
            <div className="rounded-lg border border-outline-variant overflow-hidden text-body-sm wizard-op-rows-stagger">
                <div
                    className={`grid gap-2 px-3 py-2 bg-surface-container-low text-secondary font-medium border-b border-outline-variant ${gridTemplate}`}
                >
                    <span>Seçenek</span>
                    {group.hasPrice ? <span>Fiyat etkisi</span> : null}
                    {showDefaultCol ? <span className="text-center">Varsayılan</span> : null}
                </div>
                {group.choices.map((choice, choiceIndex) => (
                    <div
                        key={choice.id}
                        className={`grid gap-2 px-3 py-2 items-center border-b border-surface-variant last:border-b-0 ${gridTemplate}`}
                    >
                        <span className="text-on-surface truncate">
                            {choice.label.trim() || `Seçenek ${choiceIndex + 1}`}
                        </span>
                        {group.hasPrice ? (
                            <span
                                className={
                                    choice.priceDelta !== 0
                                        ? "text-[#059669] dark:text-emerald-400 font-medium tabular-nums"
                                        : "text-on-surface-variant tabular-nums"
                                }
                            >
                                +{choice.priceDelta.toFixed(2).replace(".", ",")} ₺
                            </span>
                        ) : null}
                        {showDefaultCol ? (
                            <div className="flex justify-center">
                                <input
                                    type="radio"
                                    checked={choiceIndex === 0}
                                    readOnly
                                    className="accent-primary w-4 h-4"
                                    aria-label="Varsayılan"
                                />
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={onEdit}
                className="text-body-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline"
            >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Seçenek ekle
            </button>
        </section>
    );
}

export default WizardOptionGroupCard;
