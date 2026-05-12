import { useCallback, useEffect, useState } from "react";

import { getKitchenOrders } from "../services/kitchenService";
import type { OrderResponse } from "../types/cartTypes";

export function useKitchenBoardOrders(pollIntervalMs = 12000) {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setError(null);
            const data = await getKitchenOrders();
            setOrders(data);
        } catch (e) {
            console.error(e);
            setError("Siparişler yüklenemedi. Mutfak servisinin çalıştığından emin olun.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void load();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [load]);

    useEffect(() => {
        const id = window.setInterval(() => {
            void load();
        }, pollIntervalMs);

        return () => window.clearInterval(id);
    }, [load, pollIntervalMs]);

    return { orders, loading, error, reload: load };
}