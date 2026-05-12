import DetailOptionRow from "./DetailOptionRow";
import type { MenuProductOptionGroupDto } from "../types/menuDetail.types";

export type MenuDetailOptionSelection = {
    radioByGroupId: Record<string, number>;
    multiByGroupId: Record<string, number[]>;
};

type MenuDetailOptionGroupsProps = {
    groups: MenuProductOptionGroupDto[];
    value: MenuDetailOptionSelection;
    onChange: (next: MenuDetailOptionSelection) => void;
};

const groupHeading = (g: MenuProductOptionGroupDto) =>
    (g.userTitle?.trim() || g.metaTitle || "Seçenek").trim();

const formatDelta = (n: number) => {
    if (n === 0) return null;
    if (n < 0) return `- ₺${Math.abs(n)}`;
    return `+ ₺${n}`;
};

const MenuDetailOptionGroups = ({ groups, value, onChange }: MenuDetailOptionGroupsProps) => {
    const setRadio = (groupId: number, choiceId: number) => {
        onChange({
            ...value,
            radioByGroupId: { ...value.radioByGroupId, [String(groupId)]: choiceId },
        });
    };

    const toggleMulti = (group: MenuProductOptionGroupDto, choiceId: number) => {
        const gid = String(group.id);
        const cur = value.multiByGroupId[gid] ?? [];
        const maxSelect = Math.max(1, group.maxSelect);
        let nextIds: number[];
        if (cur.includes(choiceId)) {
            nextIds = cur.filter((id) => id !== choiceId);
        } else if (cur.length >= maxSelect) {
            return;
        } else {
            nextIds = [...cur, choiceId];
        }
        onChange({
            ...value,
            multiByGroupId: { ...value.multiByGroupId, [gid]: nextIds },
        });
    };

    return (
        <>
            {groups.map((g, index) => {
                const delay = `${250 + index * 70}ms`;
                const title = groupHeading(g);
                const gid = String(g.id);

                if (g.kind === "portion" || g.kind === "single") {
                    const selectedId = value.radioByGroupId[gid];
                    return (
                        <section
                            key={g.id}
                            className="flex flex-col gap-stack-sm menu-detail-fade-up"
                            style={{ animationDelay: delay }}
                        >
                            <h2 className="font-headline text-headline-md text-on-surface">{title}</h2>
                            <div className="flex flex-col gap-3" role="radiogroup" aria-label={title}>
                                {g.choices.map((choice, choiceIndex) => {
                                    const checked = selectedId === choice.id;
                                    const deltaLabel =
                                        g.hasPrice && choice.priceDelta !== 0
                                            ? formatDelta(Number(choice.priceDelta))
                                            : null;
                                    return (
                                        <DetailOptionRow
                                            key={choice.id}
                                            className={`p-4 rounded-xl ${
                                                checked
                                                    ? "border-2 border-primary bg-primary-fixed/20"
                                                    : "border border-outline-variant hover:bg-surface-container-low"
                                            }`}
                                            left={
                                                <>
                                                    <input
                                                        type="radio"
                                                        name={`opt-group-${g.id}`}
                                                        checked={checked}
                                                        onChange={() => setRadio(g.id, choice.id)}
                                                        className="accent-primary"
                                                    />
                                                    <span className="text-body-lg text-on-surface">
                                                        {choice.label.trim() ||
                                                            `Seçenek ${choiceIndex + 1}`}
                                                    </span>
                                                </>
                                            }
                                            trailing={
                                                deltaLabel ? (
                                                    <span className="text-body-sm text-on-surface-variant">
                                                        {deltaLabel}
                                                    </span>
                                                ) : undefined
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    );
                }

                const selectedMulti = value.multiByGroupId[gid] ?? [];
                return (
                    <section
                        key={g.id}
                        className="flex flex-col gap-stack-sm menu-detail-fade-up"
                        style={{ animationDelay: delay }}
                    >
                        <h2 className="font-headline text-headline-md text-on-surface">{title}</h2>
                        <div className="flex flex-col gap-3">
                            {g.choices.map((choice) => {
                                const checked = selectedMulti.includes(choice.id);
                                const deltaLabel =
                                    g.hasPrice && choice.priceDelta !== 0
                                        ? formatDelta(Number(choice.priceDelta))
                                        : null;
                                return (
                                    <DetailOptionRow
                                        key={choice.id}
                                        className="p-3 rounded-xl hover:bg-surface-container-low"
                                        left={
                                            <>
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleMulti(g, choice.id)}
                                                    className="w-5 h-5 rounded accent-primary"
                                                />
                                                <span className="text-body-lg text-on-surface">
                                                    {choice.label.trim()}
                                                </span>
                                            </>
                                        }
                                        trailing={
                                            deltaLabel ? (
                                                <span className="text-body-sm text-on-surface-variant">
                                                    {deltaLabel}
                                                </span>
                                            ) : undefined
                                        }
                                    />
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </>
    );
};

export default MenuDetailOptionGroups;

export type BuildDefaultOptionSelectionContext = {
    /** Ürün adı; örn. Izgara Tavuk pişirme grubunda varsayılan Orta için kullanılır */
    productName?: string | null;
};

export const buildDefaultOptionSelection = (
    groups: MenuProductOptionGroupDto[],
    context?: BuildDefaultOptionSelectionContext
): MenuDetailOptionSelection => {
    const radioByGroupId: Record<string, number> = {};
    const multiByGroupId: Record<string, number[]> = {};
    const productName = context?.productName?.trim() ?? "";

    for (const g of groups) {
        const gid = String(g.id);
        if (g.kind === "portion") {
            const sorted = [...g.choices].sort((a, b) => a.sortOrder - b.sortOrder);
            const first = sorted[0];
            if (first) radioByGroupId[gid] = first.id;
        } else if (g.kind === "single") {
            const sorted = [...g.choices].sort((a, b) => a.sortOrder - b.sortOrder);
            if (sorted.length === 0) continue;
            let pick = sorted[0];
            const meta = (g.metaTitle || "").trim();
            if (
                productName === "Izgara Tavuk" &&
                meta.includes("Pişirme") &&
                sorted.length >= 2
            ) {
                const orta = sorted.find((c) => c.label.trim().toLowerCase() === "orta");
                if (orta) pick = orta;
            }
            radioByGroupId[gid] = pick.id;
        } else {
            multiByGroupId[gid] = [];
        }
    }
    return { radioByGroupId, multiByGroupId };
};

export const sumSelectedOptionExtrasTry = (
    groups: MenuProductOptionGroupDto[],
    sel: MenuDetailOptionSelection
): number => {
    let sum = 0;
    for (const g of groups) {
        if (g.kind === "portion" || g.kind === "single") {
            const cid = sel.radioByGroupId[String(g.id)];
            const ch = g.choices.find((c) => c.id === cid);
            if (ch && g.hasPrice) sum += Number(ch.priceDelta ?? 0);
        } else {
            const ids = sel.multiByGroupId[String(g.id)] ?? [];
            for (const ch of g.choices) {
                if (ids.includes(ch.id) && g.hasPrice) sum += Number(ch.priceDelta ?? 0);
            }
        }
    }
    return sum;
};

export const collectSelectedOptionLabels = (
    groups: MenuProductOptionGroupDto[],
    sel: MenuDetailOptionSelection
): string[] => {
    const labels: string[] = [];
    for (const g of groups) {
        if (g.kind === "portion" || g.kind === "single") {
            const cid = sel.radioByGroupId[String(g.id)];
            const ch = g.choices.find((c) => c.id === cid);
            if (ch?.label.trim()) labels.push(ch.label.trim());
        } else {
            const ids = new Set(sel.multiByGroupId[String(g.id)] ?? []);
            for (const ch of g.choices) {
                if (ids.has(ch.id) && ch.label.trim()) labels.push(ch.label.trim());
            }
        }
    }
    return labels;
};
