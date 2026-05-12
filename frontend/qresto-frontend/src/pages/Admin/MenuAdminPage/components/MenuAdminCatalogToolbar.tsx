import AdminStatusFilterSelect from "../../components/AdminStatusFilterSelect";
import { MENU_ADMIN_SEARCH_PLACEHOLDER } from "../services/menuAdminService";
import type { MenuAdminProductStatusFilter } from "../types/menuAdmin.types";

type MenuAdminCatalogToolbarProps = {
    query: string;
    onQueryChange: (value: string) => void;
    productStatusFilter: MenuAdminProductStatusFilter;
    onProductStatusFilterChange: (value: MenuAdminProductStatusFilter) => void;
};

function MenuAdminCatalogToolbar({
    query,
    onQueryChange,
    productStatusFilter,
    onProductStatusFilterChange,
}: MenuAdminCatalogToolbarProps) {
    return (
        <div className="flex flex-wrap items-stretch gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    search
                </span>
                <input
                    type="text"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder={MENU_ADMIN_SEARCH_PLACEHOLDER}
                    className="w-full pl-10 pr-4 h-10 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container/30 focus:border-primary outline-none transition-all text-body-md"
                />
            </div>
            <AdminStatusFilterSelect
                id="menu-admin-product-status-filter"
                ariaLabel="Ürün durumu"
                value={productStatusFilter}
                onChange={onProductStatusFilterChange}
            />
        </div>
    );
}

export default MenuAdminCatalogToolbar;
