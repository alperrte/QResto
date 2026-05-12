/**
 * API sipariş numarasını "QR-..." biçiminde döndürebilir; misafir ekranlarında önek gösterilmez.
 */
export function formatGuestOrderNo(orderNo: string): string {
    if (!orderNo?.trim()) {
        return orderNo;
    }
    return orderNo.replace(/^QR-/i, "");
}
