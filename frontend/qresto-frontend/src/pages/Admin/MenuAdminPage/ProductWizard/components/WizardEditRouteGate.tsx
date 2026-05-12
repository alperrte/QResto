type WizardEditRouteGateProps = {
    variant: "loading" | "error";
    onBackToList: () => void;
};

function WizardEditRouteGate({ variant, onBackToList }: WizardEditRouteGateProps) {
    if (variant === "loading") {
        return (
            <div className="menu-admin-page bg-[var(--qresto-bg)] min-h-[calc(100vh-120px)] -mx-8 flex flex-col items-center justify-center">
                <p className="text-body-lg text-on-surface-variant">Ürün yükleniyor…</p>
            </div>
        );
    }

    return (
        <div className="menu-admin-page bg-[var(--qresto-bg)] min-h-[calc(100vh-120px)] -mx-8 flex flex-col items-center justify-center gap-4 p-6">
            <p className="text-body-lg text-on-surface">Ürün yüklenemedi.</p>
            <button
                type="button"
                onClick={onBackToList}
                className="rounded-lg bg-primary-container px-4 py-2.5 text-label-bold text-on-primary-container hover:opacity-90"
            >
                Listeye dön
            </button>
        </div>
    );
}

export default WizardEditRouteGate;
