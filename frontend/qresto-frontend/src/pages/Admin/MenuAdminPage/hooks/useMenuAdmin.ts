import { useCallback, useEffect, useMemo, useState } from "react";
import { useMenuCatalog } from "../../../menuPage/hooks/useMenuCatalog";
import {
    mapCategoriesToChips,
    mapItemsToRows,
    mapMenuAdminDraftToCreatePayload,
    mapMenuAdminDraftToUpdatePayload,
} from "../mappers/mapMenuAdmin";
import { categoryIdMatchesMenuFilter } from "../../../menuPage/mappers/mapMenuCatalog";
import type { MenuProductOptionGroupPayload } from "../services/menuAdminApi";
import {
    createMenuProductApi,
    deleteMenuProductApi,
    patchProductActiveApi,
    updateMenuProductApi,
} from "../services/menuAdminApi";
import {
    formatTry,
    isNumericMenuAdminId,
    MENU_ADMIN_SUBTITLE,
    MENU_ADMIN_TITLE,
    normalizeSearchText,
} from "../services/menuAdminService";
import {
    MENU_ADMIN_CATEGORY_UNCHOSEN,
    type MenuAdminProductDraft,
    type MenuAdminProductRow,
    type MenuAdminProductStatusFilter,
    type MenuAdminState,
} from "../types/menuAdmin.types";
import { mapProductDetailToMenuAdminDraft } from "../ProductWizard/mappers/mapProductDetailToWizard";
import type { MenuItemDetailResponse } from "../../../menuDetailPage/types/menuDetail.types";

const EMPTY_DRAFT: MenuAdminProductDraft = {
    name: "",
    categoryId: MENU_ADMIN_CATEGORY_UNCHOSEN,
    description: "",
    price: "",
    imageUrl: "",
    prepTimeMin: "",
    calorie: "",
    gram: "",
    ingredients: "",
    removableIngredients: "",
    addableIngredients: "",
    selectedOptionGroupIds: [],
    active: true,
    ratingActive: false,
    inStock: true,
    orderNoteEnabled: false,
    orderNoteTitle: "",
};

const isRowEffectivelyActive = (product: MenuAdminProductRow): boolean => {
    const isCategoryCausingPassive =
        product.categoryId !== "" && product.categoryActive === false;
    return product.active && product.inStock && !isCategoryCausingPassive;
};

