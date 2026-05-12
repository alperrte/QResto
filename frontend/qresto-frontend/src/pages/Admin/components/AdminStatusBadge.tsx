import type { ReactNode } from "react";

export type AdminStatusBadgeProps = {
    /** true: Aktif (yeşil), false: Pasif (kırmızı) */
    active: boolean;
    /** sm: ürün/kategori tabloları; md: sihirbaz özet / hücre içi */
    size?: "sm" | "md";
    className?: string;
    /** Varsayılan «Aktif» / «Pasif» */
    children?: ReactNode;
};

const badgeSizeClass: Record<"sm" | "md", string> = {
    sm: "text-[11px] px-2.5 py-1",
    md: "text-xs px-2.5 py-1",
};

/** Sıcak zeminde açık kırmızı/pembe okuması için koyu doygun kırmızı (red-800 / tema error). */
const badgeInactiveBg = "bg-[#991b1b] dark:bg-[#dc2626]";

/**
 * Liste ve özetlerde tutarlı yeşil/kırmızı durum rozeti (beyaz yazı).
 */
export function AdminStatusBadge({ active, size = "sm", className = "", children }: AdminStatusBadgeProps) {
    return (
        <span
            className={`inline-flex shrink-0 items-center rounded-full font-bold text-white ${badgeSizeClass[size]} ${
                active ? "bg-green-600 dark:bg-emerald-500" : badgeInactiveBg
            } ${className}`.trim()}
        >
            {children ?? (active ? "Aktif" : "Pasif")}
        </span>
    );
}

export type AdminStatusFlipButtonProps = {
    /** Kayıt şu an aktif mi? Aktifken amber «Pasif yap», değilse yeşil «Aktif yap». */
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
    activateLabel?: string;
    deactivateLabel?: string;
    className?: string;
};

/**
 * Kategori/ürün durumunu tersine çeviren dolu yeşil veya amber (pasifleştir) buton.
 */
export function AdminStatusFlipButton({
    isActive,
    onClick,
    disabled,
    activateLabel = "Aktif yap",
    deactivateLabel = "Pasif yap",
    className = "",
}: AdminStatusFlipButtonProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`h-9 px-3 rounded-lg font-semibold text-body-md text-white shadow-sm transition-colors border disabled:opacity-45 disabled:cursor-not-allowed ${
                isActive
                    ? "bg-amber-600 hover:bg-amber-700 border-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 dark:border-amber-500"
                    : "bg-green-600 hover:bg-green-700 border-green-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:border-emerald-400"
            } ${className}`.trim()}
        >
            {isActive ? deactivateLabel : activateLabel}
        </button>
    );
}
