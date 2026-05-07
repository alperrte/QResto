import MaterialIcon from "./MaterialIcon";

type HeaderIconButtonProps = {
    icon: string;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    fill?: boolean;
    className?: string;
    iconClassName?: string;
    badge?: string | number;
};

const HeaderIconButton = ({
    icon,
    label,
    onClick,
    disabled = false,
    fill = false,
    className = "",
    iconClassName = "text-[24px]",
    badge,
}: HeaderIconButtonProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={className}
            aria-label={label}
        >
            <MaterialIcon name={icon} fill={fill} className={iconClassName} />
            {badge !== undefined ? (
                <span className="absolute top-1 right-1 bg-secondary text-on-secondary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {badge}
                </span>
            ) : null}
        </button>
    );
};

export default HeaderIconButton;
