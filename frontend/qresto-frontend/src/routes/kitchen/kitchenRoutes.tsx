import { Navigate, Route } from "react-router-dom";

import KitchenDashboardPage from "../../pages/kitchen/KitchenDashboardPage";
import KitchenOrdersPage from "../../pages/kitchen/KitchenOrdersPage";

export const kitchenRoutes = (
    <>
        <Route path="/app/kitchen" element={<Navigate to="/app/kitchen/dashboard" replace />} />
        <Route path="/app/kitchen/dashboard" element={<KitchenDashboardPage />} />
        <Route path="/app/kitchen/orders" element={<KitchenOrdersPage />} />
    </>
);