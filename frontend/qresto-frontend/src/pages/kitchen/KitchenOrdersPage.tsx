import { useState } from "react";

import KitchenOrderList from "../../components/kitchen/KitchenOrderList";
import { useKitchenBoardOrders } from "../../hooks/useKitchenBoardOrders";
import { todayIsoDate } from "./kitchenOrderUi";

function KitchenOrdersPage() {
    const { orders, loading, error, reload } = useKitchenBoardOrders();
    const [dateKey, setDateKey] = useState(todayIsoDate);

    return (
        <KitchenOrderList
            orders={orders}
            loading={loading}
            error={error}
            enableStatusControls
            onMutateSuccess={() => reload()}
            listTitle="Sipariş Listesi"
            dateKey={dateKey}
            onDateChange={setDateKey}
            showSelectedDetail={false}
            initialTab="received"
        />
    );
}

export default KitchenOrdersPage;
