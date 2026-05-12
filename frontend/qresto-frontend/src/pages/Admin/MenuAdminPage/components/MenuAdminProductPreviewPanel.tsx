import { useMemo, type ReactNode } from "react";
import type { MenuItemDetailResponse } from "../../../menuDetailPage/types/menuDetail.types";
import { mapDetailOptionGroupsToOptionGroups } from "../mappers/mapProductDetailOptions";
import { renderOptionGroupPreview } from "../ProductWizard/components/OptionGroupPreview";
import WizardProductPreview from "../ProductWizard/components/WizardProductPreview";
import { DEFAULT_ORDER_NOTE_HEADING } from "../ProductWizard/services/wizardConstants";
import "../ProductWizard/styles/productWizard.css";
import type { MenuAdminProductRow } from "../types/menuAdmin.types";

type MenuAdminProductPreviewPanelProps = {
    product: MenuAdminProductRow;
    detail: MenuItemDetailResponse | null;
    detailLoading: boolean;
    detailError: boolean;
};

const ratingLabel = (detail: MenuItemDetailResponse | null): string => {
    if (detail == null) return "0.0";
    const n = Number(detail.avgRating ?? 0);
    if (Number.isNaN(n)) return "0.0";
    return n.toFixed(1);
};

export const MenuAdminProductPreviewPanel = ({
    product,
    detail,
    detailLoading,
    detailError,
}: MenuAdminProductPreviewPanelProps) => {
    const showOrderNote = detail?.orderNoteEnabled ?? product.orderNoteEnabled;
    const orderNoteHeading =
        (detail?.orderNoteTitle ?? product.orderNoteTitle)?.trim() || DEFAULT_ORDER_NOTE_HEADING;

    const optionBlocks = useMemo(() => {
        const groups = mapDetailOptionGroupsToOptionGroups(detail?.optionGroups);
        const parts: ReactNode[] = [];
        for (const g of groups) {
            parts.push(
                <section key={g.id} className="space-y-2">
                    <h4 className="font-headline text-[1.25rem] font-semibold leading-snug text-on-surface">
                        {g.name}
                    </h4>
                    {renderOptionGroupPreview(g)}
                </section>
            );
        }
        if (showOrderNote) {
            parts.push(
                <section key="order-note" className="space-y-2">
                    <h4 className="font-headline text-[1.25rem] font-semibold leading-snug text-on-surface">
                        {orderNoteHeading}
                    </h4>
                    <textarea
                        readOnly
                        rows={3}
                        tabIndex={-1}
                        aria-hidden
                        placeholder="Örn: Et iyi pişmiş olsun, sosu ayrı gelsin..."
                        className="w-full min-h-[80px] rounded-xl border border-outline-variant bg-surface px-3 py-2 font-sans text-[0.875rem] text-on-surface placeholder:text-on-surface-variant/70 resize-none pointer-events-none"
                        value=""
                    />
                </section>
            );
        }
        return parts.length > 0 ? <>{parts}</> : undefined;
    }, [detail?.optionGroups, showOrderNote, orderNoteHeading]);

    if (detailLoading) {
        return (
            <div className="p-6 flex flex-1 flex-col items-center justify-center min-h-[min(40vh,320px)] text-on-surface-variant text-body-md">
                Önizleme yükleniyor…
            </div>
        );
    }

    return (
        <div className="p-4 pt-3 space-y-3 overflow-y-auto flex-1 min-h-0">
            {detailError ? (
                <p className="text-body-sm text-amber-900 bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/50">
                    Ürün detayı alınamadı; görsel ve metinler listeden gösteriliyor. Opsiyonlar için API’yi
                    kontrol edin.
                </p>
            ) : null}
            <WizardProductPreview
                key={product.id}
                mode="step2"
                innerStagger
                imageUrl={product.imageUrl}
                name={product.name}
                description={product.description}
                priceFormatted={product.priceLabel}
                prepTimeMin={product.prepTimeMin != null ? String(product.prepTimeMin) : ""}
                calorie={product.calorie != null ? String(product.calorie) : ""}
                gram={product.gram != null ? String(product.gram) : ""}
                active={product.active}
                ratingActive={Number(detail?.avgRating ?? 0) > 0}
                ratingDisplay={ratingLabel(detail)}
                optionBlocks={optionBlocks}
            />
        </div>
    );
};
