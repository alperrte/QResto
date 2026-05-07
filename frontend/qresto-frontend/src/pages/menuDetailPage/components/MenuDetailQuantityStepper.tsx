type MenuDetailQuantityStepperProps = {
    quantity: number;
    onDecrement: () => void;
    onIncrement: () => void;
    minQuantity?: number;
};

const MenuDetailQuantityStepper = ({
    quantity,
    onDecrement,
    onIncrement,
    minQuantity = 1,
}: MenuDetailQuantityStepperProps) => {
    return (
        <div className="flex items-center justify-between bg-surface-container rounded-full px-2 py-1 h-[48px] w-[120px]">
            <button
                type="button"
                aria-label="Azalt"
                onClick={onDecrement}
                className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container rounded-full"
                disabled={quantity <= minQuantity}
            >
                <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="font-bold text-label-bold text-on-surface w-4 text-center">
                {quantity}
            </span>
            <button
                type="button"
                aria-label="Artır"
                onClick={onIncrement}
                className="w-8 h-8 flex items-center justify-center text-primary hover:text-on-surface transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container rounded-full"
            >
                <span className="material-symbols-outlined">add</span>
            </button>
        </div>
    );
};

export default MenuDetailQuantityStepper;
