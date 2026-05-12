import { MENU_ADMIN_CREATE_PRODUCT_LABEL } from "../services/menuAdminService";

type MenuAdminHeaderProps = {
    title: string;
    subtitle: string;
    onCreateClick: () => void;
    /** Örn. ürün listesi: "Yeni Ürün Ekle", kategoriler: "Kategori ekle" */
    createButtonLabel?: string;
};

const MenuAdminHeader = ({
    title,
    subtitle,
    onCreateClick,
    createButtonLabel = MENU_ADMIN_CREATE_PRODUCT_LABEL,
}: MenuAdminHeaderProps) => {
    return (
        <header className="menu-admin-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="menu-admin-enter-slide-left">
                <h2 className="text-headline-md font-headline-md text-on-surface">{title}</h2>
                <p className="text-body-md text-secondary mt-1">{subtitle}</p>
            </div>
            <button
                type="button"
                onClick={onCreateClick}
                className="menu-admin-enter-slide-right-soft bg-primary-container text-on-primary h-10 px-4 rounded-lg font-label-bold hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1 self-start sm:self-auto"
            >
                <span className="material-symbols-outlined text-[20px]">add</span>
                {createButtonLabel}
            </button>
        </header>
    );
};

export default MenuAdminHeader;
