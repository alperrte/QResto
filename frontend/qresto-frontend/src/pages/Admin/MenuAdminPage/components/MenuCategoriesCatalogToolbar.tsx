import AdminStatusFilterSelect from "../../components/AdminStatusFilterSelect";
import { MENU_CATEGORIES_SEARCH_PLACEHOLDER } from "../services/menuAdminService";
import type { MenuAdminProductStatusFilter } from "../types/menuAdmin.types";

type MenuCategoriesCatalogToolbarProps = {
    categorySearchQuery: string;
    onCategorySearchQueryChange: (value: string) => void;
    categoryStatusFilter: MenuAdminProductStatusFilter;
    onCategoryStatusFilterChange: (value: MenuAdminProductStatusFilter) => void;
};

function MenuCategoriesCatalogToolbar({
    categorySearchQuery,
    onCategorySearchQueryChange,
    categoryStatusFilter,
    onCategoryStatusFilterChange,
}: MenuCategoriesCatalogToolbarProps) {
    return (
        <div className="flex flex-wrap items-stretch gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    search
                </span>
                <input
                    type="text"
                    value={categorySearchQuery}
                    onChange={(e) => onCategorySearchQueryChange(e.target.value)}
                    placeholder={MENU_CATEGORIES_SEARCH_PLACEHOLDER}
                    className="w-full pl-10 pr-4 h-10 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container/30 focus:border-primary outline-none transition-all text-body-md"
                />
            </div>
            <AdminStatusFilterSelect
                id="menu-admin-category-status-filter"
                ariaLabel="Kategori durumu"
                value={categoryStatusFilter}
                onChange={onCategoryStatusFilterChange}
                activeLabel="Aktif kategoriler"
                inactiveLabel="Pasif kategoriler"
            />
        </div>
    );
}

export default MenuCategoriesCatalogToolbar;
