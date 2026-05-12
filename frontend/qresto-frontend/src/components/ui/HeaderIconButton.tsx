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
            className={`relative inline-flex items-center justify-center ${className}`}
            aria-label={label}
        >
            <MaterialIcon name={icon} fill={fill} className={iconClassName} />
            {badge !== undefined ? (
                <span className="absolute -right-1 -top-1 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-none text-on-secondary">
                    {badge}
                </span>
            ) : null}
        </button>
    );
};

export default HeaderIconButton;
