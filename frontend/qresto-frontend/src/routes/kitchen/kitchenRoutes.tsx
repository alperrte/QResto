import { Navigate, Route } from "react-router-dom";

import KitchenLayout from "../../layout/KitchenLayout/KitchenLayout";
import KitchenDashboardPage from "../../pages/kitchen/KitchenDashboardPage";
import KitchenOrdersPage from "../../pages/kitchen/KitchenOrdersPage";

export const kitchenRoutes = (
    <Route path="/app/kitchen" element={<KitchenLayout />}>
        <Route index element={<Navigate to="/app/kitchen/dashboard" replace />} />
        <Route path="dashboard" element={<KitchenDashboardPage />} />
        <Route path="orders" element={<KitchenOrdersPage />} />
    </Route>
);