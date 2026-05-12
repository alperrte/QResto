import type { RatingSummaryResponse } from "../../../types/ratingTypes";

type MenuDetailSummaryProps = {
    name: string;
    description: string;
    basePriceFormatted: string;
    prepMinutes: number | null;
    kcal: number | null;
    gram: number | null;
    ratingSummary: RatingSummaryResponse | null;
    ratingLoading: boolean;
    animationDelayMs?: string;
};

const MenuDetailSummary = ({
    name,
    description,
    basePriceFormatted,
    prepMinutes,
    kcal,
    gram,
    ratingSummary,
    ratingLoading,
    animationDelayMs = "140ms",
}: MenuDetailSummaryProps) => {
    const hasRatings =
        ratingSummary != null && Number(ratingSummary.totalRatingCount ?? 0) > 0;

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
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 pb-6 border-b border-outline-variant/30">
                {prepMinutes != null ? (
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[20px] text-primary">schedule</span>
                        <span className="text-body-sm font-medium text-on-surface">{prepMinutes} dk</span>
                    </div>
                ) : null}
                {kcal != null ? (
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[20px] text-primary">
                            local_fire_department
                        </span>
                        <span className="text-body-sm font-medium text-on-surface">{kcal} kcal</span>
                    </div>
                ) : null}
                {gram != null ? (
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[20px] text-primary">scale</span>
                        <span className="text-body-sm font-medium text-on-surface">{gram} g</span>
                    </div>
                ) : null}
                {ratingLoading ? (
                    <span className="text-body-sm italic text-on-surface-variant/80">
                        Puan yükleniyor…
                    </span>
                ) : hasRatings ? (
                    <div className="flex items-center gap-1.5 text-primary">
                        <span className="material-symbols-outlined text-[20px]" data-weight="fill">
                            star
                        </span>
                        <span className="font-bold text-label-bold text-on-surface">
                            {ratingSummary!.averageRating.toFixed(1)}
                        </span>
                    </div>
                ) : (
                    <span className="text-body-sm italic text-on-surface-variant max-w-[min(100%,220px)] leading-snug">
                        Henüz değerlendirme yok
                    </span>
                )}
            </div>
        </section>
    );
};

export default MenuDetailSummary;
