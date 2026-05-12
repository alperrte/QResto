import type { MenuAdminProductStatusFilter } from "../MenuAdminPage/types/menuAdmin.types";

export type AdminStatusFilterSelectProps = {
    id: string;
    ariaLabel: string;
    value: MenuAdminProductStatusFilter;
    onChange: (value: MenuAdminProductStatusFilter) => void;
    /** Varsayılan: Tüm durumlar / Aktif ürünler / Pasif ürünler */
    allLabel?: string;
    activeLabel?: string;
    inactiveLabel?: string;
};

/**
 * Ürün listesi ve kategori listesi için ortak durum filtresi (tümü / aktif / pasif).
 */
const AdminStatusFilterSelect = ({
    id,
    ariaLabel,
    value,
    onChange,
    allLabel = "Tüm durumlar",
    activeLabel = "Aktif ürünler",
    inactiveLabel = "Pasif ürünler",
}: AdminStatusFilterSelectProps) => {
    return (
        <div className="relative shrink-0 min-w-[12.5rem] max-w-full">
            <label htmlFor={id} className="sr-only">
                {ariaLabel}
            </label>
            <select
                id={id}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value as MenuAdminProductStatusFilter)
                }
                className="w-full h-10 appearance-none pl-3 pr-10 rounded-lg border border-outline-variant bg-surface-container text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary cursor-pointer transition-all"
            >
                <option value="all">{allLabel}</option>
                <option value="active">{activeLabel}</option>
                <option value="inactive">{inactiveLabel}</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                expand_more
            </span>
        </div>
    );
};

export default AdminStatusFilterSelect;
