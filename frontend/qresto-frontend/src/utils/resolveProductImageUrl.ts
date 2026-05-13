/**
 * Menü ürün görseli URL'lerini Vite ortamına göre çözümler.
 * Göreli yollar menü servisinin origin'ine eklenir; `/seed/` Vite statik kökündedir.
 */
export function menuServicePublicOrigin(): string {
    const raw =
        import.meta.env.VITE_MENU_SERVICE_URL ??
        import.meta.env.VITE_API_URL ??
        "http://localhost:7073/api";

    try {
        const u = new URL(raw);
        return `${u.protocol}//${u.host}`;
    } catch {
        return "http://localhost:7073";
    }
}

export function resolveProductImageUrl(raw: string | null | undefined): string | null {
    if (!raw || !String(raw).trim()) return null;

    const t = String(raw).trim();
    if (t.startsWith("http://") || t.startsWith("https://")) return t;

    const path = t.startsWith("/") ? t : `/${t}`;
    if (path.startsWith("/seed/") && typeof window !== "undefined" && window.location?.origin) {
        return `${window.location.origin}${path}`;
    }

    return `${menuServicePublicOrigin()}${path}`;
}
