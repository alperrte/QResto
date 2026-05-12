import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMenuItemDetail } from "../../menuDetailPage/services/menuDetailService";
import type { MenuItemDetailResponse } from "../../menuDetailPage/types/menuDetail.types";
import AdminCountdownConfirmModal from "../components/AdminCountdownConfirmModal";
import { type AdminTableSort } from "../components/AdminSortableTh";
import MenuAdminCatalogToolbar from "./components/MenuAdminCatalogToolbar";
import MenuAdminCategoryChipRow from "./components/MenuAdminCategoryChipRow";
import MenuAdminHeader from "./components/MenuAdminHeader";
import MenuAdminProductPreviewAside from "./components/MenuAdminProductPreviewAside";
import MenuAdminProductsTable from "./components/MenuAdminProductsTable";
import { useMenuAdmin } from "./hooks/useMenuAdmin";
import { isNumericMenuAdminId } from "./services/menuAdminService";
import type { MenuAdminProductRow } from "./types/menuAdmin.types";
import "./styles/menuAdmin.css";

type ProductTableSortKey = "name" | "category" | "price" | "status";

const isProductEffectivelyActive = (
    p: Pick<MenuAdminProductRow, "categoryId" | "categoryActive" | "active" | "inStock">
): boolean => {
    const isCategoryCausingPassive = p.categoryId !== "" && p.categoryActive === false;
    return p.active && p.inStock && !isCategoryCausingPassive;
};

