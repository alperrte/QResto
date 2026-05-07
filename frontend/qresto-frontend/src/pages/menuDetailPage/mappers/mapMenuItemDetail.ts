import type { MenuItem } from "../../menuPage/menuItems";
import type { MenuItemDetailResponse } from "../types/menuDetail.types";

/**
 * API cevabını mevcut UI `MenuItem` özet tipine dönüştürür (geçiş dönemi / mock karışık kullanım).
 * Alan adları backend’e göre güncellenir.
 */
export const mapDetailResponseToMenuItem = (dto: MenuItemDetailResponse): MenuItem => {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        priceLabel: `${dto.currency === "TRY" ? "₺" : ""}${dto.basePrice}`,
        imageUrl: dto.imageUrl,
        prepMinutes: dto.prepMinutes,
        kcal: dto.kcal,
        rating: dto.rating ?? 0,
        categoryId: dto.categoryId as MenuItem["categoryId"],
    };
};
