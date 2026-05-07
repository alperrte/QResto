import type { ReactNode } from "react";

type DetailOptionRowProps = {
    className?: string;
    left: ReactNode;
    trailing?: ReactNode;
};

const DetailOptionRow = ({ className = "", left, trailing }: DetailOptionRowProps) => {
    return (
        <label
            className={`menu-detail-option-row flex items-center justify-between cursor-pointer transition-colors ${className}`}
        >
            <div className="flex items-center gap-3">{left}</div>
            {trailing ?? null}
        </label>
    );
};

export default DetailOptionRow;
