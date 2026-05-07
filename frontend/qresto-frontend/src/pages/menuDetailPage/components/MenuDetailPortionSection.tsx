import DetailOptionRow from "./DetailOptionRow";

export type PortionChoice = "single" | "large";

type MenuDetailPortionSectionProps = {
    portion: PortionChoice;
    onPortionChange: (portion: PortionChoice) => void;
    animationDelayMs?: string;
};

const MenuDetailPortionSection = ({
    portion,
    onPortionChange,
    animationDelayMs = "250ms",
}: MenuDetailPortionSectionProps) => {
    return (
        <section
            className="flex flex-col gap-stack-sm menu-detail-fade-up"
            style={{ animationDelay: animationDelayMs }}
        >
            <h2 className="font-headline text-headline-md text-on-surface">Porsiyon</h2>
            <div className="flex flex-col gap-3">
                <DetailOptionRow
                    className="p-4 rounded-xl border-2 border-primary bg-primary-fixed/20"
                    left={
                        <>
                            <input
                                type="radio"
                                name="portion"
                                checked={portion === "single"}
                                onChange={() => onPortionChange("single")}
                                className="accent-primary"
                            />
                            <span className="text-body-lg text-on-surface">Tek Porsiyon (200gr)</span>
                        </>
                    }
                />
                <DetailOptionRow
                    className="p-4 rounded-xl border border-outline-variant hover:bg-surface-container-low"
                    left={
                        <>
                            <input
                                type="radio"
                                name="portion"
                                checked={portion === "large"}
                                onChange={() => onPortionChange("large")}
                                className="accent-primary"
                            />
                            <span className="text-body-lg text-on-surface">1.5 Porsiyon (300gr)</span>
                        </>
                    }
                    trailing={<span className="text-body-sm text-on-surface-variant">+ ₺180</span>}
                />
            </div>
        </section>
    );
};

export default MenuDetailPortionSection;
