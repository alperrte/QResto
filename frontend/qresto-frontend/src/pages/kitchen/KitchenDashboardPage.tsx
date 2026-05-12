import { AlarmClock, ChefHat, Flame, ShoppingBag } from "lucide-react";

function KitchenDashboardPage() {
    const kitchenCards = [
        { title: "Hazırlanan Sipariş", value: "23", Icon: ChefHat },
        { title: "Bekleyen Üretim", value: "7", Icon: ShoppingBag },
        { title: "Ortalama Süre", value: "14 dk", Icon: AlarmClock },
        { title: "Sıcak İstasyon", value: "3 aktif", Icon: Flame },
    ];

    return (
        <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {kitchenCards.map((card) => (
                    <article
                        key={card.title}
                        className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_8px_22px_rgba(15,23,42,0.07)] transition-transform duration-200 hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                                {card.title}
                            </p>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                <card.Icon size={20} />
                            </span>
                        </div>

                        <p className="mt-4 text-3xl font-black text-[var(--qresto-text)]">
                            {card.value}
                        </p>
                    </article>
                ))}
            </section>
        </div>
    );
}

export default KitchenDashboardPage;