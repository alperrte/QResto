/**
 * Backend / veritabanı ile hizalanacak menü listesi ve kategori şekilleri (REST örneği).
 */

export interface MenuCategoryDto {
    id: string;
    label: string;
    /** Material Symbols adı vb. */
    icon: string;
    sortOrder: number;
    defaultFill?: boolean;
}

export interface MenuItemListItemDto {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    basePrice: number;
    currency: string;
    categoryId: string;
    prepMinutes: number;
    kcal: number;
    rating: number | null;
    isAvailable: boolean;
}

/** Tek çağrıda kategori + ürün listesi (tercih edilen sözleşme). */
export interface MenuCatalogResponse {
    categories: MenuCategoryDto[];
    items: MenuItemListItemDto[];
}

/** Sayfalama kullanılıyorsa */
export interface MenuItemsPageResponse {
    items: MenuItemListItemDto[];
    totalCount: number;
    page: number;
    pageSize: number;
}
