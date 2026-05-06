import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { scanQr } from "../../services/qrService";

const generateDeviceToken = () => {
    let token = localStorage.getItem("deviceToken");

    if (!token) {
        token = crypto.randomUUID();
        localStorage.setItem("deviceToken", token);
    }

    return token;
};

const QrScanPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = params.get("token");

        if (!token) {
            alert("QR geçersiz");
            return;
        }

        const handleScan = async () => {
            try {
                const deviceToken = generateDeviceToken();
                const data = await scanQr(token, deviceToken);

                localStorage.setItem("tableId", String(data.table.id));
                localStorage.setItem("tableNo", String(data.table.tableNo));
                localStorage.setItem("tableName", data.table.name);

                localStorage.setItem("tableSessionId", String(data.tableSession.id));
                localStorage.setItem("guestSessionId", String(data.guestSession.id));

                console.log("SCAN OK:", data);

                navigate("/menu");
            } catch (err) {
                console.error(err);
                alert("QR okunamadı");
            }
        };

        handleScan();
    }, [params, navigate]);

    return (
        <div className="h-screen flex items-center justify-center bg-[#1F1713] text-white">
            <p className="text-lg">QR okunuyor...</p>
        </div>
    );
};

export default QrScanPage;