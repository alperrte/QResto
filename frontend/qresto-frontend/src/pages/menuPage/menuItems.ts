export type MenuCategoryFilterId = string | "all";

export type MenuItem = {
    id: string;
    name: string;
    description: string;
    priceLabel: string;
    imageUrl: string;
    /** Sihirbazda girildiyse; yoksa kartta gösterilmez. */
    prepMinutes: number | null;
    kcal: number | null;
    gram: number | null;
    rating: number;
    categoryId: string;
};
