import { Route } from "react-router-dom";

import AdminLayout from "../../layout/AdminLayout/AdminLayout";

import DashboardPage from "../../pages/Admin/DashboardPage";
import QrGeneratorPage from "../../pages/qrPage/QrGeneratorPage";

const adminRoutes: React.ReactNode = (
    <Route path="/app" element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />

        <Route
            path="tables-qr"
            element={<QrGeneratorPage />}
        />
    </Route>
);

export default adminRoutes;