import type { MenuItemDetailResponse } from "../../../menuDetailPage/types/menuDetail.types";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import AdminInfoSpeechBubble from "../../components/AdminInfoSpeechBubble";
import type { MenuAdminProductRow } from "../types/menuAdmin.types";
import { MenuAdminProductPreviewPanel } from "./MenuAdminProductPreviewPanel";

type MenuAdminProductPreviewAsideProps = {
    selectedProduct: MenuAdminProductRow | null;
    selectedEffectiveActive: boolean;
    disableSelectedActivate: boolean;
    selectedCategoryPassive: boolean;
    onOpenProductActiveConfirm: () => void;
    previewDetail: MenuItemDetailResponse | null;
    previewLoading: boolean;
    previewError: boolean;
};

function MenuAdminProductPreviewAside({
    selectedProduct,
    selectedEffectiveActive,
    disableSelectedActivate,
    selectedCategoryPassive,
    onOpenProductActiveConfirm,
    previewDetail,
    previewLoading,
    previewError,
}: MenuAdminProductPreviewAsideProps) {
    return (
        <aside className="menu-admin-preview-enter-up hidden xl:flex flex-col h-full min-h-0 bg-surface-container-lowest rounded-xl border border-outline-variant card-shadow overflow-hidden">
            <div className="p-4 border-b border-outline-variant shrink-0 bg-surface-container-lowest">
                <h3 className="text-headline-sm font-headline-sm text-on-surface">Ürün önizleme</h3>
                {selectedProduct ? (
                    <>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
                            <div className="flex items-center justify-between gap-4 min-w-[140px]">
                                <span className="text-body-md font-semibold text-on-surface">Ürün aktif</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (disableSelectedActivate) return;
                                        onOpenProductActiveConfirm();
                                    }}
                                    disabled={disableSelectedActivate}
                                    className={`w-12 h-7 rounded-full relative shrink-0 transition-colors ${
                                        selectedEffectiveActive
                                            ? "bg-[#10B981]"
                                            : "bg-surface-variant"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                                            selectedEffectiveActive ? "right-1" : "left-1"
                                        }`}
                                    />
                                </button>
                            </div>
                            {selectedCategoryPassive ? (
                                <p className="text-body-sm text-amber-800 dark:text-amber-300 w-full basis-full">
                                    Kategori pasif iken ürün tek başına aktif edilemez.
                                </p>
                            ) : null}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                            <span
                                className={`text-body-md sm:text-body-lg font-bold leading-snug ${
                                    selectedProduct.categoryId === ""
                                        ? "text-on-surface-variant"
                                        : "text-on-surface"
                                }`}
                            >
                                {selectedProduct.categoryLabel}
                            </span>
                            {selectedProduct.categoryId === "" ? (
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
                            ) : selectedProduct.categoryActive === false ? (
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
                    </>
                ) : null}
            </div>

            {selectedProduct ? (
                <div className="flex flex-1 flex-col min-h-0">
                    <MenuAdminProductPreviewPanel
                        product={selectedProduct}
                        detail={previewDetail}
                        detailLoading={previewLoading}
                        detailError={previewError}
                    />
                </div>
            ) : (
                <div className="p-4 text-on-surface-variant">Önizleme için tablodan bir ürün seçin.</div>
            )}
        </aside>
    );
}

export default MenuAdminProductPreviewAside;