export const useMenuAdmin = (): MenuAdminState => {
    const [query, setQuery] = useState("");
    const [productStatusFilter, setProductStatusFilter] =
        useState<MenuAdminProductStatusFilter>("all");
    const [selectedCategoryId, setSelectedCategoryId] = useState("all");
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [products, setProducts] = useState<MenuAdminProductRow[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [draft, setDraft] = useState<MenuAdminProductDraft>(EMPTY_DRAFT);
    const [rowActionProductId, setRowActionProductId] = useState<string | null>(null);
    const { data, loading, error, refetch } = useMenuCatalog(undefined, true);

    const rawCategories = data?.categories ?? [];
    const rawItems = data?.items ?? [];

    const categories = useMemo(() => mapCategoriesToChips(rawCategories), [rawCategories]);
    const allProducts = useMemo(
        () => mapItemsToRows(rawItems, rawCategories),
        [rawItems, rawCategories]
    );

    useEffect(() => {
        setProducts(allProducts);
    }, [allProducts]);

    const filteredProducts = useMemo(() => {
        const q = normalizeSearchText(query);
        let list = products.filter((product) => {
            const categoryOk = categoryIdMatchesMenuFilter(product.categoryId, selectedCategoryId);
            if (!categoryOk) return false;
            if (!q) return true;
            return (
                normalizeSearchText(product.name).includes(q) ||
                normalizeSearchText(product.description).includes(q)
            );
        });
        if (productStatusFilter === "active") {
            list = list.filter((p) => isRowEffectivelyActive(p));
        } else if (productStatusFilter === "inactive") {
            list = list.filter((p) => !isRowEffectivelyActive(p));
        }
        return list;
    }, [products, query, selectedCategoryId, productStatusFilter]);

    useEffect(() => {
        if (!filteredProducts.length) {
            setSelectedProductId(null);
            return;
        }

        const stillExists = filteredProducts.some((product) => product.id === selectedProductId);
        if (!stillExists) {
            setSelectedProductId(filteredProducts[0].id);
        }
    }, [filteredProducts, selectedProductId]);

    const selectedProduct: MenuAdminProductRow | null =
        filteredProducts.find((product) => product.id === selectedProductId) ?? null;

    const openCreateModal = () => {
        setEditingProductId(null);
        setDraft({ ...EMPTY_DRAFT });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (productId: string) => {
        const product = products.find((item) => item.id === productId);
        if (!product) return;
        setEditingProductId(productId);
        setDraft({
            name: product.name,
            categoryId: product.categoryId,
            description: product.description,
            price: String(product.price),
            imageUrl: product.imageUrl,
            prepTimeMin: product.prepTimeMin != null ? String(product.prepTimeMin) : "",
            calorie: product.calorie != null ? String(product.calorie) : "",
            gram: product.gram != null ? String(product.gram) : "",
            ingredients: product.ingredients ?? "",
            removableIngredients: product.removableIngredients ?? "",
            addableIngredients: product.addableIngredients ?? "",
            selectedOptionGroupIds: [],
            active: product.active,
            ratingActive: false,
            inStock: product.inStock,
            orderNoteEnabled: product.orderNoteEnabled,
            orderNoteTitle: product.orderNoteTitle,
        });
        setIsCreateModalOpen(true);
        setRowActionProductId(null);
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setEditingProductId(null);
        setDraft(EMPTY_DRAFT);
    };

    const setDraftField = <K extends keyof MenuAdminProductDraft>(
        key: K,
        value: MenuAdminProductDraft[K]
    ) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const beginEditFromApiDetail = useCallback((detail: MenuItemDetailResponse) => {
        setEditingProductId(String(detail.id));
        setDraft(mapProductDetailToMenuAdminDraft(detail));
    }, []);

    const resetWizardToCreate = useCallback(() => {
        setEditingProductId(null);
        setDraft({ ...EMPTY_DRAFT });
    }, []);

    const submitDraft = async (
        draftOverride?: Partial<MenuAdminProductDraft>,
        optionGroupsPayload?: MenuProductOptionGroupPayload[]
    ) => {
        const d: MenuAdminProductDraft = { ...draft, ...draftOverride };
        const price = Number(d.price);
        if (!d.name.trim() || Number.isNaN(price)) {
            return;
        }

        const categoryLabel =
            d.categoryId.trim() === MENU_ADMIN_CATEGORY_UNCHOSEN
                ? "—"
                : (categories.find((category) => category.id === d.categoryId)?.label ??
                  (d.categoryId?.trim() ? "Kategori" : "Kategorisiz"));

        if (editingProductId && isNumericMenuAdminId(editingProductId)) {
            await updateMenuProductApi(
                Number(editingProductId),
                mapMenuAdminDraftToUpdatePayload(d, optionGroupsPayload)
            );
            await refetch();
            setEditingProductId(null);
            setDraft(EMPTY_DRAFT);
            setIsCreateModalOpen(false);
            return;
        }

        if (editingProductId) {
            setProducts((prev) =>
                prev.map((product) =>
                    product.id === editingProductId
                        ? {
                              ...product,
                              name: d.name.trim(),
                              categoryId: d.categoryId,
                              categoryLabel,
                              description: d.description.trim() || "Açıklama bulunmuyor.",
                              price,
                              priceLabel: formatTry(price),
                              imageUrl: d.imageUrl.trim() || product.imageUrl,
                              prepTimeMin: d.prepTimeMin ? Number(d.prepTimeMin) : null,
                              calorie: d.calorie ? Number(d.calorie) : null,
                              gram: d.gram ? Number(d.gram) : null,
                              ingredients: d.ingredients.trim() || null,
                              removableIngredients: d.removableIngredients.trim() || null,
                              addableIngredients: d.addableIngredients.trim() || null,
                              active: d.active,
                              inStock: d.inStock,
                              orderNoteEnabled: d.orderNoteEnabled,
                              orderNoteTitle: d.orderNoteTitle.trim(),
                          }
                        : product
                )
            );
            closeModal();
            return;
        }

        const trimmedCat = d.categoryId.trim();
        if (trimmedCat === MENU_ADMIN_CATEGORY_UNCHOSEN) {
            throw new Error("Lütfen bir kategori seçin veya Kategorisiz seçeneğini kullanın.");
        }
        if (trimmedCat !== "" && !isNumericMenuAdminId(trimmedCat)) {
            throw new Error(
                "Kategori cozumlenemedi. Yeni kategori eklediyseniz kayit akisi tamamlanmamis olabilir."
            );
        }

        const created = await createMenuProductApi(
            mapMenuAdminDraftToCreatePayload(
                d,
                optionGroupsPayload !== undefined ? optionGroupsPayload : undefined
            )
        );
        await refetch();
        setSelectedProductId(String(created.id));
        closeModal();
    };

    const toggleProductActiveForId = (productId: string) => {
        setProducts((prev) =>
            prev.map((product) =>
                product.id === productId ? { ...product, active: !product.active } : product
            )
        );
    };

    const persistProductActive = useCallback(
        async (productId: string, active: boolean) => {
            if (isNumericMenuAdminId(productId)) {
                await patchProductActiveApi(Number(productId), active);
                await refetch();
                return;
            }
            setProducts((prev) =>
                prev.map((product) =>
                    product.id === productId ? { ...product, active } : product
                )
            );
        },
        [refetch]
    );

    const toggleSelectedActive = () => {
        if (!selectedProductId) return;
        toggleProductActiveForId(selectedProductId);
    };

    const deleteProductPersist = useCallback(
        async (productId: string) => {
            if (isNumericMenuAdminId(productId)) {
                await deleteMenuProductApi(Number(productId));
                await refetch();
                return;
            }
            setProducts((prev) => prev.filter((product) => product.id !== productId));
            setRowActionProductId((current) => (current === productId ? null : current));
        },
        [refetch]
    );

    return {
        title: MENU_ADMIN_TITLE,
        subtitle: MENU_ADMIN_SUBTITLE,
        categories,
        selectedCategoryId,
        productStatusFilter,
        query,
        loading,
        error,
        allProducts: products,
        filteredProducts,
        selectedProduct,
        isCreateModalOpen,
        isEditMode: Boolean(editingProductId),
        draft,
        rowActionProductId,
        setQuery,
        setProductStatusFilter,
        setSelectedCategoryId,
        setSelectedProductId,
        openCreateModal,
        closeModal,
        setDraftField,
        submitDraft,
        beginEditFromApiDetail,
        resetWizardToCreate,
        toggleSelectedActive,
        toggleProductActiveForId,
        persistProductActive,
        setRowActionProductId,
        openEditModal,
        deleteProductPersist,
        rawCategories,
        rawItems,
    };
};