const MenuAdminPage = () => {
    const navigate = useNavigate();
    const [previewDetail, setPreviewDetail] = useState<MenuItemDetailResponse | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(false);
    const [productActiveConfirmOpen, setProductActiveConfirmOpen] = useState(false);
    const [productActiveConfirmProductId, setProductActiveConfirmProductId] = useState<string | null>(
        null
    );
    const [productActiveConfirmProductName, setProductActiveConfirmProductName] = useState("");
    const [productActiveConfirmNextActive, setProductActiveConfirmNextActive] = useState(true);
    const [productActiveConfirmStep, setProductActiveConfirmStep] = useState<"confirm" | "success">(
        "confirm"
    );
    const [productActiveConfirmCountdown, setProductActiveConfirmCountdown] = useState(3);
    const [productActiveConfirmBusy, setProductActiveConfirmBusy] = useState(false);
    const productActiveConfirmReadyRef = useRef(false);

    const [productDeleteConfirmOpen, setProductDeleteConfirmOpen] = useState(false);
    const [productDeleteConfirmProductId, setProductDeleteConfirmProductId] = useState<string | null>(null);
    const [productDeleteConfirmProductName, setProductDeleteConfirmProductName] = useState("");
    const [productDeleteConfirmStep, setProductDeleteConfirmStep] = useState<"confirm" | "success">("confirm");
    const [productDeleteConfirmCountdown, setProductDeleteConfirmCountdown] = useState(3);
    const [productDeleteConfirmBusy, setProductDeleteConfirmBusy] = useState(false);
    const [productDeleteConfirmError, setProductDeleteConfirmError] = useState<string | null>(null);
    const productDeleteConfirmReadyRef = useRef(false);

    const {
        title,
        subtitle,
        categories,
        selectedCategoryId,
        setSelectedCategoryId,
        productStatusFilter,
        setProductStatusFilter,
        query,
        setQuery,
        loading,
        error,
        filteredProducts,
        selectedProduct,
        setSelectedProductId,
        rowActionProductId,
        persistProductActive,
        setRowActionProductId,
        deleteProductPersist,
    } = useMenuAdmin();

    const [tableSort, setTableSort] = useState<AdminTableSort>({ key: "name", dir: "asc" });

    const tableSortCollator = useMemo(
        () => new Intl.Collator("tr", { sensitivity: "base", numeric: true }),
        []
    );

    const tableSortedProducts = useMemo(() => {
        const list = [...filteredProducts];
        const { key, dir } = tableSort;
        const mul = dir === "asc" ? 1 : -1;

        list.sort((a, b) => {
            let cmp = 0;
            switch (key as ProductTableSortKey) {
                case "name":
                    cmp = tableSortCollator.compare(a.name, b.name);
                    break;
                case "category":
                    cmp = tableSortCollator.compare(a.categoryLabel, b.categoryLabel);
                    if (cmp === 0) cmp = tableSortCollator.compare(a.name, b.name);
                    break;
                case "price":
                    cmp =
                        a.price === b.price ? tableSortCollator.compare(a.name, b.name) : a.price < b.price ? -1 : 1;
                    break;
                case "status": {
                    const ra = isProductEffectivelyActive(a) ? 0 : 1;
                    const rb = isProductEffectivelyActive(b) ? 0 : 1;
                    cmp = ra - rb;
                    if (cmp === 0) cmp = tableSortCollator.compare(a.name, b.name);
                    break;
                }
                default:
                    break;
            }
            return mul * cmp;
        });
        return list;
    }, [filteredProducts, tableSort, tableSortCollator]);

    const handleTableSortClick = (columnKey: string) => {
        const key = columnKey as ProductTableSortKey;
        setTableSort((prev) =>
            prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
        );
    };

    const selectedCategoryPassive =
        Boolean(
            selectedProduct &&
                selectedProduct.categoryId !== "" &&
                selectedProduct.categoryActive === false
        );
    const selectedEffectiveActive =
        Boolean(
            selectedProduct &&
                selectedProduct.active &&
                selectedProduct.inStock &&
                !selectedCategoryPassive
        );
    const disableSelectedActivate =
        Boolean(selectedCategoryPassive && selectedProduct && !selectedProduct.active);

    useEffect(() => {
        productActiveConfirmReadyRef.current = false;
        if (!productActiveConfirmOpen) return;
        if (productActiveConfirmStep !== "confirm") return;

        setProductActiveConfirmCountdown(3);
        const intervalId = window.setInterval(() => {
            setProductActiveConfirmCountdown((prev) => {
                const next = prev <= 1 ? 0 : prev - 1;
                productActiveConfirmReadyRef.current = next === 0;
                return next;
            });
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
            productActiveConfirmReadyRef.current = false;
        };
    }, [productActiveConfirmOpen, productActiveConfirmStep]);

    useEffect(() => {
        productDeleteConfirmReadyRef.current = false;
        if (!productDeleteConfirmOpen) return;
        if (productDeleteConfirmStep !== "confirm") return;

        setProductDeleteConfirmCountdown(3);
        const intervalId = window.setInterval(() => {
            setProductDeleteConfirmCountdown((prev) => {
                const next = prev <= 1 ? 0 : prev - 1;
                productDeleteConfirmReadyRef.current = next === 0;
                return next;
            });
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
            productDeleteConfirmReadyRef.current = false;
        };
    }, [productDeleteConfirmOpen, productDeleteConfirmStep]);

    const openProductDeleteConfirm = (product: { id: string; name: string }) => {
        setProductDeleteConfirmProductId(product.id);
        setProductDeleteConfirmProductName(product.name);
        setProductDeleteConfirmError(null);
        setProductDeleteConfirmStep("confirm");
        setProductDeleteConfirmOpen(true);
        setRowActionProductId(null);
    };

    const closeProductDeleteConfirm = () => {
        productDeleteConfirmReadyRef.current = false;
        setProductDeleteConfirmBusy(false);
        setProductDeleteConfirmError(null);
        setProductDeleteConfirmOpen(false);
        setProductDeleteConfirmProductId(null);
        setProductDeleteConfirmProductName("");
        setProductDeleteConfirmStep("confirm");
    };

    const parseProductDeleteErrorMessage = (e: unknown): string => {
        const errAny = e as {
            response?: { data?: { message?: string; error?: string } };
            message?: string;
        };
        const serverData = errAny?.response?.data as unknown as {
            message?: string;
            error?: string;
            details?: unknown;
        };
        const serverMsg = (serverData?.message ?? serverData?.error ?? "").trim();
        const detailsAny = serverData?.details;
        const detailsStr =
            Array.isArray(detailsAny) ? detailsAny.map(String).join(" | ") : String(detailsAny ?? "").trim();
        if (serverMsg && serverMsg !== "Unexpected server error") return serverMsg;
        if (detailsStr) return `Ürün silinemedi. (${detailsStr})`;
        return "Ürün silinemedi. Lütfen tekrar deneyin.";
    };

    const confirmProductDelete = async () => {
        if (!productDeleteConfirmProductId) return;
        if (productDeleteConfirmStep !== "confirm") return;
        if (!productDeleteConfirmReadyRef.current) return;
        if (productDeleteConfirmBusy) return;

        setProductDeleteConfirmBusy(true);
        setProductDeleteConfirmError(null);
        try {
            await deleteProductPersist(productDeleteConfirmProductId);
            setProductDeleteConfirmStep("success");
            window.setTimeout(() => {
                closeProductDeleteConfirm();
            }, 1400);
        } catch (e: unknown) {
            setProductDeleteConfirmError(parseProductDeleteErrorMessage(e));
        } finally {
            setProductDeleteConfirmBusy(false);
        }
    };

    const openProductActiveConfirm = () => {
        if (!selectedProduct || disableSelectedActivate) return;
        setProductActiveConfirmProductId(selectedProduct.id);
        setProductActiveConfirmProductName(selectedProduct.name);
        setProductActiveConfirmNextActive(!selectedProduct.active);
        setProductActiveConfirmStep("confirm");
        setProductActiveConfirmOpen(true);
    };

    const closeProductActiveConfirm = () => {
        productActiveConfirmReadyRef.current = false;
        setProductActiveConfirmBusy(false);
        setProductActiveConfirmOpen(false);
        setProductActiveConfirmProductId(null);
        setProductActiveConfirmProductName("");
        setProductActiveConfirmStep("confirm");
    };

    const confirmProductActiveChange = async () => {
        if (!productActiveConfirmProductId) return;
        if (productActiveConfirmStep !== "confirm") return;
        if (!productActiveConfirmReadyRef.current) return;
        if (productActiveConfirmBusy) return;

        setProductActiveConfirmBusy(true);
        try {
            await persistProductActive(
                productActiveConfirmProductId,
                productActiveConfirmNextActive
            );
            setProductActiveConfirmStep("success");
            window.setTimeout(() => {
                closeProductActiveConfirm();
            }, 1400);
        } catch {
            window.alert("Ürün durumu güncellenemedi.");
        } finally {
            setProductActiveConfirmBusy(false);
        }
    };

    useEffect(() => {
        if (!selectedProduct || !isNumericMenuAdminId(selectedProduct.id)) {
            setPreviewDetail(null);
            setPreviewError(false);
            setPreviewLoading(false);
            return;
        }

        let cancelled = false;
        setPreviewLoading(true);
        setPreviewError(false);

        fetchMenuItemDetail(selectedProduct.id)
            .then((data) => {
                if (!cancelled) setPreviewDetail(data);
            })
            .catch(() => {
                if (!cancelled) {
                    setPreviewDetail(null);
                    setPreviewError(true);
                }
            })
            .finally(() => {
                if (!cancelled) setPreviewLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [selectedProduct?.id]);

    return (
        <div className="menu-admin-page space-y-4">
            <MenuAdminHeader
                title={title}
                subtitle={subtitle}
                onCreateClick={() => navigate("/app/admin/menu-products/create")}
            />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(360px,440px)] xl:items-stretch gap-6 min-h-[72vh] xl:min-h-[calc(100vh-140px)]">
                <section className="space-y-4 min-w-0">
                    <MenuAdminCatalogToolbar
                        query={query}
                        onQueryChange={setQuery}
                        productStatusFilter={productStatusFilter}
                        onProductStatusFilterChange={setProductStatusFilter}
                    />

                    <MenuAdminCategoryChipRow
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        onSelectCategoryId={setSelectedCategoryId}
                    />

                    <MenuAdminProductsTable
                        loading={loading}
                        error={Boolean(error)}
                        products={tableSortedProducts}
                        selectedProductId={selectedProduct?.id ?? null}
                        rowActionProductId={rowActionProductId}
                        tableSort={tableSort}
                        onTableSortClick={handleTableSortClick}
                        isProductEffectivelyActive={isProductEffectivelyActive}
                        onSelectProductId={setSelectedProductId}
                        onSetRowActionProductId={setRowActionProductId}
                        onEditProduct={(id) => navigate(`/app/admin/menu-products/${id}/edit`)}
                        onDeleteProduct={openProductDeleteConfirm}
                    />
                </section>

                <MenuAdminProductPreviewAside
                    selectedProduct={selectedProduct}
                    selectedEffectiveActive={selectedEffectiveActive}
                    disableSelectedActivate={disableSelectedActivate}
                    selectedCategoryPassive={selectedCategoryPassive}
                    onOpenProductActiveConfirm={openProductActiveConfirm}
                    previewDetail={previewDetail}
                    previewLoading={previewLoading}
                    previewError={previewError}
                />
            </div>

            <AdminCountdownConfirmModal
                open={Boolean(productActiveConfirmOpen && productActiveConfirmProductId)}
                onClose={closeProductActiveConfirm}
                busy={productActiveConfirmBusy}
                step={productActiveConfirmStep}
                confirmHeadingTone="danger"
                confirmDescription={
                    <p className="mb-0">
                        <span className="font-semibold">{productActiveConfirmProductName}</span> isimli ürünün
                        durumunu değiştireceksiniz.
                    </p>
                }
                confirmBeforeCountdown={
                    <p className="mb-0">
                        {productActiveConfirmNextActive
                            ? "Ürünü aktifleştirdiğinizde kayıt aktif olur. Menüde görünürlük stok ve kategori durumuna da bağlıdır."
                            : "Ürünü pasifleştirdiğinizde menüde listelenmeyecektir."}
                    </p>
                }
                countdown={productActiveConfirmCountdown}
                countdownCaption={
                    <span>
                        Onay süresi dolana kadar <span className="font-semibold">Onayla</span> butonu devre dışı
                        olacaktır.
                    </span>
                }
                confirmLabel="Onayla"
                confirmBusyLabel="Kaydediliyor…"
                onConfirm={confirmProductActiveChange}
                confirmButtonClassName="bg-primary text-on-primary hover:opacity-90"
                confirmDisabled={productActiveConfirmCountdown > 0}
                successBody={
                    <p className="mb-0">
                        <span className="font-semibold">{productActiveConfirmProductName}</span> isimli ürünün
                        durumu güncellendi.
                    </p>
                }
            />

            <AdminCountdownConfirmModal
                open={Boolean(productDeleteConfirmOpen && productDeleteConfirmProductId)}
                onClose={closeProductDeleteConfirm}
                busy={productDeleteConfirmBusy}
                step={productDeleteConfirmStep}
                confirmHeadingTone="danger"
                confirmDescription={
                    <p className="mb-0">
                        <span className="font-semibold">{productDeleteConfirmProductName}</span> isimli ürünü
                        kalıcı olarak sileceksiniz. Bu işlem geri alınamaz.
                    </p>
                }
                countdown={productDeleteConfirmCountdown}
                countdownCaption={
                    <span>
                        Onay süresi dolana kadar <span className="font-semibold">Sil</span> butonu devre dışı
                        olacaktır.
                    </span>
                }
                errorMessage={productDeleteConfirmError}
                confirmLabel="Sil"
                onConfirm={confirmProductDelete}
                confirmButtonClassName="bg-red-600 text-white hover:bg-red-700"
                confirmDisabled={productDeleteConfirmCountdown > 0}
                successBody={
                    <p className="mb-0">
                        <span className="font-semibold">{productDeleteConfirmProductName}</span> isimli ürün
                        silindi.
                    </p>
                }
            />
        </div>
    );
};

export default MenuAdminPage;
