import { Route } from "react-router-dom";
import KitchenDashboardPage from "../../pages/kitchen/KitchenDashboardPage";

export const kitchenRoutes = (
    <>
        <Route path="/kitchen" element={<KitchenDashboardPage />} />
    </>
);