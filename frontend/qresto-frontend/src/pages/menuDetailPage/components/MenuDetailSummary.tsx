type MenuDetailSummaryProps = {
    name: string;
    description: string;
    basePriceFormatted: string;
    prepMinutes: number;
    kcal: number;
    rating: number;
    animationDelayMs?: string;
};

const MenuDetailSummary = ({
    name,
    description,
    basePriceFormatted,
    prepMinutes,
    kcal,
    rating,
    animationDelayMs = "140ms",
}: MenuDetailSummaryProps) => {
    return (
        <section
            className="flex flex-col gap-stack-sm menu-detail-fade-up"
            style={{ animationDelay: animationDelayMs }}
        >
            <div className="flex justify-between items-start gap-4">
                <h1 className="font-headline text-display-lg text-on-surface">{name}</h1>
                <span className="font-sans text-price-tag text-secondary mt-2 whitespace-nowrap font-bold">
                    {basePriceFormatted}
                </span>
            </div>
            <p className="font-sans text-body-lg text-on-surface-variant">{description}</p>
            <div className="flex items-center gap-6 mt-2 pb-6 border-b border-outline-variant/30">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                    <span className="text-body-sm">{prepMinutes} dk</span>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">
                        local_fire_department
                    </span>
                    <span className="text-body-sm">{kcal} kcal</span>
                </div>
                <div className="flex items-center gap-1.5 text-primary">
                    <span className="material-symbols-outlined text-[20px]" data-weight="fill">
                        star
                    </span>
                    <span className="font-bold text-label-bold">{rating}</span>
                </div>
            </div>
        </section>
    );
};

export default MenuDetailSummary;
