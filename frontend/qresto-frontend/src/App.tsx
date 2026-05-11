import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import adminRoutes from "./routes/admin/adminRoutes";
import { ProtectedRoute, getRoleHomePath } from "./auth/routeGuards";
import { useAuth } from "./auth/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import QrGeneratorPage from "./pages/qrPage/QrGeneratorPage";
import QrScanPage from "./pages/qrPage/QrScanPage";
import { guestRoutes } from "./routes/guest/guestRoutes";

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
                <Route path="/qr-generator" element={<QrGeneratorPage />} />
                <Route path="/qr/scan" element={<QrScanPage />} />
                {guestRoutes}

                <Route element={<ProtectedRoute />}>
                    {adminRoutes}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;