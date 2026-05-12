import type { MenuItemDetailResponse } from "../../../menuDetailPage/types/menuDetail.types";
import type { MenuCategoryDto, MenuItemListItemDto } from "../../../menuPage/types/menu.types";
import type { MenuProductOptionGroupPayload } from "../services/menuAdminApi";

/**
 * Taslakta kategori henüz seçilmedi.
 * Boş string (`""`) ise kullanıcı bilinçli olarak «Kategorisiz» seçmiş demektir.
 */
export const MENU_ADMIN_CATEGORY_UNCHOSEN = "__qresto_category_unchosen__";

/** Tablo / liste durum filtresi (menüde görünürlük = aktif + stok + kategori). */
export type MenuAdminProductStatusFilter = "all" | "active" | "inactive";

export type MenuAdminCategoryChip = {
    id: string;
    label: string;
};

export type MenuAdminProductRow = {
    id: string;
    name: string;
    categoryId: string;
    categoryLabel: string;
    categoryActive: boolean | null;
    imageUrl: string;
    description: string;
    price: number;
    priceLabel: string;
    active: boolean;
    inStock: boolean;
    calorie: number | null;
    gram: number | null;
    prepTimeMin: number | null;
    ingredients: string | null;
    removableIngredients: string | null;
    addableIngredients: string | null;
    orderNoteEnabled: boolean;
    orderNoteTitle: string;
};

export type MenuAdminProductDraft = {
    name: string;
    categoryId: string;
    description: string;
    price: string;
    imageUrl: string;
    prepTimeMin: string;
    calorie: string;
    gram: string;
    ingredients: string;
    removableIngredients: string;
    addableIngredients: string;
    selectedOptionGroupIds: string[];
    /** Menüde listelenme / ürün kaydı (API `active`). */
    active: boolean;
    /** Değerlendirme satırı için UI; API’ye gönderilmez, `active` ile bağlı değildir. */
    ratingActive: boolean;
    inStock: boolean;
    orderNoteEnabled: boolean;
    orderNoteTitle: string;
};

export type MenuAdminState = {
    title: string;
    subtitle: string;
    categories: MenuAdminCategoryChip[];
    selectedCategoryId: string;
    productStatusFilter: MenuAdminProductStatusFilter;
    query: string;
    loading: boolean;
    error: Error | null;
    allProducts: MenuAdminProductRow[];
    filteredProducts: MenuAdminProductRow[];
    selectedProduct: MenuAdminProductRow | null;
    isCreateModalOpen: boolean;
    isEditMode: boolean;
    draft: MenuAdminProductDraft;
    rowActionProductId: string | null;
    setQuery: (query: string) => void;
    setProductStatusFilter: (filter: MenuAdminProductStatusFilter) => void;
    setSelectedCategoryId: (categoryId: string) => void;
    setSelectedProductId: (productId: string) => void;
    openCreateModal: () => void;
    closeModal: () => void;
    setDraftField: <K extends keyof MenuAdminProductDraft>(
        key: K,
        value: MenuAdminProductDraft[K]
    ) => void;
    submitDraft: (
        draftOverride?: Partial<MenuAdminProductDraft>,
        optionGroupsPayload?: MenuProductOptionGroupPayload[]
    ) => Promise<void>;
    /** Sihirbaz düzenleme: GET detay sonrası taslak + editing id. */
    beginEditFromApiDetail: (detail: MenuItemDetailResponse) => void;
    /** Sihirbaz yeni ürün: oturumu sıfırla. */
    resetWizardToCreate: () => void;
    toggleSelectedActive: () => void;
    toggleProductActiveForId: (productId: string) => void;
    persistProductActive: (productId: string, active: boolean) => Promise<void>;
    setRowActionProductId: (productId: string | null) => void;
    openEditModal: (productId: string) => void;
    deleteProductPersist: (productId: string) => Promise<void>;
    rawCategories: MenuCategoryDto[];
    rawItems: MenuItemListItemDto[];
};
