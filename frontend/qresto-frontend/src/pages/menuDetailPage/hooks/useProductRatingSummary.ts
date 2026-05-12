import { useEffect, useState } from "react";

import { getProductRatingSummary } from "../../../services/ratingService";
import type { RatingSummaryResponse } from "../../../types/ratingTypes";

export function useProductRatingSummary(productId: number | undefined) {
    const [summary, setSummary] = useState<RatingSummaryResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (productId == null || !Number.isFinite(productId)) {
            setSummary(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        void (async () => {
            try {
                const data = await getProductRatingSummary(productId);
                if (cancelled) return;
                const count = Number(data.totalRatingCount ?? 0);
                const avg =
                    data.averageRating != null && !Number.isNaN(Number(data.averageRating))
                        ? Number(data.averageRating)
                        : 0;
                setSummary({
                    ...data,
                    averageRating: avg,
                    totalRatingCount: count,
                });
            } catch {
                if (!cancelled) setSummary(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [productId]);

    return { summary, loading };
}
