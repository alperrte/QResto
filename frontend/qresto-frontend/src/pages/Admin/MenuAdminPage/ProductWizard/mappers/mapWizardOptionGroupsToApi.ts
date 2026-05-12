import type { MenuProductOptionGroupPayload } from "../../services/menuAdminApi";
import type { WizardOptionGroup } from "../types/productWizard.types";

/** Sihirbaz modelini menu-service `ProductOptionGroupRequest` gövdesine çevirir. */
export const mapWizardOptionGroupsToApiPayload = (
    groups: WizardOptionGroup[]
): MenuProductOptionGroupPayload[] =>
    groups
        .map((g) => ({
            kind: g.kind,
            hasPrice: g.hasPrice,
            userTitle: g.userTitle.trim(),
            metaTitle: g.metaTitle.trim(),
            descriptionLine: g.descriptionLine.trim() || null,
            required: g.kind === "portion" ? true : g.required,
            maxSelect: g.kind === "multi" ? Math.max(1, g.maxSelect) : 1,
            includedInPreview: g.includedInPreview,
            choices: g.choices
                .map((c) => ({
                    label: c.label.trim(),
                    priceDelta: g.hasPrice ? Number(c.priceDelta) || 0 : 0,
                }))
                .filter((c) => c.label.length > 0),
        }))
        .filter((g) => g.choices.length > 0);
