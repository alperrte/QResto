import { type ReactNode } from "react";

type AppHeaderProps = {
    title?: ReactNode;
    leftAction?: ReactNode;
    rightAction?: ReactNode;
    className?: string;
    titleClassName?: string;
    useSurface?: boolean;
};

const AppHeader = ({
    title = "QRESTO",
    leftAction,
    rightAction,
    className = "",
    titleClassName = "",
    useSurface = true,
}: AppHeaderProps) => {
    return (
        <header
            className={`${useSurface ? "app-surface-header" : ""} flex justify-between items-center w-full px-container-margin py-base ${className}`}
        >
            <div className="w-10 flex items-center justify-start">{leftAction}</div>
            <h1
                className={`font-headline text-display-lg text-primary text-center leading-none flex-1 ${titleClassName}`}
            >
                {title}
            </h1>
            <div className="w-10 flex items-center justify-end">{rightAction}</div>
        </header>
    );
};

export default AppHeader;
