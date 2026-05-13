import { MENU_ITEM_FALLBACK_IMAGE } from "../../../constants/defaultMedia";
import type { MenuItem } from "../../menuPage/menuItems";
import type { MenuItemDetailResponse } from "../types/menuDetail.types";

const optionalPositiveMeta = (value: number | null | undefined): number | null => {
    if (value == null) return null;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * API cevabını mevcut UI `MenuItem` özet tipine dönüştürür (geçiş dönemi / mock karışık kullanım).
 * Alan adları backend’e göre güncellenir.
 */
export const mapDetailResponseToMenuItem = (dto: MenuItemDetailResponse): MenuItem => {
    const price = Number(dto.price ?? 0);
    return {
        id: String(dto.id),
        name: dto.name,
        description: dto.description ?? "Açıklama bulunmuyor.",
        priceLabel: `₺${price.toFixed(2)}`,
        imageUrl: dto.imageUrl || MENU_ITEM_FALLBACK_IMAGE,
        prepMinutes: optionalPositiveMeta(dto.prepTimeMin),
        kcal: optionalPositiveMeta(dto.calorie),
        gram: optionalPositiveMeta(dto.gram),
        rating: Number(dto.avgRating ?? 0),
        categoryId: dto.categoryId == null ? "" : String(dto.categoryId),
    };
};
