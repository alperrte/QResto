import type { MenuCategoryFilterId } from "../menuItems";
import type { MenuItem } from "../menuItems";
import type { MenuCategoryDto, MenuItemListItemDto } from "../types/menu.types";

/** UI kategori satırı (menuItems.MENU_CATEGORIES ile uyumlu). */
export type MenuCategoryRow = {
    id: MenuCategoryFilterId;
    label: string;
    icon: string;
    defaultFill?: boolean;
};

const ALL_ROW: MenuCategoryRow = {
    id: "all",
    label: "Tümü",
    icon: "restaurant_menu",
};

const categoryIconByName: Record<string, string> = {
    "başlangıçlar": "emoji_food_beverage",
    "ana yemekler": "restaurant",
    pizzalar: "local_pizza",
    burgerler: "lunch_dining",
    tatlılar: "icecream",
    "içecekler": "local_cafe",
};

/**
 * API kategorilerine sentetik "Tümü" satırını ekler.
 */
export const mapCategoriesToRows = (dtos: MenuCategoryDto[]): MenuCategoryRow[] => {
    const sorted = [...dtos].sort((a, b) => a.id - b.id);
    const mapped: MenuCategoryRow[] = sorted.map((c) => {
        const rawName = ((c as { name?: string; label?: string }).name ??
            (c as { name?: string; label?: string }).label ??
            "").trim();
        const normalizedName = rawName.toLocaleLowerCase("tr-TR");

        return {
            id: String(c.id),
            label: rawName || "Kategori",
            icon: categoryIconByName[normalizedName] ?? "restaurant_menu",
            defaultFill: false,
        };
    });
    return [ALL_ROW, ...mapped];
};

/**
 * Liste öğesini kartlarda kullanılan `MenuItem` tipine çevirir.
 */
export const mapListItemToMenuItem = (dto: MenuItemListItemDto): MenuItem => {
    const price = Number(dto.price ?? 0);
    return {
        id: String(dto.id),
        name: dto.name,
        description: dto.description ?? "Açıklama bulunmuyor.",
        priceLabel: `₺${price.toFixed(2)}`,
        imageUrl: dto.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80",
        prepMinutes: dto.prepTimeMin ?? 0,
        kcal: dto.calorie ?? 0,
        rating: Number(dto.avgRating ?? 0),
        categoryId: dto.categoryId == null ? "" : String(dto.categoryId),
    };
};

export const mapCatalogItemsToMenuItems = (
    items: MenuItemListItemDto[] | unknown
): MenuItem[] => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .filter((i) => Boolean(i && i.active && i.inStock))
        .map((i) => mapListItemToMenuItem(i));
};
