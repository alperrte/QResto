import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import AdminInfoSpeechBubble from "../../components/AdminInfoSpeechBubble";
import type { MenuAdminProductRow } from "../types/menuAdmin.types";

type MenuAdminProductTableRowProps = {
    product: MenuAdminProductRow;
    rowSelected: boolean;
    rowPassive: boolean;
    rowMenuOpen: boolean;
    isEffectivelyActive: boolean;
    onRowClick: () => void;
    onToggleRowMenu: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

function MenuAdminProductTableRow({
    product,
    rowSelected,
    rowPassive,
    rowMenuOpen,
    isEffectivelyActive,
    onRowClick,
    onToggleRowMenu,
    onEdit,
    onDelete,
}: MenuAdminProductTableRowProps) {
    /** Pasif satırda rozetler + ⋮ menü hariç metin/görsel solukluğu */
    const dimIfPassive = rowPassive ? "opacity-[0.5]" : "";

    return (
        <tr
            onClick={onRowClick}
            className={`relative cursor-pointer border-l-4 transition-[background-color,box-shadow] ${
                rowMenuOpen ? "z-30" : "z-0"
            } ${
                rowSelected
                    ? `border-l-primary ${
                          rowPassive
                              ? "bg-primary-container/30 shadow-[inset_0_0_0_1px_rgba(234,88,12,0.09)]"
                              : "bg-primary-container/35 shadow-[inset_0_0_0_1px_rgba(234,88,12,0.12)]"
                      }`
                    : `border-l-transparent ${
                          rowPassive
                              ? "bg-surface-container-low/60 hover:bg-surface-container-high/80"
                              : "hover:bg-surface-bright"
                      }`
            }`}
        >
            <td className="p-3">
                <div
                    className={`w-12 h-12 rounded-lg overflow-hidden bg-surface-container ${dimIfPassive} ${
                        rowPassive ? "ring-1 ring-inset ring-outline-variant/50" : ""
                    }`}
                >
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                    />
                </div>
            </td>
            <td
                className={`p-3 font-semibold ${
                    rowSelected ? "text-primary" : rowPassive ? "text-on-surface-variant" : "text-on-surface"
                }`}
            >
                <span className={dimIfPassive}>{product.name}</span>
            </td>
            <td className={`p-3 ${rowPassive ? "text-on-surface-variant" : "text-secondary"}`}>
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={`${dimIfPassive} ${
                            product.categoryId === "" ? "text-on-surface-variant font-medium" : ""
                        }`.trim()}
                    >
                        {product.categoryLabel}
                    </span>

                    {product.categoryId === "" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm border border-amber-600/30 dark:bg-amber-600 dark:text-white dark:border-amber-500/40">
                            Kategorisiz
                            <AdminInfoSpeechBubble
                                ariaLabel="Kategorisiz ürün bilgisi"
                                triggerSize="sm"
                                tail="left"
                            >
                                <p className="m-0">
                                    Kategori atanmamış ürünler menüde yalnızca «Tümü» görünümünde listelenir.
                                </p>
                            </AdminInfoSpeechBubble>
                        </span>
                    ) : product.categoryActive === false ? (
                        <span className="inline-flex items-center gap-1">
                            <AdminStatusBadge active={false} />
                            <AdminInfoSpeechBubble
                                ariaLabel="Pasif kategori bilgisi"
                                triggerSize="sm"
                                tail="left"
                            >
                                <p className="m-0">
                                    Kategori pasif hale getirildiği için ürün menüde gözükmeyecektir.
                                </p>
                            </AdminInfoSpeechBubble>
                        </span>
                    ) : null}
                </div>
            </td>
            <td className={`p-3 font-semibold ${rowPassive ? "text-on-surface-variant" : "text-on-surface"}`}>
                <span className={dimIfPassive}>{product.priceLabel}</span>
            </td>
            <td className="p-3">
                <AdminStatusBadge active={isEffectivelyActive} />
            </td>
            <td className="p-3 text-right">
                <div className="relative z-[80] inline-block">
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onToggleRowMenu();
                        }}
                        className="relative z-[1] h-8 w-8 rounded-full hover:bg-surface-container flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-[20px] text-secondary">more_vert</span>
                    </button>

                    {rowMenuOpen ? (
                        <div className="absolute right-0 top-full z-[100] mt-1 w-36 rounded-lg border border-outline-variant bg-surface-container-lowest py-0.5 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onEdit();
                                }}
                                className="w-full text-left px-3 py-2 text-body-md hover:bg-surface-container-low"
                            >
                                Düzenle
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDelete();
                                }}
                                className="w-full text-left px-3 py-2 text-body-md text-red-600 hover:bg-red-50"
                            >
                                Sil
                            </button>
                        </div>
                    ) : null}
                </div>
            </td>
        </tr>
    );
}

export default MenuAdminProductTableRow;
