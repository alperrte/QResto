import type { CSSProperties } from "react";
import type { MenuAdminCategoryChip } from "../types/menuAdmin.types";

type MenuAdminCategoryChipRowProps = {
    categories: MenuAdminCategoryChip[];
    selectedCategoryId: string;
    onSelectCategoryId: (id: string) => void;
};

function MenuAdminCategoryChipRow({
    categories,
    selectedCategoryId,
    onSelectCategoryId,
}: MenuAdminCategoryChipRowProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {categories.map((category, chipIndex) => {
                const active = selectedCategoryId === category.id;
                return (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => onSelectCategoryId(category.id)}
                        style={{ "--menu-admin-chip-i": chipIndex } as CSSProperties}
                        className={`menu-admin-chip-ladder px-4 h-8 rounded-full text-label-bold transition-colors ${
                            active
                                ? "bg-primary text-white"
                                : "bg-surface-container text-secondary hover:bg-surface-container-high"
                        }`}
                    >
                        {category.label}
                    </button>
                );
            })}
        </div>
    );
}

export default MenuAdminCategoryChipRow;
