/** `addedIngredients`: `Etiket +₺12.00` veya eski yalnızca etiket virgül listesi. */
export type ParsedPaidExtra = { label: string; extraTry: number | null };

const parsePaidIngredientSegment = (segment: string): ParsedPaidExtra => {
    const s = segment.trim();
    if (!s) return { label: "", extraTry: null };
    let m = s.match(/\s+\+₺([\d.]+)$/);
    if (m != null && m.index != null) {
        return { label: s.slice(0, m.index).trim(), extraTry: Number(m[1]) };
    }
    m = s.match(/\s+-₺([\d.]+)$/);
    if (m != null && m.index != null) {
        return { label: s.slice(0, m.index).trim(), extraTry: -Number(m[1]) };
    }
    return { label: s, extraTry: null };
};

export const parsePaidIngredientsFromOrderField = (
    raw: string | null | undefined
): ParsedPaidExtra[] => {
    if (!raw?.trim()) return [];
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(parsePaidIngredientSegment)
        .filter((x) => x.label.length > 0);
};

export const formatExtraDeltaTry = (n: number | null): string | null => {
    if (n == null || Number.isNaN(n)) return null;
    if (n >= 0) return `+₺${n.toFixed(2)}`;
    return `-₺${Math.abs(n).toFixed(2)}`;
};

/** Sadece tutar bilgisi olan (fiyat farkı bilinen) ekler */
export const parsePriceAffectingPaidExtras = (
    raw: string | null | undefined
): ParsedPaidExtra[] =>
    parsePaidIngredientsFromOrderField(raw).filter((r) => r.extraTry != null);
