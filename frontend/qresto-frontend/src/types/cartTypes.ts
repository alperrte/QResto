export type CartItem = {
    id?: number;
    productId: number;
    productName: string;
    productPrice: number;
    vatIncluded: boolean;
    quantity: number;
    removedIngredients?: string;
    addedIngredients?: string;
    note?: string;
    lineTotal?: number;
};

export type CartResponse = {
    id: number;
    tableSessionId: number;
    guestSessionId: number;
    tableId: number;
    tableName: string;
    status: "ACTIVE" | "ORDERED" | "CLEARED" | "CANCELLED";
    subtotalAmount: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string | null;
    orderedAt?: string | null;
    clearedAt?: string | null;
    items: CartItem[];
};

export type AddCartItemRequest = {
    productId: number;
    productName: string;
    productPrice: number;
    vatIncluded: boolean;
    quantity: number;
    removedIngredients?: string;
    addedIngredients?: string;
    note?: string;
};

export type UpdateCartItemQuantityRequest = {
    quantity: number;
};

export type OrderResponse = {
    id: number;
    orderNo: string;
    cartId: number;
    tableSessionId: number;
    guestSessionId: number;
    tableId: number;
    tableName: string;
    status: string;
    subtotalAmount: number;
    vatAmount: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string | null;
    items: unknown[];
};