import { Route } from "react-router-dom";

import AdminLayout from "../../layout/AdminLayout/AdminLayout";
import { RoleHomeRedirect, RoleRoute } from "../../auth/routeGuards";

import DashboardPage from "../../pages/Admin/DashboardPage/DashboardPage";
import MenuCategoriesAdminPage from "../../pages/Admin/MenuCategoriesAdminPage";
import MenuAdminPage from "../../pages/Admin/MenuAdminPage/MenuAdminPage";
import ProductSetupWizardPage from "../../pages/Admin/MenuAdminPage/ProductWizard/ProductSetupWizardPage";
import QrGeneratorPage from "../../pages/qrPage/QrGeneratorPage";
import WaiterDashboardPage from "../../pages/waiter/WaiterDashboard";
import KitchenDashboardPage from "../../pages/kitchen/KitchenDashboardPage";
import KitchenOrdersPage from "../../pages/kitchen/KitchenOrdersPage";
import RatingSettingsPage from "../../pages/rating/RatingSettingsPage";
import RestaurantRatingsPage from "../../pages/rating/RestaurantRatingsPage";
import ProductRatingsPage from "../../pages/rating/ProductRatingsPage";
import OrdersAdminPage from "../../pages/Admin/OrdersAdminPage";

const adminRoutes: React.ReactNode = (
    <Route path="/app" element={<AdminLayout />}>
        <Route index element={<RoleHomeRedirect />} />

        <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="admin/dashboard" element={<DashboardPage />} />
            <Route path="admin/orders" element={<OrdersAdminPage />} />
            <Route path="admin/menu-categories" element={<MenuCategoriesAdminPage />} />
            <Route path="admin/menu-products" element={<MenuAdminPage />} />
            <Route path="admin/menu-products/:productId/edit" element={<ProductSetupWizardPage />} />
            <Route path="admin/menu-products/create" element={<ProductSetupWizardPage />} />
            <Route
                path="tables-qr"
                element={<QrGeneratorPage />}
            />

            <Route
                path="rating-service"
                element={<RatingSettingsPage />}
            />

            <Route
                path="rating-service/restaurant-ratings"
                element={<RestaurantRatingsPage />}
            />

            <Route
                path="rating-service/product-ratings"
                element={<ProductRatingsPage />}
            />
        </Route>

        <Route element={<RoleRoute allowedRoles={["WAITER"]} />}>
            <Route path="waiter/dashboard" element={<WaiterDashboardPage />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={["KITCHEN"]} />}>
            <Route path="kitchen/dashboard" element={<KitchenDashboardPage />} />
            <Route path="kitchen/orders" element={<KitchenOrdersPage />} />
        </Route>
    </Route>
);

export default adminRoutes;