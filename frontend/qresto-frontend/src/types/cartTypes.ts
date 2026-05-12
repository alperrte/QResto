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
    /** Birim fiyat (taban + seçilen opsiyon ekleri); satır toplamı = productPrice × quantity */
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

export type OrderItemResponse = {
    id: number;
    productId: number;
    productName: string;
    productPrice: number;
    vatIncluded: boolean;
    quantity: number;
    removedIngredients?: string | null;
    addedIngredients?: string | null;
    note?: string | null;
    lineTotal: number;
    status?: string;
    cancelReason?: string | null;
    cancelledAt?: string | null;
    createdAt?: string;
    updatedAt?: string | null;
    productImageUrl?: string | null;
};

export type OrderResponse = {
    id: number;
    orderNo: string;
    cartId: number;
    tableSessionId: number;
    guestSessionId: number;
    tableId: number;
    tableName: string;
    status:
        | "RECEIVED"
        | "PREPARING"
        | "READY"
        | "SERVED"
        | "COMPLETED"
        | "PAYMENT_PENDING"
        | "PAID"
        | "CANCELLED";
    subtotalAmount: number;
    vatAmount: number;
    totalAmount: number;
    cancelReason?: string | null;
    createdAt: string;
    updatedAt: string | null;
    receivedAt?: string | null;
    preparingAt?: string | null;
    readyAt?: string | null;
    servedAt?: string | null;
    completedAt?: string | null;
    paymentPendingAt?: string | null;
    paidAt?: string | null;
    cancelledAt?: string | null;
    items: OrderItemResponse[];
};

export type DemoPaymentRequest = {
    guestSessionId: number;
};

export type OrderAdminSummaryResponse = {
    activeOrderCount: number;
    completedOrderCount: number;
    cancelledOrderCount: number;
    totalOrderCount: number;
    todayRevenue: number;
    operationDensity: number;
};

/** Admin dashboard: bugün PAID/COMPLETED siparişlerde ciro bazlı üst ürünler. */
export type OrderAdminTopProductResponse = {
    productId: number;
    productName: string;
    quantitySold: number;
    revenue: number;
    productImageUrl?: string | null;
};

/** Admin: bugünkü ürün bazlı satış (dünkü ciroya göre trend). */
export type OrderAdminProductSalesRowResponse = {
    productId: number;
    productName: string;
    quantitySold: number;
    revenue: number;
    orderCount: number;
    trend: "up" | "down" | "flat";
};

export type TableSessionBillResponse = {
    tableSessionId: number;
    tableId: number;
    tableName: string;
    subtotalAmount: number;
    vatAmount: number;
    totalAmount: number;
    orderCount: number;
    orders: OrderResponse[];
};