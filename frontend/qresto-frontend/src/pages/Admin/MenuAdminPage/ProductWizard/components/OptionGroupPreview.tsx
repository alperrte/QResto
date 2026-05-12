import type { OptionGroup } from "../types/productWizard.types";

/** Müşteri kartındaki opsiyon blokları (sihirbaz + admin liste önizlemesi). */
export const renderOptionGroupPreview = (group: OptionGroup) => {
    if (group.kind === "portion") {
        return (
            <div className="flex flex-col gap-2 mt-3">
                {group.choices.map((choice, index) => (
                    <div
                        key={choice.id}
                        className={`flex items-center justify-between rounded-xl p-3 ${
                            index === 0
                                ? "border-2 border-primary bg-primary-fixed/20"
                                : "border border-outline-variant hover:bg-surface-container-low"
                        }`}
                    >
                        <label className="inline-flex items-center gap-2 text-body-md text-on-surface">
                            <input
                                type="radio"
                                checked={index === 0}
                                readOnly
                                className="accent-primary"
                            />
                            <span>{choice.label.trim() || `Seçenek ${index + 1}`}</span>
                        </label>
                        {choice.priceDelta !== 0 ? (
                            <span className="text-body-sm text-on-surface-variant">
                                {choice.priceDelta > 0 ? "+" : ""} ₺{choice.priceDelta}
                            </span>
                        ) : null}
                    </div>
                ))}
            </div>
        );
    }

    if (group.kind === "single") {
        return (
            <div className="flex flex-col gap-2 mt-3">
                {group.choices.map((choice, index) => (
                    <div
                        key={choice.id}
                        className="flex items-center justify-between rounded-xl border border-outline-variant p-3 hover:bg-surface-container-low"
                    >
                        <label className="inline-flex items-center gap-2 text-body-md text-on-surface">
                            <input
                                type="radio"
                                checked={false}
                                readOnly
                                className="accent-primary"
                            />
                            <span>{choice.label.trim() || `Seçenek ${index + 1}`}</span>
                        </label>
                        {choice.priceDelta !== 0 ? (
                            <span className="text-body-sm text-on-surface-variant">
                                {choice.priceDelta > 0 ? "+" : ""} ₺{choice.priceDelta}
                            </span>
                        ) : null}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 mt-3">
            {group.choices.map((choice, index) => (
                <div
                    key={choice.id}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-surface-container-low"
                >
                    <label className="inline-flex items-center gap-2 text-body-md text-on-surface">
                        <input
                            type="checkbox"
                            checked={false}
                            readOnly
                            className="w-5 h-5 rounded accent-primary"
                        />
                        <span>{choice.label.trim() || `Seçenek ${index + 1}`}</span>
                    </label>
                    {choice.priceDelta !== 0 ? (
                        <span className="text-body-sm text-on-surface-variant">+ ₺{choice.priceDelta}</span>
                    ) : null}
                </div>
            ))}
        </div>
    );
};
