import type { OptionGroup, WizardOptionGroup } from "../types/productWizard.types";

const newChoiceId = () => `ch-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const createInitialWizardOptionGroups = (): WizardOptionGroup[] => [
    {
        id: "wg-portion",
        kind: "portion",
        hasPrice: true,
        userTitle: "",
        metaTitle: "Porsiyon",
        descriptionLine:
            "Tek seçim — porsiyon seçimi sunmak için uygundur. (Tek seçenek, ek fiyat)",
        required: true,
        maxSelect: 1,
        choices: [
            { id: newChoiceId(), label: "", priceDelta: 0 },
            { id: newChoiceId(), label: "", priceDelta: 0 },
        ],
        includedInPreview: false,
    },
    {
        id: "wg-addons",
        kind: "multi",
        hasPrice: true,
        userTitle: "",
        metaTitle: "Eklenebilir malzemeler",
        descriptionLine:
            "Çoklu seçim — ekstra malzemeler için uygundur. (Birden fazla seçenek, ek fiyat)",
        required: false,
        maxSelect: 3,
        choices: [
            { id: newChoiceId(), label: "", priceDelta: 0 },
            { id: newChoiceId(), label: "", priceDelta: 0 },
            { id: newChoiceId(), label: "", priceDelta: 0 },
        ],
        includedInPreview: false,
    },
    {
        id: "wg-removable",
        kind: "multi",
        hasPrice: false,
        userTitle: "",
        metaTitle: "Çıkarılabilir malzemeler",
        descriptionLine:
            "Çoklu seçim — fiyat farkı olmayan çoklu seçim için uygundur.",
        required: false,
        maxSelect: 3,
        choices: [
            { id: newChoiceId(), label: "", priceDelta: 0 },
            { id: newChoiceId(), label: "", priceDelta: 0 },
            { id: newChoiceId(), label: "", priceDelta: 0 },
        ],
        includedInPreview: false,
    },
    {
        id: "wg-service",
        kind: "single",
        hasPrice: false,
        userTitle: "",
        metaTitle: "Servis seçimi",
        descriptionLine:
            "Tek seçim — sıcak / soğuk gibi fiyat farkı olmayan tek seçim için uygundur.",
        required: true,
        maxSelect: 1,
        choices: [
            { id: newChoiceId(), label: "", priceDelta: 0 },
            { id: newChoiceId(), label: "", priceDelta: 0 },
        ],
        includedInPreview: false,
    },
];

export const newWizardChoiceId = newChoiceId;

export const cloneWizardGroup = (group: WizardOptionGroup): WizardOptionGroup => ({
    ...group,
    choices: group.choices.map((c) => ({ ...c })),
});

export const wizardGroupToPreviewGroup = (group: WizardOptionGroup): OptionGroup => ({
    id: `preview-${group.id}`,
    name: group.userTitle.trim() || group.metaTitle,
    kind: group.kind,
    minSelect: group.kind === "multi" ? 0 : group.required ? 1 : 0,
    maxSelect: group.kind === "multi" ? Math.max(group.maxSelect, 1) : 1,
    choices: group.choices,
});

export const reorderWizardGroups = (
    groups: WizardOptionGroup[],
    dragId: string,
    dropId: string
) => {
    const from = groups.findIndex((g) => g.id === dragId);
    const to = groups.findIndex((g) => g.id === dropId);
    if (from === -1 || to === -1 || from === to) return groups;
    const next = [...groups];
    const [moved] = next.splice(from, 1);
    const toAfterRemove = next.findIndex((g) => g.id === dropId);
    next.splice(toAfterRemove, 0, moved);
    return next;
};
