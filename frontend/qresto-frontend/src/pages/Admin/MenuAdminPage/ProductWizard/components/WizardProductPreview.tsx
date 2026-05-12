import { Children, cloneElement, isValidElement } from "react";
import type { CSSProperties, ReactElement } from "react";

import type { WizardProductPreviewProps } from "../types/productWizard.types";
import "../styles/productWizard.css";
import "../styles/wizardPreviewInnerReveal.css";

const displayTitle = (name: string) => {
    const t = name.trim();
    return t || "Ürün adı";
};

const parsePositiveInt = (raw: string) => {
    const t = raw.trim();
    if (!t) return null;
    const n = Number(t);
    if (Number.isNaN(n) || n <= 0) return null;
    return Math.round(n);
};

/**
 * Ürün kartı önizlemesi (tasarım referansıyla uyumlu).
 * Adım 1: yalnızca görsel + ürün adı + fiyat. Adım 2: girilen açıklama ve meta (hazırlık, kalori, gram, puan).
 */
const WizardProductPreview = ({
    mode,
    imageUrl,
    name,
    description,
    priceFormatted,
    prepTimeMin,
    calorie,
    gram,
    active: _productMenuActive,
    ratingActive = true,
    ratingDisplay = "0.0",
    optionBlocks,
    innerStagger = false,
}: WizardProductPreviewProps) => {
    const isStep1 = mode === "step1";
    const title = displayTitle(name);
    const namePlaceholder = !name.trim();
    const desc = description.trim();

    const prep = parsePositiveInt(prepTimeMin);
    const kcal = parsePositiveInt(calorie);
    const gr = parsePositiveInt(gram);

    const priceEmpty = priceFormatted === "—";
    const hasImage = Boolean(imageUrl.trim());

    let revealSeq = 0;
    const rev = (className: string) => {
        if (!innerStagger) {
            return { className };
        }
        const i = revealSeq;
        revealSeq += 1;
        return {
            className: `${className} wizard-preview-inner-item`.trim(),
            style: { "--wpi-i": i } as CSSProperties,
        };
    };

    const renderOptionBlocks = () => {
        if (!optionBlocks) return null;
        if (!innerStagger) {
            return optionBlocks;
        }
        const base = revealSeq;
        return Children.map(Children.toArray(optionBlocks), (child, i) => {
            if (!isValidElement(child)) {
                return child;
            }
            const el = child as ReactElement<{ className?: string; style?: CSSProperties }>;
            const prevStyle =
                el.props.style && typeof el.props.style === "object" ? el.props.style : undefined;
            const mergedClass = [el.props.className, "wizard-preview-inner-item"].filter(Boolean).join(" ");
            return cloneElement(el, {
                className: mergedClass,
                style: {
                    ...prevStyle,
                    "--wpi-i": base + i,
                } as CSSProperties,
            });
        });
    };

    return (
        <div className="wizard-product-preview-card overflow-hidden rounded-[28px] border border-outline-variant bg-surface-container-low shadow-[0_4px_24px_rgba(30,27,24,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
            <div
                {...rev(
                    "wizard-product-preview-hero relative aspect-[4/3] w-full overflow-hidden bg-surface-container-high"
                )}
            >
                {hasImage ? (
                    <img
                        src={imageUrl.trim()}
                        alt={name.trim() || "Ürün"}
                        className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                ) : (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-on-surface-variant"
                        aria-hidden
                    >
                        <span className="material-symbols-outlined text-[44px] opacity-35">image</span>
                    </div>
                )}
            </div>

            <div className="px-5 pt-5 pb-6">
                <div {...rev("flex items-start justify-between gap-3")}>
                    <h2
                        className={`min-w-0 flex-1 font-headline text-[1.625rem] font-semibold leading-snug tracking-tight text-on-surface ${
                            namePlaceholder ? "text-on-surface/55" : ""
                        }`}
                    >
                        {title}
                    </h2>
                    <span
                        className={`shrink-0 font-sans text-lg font-bold leading-tight text-secondary ${
                            priceEmpty ? "text-on-surface-variant/45" : ""
                        }`}
                    >
                        {priceEmpty ? "—" : priceFormatted}
                    </span>
                </div>

                {!isStep1 ? (
                    <>
                        {desc ? (
                            <p
                                {...rev(
                                    "mt-3 whitespace-pre-wrap font-sans text-[0.9375rem] leading-relaxed text-on-surface-variant"
                                )}
                            >
                                {desc}
                            </p>
                        ) : null}

                        <div
                            {...rev(
                                "mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-[0.8125rem]"
                            )}
                        >
                            {prep !== null ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[18px] text-primary">
                                        schedule
                                    </span>
                                    <span className="font-medium text-on-surface">{prep} dk</span>
                                </span>
                            ) : null}
                            {kcal !== null ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[18px] text-primary">
                                        local_fire_department
                                    </span>
                                    <span className="font-medium text-on-surface">{kcal} kcal</span>
                                </span>
                            ) : null}
                            {gr !== null ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[18px] text-primary">
                                        scale
                                    </span>
                                    <span className="font-medium text-on-surface">{gr} g</span>
                                </span>
                            ) : null}
                            <span
                                className={`inline-flex items-center gap-1.5 text-primary transition-opacity ${
                                    ratingActive ? "" : "opacity-40"
                                }`}
                            >
                                <span
                                    className="material-symbols-outlined text-[18px]"
                                    data-weight="fill"
                                >
                                    star
                                </span>
                                <span
                                    className={`font-bold ${
                                        ratingActive ? "text-on-surface" : "text-on-surface-variant"
                                    }`}
                                >
                                    {ratingDisplay}
                                </span>
                            </span>
                        </div>
                    </>
                ) : null}
            </div>

            {optionBlocks ? (
                <div className="space-y-4 border-t border-outline-variant bg-surface-container-low px-5 py-5">
                    {renderOptionBlocks()}
                </div>
            ) : null}
        </div>
    );
};

export default WizardProductPreview;
