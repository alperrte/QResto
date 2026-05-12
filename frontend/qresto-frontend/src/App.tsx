import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import adminRoutes from "./routes/admin/adminRoutes";
import { guestRoutes } from "./routes/guest/guestRoutes";
import { waiterRoutes } from "./routes/waiter/waiterRoutes";
import { RoleRoute, getRoleHomePath } from "./auth/routeGuards";

import { useAuth } from "./auth/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import QrGeneratorPage from "./pages/qrPage/QrGeneratorPage";
import QrScanPage from "./pages/qrPage/QrScanPage";


function App() {
    const { isAuthenticated, user } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated && user ? (
                            <Navigate to={getRoleHomePath(user.role)} replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                <Route path="/login" element={<LoginPage />} />
                <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                    <Route path="/qr-generator" element={<QrGeneratorPage />} />
                </Route>
                <Route path="/qr/scan" element={<QrScanPage />} />

                {guestRoutes}

                <Route element={<RoleRoute allowedRoles={["WAITER", "ADMIN"]} />}>
                    {waiterRoutes}
                </Route>

                {adminRoutes}


            </Routes>
        </BrowserRouter>
    );
}

export default App;