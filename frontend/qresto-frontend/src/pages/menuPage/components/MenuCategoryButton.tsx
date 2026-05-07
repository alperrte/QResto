import MaterialIcon from "../../../components/ui/MaterialIcon";
import { type MenuCategoryFilterId } from "../menuItems";

type MenuCategoryButtonProps = {
    id: MenuCategoryFilterId;
    icon: string;
    defaultFill?: boolean;
    fallbackLabel: string;
    isActive: boolean;
    animationDelayMs: number;
    onClick: (id: MenuCategoryFilterId) => void;
    // Future-proof: when categories come from DB, pass fetched name here.
    dbLabel?: string | null;
};

const MenuCategoryButton = ({
    id,
    icon,
    defaultFill = false,
    fallbackLabel,
    isActive,
    animationDelayMs,
    onClick,
    dbLabel,
}: MenuCategoryButtonProps) => {
    const categoryLabel = dbLabel?.trim() || fallbackLabel;

    return (
        <button
            type="button"
            onClick={() => onClick(id)}
            style={{ animationDelay: `${animationDelayMs}ms` }}
            className={`menu-category-stagger relative z-30 flex items-center gap-2 px-4 py-2 rounded-full font-sans text-label-bold whitespace-nowrap shadow-sm active:scale-95 transition-transform border-2 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isActive
                    ? "border-primary bg-primary-container text-on-primary-container"
                    : "border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high border"
            }`}
        >
            <MaterialIcon
                name={icon}
                fill={isActive && defaultFill}
                className="text-[20px]"
            />
            {categoryLabel}
        </button>
    );
};

export default MenuCategoryButton;
