export type MenuProductOptionKindDto = "portion" | "single" | "multi";

export interface MenuProductOptionChoiceDto {
    id: number;
    sortOrder: number;
    label: string;
    priceDelta: number;
}

export interface MenuProductOptionGroupDto {
    id: number;
    sortOrder: number;
    kind: MenuProductOptionKindDto;
    hasPrice: boolean;
    userTitle: string;
    metaTitle: string;
    descriptionLine: string | null;
    required: boolean;
    maxSelect: number;
    includedInPreview: boolean;
    choices: MenuProductOptionChoiceDto[];
}

export interface MenuItemDetailResponse {
    id: number;
    categoryId: number | null;
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
    orderNoteEnabled?: boolean;
    orderNoteTitle?: string | null;
    optionGroups?: MenuProductOptionGroupDto[] | null;
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
