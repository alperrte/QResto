type MaterialIconProps = {
    name: string;
    fill?: boolean;
    className?: string;
};

const MaterialIcon = ({ name, fill, className = "" }: MaterialIconProps) => {
    return (
        <span
            className={`material-symbols-outlined ${className}`}
            data-weight={fill ? "fill" : undefined}
            aria-hidden
        >
            {name}
        </span>
    );
};

export default MaterialIcon;
