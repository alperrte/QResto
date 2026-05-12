import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";

import AdminCountdownConfirmModal from "../../../components/AdminCountdownConfirmModal";
import AdminInfoSpeechBubble, {
    type AdminInfoSpeechBubbleHandle,
} from "../../../components/AdminInfoSpeechBubble";
import {
    MENU_ADMIN_CATEGORY_UNCHOSEN,
    type MenuAdminProductDraft,
} from "../../types/menuAdmin.types";
import type { LocalCategory } from "../types/productWizard.types";
import WizardProductPreview from "./WizardProductPreview";
import WizardQuickPreviewPanel from "./WizardQuickPreviewPanel";

type WizardStep1BasicProps = {
    draft: MenuAdminProductDraft;
    setDraftField: <K extends keyof MenuAdminProductDraft>(key: K, value: MenuAdminProductDraft[K]) => void;
    availableCategories: LocalCategory[];
    newCategoryName: string;
    setNewCategoryName: (value: string) => void;
    onCreateCategory: () => void;
    isDragOverUpload: boolean;
    setIsDragOverUpload: (value: boolean) => void;
    onDropUpload: (event: DragEvent<HTMLDivElement>) => void;
    onUploadChange: (event: ChangeEvent<HTMLInputElement>) => void;
    imageUploadBusy?: boolean;
    imageUploadError?: string | null;
    /** Son başarılı dosya yüklemesinden sonra true; URL alanı gizlenir, kutu üzerinde kaldırma çarpısı gösterilir. */
    productImageFromUpload: boolean;
    onImageUrlChange: (value: string) => void;
    onClearUploadedImage: () => void;
    previewImage: string;
    summaryPriceLabel: string;
};

