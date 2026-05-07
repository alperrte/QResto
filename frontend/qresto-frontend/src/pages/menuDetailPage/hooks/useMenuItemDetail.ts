import { useEffect, useState } from "react";
import { fetchMenuItemDetail } from "../services/menuDetailService";
import type { MenuItemDetailResponse } from "../types/menuDetail.types";

type UseMenuItemDetailResult = {
    data: MenuItemDetailResponse | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
};

/**
 * Ürün detayını API’den yükler. `itemId` yokken istek atılmaz.
 * İleride React Query / SWR ile değiştirilebilir.
 */
export const useMenuItemDetail = (itemId: string | undefined): UseMenuItemDetailResult => {
    const [data, setData] = useState<MenuItemDetailResponse | null>(null);
    const [loading, setLoading] = useState(Boolean(itemId));
    const [error, setError] = useState<Error | null>(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        if (!itemId) {
            setData(null);
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchMenuItemDetail(itemId)
            .then((res) => {
                if (!cancelled) setData(res);
            })
            .catch((e: unknown) => {
                if (!cancelled) {
                    setError(e instanceof Error ? e : new Error(String(e)));
                    setData(null);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [itemId, version]);

    const refetch = () => setVersion((v) => v + 1);

    return { data, loading, error, refetch };
};
