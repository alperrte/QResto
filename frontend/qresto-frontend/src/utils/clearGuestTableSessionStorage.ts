const TABLE_LOCATION_KEYS = [
    "tableId",
    "tableNo",
    "tableName",
    "qresto_table_id",
    "qresto_table_no",
    "qresto_table_name",
] as const;

const SESSION_AND_CART_KEYS = [
    "tableSessionId",
    "guestSessionId",
    "qresto_table_session_id",
    "qresto_guest_session_id",
    "qresto_cart_id",
] as const;

const ALL_GUEST_FLOW_KEYS = [...TABLE_LOCATION_KEYS, ...SESSION_AND_CART_KEYS] as const;

function removeKeys(keys: readonly string[]): void {
    if (typeof window === "undefined") return;

    for (const key of keys) {
        try {
            window.sessionStorage.removeItem(key);
            window.localStorage.removeItem(key);
        } catch {
            /* private mode vb. */
        }
    }
}

/** Online ödeme sonrası: oturum biter, masa bilgisi Welcome’da kalsın (QR yeniden okutulana kadar). */
export function clearGuestPaymentSessionKeys(): void {
    removeKeys(SESSION_AND_CART_KEYS);
}

/**
 * Yeni QR okutulduğunda: tüm misafir anahtarlarını temizler.
 */
export function clearGuestTableSessionStorage(): void {
    removeKeys(ALL_GUEST_FLOW_KEYS);
}