function WizardStep1Basic({
    draft,
    setDraftField,
    availableCategories,
    newCategoryName,
    setNewCategoryName,
    onCreateCategory,
    isDragOverUpload,
    setIsDragOverUpload,
    onDropUpload,
    onUploadChange,
    imageUploadBusy = false,
    imageUploadError = null,
    productImageFromUpload,
    onImageUrlChange,
    onClearUploadedImage,
    previewImage,
    summaryPriceLabel,
}: WizardStep1BasicProps) {
    const imageFileInputRef = useRef<HTMLInputElement>(null);
    const [activeModalOpen, setActiveModalOpen] = useState(false);
    const [activeModalStep, setActiveModalStep] = useState<"confirm" | "success">("confirm");
    const [activeModalNext, setActiveModalNext] = useState(false);
    const [activeCountdown, setActiveCountdown] = useState(3);
    const activeConfirmReadyRef = useRef(false);
    const activeHintBubbleRef = useRef<AdminInfoSpeechBubbleHandle>(null);

    useEffect(() => {
        activeConfirmReadyRef.current = false;
        if (!activeModalOpen || activeModalStep !== "confirm") return;

        setActiveCountdown(3);
        const intervalId = window.setInterval(() => {
            setActiveCountdown((prev) => {
                const next = prev <= 1 ? 0 : prev - 1;
                activeConfirmReadyRef.current = next === 0;
                return next;
            });
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
            activeConfirmReadyRef.current = false;
        };
    }, [activeModalOpen, activeModalStep]);

    const openActiveChangeModal = (nextActive: boolean) => {
        if (nextActive === draft.active) return;
        activeHintBubbleRef.current?.close();
        setActiveModalNext(nextActive);
        setActiveModalStep("confirm");
        setActiveModalOpen(true);
    };

    const closeActiveModal = () => {
        activeConfirmReadyRef.current = false;
        setActiveModalOpen(false);
        setActiveModalStep("confirm");
    };

    const confirmActiveChange = () => {
        if (!activeConfirmReadyRef.current) return;
        setDraftField("active", activeModalNext);
        setActiveModalStep("success");
        window.setTimeout(() => {
            closeActiveModal();
        }, 1200);
    };

    const handleClearUploadedImage = () => {
        if (imageFileInputRef.current) {
            imageFileInputRef.current.value = "";
        }
        onClearUploadedImage();
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start wizard-reveal-cols-2">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg border border-surface-variant shadow-sm p-6 flex flex-col gap-6 wizard-card-section-stagger">
                <div className="flex flex-col gap-3 border-b border-surface-variant pb-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">Temel bilgiler</h2>
                    <div className="flex flex-col items-stretch sm:items-end gap-0 shrink-0">
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-body-sm text-on-surface-variant">Aktif</span>
                            <button
                                type="button"
                                aria-pressed={draft.active}
                                onClick={() => openActiveChangeModal(!draft.active)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                    draft.active
                                        ? "bg-[#10B981]"
                                        : "bg-surface-variant"
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        draft.active ? "translate-x-5" : "translate-x-0"
                                    }`}
                                />
                            </button>
                            <AdminInfoSpeechBubble
                                ref={activeHintBubbleRef}
                                ariaLabel="Aktif / pasif durumu hakkında bilgi"
                                stopPointerBubbling={false}
                                triggerSize="md"
                            >
                                <p className="m-0 pr-1">
                                    Eklenen ürünü <span className="font-semibold text-blue-900">aktif</span> veya{" "}
                                    <span className="font-semibold text-blue-900">pasif</span> olarak
                                    ekleyebilirsiniz. Anahtarı değiştirdiğinizde onay penceresi açılır; geri sayım
                                    bittikten sonra <span className="font-semibold">Onayla</span> ile taslaktaki durum
                                    güncellenir.
                                </p>
                            </AdminInfoSpeechBubble>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 wizard-inner-fields-stagger">
                    <label className="flex flex-col gap-1">
                        <span className="text-label-bold text-on-surface">
                            Ürün adı
                            <span className="text-red-600 dark:text-red-400 ml-0.5" aria-hidden="true">
                                *
                            </span>
                        </span>
                        <input
                            type="text"
                            value={draft.name}
                            onChange={(event) => setDraftField("name", event.target.value)}
                            placeholder="Örn: Klasik Burger"
                            className="h-10 rounded-lg border border-outline-variant px-3 bg-surface"
                            aria-required="true"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-label-bold text-on-surface">
                            Fiyat
                            <span className="text-red-600 dark:text-red-400 ml-0.5" aria-hidden="true">
                                *
                            </span>
                        </span>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                                ₺
                            </span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={draft.price}
                                onChange={(event) => setDraftField("price", event.target.value)}
                                placeholder="0.00"
                                className="h-10 w-full rounded-lg border border-outline-variant pl-8 pr-3 bg-surface"
                                aria-required="true"
                            />
                        </div>
                    </label>
                    <div className="md:col-span-2 mt-2 mb-2">
                        <span className="text-label-bold text-on-surface mb-2 block">
                            Kategori seç
                            <span className="text-red-600 dark:text-red-400 ml-0.5" aria-hidden="true">
                                *
                            </span>
                        </span>
                        <div className="border border-surface-variant rounded-lg p-3 bg-surface mb-3">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setDraftField("categoryId", "")}
                                    className={`px-3 h-8 inline-flex items-center rounded-full text-body-sm transition-colors ${
                                        draft.categoryId === ""
                                            ? "bg-primary text-white"
                                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                                    }`}
                                >
                                    Kategorisiz
                                </button>
                                {availableCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => setDraftField("categoryId", category.id)}
                                        className={`px-3 h-8 inline-flex items-center rounded-full text-body-sm transition-colors ${
                                            draft.categoryId === category.id
                                                ? "bg-primary text-white"
                                                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                                        }`}
                                    >
                                        {category.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-end gap-2">
                                <label className="flex flex-col gap-1 w-full md:w-1/2">
                                    <span className="text-body-sm text-secondary">Seçilen Kategori</span>
                                    <select
                                        value={draft.categoryId}
                                        onChange={(event) => setDraftField("categoryId", event.target.value)}
                                        className="h-10 rounded-lg border border-outline-variant px-3 bg-surface"
                                        aria-required="true"
                                    >
                                        <option value={MENU_ADMIN_CATEGORY_UNCHOSEN}>Kategori seçin</option>
                                        <option value="">Kategorisiz</option>
                                        {availableCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(event) => setNewCategoryName(event.target.value)}
                                    placeholder="Yeni kategori adı"
                                    className="h-10 flex-1 rounded-lg border border-outline-variant px-3 bg-surface"
                                />
                                <button
                                    type="button"
                                    onClick={onCreateCategory}
                                    className="h-10 px-4 rounded-lg bg-primary text-white font-label-bold ml-auto whitespace-nowrap"
                                >
                                    Kategori Ekle
                                </button>
                            </div>
                        </div>
                    </div>
                    <label className="flex flex-col gap-1 md:col-span-2">
                        <span className="text-label-bold text-on-surface inline-flex flex-wrap items-baseline gap-x-2 gap-y-0">
                            <span>Ürün görseli</span>
                            <span className="text-body-sm font-normal text-on-surface-variant">(isteğe bağlı)</span>
                        </span>
                        <div className="relative mt-1">
                            {productImageFromUpload && draft.imageUrl.trim() && !imageUploadBusy ? (
                                <button
                                    type="button"
                                    onClick={handleClearUploadedImage}
                                    className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface/95 text-on-surface shadow-sm hover:bg-surface-container-high"
                                    aria-label="Yüklenen görseli kaldır"
                                >
                                    <span className="material-symbols-outlined text-[22px] leading-none">close</span>
                                </button>
                            ) : null}
                            <div
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    if (imageUploadBusy) return;
                                    setIsDragOverUpload(true);
                                }}
                                onDragLeave={() => setIsDragOverUpload(false)}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    setIsDragOverUpload(false);
                                    if (!imageUploadBusy) {
                                        onDropUpload(event);
                                    }
                                }}
                                className={`flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${
                                    imageUploadBusy
                                        ? "border-outline-variant bg-surface-container-low/80 opacity-70 pointer-events-none"
                                        : isDragOverUpload
                                          ? "border-primary-container bg-surface-container-low"
                                          : "border-outline-variant hover:bg-surface-container-low"
                                }`}
                            >
                            <div className="text-center">
                                <span className="material-symbols-outlined text-4xl text-secondary mb-2">
                                    {imageUploadBusy ? "hourglass_empty" : "image"}
                                </span>
                                <div className="mt-4 flex flex-wrap text-sm leading-6 text-on-surface-variant justify-center gap-x-1">
                                    <label
                                        htmlFor="product-image-upload"
                                        className={`relative rounded-md bg-transparent font-label-bold ${
                                            imageUploadBusy
                                                ? "text-on-surface-variant cursor-not-allowed"
                                                : "cursor-pointer text-primary-container hover:text-surface-tint"
                                        }`}
                                    >
                                        <span>{imageUploadBusy ? "Yükleniyor…" : "Dosya yükle"}</span>
                                        <input
                                            ref={imageFileInputRef}
                                            id="product-image-upload"
                                            type="file"
                                            accept="image/*"
                                            disabled={imageUploadBusy}
                                            onChange={onUploadChange}
                                            className="sr-only"
                                        />
                                    </label>
                                    {!imageUploadBusy ? <p className="pl-1">veya sürükleyip bırakın</p> : null}
                                </div>
                                <p className="text-xs leading-5 text-secondary">
                                    PNG, JPG, GIF, WEBP — en fazla 10 MB; dosya menü sunucusunda saklanır.
                                </p>
                            </div>
                            </div>
                        </div>
                        {imageUploadError ? (
                            <p className="text-body-sm text-red-600 dark:text-red-400 mt-1">{imageUploadError}</p>
                        ) : null}
                        {!productImageFromUpload ? (
                            <input
                                type="url"
                                value={draft.imageUrl}
                                onChange={(event) => onImageUrlChange(event.target.value)}
                                placeholder="veya doğrudan görsel URL’si girin (harici bağlantı)"
                                disabled={imageUploadBusy}
                                className="h-10 rounded-lg border border-outline-variant px-3 bg-surface disabled:opacity-60"
                            />
                        ) : null}
                    </label>
                </div>
            </div>

            <WizardQuickPreviewPanel footerHint="Bu alan müşterilerinize ürünün nasıl görüneceğini gösterir.">
                <WizardProductPreview
                    mode="step1"
                    imageUrl={previewImage}
                    name={draft.name}
                    description={draft.description}
                    priceFormatted={summaryPriceLabel}
                    prepTimeMin={draft.prepTimeMin}
                    calorie={draft.calorie}
                    gram={draft.gram}
                    active={draft.active}
                />
            </WizardQuickPreviewPanel>
        </div>

            <AdminCountdownConfirmModal
                open={activeModalOpen}
                onClose={closeActiveModal}
                step={activeModalStep}
                confirmHeading="Ürün durumu"
                confirmHeadingTone="neutral"
                confirmDescription={
                    <p className="mb-0">
                        {activeModalNext
                            ? "Ürünü aktif olarak kaydetmek üzeresiniz. Aktif ürünler menüde görünebilir (stok, kategori ve diğer ayarlara bağlıdır)."
                            : "Ürünü pasif olarak kaydetmek üzeresiniz. Pasif ürünler menüde listelenmez."}
                    </p>
                }
                confirmBeforeCountdown={
                    <p className="mb-0 text-on-surface">
                        Onayladığınızda formdaki &quot;Aktif&quot; alanı buna göre güncellenir; kaydı
                        tamamlamak için sihirbazın son adımında yayınlamanız gerekir.
                    </p>
                }
                countdown={activeCountdown}
                countdownCaption={
                    <span>
                        Onay süresi dolana kadar <span className="font-semibold">Onayla</span> butonu devre dışı
                        olacaktır.
                    </span>
                }
                confirmLabel="Onayla"
                onConfirm={confirmActiveChange}
                confirmButtonClassName="bg-primary text-on-primary hover:opacity-90"
                confirmDisabled={activeCountdown > 0}
                successBody={
                    <p className="mb-0">
                        {activeModalNext
                            ? "Ürün aktif olarak işaretlendi."
                            : "Ürün pasif olarak işaretlendi."}
                    </p>
                }
            />
        </>
    );
}

export default WizardStep1Basic;
