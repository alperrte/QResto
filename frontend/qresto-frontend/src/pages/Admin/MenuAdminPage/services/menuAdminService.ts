export const MENU_ADMIN_TITLE = "Ürün Listesi";
export const MENU_ADMIN_SUBTITLE = "Menünüzdeki tüm ürünleri buradan yönetebilirsiniz.";
export const MENU_ADMIN_CREATE_PRODUCT_LABEL = "Yeni Ürün Ekle";
export const MENU_ADMIN_SEARCH_PLACEHOLDER = "Ürün ara...";

export const MENU_CATEGORIES_PAGE_TITLE = "Kategoriler";
export const MENU_CATEGORIES_CREATE_LABEL = "Kategori ekle";
export const MENU_CATEGORIES_SEARCH_PLACEHOLDER = "Kategori ara…";
export const MENU_CATEGORIES_PAGE_SUBTITLE =
    "Menü kategorilerini görüntüleyin, yeni kategori ekleyin veya durumlarını güncelleyin.";

/** menu-service kayıt kimlikleri (ürün / kategori id string) */
export const isNumericMenuAdminId = (id: string): boolean => /^\d+$/.test(id.trim());

export const normalizeSearchText = (value: string): string => {
    return value.trim().toLocaleLowerCase("tr-TR");
};

export const formatTry = (price: number): string => `₺${price.toFixed(2)}`;
