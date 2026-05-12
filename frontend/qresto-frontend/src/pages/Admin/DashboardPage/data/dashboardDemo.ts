export type DashboardPaymentSlice = {
    key: string;
    label: string;
    percent: number;
    orderCount: number;
    color: string;
};

/** Ödeme yöntemi dağılımı — backend henüz desteklemediği için demo. */
export const DEMO_PAYMENT_SLICES: DashboardPaymentSlice[] = [
    { key: "card", label: "Kredi Kartı", percent: 65, orderCount: 92, color: "#ff4b16" },
    { key: "cash", label: "Nakit", percent: 25, orderCount: 35, color: "#555f6f" },
    { key: "qr", label: "QR Ödeme", percent: 10, orderCount: 15, color: "#fcdcd4" },
];

export function buildConicGradientFromSlices(
    slices: DashboardPaymentSlice[]
): string {
    let acc = 0;
    const parts: string[] = [];
    for (const s of slices) {
        const start = acc;
        const end = acc + s.percent;
        parts.push(`${s.color} ${start}% ${end}%`);
        acc = end;
    }
    return `conic-gradient(${parts.join(", ")})`;
}
