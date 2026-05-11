import type { CSSProperties, ReactNode } from "react";

type MenuDetailBottomBarProps = {
    style?: CSSProperties;
    children: ReactNode;
};

const MenuDetailBottomBar = ({ style, children }: MenuDetailBottomBarProps) => {
    return (
        <div
            className="menu-detail-bottom-rise menu-detail-bottom-bar menu-detail-bottom-bar-shadow bg-surface-container-lowest border-t border-outline-variant/30 px-container-margin py-4 flex items-center justify-between gap-4 box-border md:rounded-t-2xl md:border md:border-outline-variant/30"
            style={style}
        >
            {children}
        </div>
    );
};

export default MenuDetailBottomBar;
