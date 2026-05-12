import axios from "axios";

import type {
    ProductRatingCreateRequest,
    ProductRatingResponse,
    RatingSettingToggleRequest,
    RatingSettingsResponse,
    RatingSettingsUpdateRequest,
    RatingSummaryResponse,
    RestaurantRatingCreateRequest,
    RestaurantRatingResponse,
} from "../types/ratingTypes";

const RATING_SERVICE_BASE_URL =
    import.meta.env.VITE_RATING_SERVICE_URL ??
    "http://localhost:7077/api/rating";

const ratingApi = axios.create({
    baseURL: RATING_SERVICE_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const createProductRating = async (
    request: ProductRatingCreateRequest
): Promise<ProductRatingResponse> => {
    const response = await ratingApi.post<ProductRatingResponse>(
        "/product-ratings",
        request
    );

    return response.data;
};

export const createRestaurantRating = async (
    request: RestaurantRatingCreateRequest
): Promise<RestaurantRatingResponse> => {
    const response = await ratingApi.post<RestaurantRatingResponse>(
        "/restaurant-ratings",
        request
    );

    return response.data;
};

export const getProductRatingsByProductId = async (
    productId: number
): Promise<ProductRatingResponse[]> => {
    const response = await ratingApi.get<ProductRatingResponse[]>(
        `/product-ratings/product/${productId}`
    );

    return response.data;
};

export const getProductRatingSummary = async (
    productId: number
): Promise<RatingSummaryResponse> => {
    const response = await ratingApi.get<RatingSummaryResponse>(
        `/product-ratings/product/${productId}/summary`
    );

    return response.data;
};

export const getRecentProductRatings = async (): Promise<ProductRatingResponse[]> => {
    const response = await ratingApi.get<ProductRatingResponse[]>(
        "/product-ratings/recent"
    );

    return response.data;
};

export const getRestaurantRatings = async (): Promise<RestaurantRatingResponse[]> => {
    const response = await ratingApi.get<RestaurantRatingResponse[]>(
        "/restaurant-ratings"
    );

    return response.data;
};

export const getRestaurantRatingSummary = async (): Promise<RatingSummaryResponse> => {
    const response = await ratingApi.get<RatingSummaryResponse>(
        "/restaurant-ratings/summary"
    );

    return response.data;
};

export const getRecentRestaurantRatings = async (): Promise<RestaurantRatingResponse[]> => {
    const response = await ratingApi.get<RestaurantRatingResponse[]>(
        "/restaurant-ratings/recent"
    );

    return response.data;
};

export const getRatingSettings = async (): Promise<RatingSettingsResponse> => {
    const response = await ratingApi.get<RatingSettingsResponse>("/settings");

    return response.data;
};

export const updateRatingSettings = async (
    request: RatingSettingsUpdateRequest
): Promise<RatingSettingsResponse> => {
    const response = await ratingApi.put<RatingSettingsResponse>(
        "/settings",
        request
    );

    return response.data;
};

export const toggleRatingService = async (
    enabled: boolean
): Promise<RatingSettingsResponse> => {
    const body: RatingSettingToggleRequest = { enabled };

    const response = await ratingApi.patch<RatingSettingsResponse>(
        "/settings/rating-service",
        body
    );

    return response.data;
};

export const toggleRestaurantRatings = async (
    enabled: boolean
): Promise<RatingSettingsResponse> => {
    const body: RatingSettingToggleRequest = { enabled };

    const response = await ratingApi.patch<RatingSettingsResponse>(
        "/settings/restaurant-ratings",
        body
    );

    return response.data;
};

export const toggleRestaurantComments = async (
    enabled: boolean
): Promise<RatingSettingsResponse> => {
    const body: RatingSettingToggleRequest = { enabled };

    const response = await ratingApi.patch<RatingSettingsResponse>(
        "/settings/restaurant-comments",
        body
    );

    return response.data;
};

export const toggleProductRatings = async (
    enabled: boolean
): Promise<RatingSettingsResponse> => {
    const body: RatingSettingToggleRequest = { enabled };

    const response = await ratingApi.patch<RatingSettingsResponse>(
        "/settings/product-ratings",
        body
    );

    return response.data;
};

export const toggleProductComments = async (
    enabled: boolean
): Promise<RatingSettingsResponse> => {
    const body: RatingSettingToggleRequest = { enabled };

    const response = await ratingApi.patch<RatingSettingsResponse>(
        "/settings/product-comments",
        body
    );

    return response.data;
};

export default ratingApi;