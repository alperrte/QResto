import { RefreshCw } from "lucide-react";

type DashboardReportToolbarProps = {
    onRefresh: () => void;
    loading: boolean;
};

function DashboardReportToolbar({ onRefresh, loading }: DashboardReportToolbarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="dashboard-display text-2xl font-bold tracking-tight text-[var(--qresto-text)] sm:text-[32px] sm:leading-snug">
                Kontrol Paneli Raporları
            </h2>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => void onRefresh()}
                    disabled={loading}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-muted)] shadow-sm transition-colors hover:bg-[var(--qresto-hover)] disabled:opacity-50"
                    aria-label="Verileri yenile"
                >
                    <RefreshCw
                        size={20}
                        className={loading ? "animate-spin" : ""}
                    />
                </button>
            </div>
        </div>
    );
}

export default DashboardReportToolbar;
