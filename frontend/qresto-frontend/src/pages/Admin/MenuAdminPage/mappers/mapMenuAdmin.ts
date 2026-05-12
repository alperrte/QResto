import { MENU_ITEM_FALLBACK_IMAGE } from "../../../../constants/defaultMedia";
import type { MenuCategoryDto, MenuItemListItemDto } from "../../../menuPage/types/menu.types";
import type {
    MenuProductCreatePayload,
    MenuProductOptionGroupPayload,
    MenuProductUpdatePayload,
} from "../services/menuAdminApi";
import {
    MENU_ADMIN_CATEGORY_UNCHOSEN,
    type MenuAdminCategoryChip,
    type MenuAdminProductDraft,
    type MenuAdminProductRow,
} from "../types/menuAdmin.types";

export const mapCategoriesToChips = (categories: MenuCategoryDto[]): MenuAdminCategoryChip[] => {
    const sorted = [...categories].sort((a, b) => a.id - b.id);
    return [
        { id: "all", label: "Tümü" },
        ...sorted.map((category) => ({
            id: String(category.id),
            label: category.name,
        })),
    ];
};

const optionalTrim = (value: string): string | null => {
    const t = value.trim();
    return t.length > 0 ? t : null;
};

const optionalInt = (value: string): number | null => {
    const t = value.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isNaN(n) ? null : Math.round(n);
};

export const mapMenuAdminDraftToCreatePayload = (
    draft: MenuAdminProductDraft,
    optionGroups?: MenuProductOptionGroupPayload[]
): MenuProductCreatePayload => {
    const price = Number(draft.price);
    const trimmedCat = draft.categoryId.trim();
    if (trimmedCat === MENU_ADMIN_CATEGORY_UNCHOSEN) {
        throw new Error("Kategori seçilmeden ürün oluşturulamaz.");
    }
    const payload: MenuProductCreatePayload = {
        categoryId: trimmedCat === "" ? null : Number(trimmedCat),
        subCategoryId: null,
        name: draft.name.trim(),
        description: optionalTrim(draft.description),
        price,
        imageUrl: optionalTrim(draft.imageUrl),
        vatIncluded: true,
        ingredients: optionalTrim(draft.ingredients),
        removableIngredients: optionalTrim(draft.removableIngredients),
        addableIngredients: optionalTrim(draft.addableIngredients),
        calorie: optionalInt(draft.calorie),
        gram: optionalInt(draft.gram),
        prepTimeMin: optionalInt(draft.prepTimeMin),
        active: draft.active,
        inStock: draft.inStock,
        orderNoteEnabled: draft.orderNoteEnabled,
        orderNoteTitle: optionalTrim(draft.orderNoteTitle),
    };
    if (optionGroups !== undefined) {
        payload.optionGroups = optionGroups;
    }
    return payload;
};

export const mapMenuAdminDraftToUpdatePayload = (
    draft: MenuAdminProductDraft,
    optionGroups?: MenuProductOptionGroupPayload[]
): MenuProductUpdatePayload => {
    const trimmedCat = draft.categoryId.trim();
    const base = mapMenuAdminDraftToCreatePayload(draft, optionGroups);
    return {
        ...base,
        categoryId: trimmedCat === "" ? null : Number(trimmedCat),
        vatIncluded: true,
        active: draft.active,
        inStock: draft.inStock,
    };
};

export const mapItemsToRows = (
    items: MenuItemListItemDto[],
    categories: MenuCategoryDto[]
): MenuAdminProductRow[] => {
    const categoryById = new Map(
        categories.map((category) => [category.id, { label: category.name, active: category.active }])
    );

    return items.map((item) => {
        const price = Number(item.price ?? 0);
        const cid = item.categoryId;
        const meta = cid == null ? null : categoryById.get(cid) ?? null;
        return {
            id: String(item.id),
            name: item.name,
            categoryId: cid == null ? "" : String(cid),
            categoryLabel: cid == null ? "Kategorisiz" : (meta?.label ?? "Kategori"),
            categoryActive: cid == null ? null : meta?.active ?? null,
            imageUrl: item.imageUrl || MENU_ITEM_FALLBACK_IMAGE,
            description: item.description ?? "Açıklama bulunmuyor.",
            price,
            priceLabel: `₺${price.toFixed(2)}`,
            active: item.active,
            inStock: item.inStock,
            calorie: item.calorie,
            gram: item.gram,
            prepTimeMin: item.prepTimeMin,
            ingredients: item.ingredients,
            removableIngredients: item.removableIngredients,
            addableIngredients: item.addableIngredients,
            orderNoteEnabled: item.orderNoteEnabled ?? false,
            orderNoteTitle: item.orderNoteTitle ?? "",
        };
    });
};
