import { Routes, Route, Navigate } from "react-router-dom";
import QrGeneratorPage from "../../pages/qrPage/QrGeneratorPage";
import QrScanPage from "../../pages/qrPage/QrScanPage";
import { guestRoutes } from "../guest/guestRoutes";

function QrRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/qr-generator" replace />} />
      <Route path="/qr-generator" element={<QrGeneratorPage />} />
      <Route path="/qr/scan" element={<QrScanPage />} />
      {...guestRoutes}
    </Routes>
  );
}

export default QrRoutes;
