import type { MenuProductOptionGroupDto } from "../../../menuDetailPage/types/menuDetail.types";
import type { OptionGroup, OptionKind } from "../ProductWizard/types/productWizard.types";

const asKind = (raw: string): OptionKind => {
    if (raw === "portion" || raw === "single" || raw === "multi") return raw;
    return "single";
};

/** menu-service ürün detayındaki opsiyonları müşteri önizleme `OptionGroup` tipine çevirir. */
export const mapDetailOptionGroupsToOptionGroups = (
    raw: MenuProductOptionGroupDto[] | null | undefined
): OptionGroup[] => {
    if (!raw?.length) return [];
    return [...raw]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((g) => ({
            id: `api-og-${g.id}`,
            name: (g.userTitle?.trim() || g.metaTitle || "Seçenek").trim(),
            kind: asKind(g.kind),
            minSelect: g.kind === "multi" ? 0 : g.required ? 1 : 0,
            maxSelect: g.kind === "multi" ? Math.max(g.maxSelect, 1) : 1,
            choices: g.choices
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((c) => ({
                    id: `api-ch-${c.id}`,
                    label: c.label ?? "",
                    priceDelta: Number(c.priceDelta ?? 0),
                })),
        }));
};
