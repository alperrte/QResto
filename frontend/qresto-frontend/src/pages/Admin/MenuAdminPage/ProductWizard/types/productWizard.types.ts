import type { ReactNode } from "react";

export type WizardProductPreviewMode = "step1" | "step2";

export type WizardProductPreviewProps = {
    mode: WizardProductPreviewMode;
    imageUrl: string;
    name: string;
    description: string;
    /** `formatDraftPriceLabel(draft.price)` — tutarlı ₺ biçimi. */
    priceFormatted: string;
    prepTimeMin: string;
    calorie: string;
    gram: string;
    active: boolean;
    /** Değerlendirme satırı önizlemede soluk mu; verilmezse `true` (normal). */
    ratingActive?: boolean;
    /** Örn. liste API `avgRating`; verilmezse 0.0. */
    ratingDisplay?: string;
    /** Örn. adım 3: ürün kartının altında müşteri opsiyon önizlemesi. */
    optionBlocks?: ReactNode;
    /** Kart içi blokları yukarıdan aşağı hafif sıralı göster (ör. menü admin önizleme). */
    innerStagger?: boolean;
};

export type OptionKind = "portion" | "multi" | "single";

export type OptionChoice = {
    id: string;
    label: string;
    priceDelta: number;
};

export type OptionGroup = {
    id: string;
    name: string;
    kind: OptionKind;
    minSelect: number;
    maxSelect: number;
    choices: OptionChoice[];
};

export type WizardOptionGroup = {
    id: string;
    kind: OptionKind;
    hasPrice: boolean;
    userTitle: string;
    metaTitle: string;
    descriptionLine: string;
    required: boolean;
    maxSelect: number;
    choices: OptionChoice[];
    includedInPreview: boolean;
};

export type LocalCategory = {
    id: string;
    label: string;
};
