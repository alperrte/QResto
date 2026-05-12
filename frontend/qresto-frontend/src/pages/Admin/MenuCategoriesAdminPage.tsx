import { useCallback, useEffect, useMemo, useState } from "react";
import {
    createMenuCategoryApi,
    deleteMenuCategoryApi,
    fetchAdminCategoriesAll,
    patchCategoryActiveApi,
    updateMenuCategoryApi,
} from "./MenuAdminPage/services/menuAdminApi";
import MenuAdminHeader from "./MenuAdminPage/components/MenuAdminHeader";
import MenuCategoriesCatalogToolbar from "./MenuAdminPage/components/MenuCategoriesCatalogToolbar";
import MenuCategoriesTable from "./MenuAdminPage/components/MenuCategoriesTable";
import {
    MENU_CATEGORIES_CREATE_LABEL,
    MENU_CATEGORIES_PAGE_SUBTITLE,
    MENU_CATEGORIES_PAGE_TITLE,
    normalizeSearchText,
} from "./MenuAdminPage/services/menuAdminService";
import type { MenuAdminProductStatusFilter } from "./MenuAdminPage/types/menuAdmin.types";
import type { MenuCategoryDto } from "../menuPage/types/menu.types";
import AdminCountdownConfirmModal from "./components/AdminCountdownConfirmModal";
import AdminFormModal from "./components/AdminFormModal";
import { type AdminTableSort } from "./components/AdminSortableTh";
import "./MenuAdminPage/styles/menuAdmin.css";

