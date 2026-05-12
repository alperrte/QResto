import { Route } from "react-router-dom";

import AdminLayout from "../../layout/AdminLayout/AdminLayout";
import { RoleHomeRedirect, RoleRoute } from "../../auth/routeGuards";

import DashboardPage from "../../pages/Admin/DashboardPage";
import MenuCategoriesAdminPage from "../../pages/Admin/MenuCategoriesAdminPage";
import MenuAdminPage from "../../pages/Admin/MenuAdminPage/MenuAdminPage";
import ProductSetupWizardPage from "../../pages/Admin/MenuAdminPage/ProductWizard/ProductSetupWizardPage";
import QrGeneratorPage from "../../pages/qrPage/QrGeneratorPage";
import WaiterDashboardPage from "../../pages/waiter/WaiterDashboardPage";
import KitchenDashboardPage from "../../pages/kitchen/KitchenDashboardPage";

const adminRoutes: React.ReactNode = (
    <Route path="/app" element={<AdminLayout />}>
        <Route index element={<RoleHomeRedirect />} />

        <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="admin/dashboard" element={<DashboardPage />} />
            <Route path="admin/menu-categories" element={<MenuCategoriesAdminPage />} />
            <Route path="admin/menu-products" element={<MenuAdminPage />} />
            <Route path="admin/menu-products/:productId/edit" element={<ProductSetupWizardPage />} />
            <Route path="admin/menu-products/create" element={<ProductSetupWizardPage />} />
            <Route
                path="tables-qr"
                element={<QrGeneratorPage />}
            />
        </Route>

        <Route element={<RoleRoute allowedRoles={["WAITER"]} />}>
            <Route path="waiter/dashboard" element={<WaiterDashboardPage />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={["KITCHEN"]} />}>
            <Route path="kitchen/dashboard" element={<KitchenDashboardPage />} />
        </Route>
    </Route>
);

export default adminRoutes;