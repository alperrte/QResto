import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import QrRoutes from "./routes/qr/qrRoutes";
import adminRoutes from "./routes/admin/adminRoutes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/app/dashboard" />}
                />

                {adminRoutes}
            </Routes>

            <QrRoutes />
        </BrowserRouter>
    );
}

export default App;