const MenuCategoriesAdminPage = () => {
    const [categories, setCategories] = useState<MenuCategoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [categorySearchQuery, setCategorySearchQuery] = useState("");
    const [categoryStatusFilter, setCategoryStatusFilter] =
        useState<MenuAdminProductStatusFilter>("all");
    const [nameSort, setNameSort] = useState<AdminTableSort>({ key: "name", dir: "asc" });

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addModalName, setAddModalName] = useState("");

    const [editModalCategory, setEditModalCategory] = useState<MenuCategoryDto | null>(null);
    const [editModalName, setEditModalName] = useState("");

    const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
    const [statusConfirmCategory, setStatusConfirmCategory] = useState<MenuCategoryDto | null>(null);
    const [statusConfirmNextActive, setStatusConfirmNextActive] = useState<boolean>(true);
    const [statusCountdown, setStatusCountdown] = useState(3);
    const [statusConfirmBusy, setStatusConfirmBusy] = useState(false);
    const [statusConfirmStep, setStatusConfirmStep] = useState<"confirm" | "success">("confirm");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<MenuCategoryDto | null>(null);
    const [deleteConfirmBusy, setDeleteConfirmBusy] = useState(false);
    const [deleteCountdown, setDeleteCountdown] = useState(3);
    const [deleteConfirmStep, setDeleteConfirmStep] = useState<"confirm" | "success">("confirm");
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await fetchAdminCategoriesAll();
            setCategories([...list].sort((a, b) => a.id - b.id));
        } catch {
            setError("Kategoriler yüklenemedi.");
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (!statusConfirmOpen) return;

        setStatusCountdown(3);
        const intervalId = window.setInterval(() => {
            setStatusCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [statusConfirmOpen]);

    useEffect(() => {
        if (!deleteConfirmOpen) return;
        if (deleteConfirmStep !== "confirm") return;

        setDeleteCountdown(3);
        setDeleteError(null);

        const intervalId = window.setInterval(() => {
            setDeleteCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [deleteConfirmOpen, deleteConfirmStep]);

    const nameCollator = useMemo(
        () => new Intl.Collator("tr", { sensitivity: "base", numeric: true }),
        []
    );

    const filteredCategories = useMemo(() => {
        let list = categories;
        if (categoryStatusFilter === "active") {
            list = list.filter((c) => c.active);
        } else if (categoryStatusFilter === "inactive") {
            list = list.filter((c) => !c.active);
        }
        const q = normalizeSearchText(categorySearchQuery);
        if (q) {
            list = list.filter((c) => normalizeSearchText(c.name).includes(q));
        }
        return list;
    }, [categories, categorySearchQuery, categoryStatusFilter]);

    const tableSortedCategories = useMemo(() => {
        const list = [...filteredCategories];
        const mul = nameSort.dir === "asc" ? 1 : -1;
        list.sort((a, b) => mul * nameCollator.compare(a.name, b.name));
        return list;
    }, [filteredCategories, nameSort, nameCollator]);

    const handleNameSortClick = (columnKey: string) => {
        if (columnKey !== "name") return;
        setNameSort((prev) => ({
            key: "name",
            dir: prev.dir === "asc" ? "desc" : "asc",
        }));
    };

    const openAddModal = () => {
        setAddModalName("");
        setAddModalOpen(true);
    };

    const closeAddModal = () => {
        setAddModalOpen(false);
        setAddModalName("");
    };

    const submitAddCategory = async () => {
        const name = addModalName.trim();
        if (!name) return;
        setSaving(true);
        try {
            await createMenuCategoryApi({ name });
            closeAddModal();
            await load();
        } catch (e) {
            window.alert(
                e instanceof Error
                    ? e.message
                    : "Kategori eklenemedi (ör. aynı isim zaten var). İsmi değiştirip tekrar deneyin."
            );
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (c: MenuCategoryDto) => {
        setEditModalCategory(c);
        setEditModalName(c.name);
    };

    const closeEditModal = () => {
        setEditModalCategory(null);
        setEditModalName("");
    };

    const submitEditCategory = async () => {
        if (!editModalCategory) return;
        const name = editModalName.trim();
        if (!name) return;
        setSaving(true);
        try {
            await updateMenuCategoryApi(editModalCategory.id, {
                name,
                active: editModalCategory.active,
            });
            closeEditModal();
            await load();
        } catch {
            window.alert("Kategori güncellenemedi.");
        } finally {
            setSaving(false);
        }
    };

    const openStatusConfirm = (c: MenuCategoryDto) => {
        setStatusConfirmCategory(c);
        setStatusConfirmNextActive(!c.active);
        setStatusConfirmOpen(true);
        setStatusConfirmStep("confirm");
    };

    const closeStatusConfirm = () => {
        setStatusConfirmOpen(false);
        setStatusConfirmCategory(null);
        setStatusConfirmBusy(false);
        setStatusConfirmStep("confirm");
    };

    const confirmStatusChange = async () => {
        if (!statusConfirmCategory) return;
        if (statusCountdown > 0) return;

        setStatusConfirmBusy(true);
        try {
            await patchCategoryActiveApi(statusConfirmCategory.id, statusConfirmNextActive);
            setCategories((prev) =>
                prev.map((x) =>
                    x.id === statusConfirmCategory.id ? { ...x, active: statusConfirmNextActive } : x
                )
            );
        } catch {
            window.alert("Durum güncellenemedi.");
        } finally {
            setStatusConfirmBusy(false);

            setStatusConfirmStep("success");
            window.setTimeout(() => {
                closeStatusConfirm();
            }, 1400);
        }
    };

    const openDeleteConfirm = (c: MenuCategoryDto) => {
        setDeleteConfirmCategory(c);
        setDeleteConfirmOpen(true);
        setDeleteConfirmBusy(false);
        setDeleteConfirmStep("confirm");
        setDeleteError(null);
    };

    const closeDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setDeleteConfirmCategory(null);
        setDeleteConfirmBusy(false);
        setDeleteError(null);
        setDeleteConfirmStep("confirm");
    };

    const confirmDeleteCategory = async () => {
        if (!deleteConfirmCategory) return;
        if (deleteConfirmBusy) return;
        if (deleteConfirmStep !== "confirm") return;
        if (deleteCountdown > 0) return;

        setDeleteConfirmBusy(true);
        try {
            await deleteMenuCategoryApi(deleteConfirmCategory.id);
            if (editModalCategory?.id === deleteConfirmCategory.id) {
                closeEditModal();
            }
            await load();
            setDeleteConfirmStep("success");
            window.setTimeout(() => {
                closeDeleteConfirm();
            }, 1400);
        } catch (e: unknown) {
            const errAny = e as unknown as {
                response?: { data?: { message?: string; error?: string } };
                message?: string;
            };
            const serverData = errAny?.response?.data as unknown as {
                message?: string;
                error?: string;
                details?: unknown;
            };
            const serverMsg =
                (serverData?.message ?? serverData?.error ?? "").trim();
            const detailsAny = serverData?.details;
            const detailsStr =
                Array.isArray(detailsAny) ? detailsAny.map(String).join(" | ") : String(detailsAny ?? "").trim();
            setDeleteError(
                serverMsg === "Unexpected server error"
                    ? (detailsStr
                        ? `Kategori silinemedi. (${detailsStr})`
                        : "Kategori silinemedi. Sistemden bir hata oluştu. Lütfen tekrar deneyin.")
                    : serverMsg ||
                      (detailsStr
                          ? `Kategori silinemedi. (${detailsStr})`
                          : "Kategori silinemedi. Sistemden bir hata oluştu. Lütfen tekrar deneyin.")
            );
        } finally {
            setDeleteConfirmBusy(false);
        }
    };

    const emptyAllCategories = !loading && !error && categories.length === 0;
    const emptyAfterFilter =
        !loading && !error && categories.length > 0 && filteredCategories.length === 0;

    return (
        <div className="menu-admin-page space-y-4">
            <MenuAdminHeader
                title={MENU_CATEGORIES_PAGE_TITLE}
                subtitle={MENU_CATEGORIES_PAGE_SUBTITLE}
                createButtonLabel={MENU_CATEGORIES_CREATE_LABEL}
                onCreateClick={openAddModal}
            />

            <MenuCategoriesCatalogToolbar
                categorySearchQuery={categorySearchQuery}
                onCategorySearchQueryChange={setCategorySearchQuery}
                categoryStatusFilter={categoryStatusFilter}
                onCategoryStatusFilterChange={setCategoryStatusFilter}
            />

            <MenuCategoriesTable
                loading={loading}
                error={error}
                emptyAllCategories={emptyAllCategories}
                emptyAfterFilter={emptyAfterFilter}
                categories={tableSortedCategories}
                nameSort={nameSort}
                onNameSortClick={handleNameSortClick}
                saving={saving}
                onEdit={openEditModal}
                onToggleStatus={openStatusConfirm}
                onDelete={openDeleteConfirm}
            />

            <AdminFormModal
                open={addModalOpen}
                title="Yeni kategori"
                onClose={closeAddModal}
                primaryLabel="Kaydet"
                onPrimary={() => void submitAddCategory()}
                primaryDisabled={!addModalName.trim()}
                primaryBusy={saving}
            >
                <label htmlFor="category-add-name" className="block text-body-sm text-on-surface-variant mb-1">
                    Kategori adı
                </label>
                <input
                    id="category-add-name"
                    type="text"
                    value={addModalName}
                    onChange={(e) => setAddModalName(e.target.value)}
                    placeholder="Örn: Ana yemekler"
                    className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container px-3 text-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary-container/30"
                    autoFocus
                />
            </AdminFormModal>

            <AdminFormModal
                open={Boolean(editModalCategory)}
                title="Kategoriyi düzenle"
                onClose={closeEditModal}
                primaryLabel="Kaydet"
                onPrimary={() => void submitEditCategory()}
                primaryDisabled={!editModalName.trim()}
                primaryBusy={saving}
            >
                <label htmlFor="category-edit-name" className="block text-body-sm text-on-surface-variant mb-1">
                    Kategori adı
                </label>
                <input
                    id="category-edit-name"
                    type="text"
                    value={editModalName}
                    onChange={(e) => setEditModalName(e.target.value)}
                    className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container px-3 text-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary-container/30"
                    autoFocus
                />
            </AdminFormModal>

            <AdminCountdownConfirmModal
                open={Boolean(statusConfirmOpen && statusConfirmCategory)}
                onClose={closeStatusConfirm}
                busy={statusConfirmBusy}
                step={statusConfirmStep}
                confirmHeadingTone="neutral"
                confirmDescription={
                    statusConfirmCategory ? (
                        <p className="mb-0 text-on-surface">
                            <span className="font-bold text-on-surface">{statusConfirmCategory.name}</span>{" "}
                            kategorisinin{" "}
                            <span className="font-semibold text-on-surface">durumunu</span> değiştireceksiniz.
                        </p>
                    ) : (
                        ""
                    )
                }
                confirmBeforeCountdown={
                    <p className="mb-0 text-on-surface">
                        {statusConfirmNextActive ? (
                            <>
                                Bir kategoriyi{" "}
                                <span className="font-bold text-on-surface">aktif</span> hale almak, kategoride
                                bulunan bütün ürünlerin{" "}
                                <span className="font-semibold text-on-surface">
                                    menüde tekrar görüntülenmesini
                                </span>{" "}
                                sağlayacaktır.
                            </>
                        ) : (
                            <>
                                Bir kategoriyi{" "}
                                <span className="font-bold text-on-surface">pasife</span> almak, o kategoride
                                bulunan{" "}
                                <span className="font-semibold text-on-surface">bütün ürünleri</span> pasif hale
                                getirip{" "}
                                <span className="font-semibold text-on-surface">
                                    menüde görüntülenmemelerini
                                </span>{" "}
                                sağlayacaktır.
                            </>
                        )}
                    </p>
                }
                countdown={statusCountdown}
                countdownCaption={
                    <span>
                        <span className="font-semibold text-on-surface">Onay süresi</span> dolduktan sonra{" "}
                        <span className="font-semibold text-on-surface">Onayla</span> butonunu kullanabilirsiniz.
                    </span>
                }
                confirmLabel="Onayla"
                onConfirm={confirmStatusChange}
                confirmButtonClassName="bg-primary text-on-primary hover:opacity-90"
                confirmDisabled={statusCountdown > 0}
                successBody={
                    statusConfirmCategory ? (
                        <p className="mb-0 text-on-surface">
                            <span className="font-bold">{statusConfirmCategory.name}</span> kategorisinin durumu{" "}
                            <span className="font-semibold">güncellendi</span>.
                        </p>
                    ) : (
                        ""
                    )
                }
                successFooterNote="Bu pencere kısa süre sonra kapanacaktır."
            />

            <AdminCountdownConfirmModal
                open={Boolean(deleteConfirmOpen && deleteConfirmCategory)}
                onClose={closeDeleteConfirm}
                busy={deleteConfirmBusy}
                step={deleteConfirmStep}
                confirmHeadingTone="danger"
                confirmDescription={
                    <p className="mb-0 text-on-surface">
                        Kategori <span className="font-bold">silindiğinde</span> bu kategoriye ait ürünler{" "}
                        <span className="font-semibold">kategorisiz</span> olarak{" "}
                        <span className="font-semibold">Tüm ürünler</span> sekmesinde görüntülenir.
                        <br />
                        <span className="font-semibold">İsterseniz</span> menüyü düzenleyip bu ürünlere tekrar
                        kategori ekleyebilirsiniz.
                    </p>
                }
                countdown={deleteCountdown}
                countdownCaption={
                    <span>
                        <span className="font-semibold text-on-surface">Onay süresi</span> dolana kadar{" "}
                        <span className="font-semibold text-on-surface">Sil</span> butonu devre dışı olacaktır.
                    </span>
                }
                errorMessage={deleteError}
                confirmLabel="Sil"
                onConfirm={confirmDeleteCategory}
                confirmButtonClassName="bg-red-600 text-white hover:bg-red-700"
                confirmDisabled={deleteCountdown > 0}
                successBody={
                    deleteConfirmCategory ? (
                        <p className="mb-0 text-on-surface">
                            <span className="font-bold">{deleteConfirmCategory.name}</span> kategorisi{" "}
                            <span className="font-semibold">silindi</span>.
                        </p>
                    ) : (
                        ""
                    )
                }
            />
        </div>
    );
};

export default MenuCategoriesAdminPage;
