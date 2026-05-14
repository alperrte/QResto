import KitchenOrderList from "../../components/kitchen/KitchenOrderList";
import { useKitchenBoardOrders } from "../../hooks/useKitchenBoardOrders";

function KitchenOrdersPage() {
    const { orders, loading, error, reload } = useKitchenBoardOrders();

    return (
        <KitchenOrderList
            orders={orders}
            loading={loading}
            error={error}
            enableStatusControls
            onMutateSuccess={() => reload()}
            listTitle="Sipariş Listesi"
            showSelectedDetail={false}
            initialTab="received"
        />
    );
}

export default KitchenOrdersPage;
