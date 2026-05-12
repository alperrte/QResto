/** Özet adımı için fiyat etiketi (₺, tr-TR). */
export const formatDraftPriceLabel = (price: string): string => {
    const n = Number(price);
    if (!price.trim() || Number.isNaN(n)) return "—";
    return `₺${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
