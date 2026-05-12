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

/** Sıfır / null / geçersiz → müşteri arayüzünde gösterme. */
const optionalPositiveMeta = (value: number | null | undefined): number | null => {
    if (value == null) return null;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
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
        prepMinutes: optionalPositiveMeta(dto.prepTimeMin),
        kcal: optionalPositiveMeta(dto.calorie),
        gram: optionalPositiveMeta(dto.gram),
        rating: Number(dto.avgRating ?? 0),
        categoryId: dto.categoryId == null ? "" : String(dto.categoryId),
    };
};

/**
 * Ham `categoryId` (liste/detay) + seçilen chip id’si.
 * Boş / kategorisiz → yalnızca `all` iken true.
 */
export const categoryIdMatchesMenuFilter = (
    categoryIdRaw: string,
    selectedCategory: MenuCategoryFilterId | string
): boolean => {
    if (selectedCategory === "all") return true;
    const cid = categoryIdRaw?.trim() ?? "";
    if (cid === "") return false;
    return cid === selectedCategory;
};

/**
 * Kategorisiz ürünler (API’de categoryId null) yalnızca «Tümü» seçiliyken gösterilir;
 * belirli bir kategori seçiliyken listede yer almazlar.
 */
export const menuItemMatchesCategoryFilter = (
    item: MenuItem,
    selectedCategory: MenuCategoryFilterId
): boolean => {
    return categoryIdMatchesMenuFilter(item.categoryId, selectedCategory);
};

/**
 * Müşteri menüsü listesi: yalnızca açıkça pasif veya stokta değil olanları ele.
 * `onlyActive=true` ile gelen satırlarda `active` bazen omit edilebilir; `undefined` → görünür kabul.
 */
const isCatalogItemVisibleToCustomer = (i: unknown): i is MenuItemListItemDto => {
    if (!i || typeof i !== "object") return false;
    const row = i as MenuItemListItemDto;
    if (row.active === false) return false;
    if (row.inStock === false) return false;
    return true;
};

export const mapCatalogItemsToMenuItems = (
    items: MenuItemListItemDto[] | unknown
): MenuItem[] => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items.filter(isCatalogItemVisibleToCustomer).map((i) => mapListItemToMenuItem(i));
};
