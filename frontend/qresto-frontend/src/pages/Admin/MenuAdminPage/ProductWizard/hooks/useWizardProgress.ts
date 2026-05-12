import { useMemo } from "react";

export type WizardStepperLineStyles = {
    lineInset: string;
    progressWidth: string;
};

export function useWizardStepperLineStyles(
    wizardStep: number,
    stepCount: number
): WizardStepperLineStyles {
    return useMemo(() => {
        const n = Math.max(1, stepCount);
        const insetPct = 100 / (2 * n);
        const trackPct = 100 - 2 * insetPct;
        const denom = Math.max(1, n - 1);
        const progressPct = ((wizardStep - 1) / denom) * trackPct;
        return {
            lineInset: `${insetPct}%`,
            progressWidth: `${progressPct}%`,
        };
    }, [wizardStep, stepCount]);
}
