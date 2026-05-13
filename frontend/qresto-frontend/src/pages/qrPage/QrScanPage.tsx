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
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const qrToken = searchParams.get("token");
    /** Aynı token için başarılı taramayı tekrarlamayı önler; token değişince yeni QR mutlaka işlenir. */
    const lastSuccessfulScanTokenRef = useRef<string | null>(null);

    useEffect(() => {
        if (!qrToken) {
            alert("QR geçersiz");
            return;
        }

        if (lastSuccessfulScanTokenRef.current === qrToken) {
            return;
        }

        let cancelled = false;

        const handleScan = async () => {
            try {
                const clearGuestFlowKeys = (storage: Storage) => {
                    storage.removeItem("tableId");
                    storage.removeItem("tableNo");
                    storage.removeItem("tableName");
                    storage.removeItem("tableSessionId");
                    storage.removeItem("guestSessionId");
                    storage.removeItem("qresto_table_id");
                    storage.removeItem("qresto_table_no");
                    storage.removeItem("qresto_table_name");
                    storage.removeItem("qresto_table_session_id");
                    storage.removeItem("qresto_guest_session_id");
                    storage.removeItem("qresto_cart_id");
                };

                clearGuestFlowKeys(sessionStorage);
                clearGuestFlowKeys(localStorage);

                const deviceToken = generateDeviceToken();
                const data = await scanQr(qrToken, deviceToken);

                if (cancelled) {
                    return;
                }

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

                lastSuccessfulScanTokenRef.current = qrToken;
                navigate("/welcome");
            } catch (err) {
                console.error(err);
                alert("QR okunamadı");
            }
        };

        void handleScan();

        return () => {
            cancelled = true;
        };
    }, [qrToken, navigate]);

    return (
        <div className="h-screen flex items-center justify-center bg-[#1F1713] text-white">
            <p className="text-lg">QR okunuyor...</p>
        </div>
    );
};

export default QrScanPage;