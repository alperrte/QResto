import { useEffect, useState } from "react";
import { fetchMenuCatalog } from "../services/menuService";
import type { MenuCategoryDto, MenuItemListItemDto } from "../types/menu.types";

type MenuCatalogData = {
    categories: MenuCategoryDto[];
    items: MenuItemListItemDto[];
};

type UseMenuCatalogResult = {
    data: MenuCatalogData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
};

/**
 * Menü ana sayfası için kategori + ürün listesini yükler.
 * `restaurantId` backend hazır olunca route veya context’ten geçirilebilir.
 * `includeInactiveProducts`: admin gibi senaryolarda `true` (varsayılan `false`, müşteri menüsü).
 */
export const useMenuCatalog = (
    restaurantId?: string,
    includeInactiveProducts = false
): UseMenuCatalogResult => {
    const [data, setData] = useState<MenuCatalogData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchMenuCatalog(restaurantId, includeInactiveProducts, includeInactiveProducts)
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
    }, [restaurantId, version, includeInactiveProducts]);

    const refetch = () => setVersion((v) => v + 1);

    return { data, loading, error, refetch };
};
