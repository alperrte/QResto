import { type ChangeEvent, type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMenuItemDetail } from "../../../menuDetailPage/services/menuDetailService";
import { useMenuAdmin } from "../hooks/useMenuAdmin";
import "../styles/menuAdmin.css";
import "./styles/productWizard.css";
import "./styles/wizardPageAnimations.css";

import WizardEditRouteGate from "./components/WizardEditRouteGate";
import WizardFooterBar from "./components/WizardFooterBar";
import WizardOptionGroupModal from "./components/WizardOptionGroupModal";
import WizardOrderNoteModal from "./components/WizardOrderNoteModal";
import WizardPageHeader from "./components/WizardPageHeader";
import WizardStep1Basic from "./components/WizardStep1Basic";
import WizardStep2Content from "./components/WizardStep2Content";
import WizardStep3Options from "./components/WizardStep3Options";
import WizardStep4Summary from "./components/WizardStep4Summary";
import WizardStepper from "./components/WizardStepper";
import { mapApiDetailToWizardOptionGroups } from "./mappers/mapProductDetailToWizard";
import { mapWizardOptionGroupsToApiPayload } from "./mappers/mapWizardOptionGroupsToApi";
import {
    cloneWizardGroup,
    createInitialWizardOptionGroups,
    reorderWizardGroups,
    newWizardChoiceId as newChoiceId,
} from "./mappers/wizardOptionGroups";
import { createMenuCategoryApi, uploadMenuProductImageApi } from "../services/menuAdminApi";
import { isNumericMenuAdminId } from "../services/menuAdminService";
import { MENU_ADMIN_CATEGORY_UNCHOSEN } from "../types/menuAdmin.types";
import { formatDraftPriceLabel } from "./services/formatWizardPrice";
import { DEFAULT_ORDER_NOTE_HEADING, WIZARD_STEPS } from "./services/wizardConstants";
import type { LocalCategory, WizardOptionGroup } from "./types/productWizard.types";

