import { buildConicGradientFromSlices, DEMO_PAYMENT_SLICES } from "../data/dashboardDemo";

type DashboardPaymentDistributionProps = {
    /** Ortadaki toplam sipariş sayısı (bugünün özeti). */
    totalOrders: number;
};

function DashboardPaymentDistribution({ totalOrders }: DashboardPaymentDistributionProps) {
    const gradient = buildConicGradientFromSlices(DEMO_PAYMENT_SLICES);
    const center = totalOrders > 20 ? totalOrders : DEMO_PAYMENT_SLICES.reduce((a, s) => a + s.orderCount, 0);

    return (
        <article className="dashboard-card-surface dashboard-ambient-shadow rounded-[32px] p-6">
            <h3 className="dashboard-display mb-6 text-xl font-bold text-[var(--qresto-text)]">
                Ödeme Yöntemi Dağılımı
            </h3>
            <p className="mb-4 text-xs text-[var(--qresto-muted)]">
                Demo veri — ödeme yöntemi kırılımı API ile bağlanınca güncellenecek.
            </p>
            <div className="flex flex-col items-center justify-center gap-8 py-2 lg:flex-row">
                <div
                    className="relative flex h-48 w-48 items-center justify-center rounded-full"
                    style={{ background: gradient }}
                >
                    <div className="dashboard-donut-hole flex h-32 w-32 flex-col items-center justify-center rounded-full shadow-inner">
                        <span className="text-sm font-bold text-[var(--qresto-muted)]">Toplam</span>
                        <span className="dashboard-display text-3xl font-bold text-[var(--qresto-text)]">
                            {center}
                        </span>
                    </div>
                </div>
                <div className="flex w-full max-w-xs flex-col gap-4">
                    {DEMO_PAYMENT_SLICES.map((s) => (
                        <div key={s.key} className="flex items-center gap-3">
                            <div
                                className="h-4 w-4 shrink-0 rounded-full"
                                style={{ backgroundColor: s.color }}
                            />
                            <div>
                                <div className="text-sm font-bold text-[var(--qresto-text)]">{s.label}</div>
                                <div className="text-sm text-[var(--qresto-muted)]">
                                    %{s.percent} ({s.orderCount} Sipariş)
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    );
}

export default DashboardPaymentDistribution;
