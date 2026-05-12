export type ProductRatingCreateRequest = {
    orderId: number;
    orderItemId: number;
    guestSessionId: number;
    rating: number;
    comment?: string;
};

export type RestaurantRatingCreateRequest = {
    orderId: number;
    guestSessionId: number;
    rating: number;
    comment?: string;
};

export type ProductRatingResponse = {
    id: number;
    orderId: number;
    orderItemId: number;
    productId: number;
    tableSessionId: number;
    guestSessionId: number;
    tableId: number;
    tableName: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    updatedAt?: string | null;
};

export type RestaurantRatingResponse = {
    id: number;
    orderId: number;
    tableSessionId: number;
    guestSessionId: number;
    tableId: number;
    tableName: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    updatedAt?: string | null;
};

export type RatingSummaryResponse = {
    targetId: number | null;
    targetType: "PRODUCT" | "RESTAURANT";
    averageRating: number;
    totalRatingCount: number;
};

export type RatingSettingsResponse = {
    id: number;
    ratingServiceEnabled: boolean;
    restaurantRatingsEnabled: boolean;
    restaurantCommentsEnabled: boolean;
    productRatingsEnabled: boolean;
    productCommentsEnabled: boolean;
    createdAt: string;
    updatedAt?: string | null;
};

export type RatingSettingsUpdateRequest = {
    ratingServiceEnabled: boolean;
    restaurantRatingsEnabled: boolean;
    restaurantCommentsEnabled: boolean;
    productRatingsEnabled: boolean;
    productCommentsEnabled: boolean;
};

export type RatingSettingToggleRequest = {
    enabled: boolean;
};