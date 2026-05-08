export interface MenuItemDetailResponse {
    id: number;
    categoryId: number;
    subCategoryId: number | null;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string;
    vatIncluded: boolean;
    ingredients: string | null;
    removableIngredients: string | null;
    addableIngredients: string | null;
    calorie: number | null;
    gram: number | null;
    prepTimeMin: number | null;
    avgRating: number;
    active: boolean;
    inStock: boolean;
    createdAt: string;
    updatedAt: string;
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
