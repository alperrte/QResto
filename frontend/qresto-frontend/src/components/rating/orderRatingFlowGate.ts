import type { RatingSettingsResponse } from "../../types/ratingTypes";

/**
 * Sipariş sonrası birleşik form hem ürün hem restoran puanı gönderir.
 * Servis veya ilgili puan türleri kapalıysa akış gösterilmez / kapatılır.
 */
export function isOrderRatingFlowEnabled(
    settings: RatingSettingsResponse
): boolean {
    return (
        Boolean(settings.ratingServiceEnabled) &&
        Boolean(settings.productRatingsEnabled) &&
        Boolean(settings.restaurantRatingsEnabled)
    );
}
