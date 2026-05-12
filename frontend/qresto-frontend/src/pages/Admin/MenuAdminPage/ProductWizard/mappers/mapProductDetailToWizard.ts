import type { MenuItemDetailResponse } from "../../../../menuDetailPage/types/menuDetail.types";
import type { MenuAdminProductDraft } from "../../types/menuAdmin.types";
import { createInitialWizardOptionGroups } from "./wizardOptionGroups";
import type { WizardOptionGroup } from "../types/productWizard.types";

export const mapProductDetailToMenuAdminDraft = (d: MenuItemDetailResponse): MenuAdminProductDraft => ({
    name: d.name,
    categoryId: d.categoryId != null ? String(d.categoryId) : "",
    description: d.description ?? "",
    price: String(Number(d.price)),
    imageUrl: d.imageUrl ?? "",
    prepTimeMin: d.prepTimeMin != null ? String(d.prepTimeMin) : "",
    calorie: d.calorie != null ? String(d.calorie) : "",
    gram: d.gram != null ? String(d.gram) : "",
    ingredients: d.ingredients ?? "",
    removableIngredients: d.removableIngredients ?? "",
    addableIngredients: d.addableIngredients ?? "",
    selectedOptionGroupIds: [],
    active: d.active,
    /** Sunucudaki ortalama puan > 0 ise değerlendirme satırı “aktif” gösterimi. */
    ratingActive: Number(d.avgRating ?? 0) > 0,
    inStock: d.inStock,
    orderNoteEnabled: d.orderNoteEnabled ?? false,
    orderNoteTitle: d.orderNoteTitle ?? "",
});

/** API opsiyonlarını sihirbaz `WizardOptionGroup` listesine çevirir; yoksa varsayılan şablon. */
export const mapApiDetailToWizardOptionGroups = (
    groups: MenuItemDetailResponse["optionGroups"]
): WizardOptionGroup[] => {
    if (!groups?.length) return createInitialWizardOptionGroups();
    return [...groups]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((g) => ({
            id: `wg-load-${g.id}`,
            kind: g.kind,
            hasPrice: g.hasPrice,
            userTitle: g.userTitle ?? "",
            metaTitle: g.metaTitle ?? "",
            descriptionLine: g.descriptionLine ?? "",
            required: g.required,
            maxSelect: g.maxSelect,
            includedInPreview: g.includedInPreview,
            choices: [...g.choices]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((c) => ({
                    id: `ch-load-${c.id}`,
                    label: c.label ?? "",
                    priceDelta: Number(c.priceDelta ?? 0),
                })),
        }));
};
