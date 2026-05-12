import { useEffect, useState } from "react";

import { getProductRatingSummary } from "../../../services/ratingService";
import type { RatingSummaryResponse } from "../../../types/ratingTypes";

function normalizeSummary(raw: RatingSummaryResponse): RatingSummaryResponse {
    const count = Number(raw.totalRatingCount ?? 0);
    const avg =
        raw.averageRating != null && !Number.isNaN(Number(raw.averageRating))
            ? Number(raw.averageRating)
            : 0;
    return {
        ...raw,
        averageRating: avg,
        totalRatingCount: count,
    };
}

/**
 * Menü listesindeki ürünler için rating-service özetlerini toplu çeker.
 * `productIds` her render'da yeni dizi olabilir; içerik aynıysa yeniden istek atılmaz.
 */
export function useProductRatingSummaries(productIds: number[]) {
    const idsKey = [...new Set(productIds.filter((n) => Number.isFinite(n)))]
        .sort((a, b) => a - b)
        .join(",");

    const [summaries, setSummaries] = useState<Record<string, RatingSummaryResponse>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const ids = idsKey
            ? idsKey.split(",").map((s) => Number(s)).filter((n) => Number.isFinite(n))
            : [];

        if (ids.length === 0) {
            setSummaries({});
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        void (async () => {
            const results = await Promise.allSettled(
                ids.map(async (id) => {
                    const data = await getProductRatingSummary(id);
                    return { id, data: normalizeSummary(data) };
                })
            );

            if (cancelled) return;

            const next: Record<string, RatingSummaryResponse> = {};
            for (const r of results) {
                if (r.status === "fulfilled") {
                    next[String(r.value.id)] = r.value.data;
                }
            }
            setSummaries(next);
            setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [idsKey]);

    return { summaries, loading };
}
