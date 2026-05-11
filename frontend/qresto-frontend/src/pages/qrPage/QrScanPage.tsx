import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { scanQr } from "../../services/qrService";

const generateDeviceToken = () => {
    let token = sessionStorage.getItem("deviceToken");

    if (!token) {
        token = crypto.randomUUID();
        sessionStorage.setItem("deviceToken", token);
    }

    return token;
};

const QrScanPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const didScanRef = useRef(false);

    useEffect(() => {
        if (didScanRef.current) return;
        didScanRef.current = true;

        const token = params.get("token");

        if (!token) {
            alert("QR geçersiz");
            return;
        }

        const handleScan = async () => {
            try {
                sessionStorage.removeItem("tableId");
                sessionStorage.removeItem("tableNo");
                sessionStorage.removeItem("tableName");
                sessionStorage.removeItem("tableSessionId");
                sessionStorage.removeItem("guestSessionId");

                sessionStorage.removeItem("qresto_table_id");
                sessionStorage.removeItem("qresto_table_no");
                sessionStorage.removeItem("qresto_table_name");
                sessionStorage.removeItem("qresto_table_session_id");
                sessionStorage.removeItem("qresto_guest_session_id");
                sessionStorage.removeItem("qresto_cart_id");

                const deviceToken = generateDeviceToken();
                const data = await scanQr(token, deviceToken);

                sessionStorage.setItem("tableId", String(data.table.id));
                sessionStorage.setItem("tableNo", String(data.table.tableNo));
                sessionStorage.setItem("tableName", data.table.name);

                sessionStorage.setItem("tableSessionId", String(data.tableSession.id));
                sessionStorage.setItem("guestSessionId", String(data.guestSession.id));

                sessionStorage.setItem("qresto_table_id", String(data.table.id));
                sessionStorage.setItem("qresto_table_no", String(data.table.tableNo));
                sessionStorage.setItem("qresto_table_name", data.table.name);

                sessionStorage.setItem(
                    "qresto_table_session_id",
                    String(data.tableSession.id)
                );

                sessionStorage.setItem(
                    "qresto_guest_session_id",
                    String(data.guestSession.id)
                );

                console.log("SCAN OK:", {
                    tableId: data.table.id,
                    tableNo: data.table.tableNo,
                    tableName: data.table.name,
                    tableSessionId: data.tableSession.id,
                    guestSessionId: data.guestSession.id,
                });

                navigate("/welcome");
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