import { BellRing, CheckCircle2, GlassWater, UtensilsCrossed } from "lucide-react";

function WaiterDashboardPage() {
    const waiterCards = [
        { title: "Bekleyen Sipariş", value: "12", Icon: UtensilsCrossed },
        { title: "Çağrı İsteği", value: "4", Icon: BellRing },
        { title: "Servise Hazır", value: "9", Icon: CheckCircle2 },
        { title: "Dolu Masa", value: "19", Icon: GlassWater },
    ];

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
                <h2 className="text-3xl font-black text-[var(--qresto-text)]">Garson Dashboard</h2>
                <p className="mt-2 text-sm font-medium text-[var(--qresto-muted)]">
                    Masaları, çağrıları ve servis trafiğini tek bakışta yönetin.
                </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {waiterCards.map((card) => (
                    <article
                        key={card.title}
                        className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_8px_22px_rgba(15,23,42,0.07)] transition-transform duration-200 hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-[var(--qresto-muted)]">{card.title}</p>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                <card.Icon size={20} />
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-black text-[var(--qresto-text)]">{card.value}</p>
                    </article>
                ))}
            </section>
        </div>
    );
}

export default WaiterDashboardPage;
