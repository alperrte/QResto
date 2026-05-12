type WizardPageHeaderProps = {
    isEditRoute: boolean;
    onBack: () => void;
};

function WizardPageHeader({ isEditRoute, onBack }: WizardPageHeaderProps) {
    return (
        <header className="wizard-page-header-enter bg-surface-container-lowest border-b border-outline-variant flex items-center w-full px-8 h-16 sticky top-[92px] z-30">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 p-2 rounded-full flex items-center justify-center"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-headline-md font-headline-md text-primary">
                    {isEditRoute ? "Ürünü düzenle" : "Ürün ekle"}
                </h1>
            </div>
        </header>
    );
}

export default WizardPageHeader;
