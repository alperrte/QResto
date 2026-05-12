import type { ReactNode } from "react";

type WizardQuickPreviewPanelProps = {
    children: ReactNode;
    footerHint?: string;
    asideClassName?: string;
};

function WizardQuickPreviewPanel({ children, footerHint, asideClassName = "" }: WizardQuickPreviewPanelProps) {
    return (
        <aside
            className={`bg-surface-container-lowest rounded-lg border border-surface-variant shadow-sm overflow-hidden self-start min-h-[560px] w-full ${asideClassName}`}
        >
            <div className="bg-surface-container-low px-4 py-3 border-b border-surface-variant wizard-preview-head-reveal">
                <h3 className="text-label-bold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-sm">visibility</span>
                    Hızlı Önizleme
                </h3>
            </div>
            <div className="p-4 flex flex-col gap-4 wizard-preview-stack-reveal">
                {children}
                {footerHint ? (
                    <p className="text-body-sm text-secondary text-center">{footerHint}</p>
                ) : null}
            </div>
        </aside>
    );
}

export default WizardQuickPreviewPanel;
