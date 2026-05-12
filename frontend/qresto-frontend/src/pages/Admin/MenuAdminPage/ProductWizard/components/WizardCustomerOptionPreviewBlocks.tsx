import { renderOptionGroupPreview } from "./OptionGroupPreview";
import { wizardGroupToPreviewGroup } from "../mappers/wizardOptionGroups";
import type { WizardOptionGroup } from "../types/productWizard.types";

type WizardCustomerOptionPreviewBlocksProps = {
    wizardOptionGroups: WizardOptionGroup[];
    orderNoteEnabled: boolean;
    orderNoteHeadingDisplay: string;
    emptyListingHint: string;
};

function WizardCustomerOptionPreviewBlocks({
    wizardOptionGroups,
    orderNoteEnabled,
    orderNoteHeadingDisplay,
    emptyListingHint,
}: WizardCustomerOptionPreviewBlocksProps) {
    const previewGroups = wizardOptionGroups.filter((g) => g.includedInPreview);

    return (
        <>
            {previewGroups.length === 0 && !orderNoteEnabled ? (
                <p className="text-body-sm text-on-surface-variant py-4 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-low">
                    {emptyListingHint}
                </p>
            ) : null}
            {previewGroups.map((group) => {
                const preview = wizardGroupToPreviewGroup(group);
                const customerHeading = group.userTitle.trim() || group.metaTitle;
                return (
                    <section key={`preview-wrap-${group.id}`} className="space-y-2">
                        <h4 className="font-headline text-[1.25rem] font-semibold leading-snug text-on-surface">
                            {customerHeading}
                        </h4>
                        {renderOptionGroupPreview(preview)}
                    </section>
                );
            })}
            {orderNoteEnabled ? (
                <section className="space-y-2">
                    <h4 className="font-headline text-[1.25rem] font-semibold leading-snug text-on-surface">
                        {orderNoteHeadingDisplay}
                    </h4>
                    <textarea
                        readOnly
                        rows={3}
                        tabIndex={-1}
                        aria-hidden
                        placeholder="Örn: Etin iyi pişmiş olsun, sosu ayrı gelsin…"
                        className="w-full min-h-[80px] rounded-xl border border-outline-variant bg-surface px-3 py-2 font-sans text-[0.875rem] text-on-surface placeholder:text-on-surface-variant/70 resize-none pointer-events-none"
                        value=""
                    />
                </section>
            ) : null}
        </>
    );
}

export default WizardCustomerOptionPreviewBlocks;
