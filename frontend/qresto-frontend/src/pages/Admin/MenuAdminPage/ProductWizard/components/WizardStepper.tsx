import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { useWizardStepperLineStyles } from "../hooks/useWizardProgress";

import "./WizardStepper.css";
import "../styles/wizardPageAnimations.css";

type WizardStepperProps = {
    steps: readonly string[];
    /** 1-based index */
    currentStep: number;
};

function WizardStepper({ steps, currentStep }: WizardStepperProps) {
    const stepCount = steps.length;
    const stepperLines = useWizardStepperLineStyles(currentStep, stepCount);
    const prevStepRef = useRef<number | null>(null);
    const [balloonStep, setBalloonStep] = useState<number | null>(null);

    useEffect(() => {
        const prev = prevStepRef.current;
        prevStepRef.current = currentStep;

        if (prev !== null && prev !== currentStep) {
            setBalloonStep(currentStep);
            const id = window.setTimeout(() => setBalloonStep(null), 580);
            return () => clearTimeout(id);
        }
    }, [currentStep]);

    return (
        <div className="wizard-stepper" role="navigation" aria-label="Sihirbaz adımları">
            <div
                className="wizard-stepper-line-base wizard-stepper-line-anim"
                style={{ left: stepperLines.lineInset, right: stepperLines.lineInset }}
            />
            <div
                className="wizard-stepper-line-progress wizard-stepper-line-anim"
                style={{ left: stepperLines.lineInset, width: stepperLines.progressWidth }}
            />
            {steps.map((label, index) => {
                const step = index + 1;
                const isActive = step === currentStep;
                const isDone = currentStep > step;
                const showBalloon = step === balloonStep;

                return (
                    <div
                        key={label}
                        className="wizard-step-item wizard-step-item-enter"
                        style={{ "--wsi": index } as CSSProperties}
                    >
                        <div
                            className={`wizard-step-dot ${
                                isDone
                                    ? "wizard-step-dot-done"
                                    : isActive
                                      ? "wizard-step-dot-active"
                                      : "wizard-step-dot-pending"
                            }${showBalloon ? " wizard-step-dot-balloon" : ""}`}
                            aria-current={isActive ? "step" : undefined}
                        >
                            {isDone ? "✓" : step}
                        </div>
                        <span
                            className={`wizard-step-label ${
                                isActive ? "wizard-step-label-active" : "wizard-step-label-passive"
                            }`}
                        >
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default WizardStepper;
