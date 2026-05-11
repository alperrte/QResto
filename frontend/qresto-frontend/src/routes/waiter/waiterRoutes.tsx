import { Route } from "react-router-dom";

import WaiterLayout from "../../layout/WaiterLayout/WaiterLayout";
import WaiterDashboard from "../../pages/waiter/WaiterDashboard";

export const waiterRoutes = (
    <Route element={<WaiterLayout />}>
        <Route path="/app/waiter/dashboard" element={<WaiterDashboard />} />
    </Route>
);