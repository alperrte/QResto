import type { CSSProperties } from "react";

import { AdminStatusBadge, AdminStatusFlipButton } from "../../components/AdminStatusBadge";
import AdminSortableTh, { type AdminTableSort } from "../../components/AdminSortableTh";
import type { MenuCategoryDto } from "../../../menuPage/types/menu.types";

type MenuCategoriesTableProps = {
    loading: boolean;
    error: string | null;
    emptyAllCategories: boolean;
    emptyAfterFilter: boolean;
    categories: MenuCategoryDto[];
    nameSort: AdminTableSort;
    onNameSortClick: (columnKey: string) => void;
    saving: boolean;
    onEdit: (c: MenuCategoryDto) => void;
    onToggleStatus: (c: MenuCategoryDto) => void;
    onDelete: (c: MenuCategoryDto) => void;
};

function MenuCategoriesTable({
    loading,
    error,
    emptyAllCategories,
    emptyAfterFilter,
    categories,
    nameSort,
    onNameSortClick,
    saving,
    onEdit,
    onToggleStatus,
    onDelete,
}: MenuCategoriesTableProps) {
    return (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant card-shadow overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                        <AdminSortableTh
                            label="Ad"
                            columnKey="name"
                            sort={nameSort}
                            onSort={onNameSortClick}
                        />
                        <th className="p-3 text-label-bold text-secondary">Durum</th>
                        <th className="p-3 text-label-bold text-secondary text-right min-w-[300px]">
                            İşlem
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                    {loading ? (
                        <tr>
                            <td colSpan={3} className="p-6 text-center text-on-surface-variant">
                                Yükleniyor…
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={3} className="p-6 text-center text-red-600">
                                {error}
                            </td>
                        </tr>
                    ) : emptyAllCategories ? (
                        <tr>
                            <td colSpan={3} className="p-6 text-center text-on-surface-variant">
                                Henüz kategori yok.
                            </td>
                        </tr>
                    ) : emptyAfterFilter ? (
                        <tr>
                            <td colSpan={3} className="p-6 text-center text-on-surface-variant">
                                Filtreye uygun kategori bulunamadı.
                            </td>
                        </tr>
                    ) : (
                        categories.map((c, rowIndex) => (
                            <tr
                                key={c.id}
                                style={{ "--menu-admin-row-i": rowIndex } as CSSProperties}
                                className={`menu-admin-table-row-ladder transition-colors ${
                                    c.active
                                        ? "hover:bg-surface-bright/60"
                                        : "opacity-[0.72] bg-surface-container-low/70 text-on-surface-variant hover:bg-surface-container-low"
                                }`}
                            >
                                <td
                                    className={`p-3 font-semibold ${
                                        c.active ? "text-on-surface" : "text-on-surface-variant font-medium"
                                    }`}
                                >
                                    {c.name}
                                </td>
                                <td className="p-3">
                                    <AdminStatusBadge active={c.active} />
                                </td>
                                <td className="p-3 text-right">
                                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(c)}
                                            className="h-9 px-3 rounded-lg border-2 border-primary text-on-surface bg-primary-container/25 font-semibold text-body-md shadow-sm hover:bg-primary-container/40 hover:border-primary transition-colors"
                                        >
                                            Düzenle
                                        </button>
                                        <AdminStatusFlipButton isActive={c.active} onClick={() => onToggleStatus(c)} />
                                        <button
                                            type="button"
                                            disabled={saving}
                                            onClick={() => onDelete(c)}
                                            className="h-9 px-3 rounded-lg text-label-bold text-white bg-red-600 hover:bg-red-700 border border-red-700 shadow-sm disabled:opacity-45 disabled:cursor-not-allowed dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-500"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default MenuCategoriesTable;
