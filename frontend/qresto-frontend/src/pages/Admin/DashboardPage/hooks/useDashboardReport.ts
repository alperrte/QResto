import { useCallback, useEffect, useState } from "react";

import {
    getAdminOrderSummary,
    getAdminProductSalesToday,
    getAdminTopProductsToday,
} from "../../../../services/orderService";
import {
    getAllProductRatingsSummary,
    getRestaurantRatingSummary,
} from "../../../../services/ratingService";
import type {
    OrderAdminProductSalesRowResponse,
    OrderAdminSummaryResponse,
    OrderAdminTopProductResponse,
} from "../../../../types/cartTypes";
import type { RatingSummaryResponse } from "../../../../types/ratingTypes";

const emptySummary: OrderAdminSummaryResponse = {
    activeOrderCount: 0,
    completedOrderCount: 0,
    cancelledOrderCount: 0,
    totalOrderCount: 0,
    todayRevenue: 0,
    operationDensity: 0,
};

const REFRESH_MS = 10_000;

export function useDashboardReport() {
    const [summary, setSummary] = useState<OrderAdminSummaryResponse>(emptySummary);
    const [ratingSummary, setRatingSummary] = useState<RatingSummaryResponse | null>(
        null
    );
    const [productRatingSummary, setProductRatingSummary] =
        useState<RatingSummaryResponse | null>(null);
    const [topProducts, setTopProducts] = useState<OrderAdminTopProductResponse[]>([]);
    const [productSales, setProductSales] = useState<OrderAdminProductSalesRowResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async (opts?: { silent?: boolean }) => {
        const silent = Boolean(opts?.silent);
        if (!silent) {
            setLoading(true);
        }
        setError("");

        try {
            const [orderSummary, restaurantRating, productRating, topProductsToday, productSalesToday] =
                await Promise.all([
                    getAdminOrderSummary(),
                    getRestaurantRatingSummary().catch(() => null),
                    getAllProductRatingsSummary().catch(() => null),
                    getAdminTopProductsToday(8).catch(() => []),
                    getAdminProductSalesToday(50).catch(() => []),
                ]);
            setSummary(orderSummary);
            setRatingSummary(restaurantRating);
            setProductRatingSummary(productRating);
            setTopProducts(topProductsToday);
            setProductSales(productSalesToday);
        } catch {
            setError("Rapor özeti yüklenemedi. Bağlantınızı kontrol edip yenileyin.");
            if (!silent) {
                setSummary(emptySummary);
                setRatingSummary(null);
                setProductRatingSummary(null);
                setTopProducts([]);
                setProductSales([]);
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        const id = window.setInterval(() => {
            void load({ silent: true });
        }, REFRESH_MS);
        return () => window.clearInterval(id);
    }, [load]);

    return {
        summary,
        ratingSummary,
        productRatingSummary,
        topProducts,
        productSales,
        loading,
        error,
        refresh: () => void load(),
    };
}
