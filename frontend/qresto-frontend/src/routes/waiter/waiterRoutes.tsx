import { Route, Navigate } from "react-router-dom";

import WaiterLayout from "../../layout/WaiterLayout/WaiterLayout";
import WaiterDashboard from "../../pages/waiter/WaiterDashboard";

export const waiterRoutes = (
    <Route path="/app/waiter" element={<WaiterLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<WaiterDashboard />} />
        <Route path="tables" element={<WaiterDashboard />} />
        <Route path="orders" element={<WaiterDashboard />} />
        <Route path="calls" element={<WaiterDashboard />} />
        <Route path="payments" element={<WaiterDashboard />} />
    </Route>
);
