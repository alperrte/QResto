export interface MenuCategoryDto {
    id: number;
    name: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MenuItemListItemDto {
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
