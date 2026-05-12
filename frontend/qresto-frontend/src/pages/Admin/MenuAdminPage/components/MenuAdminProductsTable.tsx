import AdminSortableTh, { type AdminTableSort } from "../../components/AdminSortableTh";
import type { MenuAdminProductRow } from "../types/menuAdmin.types";
import MenuAdminProductTableRow from "./MenuAdminProductTableRow";

type MenuAdminProductsTableProps = {
    loading: boolean;
    error: boolean;
    products: MenuAdminProductRow[];
    selectedProductId: string | null;
    rowActionProductId: string | null;
    tableSort: AdminTableSort;
    onTableSortClick: (columnKey: string) => void;
    isProductEffectivelyActive: (product: MenuAdminProductRow) => boolean;
    onSelectProductId: (id: string) => void;
    onSetRowActionProductId: (id: string | null) => void;
    onEditProduct: (id: string) => void;
    onDeleteProduct: (product: MenuAdminProductRow) => void;
};

function MenuAdminProductsTable({
    loading,
    error,
    products,
    selectedProductId,
    rowActionProductId,
    tableSort,
    onTableSortClick,
    isProductEffectivelyActive,
    onSelectProductId,
    onSetRowActionProductId,
    onEditProduct,
    onDeleteProduct,
}: MenuAdminProductsTableProps) {
    return (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant card-shadow">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                        <th className="p-3 text-label-bold text-secondary">Görsel</th>
                        <AdminSortableTh
                            label="Ürün adı"
                            columnKey="name"
                            sort={tableSort}
                            onSort={onTableSortClick}
                        />
                        <AdminSortableTh
                            label="Kategori / durum"
                            columnKey="category"
                            sort={tableSort}
                            onSort={onTableSortClick}
                        />
                        <AdminSortableTh
                            label="Fiyat"
                            columnKey="price"
                            sort={tableSort}
                            onSort={onTableSortClick}
                        />
                        <AdminSortableTh
                            label="Ürün / durum"
                            columnKey="status"
                            sort={tableSort}
                            onSort={onTableSortClick}
                        />
                        <th className="p-3 text-label-bold text-secondary text-right">İşlem</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant isolate">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                                Ürünler yükleniyor…
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={6} className="p-6 text-center text-red-600 dark:text-red-400">
                                Ürünler yüklenirken hata oluştu.
                            </td>
                        </tr>
                    ) : products.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                                Filtreye uygun ürün bulunamadı.
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => {
                            const rowPassive = !isProductEffectivelyActive(product);
                            const rowSelected = selectedProductId === product.id;
                            const isEffectivelyActive = isProductEffectivelyActive(product);
                            return (
                                <MenuAdminProductTableRow
                                    key={product.id}
                                    product={product}
                                    rowSelected={rowSelected}
                                    rowPassive={rowPassive}
                                    rowMenuOpen={rowActionProductId === product.id}
                                    isEffectivelyActive={isEffectivelyActive}
                                    onRowClick={() => onSelectProductId(product.id)}
                                    onToggleRowMenu={() =>
                                        onSetRowActionProductId(
                                            rowActionProductId === product.id ? null : product.id
                                        )
                                    }
                                    onEdit={() => onEditProduct(product.id)}
                                    onDelete={() => onDeleteProduct(product)}
                                />
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default MenuAdminProductsTable;
