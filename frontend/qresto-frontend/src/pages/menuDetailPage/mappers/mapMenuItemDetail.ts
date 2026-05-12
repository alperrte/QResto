import type { MenuItem } from "../../menuPage/menuItems";
import type { MenuItemDetailResponse } from "../types/menuDetail.types";

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
        imageUrl:
            dto.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80",
        prepMinutes: dto.prepTimeMin ?? 0,
        kcal: dto.calorie ?? 0,
        rating: Number(dto.avgRating ?? 0),
        categoryId: dto.categoryId == null ? "" : String(dto.categoryId),
    };
};
