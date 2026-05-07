type MenuDetailAddToCartButtonProps = {
    totalPriceFormatted: string;
};

const MenuDetailAddToCartButton = ({ totalPriceFormatted }: MenuDetailAddToCartButtonProps) => {
    return (
        <button
            type="button"
            className="flex-1 h-[48px] bg-primary text-on-primary rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
        >
            <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
            <span className="font-bold text-label-bold">Sepete Ekle - {totalPriceFormatted}</span>
        </button>
    );
};

export default MenuDetailAddToCartButton;
