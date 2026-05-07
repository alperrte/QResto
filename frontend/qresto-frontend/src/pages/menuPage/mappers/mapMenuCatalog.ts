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

/**
 * API kategorilerine sentetik "Tümü" satırını ekler.
 */
export const mapCategoriesToRows = (dtos: MenuCategoryDto[]): MenuCategoryRow[] => {
    const sorted = [...dtos].sort((a, b) => a.sortOrder - b.sortOrder);
    const mapped: MenuCategoryRow[] = sorted.map((c) => ({
        id: c.id as MenuCategoryFilterId,
        label: c.label,
        icon: c.icon,
        defaultFill: c.defaultFill,
    }));
    return [ALL_ROW, ...mapped];
};

/**
 * Liste öğesini kartlarda kullanılan `MenuItem` tipine çevirir.
 */
export const mapListItemToMenuItem = (dto: MenuItemListItemDto): MenuItem => {
    const symbol = dto.currency === "TRY" ? "₺" : "";
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        priceLabel: `${symbol}${dto.basePrice}`,
        imageUrl: dto.imageUrl,
        prepMinutes: dto.prepMinutes,
        kcal: dto.kcal,
        rating: dto.rating ?? 0,
        categoryId: dto.categoryId as MenuItem["categoryId"],
    };
};

export const mapCatalogItemsToMenuItems = (items: MenuItemListItemDto[]): MenuItem[] =>
    items.filter((i) => i.isAvailable).map(mapListItemToMenuItem);
