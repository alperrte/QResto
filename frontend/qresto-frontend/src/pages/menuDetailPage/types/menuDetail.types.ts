/**
 * Backend / veritabanı ile hizalanacak menü ürün detayı ve seçenek şekilleri (REST örneği).
 * Gerçek API sözleşmesine göre güncellenir.
 */

export interface MenuItemModifierOptionDto {
    id: string;
    name: string;
    /** Ek ücret (kuruş veya API’nin kullandığı para birimi birimi). */
    priceDelta: number;
    sortOrder: number;
}

export interface MenuItemModifierGroupDto {
    id: string;
    /** Örn: portion, extras */
    code: string;
    label: string;
    selection: "single" | "multiple";
    required: boolean;
    options: MenuItemModifierOptionDto[];
}

export interface MenuItemDetailResponse {
    id: string;
    restaurantId?: string;
    name: string;
    description: string;
    imageUrl: string;
    /** Temel fiyat (sayısal). Gösterim için currency ile birlikte kullanılır. */
    basePrice: number;
    currency: string;
    categoryId: string;
    prepMinutes: number;
    kcal: number;
    rating: number | null;
    isAvailable: boolean;
    modifierGroups?: MenuItemModifierGroupDto[];
}

export interface AddLineItemRequest {
    menuItemId: string;
    quantity: number;
    selectedOptionIds?: string[];
    note?: string | null;
}

export interface AddLineItemResponse {
    lineItemId: string;
    /** İsterseniz sepet özeti id’si */
    cartId?: string;
}
