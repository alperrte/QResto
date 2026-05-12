import { useState } from "react";

import KitchenOrderList from "../../components/kitchen/KitchenOrderList";
import { useKitchenBoardOrders } from "../../hooks/useKitchenBoardOrders";
import { todayIsoDate } from "./kitchenOrderUi";

function KitchenOrdersPage() {
    const { orders, loading, error, reload } = useKitchenBoardOrders();
    const [dateKey, setDateKey] = useState(todayIsoDate);

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
                <h2 className="text-2xl font-black text-[var(--qresto-text)] md:text-3xl">Siparişler</h2>
                <p className="mt-2 text-sm font-medium text-[var(--qresto-muted)]">
                    Sipariş durumunu buradan güncelleyin; mutfak paneli listesi order servisindeki güncel
                    durumu gösterir.
                </p>
            </section>

            <KitchenOrderList
                orders={orders}
                loading={loading}
                error={error}
                enableStatusControls
                onMutateSuccess={() => reload()}
                listTitle="Sipariş Listesi"
                dateKey={dateKey}
                onDateChange={setDateKey}
            />
        </div>
    );
}

export default KitchenOrdersPage;
