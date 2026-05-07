import MaterialIcon from "../../../components/ui/MaterialIcon";

type MenuSearchBarProps = {
    value: string;
    onChange: (value: string) => void;
};

const MenuSearchBar = ({ value, onChange }: MenuSearchBarProps) => {
    return (
        <div className="w-full relative z-0">
            <div className="flex items-center bg-linear-to-r from-surface-container to-surface-container-lowest rounded-full px-4 py-3 shadow-sm border border-outline-variant/30">
                <MaterialIcon
                    name="search"
                    className="text-on-surface-variant mr-3 text-[22px]"
                />
                <input
                    id="menu-product-search"
                    className="bg-transparent border-none outline-none flex-1 font-sans text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:ring-0 p-0 min-w-0"
                    placeholder="Lezzetli bir şeyler arayın..."
                    type="search"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete="off"
                    aria-label="Menüde ürün arama"
                />
            </div>
        </div>
    );
};

export default MenuSearchBar;
