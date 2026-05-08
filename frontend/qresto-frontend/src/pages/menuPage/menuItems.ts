export type MenuCategoryFilterId = string | "all";

export type MenuItem = {
    id: string;
    name: string;
    description: string;
    priceLabel: string;
    imageUrl: string;
    prepMinutes: number;
    kcal: number;
    rating: number;
    categoryId: string;
};
