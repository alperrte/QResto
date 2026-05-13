/**
 * order-service vb. `java.time.LocalDateTime` JSON olarak gönderir (çoğu dağıtımda JVM UTC).
 * ISO string'de bölge yoksa UTC duvar saati kabul edilir; `Date` anına çevrilir.
 * Z veya ±offset varsa olduğu gibi parse edilir.
 */
export function parseBackendLocalDateTime(isoLike: string): Date {
    const s = isoLike.trim();
    if (!s) return new Date(NaN);
    if (/Z$/i.test(s)) return new Date(s);
    if (/[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
    const withT = s.includes("T") ? s : s.replace(" ", "T");
    return new Date(`${withT}Z`);
}

export function formatOrderDateTimeTr(isoLike: string): string {
    const d = parseBackendLocalDateTime(isoLike);
    if (Number.isNaN(d.getTime())) return isoLike;
    return d.toLocaleString("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}