const ProductSetupWizardPage = () => {
    const navigate = useNavigate();
    const { productId: editProductId } = useParams<{ productId?: string }>();
    const editIdTrimmed = editProductId?.trim() ?? "";
    const isEditRoute = isNumericMenuAdminId(editIdTrimmed);

    const {
        categories,
        draft,
        setDraftField,
        submitDraft,
        beginEditFromApiDetail,
        resetWizardToCreate,
    } = useMenuAdmin();
    const [wizardStep, setWizardStep] = useState(1);
    const [editLoadState, setEditLoadState] = useState<"idle" | "loading" | "error" | "ok">(() =>
        isNumericMenuAdminId(editProductId?.trim() ?? "") ? "loading" : "idle"
    );
    const [isDragOverUpload, setIsDragOverUpload] = useState(false);
    const [localCategories, setLocalCategories] = useState<LocalCategory[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [wizardOptionGroups, setWizardOptionGroups] = useState<WizardOptionGroup[]>(() =>
        createInitialWizardOptionGroups()
    );
    const [modalDraft, setModalDraft] = useState<WizardOptionGroup | null>(null);
    const [orderNoteModalOpen, setOrderNoteModalOpen] = useState(false);
    const [orderNoteTitleDraft, setOrderNoteTitleDraft] = useState("");
    const [summaryAcknowledged, setSummaryAcknowledged] = useState(false);
    const [imageUploadBusy, setImageUploadBusy] = useState(false);
    const [imageUploadError, setImageUploadError] = useState<string | null>(null);
    const [productImageFromUpload, setProductImageFromUpload] = useState(false);
    const prevWizardStepRef = useRef(0);
    const [wizardStepPaneMotion, setWizardStepPaneMotion] = useState<"forward" | "backward">("forward");

    /** Oluşturma rotasında: resetWizardToCreate sabit referanslı — kategori API gelince taslak yeniden sıfırlanmaz. */
    useEffect(() => {
        if (isEditRoute) return;
        resetWizardToCreate();
        setWizardOptionGroups(createInitialWizardOptionGroups());
        prevWizardStepRef.current = 0;
        setWizardStep(1);
        setEditLoadState("idle");
        setProductImageFromUpload(false);
    }, [isEditRoute, resetWizardToCreate]);

    useEffect(() => {
        if (!isEditRoute || !editIdTrimmed) {
            return;
        }
        let cancelled = false;
        setEditLoadState("loading");
                fetchMenuItemDetail(editIdTrimmed)
            .then((detail) => {
                if (cancelled) return;
                beginEditFromApiDetail(detail);
                setProductImageFromUpload(false);
                setWizardOptionGroups(mapApiDetailToWizardOptionGroups(detail.optionGroups));
                prevWizardStepRef.current = 0;
                setWizardStep(1);
                setEditLoadState("ok");
            })
            .catch(() => {
                if (!cancelled) setEditLoadState("error");
            });
        return () => {
            cancelled = true;
        };
    }, [editIdTrimmed, isEditRoute, beginEditFromApiDetail]);

    useEffect(() => {
        const prev = prevWizardStepRef.current;
        if (prev === 0) {
            prevWizardStepRef.current = wizardStep;
            return;
        }
        if (prev === wizardStep) {
            return;
        }
        setWizardStepPaneMotion(wizardStep > prev ? "forward" : "backward");
        prevWizardStepRef.current = wizardStep;
    }, [wizardStep]);

    const canProceedStep1 = useMemo(
        () =>
            Boolean(draft.name.trim() && draft.price) &&
            draft.categoryId.trim() !== MENU_ADMIN_CATEGORY_UNCHOSEN,
        [draft.name, draft.price, draft.categoryId]
    );
    const canProceedStep2 = useMemo(() => Boolean(draft.description.trim()), [draft.description]);
    const canProceedCurrentStep =
        wizardStep === 1 ? canProceedStep1 : wizardStep === 2 ? canProceedStep2 : true;

    const availableCategories = useMemo(
        () => [...categories.filter((category) => category.id !== "all"), ...localCategories],
        [categories, localCategories]
    );
    const previewImage = draft.imageUrl.trim();

    const orderNoteHeadingDisplay = useMemo(
        () => draft.orderNoteTitle.trim() || DEFAULT_ORDER_NOTE_HEADING,
        [draft.orderNoteTitle]
    );

    const summaryPriceLabel = useMemo(() => formatDraftPriceLabel(draft.price), [draft.price]);

    const ingredientChips = useMemo(
        () =>
            draft.ingredients
                .split(/[,;|]/)
                .map((s) => s.trim())
                .filter(Boolean),
        [draft.ingredients]
    );

    const openOrderNoteModal = () => {
        setOrderNoteTitleDraft(draft.orderNoteTitle);
        setOrderNoteModalOpen(true);
    };

    const closeOrderNoteModal = () => {
        setOrderNoteModalOpen(false);
    };

    const saveOrderNoteModal = () => {
        setDraftField("orderNoteTitle", orderNoteTitleDraft.trim());
        closeOrderNoteModal();
    };

    const openGroupModal = (group: WizardOptionGroup) => {
        setModalDraft(cloneWizardGroup(group));
    };

    const closeGroupModal = () => {
        setModalDraft(null);
    };

    const saveGroupModal = () => {
        if (!modalDraft) return;
        const normalized: WizardOptionGroup = {
            ...modalDraft,
            required: modalDraft.kind === "portion" ? true : modalDraft.required,
            maxSelect: modalDraft.kind === "multi" ? Math.max(1, modalDraft.maxSelect) : 1,
        };
        setWizardOptionGroups((prev) => prev.map((g) => (g.id === normalized.id ? normalized : g)));
        closeGroupModal();
    };

    const handleWizardGroupDragStart = (groupId: string) => (event: DragEvent<HTMLElement>) => {
        event.dataTransfer.setData("text/plain", groupId);
        event.dataTransfer.effectAllowed = "move";
    };

    const handleWizardGroupDragOver = (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    const handleWizardGroupDrop =
        (dropId: string) => (event: DragEvent<HTMLElement>) => {
            event.preventDefault();
            const dragId = event.dataTransfer.getData("text/plain");
            if (!dragId || dragId === dropId) return;
            setWizardOptionGroups((prev) => reorderWizardGroups(prev, dragId, dropId));
        };

    const applyImageFile = async (file: File | null) => {
        if (!file || !file.type.startsWith("image/")) return;
        const maxBytes = 10 * 1024 * 1024;
        if (file.size > maxBytes) {
            window.alert("Görsel en fazla 10 MB olabilir.");
            return;
        }
        setImageUploadBusy(true);
        setImageUploadError(null);
        try {
            const prev = draft.imageUrl.trim();
            const url = await uploadMenuProductImageApi(file);
            if (prev.startsWith("blob:")) {
                URL.revokeObjectURL(prev);
            }
            setDraftField("imageUrl", url);
            setProductImageFromUpload(true);
        } catch {
            const msg =
                "Görsel sunucuya yüklenemedi. Menü sunucusunun çalıştığını ve bağlantı ayarlarınızı kontrol edin.";
            setImageUploadError(msg);
            window.alert(msg);
        } finally {
            setImageUploadBusy(false);
        }
    };

    const handleUploadChange = (event: ChangeEvent<HTMLInputElement>) => {
        const picked = event.target.files?.[0] ?? null;
        event.target.value = "";
        void applyImageFile(picked);
    };

    const handleDropUpload = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOverUpload(false);
        if (imageUploadBusy) return;
        void applyImageFile(event.dataTransfer.files?.[0] ?? null);
    };

    const handleImageUrlFieldChange = (value: string) => {
        setProductImageFromUpload(false);
        setDraftField("imageUrl", value);
    };

    const clearUploadedProductImage = () => {
        setProductImageFromUpload(false);
        setDraftField("imageUrl", "");
        setImageUploadError(null);
    };

    const createCategory = () => {
        const normalized = newCategoryName.trim();
        if (!normalized) return;

        const exists = availableCategories.some(
            (category) => category.label.toLocaleLowerCase("tr-TR") === normalized.toLocaleLowerCase("tr-TR")
        );
        if (exists) return;

        const id = `custom-category-${Date.now()}`;
        const nextCategory = { id, label: normalized };
        setLocalCategories((prev) => [...prev, nextCategory]);
        setDraftField("categoryId", id);
        setNewCategoryName("");
    };

    const resolvePersistedCategoryId = async (): Promise<string> => {
        const cid = draft.categoryId.trim();
        if (cid === MENU_ADMIN_CATEGORY_UNCHOSEN) {
            throw new Error("Lütfen bir kategori seçin veya Kategorisiz seçeneğini kullanın.");
        }
        if (!cid) return "";
        if (isNumericMenuAdminId(cid)) return cid;
        const local = localCategories.find((c) => c.id === cid);
        const label = local?.label.trim() ?? "";
        if (!label) {
            throw new Error(
                "Geçerli bir kategori seçin veya yeni kategori adı yazıp Kategori Ekle kullanın."
            );
        }
        const created = await createMenuCategoryApi({ name: label });
        const newId = String(created.id);
        setLocalCategories((prev) => prev.map((c) => (c.id === cid ? { id: newId, label: c.label } : c)));
        setDraftField("categoryId", newId);
        return newId;
    };

    const handlePublish = async () => {
        try {
            const categoryId = await resolvePersistedCategoryId();
            await submitDraft({ categoryId }, mapWizardOptionGroupsToApiPayload(wizardOptionGroups));
            navigate("/app/admin/menu-products");
        } catch (err) {
            window.alert(
                err instanceof Error
                    ? err.message
                    : "Ürün kaydedilemedi. Menü sunucusu ayarlarını kontrol edin."
            );
        }
    };

    const goToProductList = () => navigate("/app/admin/menu-products");

    if (isEditRoute && editLoadState === "loading") {
        return <WizardEditRouteGate variant="loading" onBackToList={goToProductList} />;
    }

    if (isEditRoute && editLoadState === "error") {
        return <WizardEditRouteGate variant="error" onBackToList={goToProductList} />;
    }

    return (
        <div className="menu-admin-page bg-[var(--qresto-bg)] min-h-[calc(100vh-120px)] -mx-8 flex flex-col">
            <WizardPageHeader isEditRoute={isEditRoute} onBack={goToProductList} />

            <div className="wizard-stepper-bar-enter px-8 py-5 border-b border-outline-variant bg-surface-container-lowest">
                <WizardStepper steps={WIZARD_STEPS} currentStep={wizardStep} />
            </div>

            <div className="p-8 pb-40 space-y-5 flex-1 overflow-y-auto">
                <div
                    key={wizardStep}
                    className={`min-w-0 ${
                        wizardStepPaneMotion === "backward"
                            ? "wizard-step-pane-backward"
                            : "wizard-step-pane-forward"
                    }`}
                >
                {wizardStep === 1 ? (
                    <WizardStep1Basic
                        draft={draft}
                        setDraftField={setDraftField}
                        availableCategories={availableCategories}
                        newCategoryName={newCategoryName}
                        setNewCategoryName={setNewCategoryName}
                        onCreateCategory={createCategory}
                        isDragOverUpload={isDragOverUpload}
                        setIsDragOverUpload={setIsDragOverUpload}
                        onDropUpload={handleDropUpload}
                        onUploadChange={handleUploadChange}
                        imageUploadBusy={imageUploadBusy}
                        imageUploadError={imageUploadError}
                        productImageFromUpload={productImageFromUpload}
                        onImageUrlChange={handleImageUrlFieldChange}
                        onClearUploadedImage={clearUploadedProductImage}
                        previewImage={previewImage}
                        summaryPriceLabel={summaryPriceLabel}
                    />
                ) : null}

                {wizardStep === 2 ? (
                    <WizardStep2Content
                        draft={draft}
                        setDraftField={setDraftField}
                        previewImage={previewImage}
                        summaryPriceLabel={summaryPriceLabel}
                    />
                ) : null}

                {wizardStep === 3 ? (
                    <WizardStep3Options
                        draft={draft}
                        setDraftField={setDraftField}
                        wizardOptionGroups={wizardOptionGroups}
                        setWizardOptionGroups={setWizardOptionGroups}
                        orderNoteHeadingDisplay={orderNoteHeadingDisplay}
                        previewImage={previewImage}
                        summaryPriceLabel={summaryPriceLabel}
                        onOpenGroupModal={openGroupModal}
                        onOpenOrderNoteModal={openOrderNoteModal}
                        onGroupDragStart={handleWizardGroupDragStart}
                        onGroupDragOver={handleWizardGroupDragOver}
                        onGroupDrop={handleWizardGroupDrop}
                    />
                ) : null}

                {wizardStep === 4 ? (
                    <WizardStep4Summary
                        draft={draft}
                        availableCategories={availableCategories}
                        summaryPriceLabel={summaryPriceLabel}
                        ingredientChips={ingredientChips}
                        wizardOptionGroups={wizardOptionGroups}
                        previewImage={previewImage}
                        orderNoteHeadingDisplay={orderNoteHeadingDisplay}
                        setWizardStep={setWizardStep}
                    />
                ) : null}
                </div>
            </div>

            {modalDraft ? (
                <WizardOptionGroupModal
                    modalDraft={modalDraft}
                    setModalDraft={setModalDraft}
                    newChoiceId={newChoiceId}
                    onClose={closeGroupModal}
                    onSave={saveGroupModal}
                />
            ) : null}

            {orderNoteModalOpen ? (
                <WizardOrderNoteModal
                    orderNoteTitleDraft={orderNoteTitleDraft}
                    setOrderNoteTitleDraft={setOrderNoteTitleDraft}
                    onClose={closeOrderNoteModal}
                    onSave={saveOrderNoteModal}
                />
            ) : null}

            <WizardFooterBar
                wizardStep={wizardStep}
                isEditRoute={isEditRoute}
                canProceedCurrentStep={canProceedCurrentStep}
                summaryAcknowledged={summaryAcknowledged}
                setSummaryAcknowledged={setSummaryAcknowledged}
                setWizardStep={setWizardStep}
                onCancel={goToProductList}
                onPublish={handlePublish}
            />
        </div>
    );
};

export default ProductSetupWizardPage;
