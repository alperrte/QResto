import { CheckCircle2, ChefHat, ShoppingCart, XCircle } from "lucide-react";

import KitchenOrderList from "../../components/kitchen/KitchenOrderList";
import { useKitchenBoardOrders } from "../../hooks/useKitchenBoardOrders";
import { countByStatus } from "./kitchenOrderUi";

function KitchenDashboardPage() {
    const { orders, loading, error, reload } = useKitchenBoardOrders();
    const counts = countByStatus(orders);

    const kitchenCards = [
        {
            title: "Yeni Siparişler",
            value: counts.received,
            description: "Son akış",
            Icon: ShoppingCart,
            iconClass: "bg-orange-500/10 text-orange-600",
            valueClass: "text-orange-600",
        },
        {
            title: "Hazırlanıyor",
            value: counts.preparing,
            description: "Aktif sipariş",
            Icon: ChefHat,
            iconClass: "bg-blue-500/10 text-blue-600",
            valueClass: "text-blue-600",
        },
        {
            title: "Hazır Bekleyen",
            value: counts.ready,
            description: "Servise hazır",
            Icon: CheckCircle2,
            iconClass: "bg-emerald-500/10 text-emerald-600",
            valueClass: "text-emerald-600",
        },
        {
            title: "İptal Edilen",
            value: counts.cancelledToday,
            description: "Bugünkü kayıt",
            Icon: XCircle,
            iconClass: "bg-red-500/10 text-red-600",
            valueClass: "text-red-600",
        },
    ] as const;

    return (
        <div className="space-y-5">
            <section className="grid gap-4 xl:grid-cols-4">
                {kitchenCards.map((card) => (
                    <article
                        key={card.title}
                        className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                    >
                        <div className="flex items-center gap-4">
                            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.iconClass}`}>
                                <card.Icon size={25} />
                            </span>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-black text-[var(--qresto-text)]">
                                    {card.title}
                                </p>
                                <p className={`mt-1 text-3xl font-black ${card.valueClass}`}>
                                    {loading ? "..." : card.value}
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-[var(--qresto-muted)]">
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    </article>
                ))}
            </section>

            <KitchenOrderList
                orders={orders}
                loading={loading}
                error={error}
                enableStatusControls={false}
                onMutateSuccess={() => reload()}
                listTitle="Sipariş Listesi"
                initialTab="received"
            />
        </div>
    );
}

export default KitchenDashboardPage;
