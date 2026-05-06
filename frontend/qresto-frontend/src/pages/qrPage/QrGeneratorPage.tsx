import { useEffect, useState } from "react";
import QRCode from "qrcode";

import {
    activateTable,
    createTable,
    deactivateTable,
    generateQrCode,
    getTables,
    regenerateQrCode,
} from "../../services/qrService";

import type {
    RestaurantTableResponse,
    TableQrCodeResponse,
    QrPreview,
} from "../../types/qr.types";

type ModalType = "download" | "regenerate" | "deactivate" | "activate" | null;
type ActiveTab = "tables" | "create" | "preview";

const QrGeneratorPage = () => {
    const [tables, setTables] = useState<RestaurantTableResponse[]>([]);
    const [selectedQr, setSelectedQr] = useState<QrPreview | null>(null);
    const [selectedTable, setSelectedTable] = useState<RestaurantTableResponse | null>(null);

    const [activeTab, setActiveTab] = useState<ActiveTab>("tables");
    const [modalType, setModalType] = useState<ModalType>(null);
    const [loading, setLoading] = useState(false);

    const [tableNo, setTableNo] = useState("");
    const [tableName, setTableName] = useState("");
    const [capacity, setCapacity] = useState("");

    const loadTables = async () => {
        const data = await getTables();
        setTables(data);
    };

    useEffect(() => {
        loadTables();
    }, []);

    const createQrImage = async (
        table: RestaurantTableResponse,
        qr: TableQrCodeResponse
    ) => {
        const imageUrl = await QRCode.toDataURL(qr.qrContent, {
            width: 420,
            margin: 2,
        });

        setSelectedQr({ table, qr, imageUrl });
    };

    const handleCreateTable = async () => {
        if (!tableNo || !tableName) {
            alert("Masa no ve masa adı zorunlu.");
            return;
        }

        setLoading(true);

        try {
            const newTable = await createTable({
                tableNo: Number(tableNo),
                name: tableName,
                capacity: capacity ? Number(capacity) : undefined,
            });

            const qr = await generateQrCode(newTable.id);
            await createQrImage(newTable, qr);

            setTableNo("");
            setTableName("");
            setCapacity("");

            await loadTables();

            setActiveTab("preview");
        } catch (error) {
            console.error(error);
            alert("Masa veya QR oluşturulamadı.");
        } finally {
            setLoading(false);
        }
    };

    const handleShowQr = async (table: RestaurantTableResponse) => {
        setLoading(true);

        try {
            const qr = await generateQrCode(table.id);
            await createQrImage(table, qr);
            setActiveTab("preview");
        } catch (error) {
            console.error(error);
            alert("QR görüntülenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const openRegenerateModal = (table: RestaurantTableResponse) => {
        setSelectedTable(table);
        setModalType("regenerate");
    };

    const openTableStatusModal = (table: RestaurantTableResponse) => {
        setSelectedTable(table);
        setModalType(table.active ? "deactivate" : "activate");
    };

    const confirmTableStatusChange = async () => {
        if (!selectedTable) return;

        setLoading(true);

        try {
            if (selectedTable.active) {
                await deactivateTable(selectedTable.id);
            } else {
                await activateTable(selectedTable.id);
            }

            await loadTables();
            setModalType(null);
        } catch (error) {
            console.error(error);
            alert("Masa durumu güncellenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const confirmRegenerateQr = async () => {
        if (!selectedTable) return;

        setLoading(true);

        try {
            const qr = await regenerateQrCode(selectedTable.id);
            await createQrImage(selectedTable, qr);
            setActiveTab("preview");
            setModalType(null);
        } catch (error) {
            console.error(error);
            alert("QR yenilenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const downloadQr = () => {
        if (!selectedQr) return;

        const link = document.createElement("a");
        link.href = selectedQr.imageUrl;
        link.download = `qresto-masa-${selectedQr.table.tableNo}-qr.png`;
        link.click();

        setModalType(null);
    };

    return (
        <div className="min-h-screen bg-[#F7F3EE] text-[#1F1713] p-6 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black !text-[#24140D]">
                            Masalar & QR Kodlar
                        </h1>
                        <p className="text-[#6B5A4F] mt-3 text-base">
                            Masalarınızı yönetin, QR kodları önizleyin, yenileyin ve PNG olarak indirin.
                        </p>
                    </div>

                    <div className="bg-white border border-[#F1D8C2] rounded-2xl px-5 py-3 shadow-sm">
                        <span className="text-green-700 font-bold">● QR Sistemi Aktif</span>
                    </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                    <div className="bg-white rounded-3xl p-6 border border-[#F1D8C2] shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-[#7B6A5F] font-bold">Toplam Masa</p>
                            <span className="text-3xl">🍽️</span>
                        </div>
                        <h2 className="text-4xl font-black !text-[#24140D] mt-2">
                            {tables.length}
                        </h2>
                    </div>

                    <div className="bg-green-50 rounded-3xl p-6 border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-green-800 font-bold">Aktif Masa</p>
                            <span className="text-3xl">✅</span>
                        </div>
                        <h2 className="text-4xl font-black !text-green-800 mt-2">
                            {tables.filter((table) => table.active).length}
                        </h2>
                    </div>

                    <div className="bg-red-50 rounded-3xl p-6 border border-red-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-red-800 font-bold">Pasif Masa</p>
                            <span className="text-3xl">⛔</span>
                        </div>
                        <h2 className="text-4xl font-black !text-red-800 mt-2">
                            {tables.filter((table) => !table.active).length}
                        </h2>
                    </div>
                </section>

                <section className="bg-white rounded-3xl border border-[#F1D8C2] shadow-sm p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            onClick={() => setActiveTab("tables")}
                            className={`rounded-2xl py-4 font-bold transition ${
                                activeTab === "tables"
                                    ? "bg-gradient-to-r from-[#FF3D00] to-[#FF7A00] text-white"
                                    : "bg-[#FFF6EC] text-[#3B2418]"
                            }`}
                        >
                            Masalar
                        </button>

                        <button
                            onClick={() => setActiveTab("create")}
                            className={`rounded-2xl py-4 font-bold transition ${
                                activeTab === "create"
                                    ? "bg-gradient-to-r from-[#FF3D00] to-[#FF7A00] text-white"
                                    : "bg-[#FFF6EC] text-[#3B2418]"
                            }`}
                        >
                            Yeni Masa + QR
                        </button>
                    </div>
                </section>

                {activeTab === "tables" && (
                    <section className="bg-white rounded-3xl p-6 border border-[#F1D8C2] shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-3xl font-black text-[#24140D]">
                                    Masa Listesi
                                </h2>
                                <p className="text-[#7B6A5F] mt-1">
                                    Masaların QR kodlarını önizleyebilir veya yenileyebilirsiniz.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {tables.map((table) => (
                                <div
                                    key={table.id}
                                    className="bg-[#FFF6EC] rounded-3xl p-5 border border-[#F1D8C2]"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-[#24140D]">
                                                Masa {table.tableNo}
                                            </h3>
                                            <p className="text-[#5F5149] mt-1 font-medium">
                                                {table.name}
                                            </p>
                                            <p className="text-sm text-[#7B6A5F] mt-1">
                                                Kapasite: {table.capacity ?? "-"}
                                            </p>
                                        </div>

                                        <span
                                            className={`text-xs px-4 py-2 rounded-full font-bold ${
                                                table.active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {table.active ? "Aktif" : "Pasif"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                                        <button
                                            onClick={() => handleShowQr(table)}
                                            className="bg-[#FF6A00] text-white font-bold rounded-2xl py-3"
                                        >
                                            QR Önizle
                                        </button>

                                        <button
                                            onClick={() => openRegenerateModal(table)}
                                            className="bg-[#3B2418] text-white font-bold rounded-2xl py-3"
                                        >
                                            Yenile
                                        </button>

                                        <button
                                            onClick={() => openTableStatusModal(table)}
                                            className={`font-bold rounded-2xl py-3 ${
                                                table.active
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-green-100 text-green-700"
                                            }`}
                                        >
                                            {table.active ? "Pasife Al" : "Aktif Et"}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {tables.length === 0 && (
                                <div className="xl:col-span-3 text-center py-20">
                                    <p className="text-[#7B6A5F] font-medium">
                                        Henüz masa oluşturulmadı.
                                    </p>

                                    <button
                                        onClick={() => setActiveTab("create")}
                                        className="mt-5 bg-[#FF6A00] text-white font-bold rounded-2xl px-6 py-3"
                                    >
                                        İlk Masayı Oluştur
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === "create" && (
                    <section className="bg-white rounded-3xl p-8 border border-[#F1D8C2] shadow-sm max-w-2xl mx-auto">
                        <h2 className="text-3xl font-black !text-[#24140D] text-center">
                            Yeni Masa + QR Oluştur
                        </h2>
                        <p className="text-[#7B6A5F] mt-2 mb-6 text-center">
                            Yeni masa oluşturulduktan sonra masaya özel QR kod otomatik hazırlanır.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="number"
                                placeholder="Masa No"
                                value={tableNo}
                                onChange={(e) => setTableNo(e.target.value)}
                                className="w-full bg-[#FFF6EC] border border-[#F1D8C2] text-[#24140D] rounded-2xl px-5 py-4 outline-none placeholder:text-[#A38F81]"
                            />

                            <input
                                type="text"
                                placeholder="Masa Adı"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                className="w-full bg-[#FFF6EC] border border-[#F1D8C2] text-[#24140D] rounded-2xl px-5 py-4 outline-none placeholder:text-[#A38F81]"
                            />

                            <input
                                type="number"
                                placeholder="Kapasite"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                className="w-full bg-[#FFF6EC] border border-[#F1D8C2] text-[#24140D] rounded-2xl px-5 py-4 outline-none placeholder:text-[#A38F81]"
                            />

                            <button
                                onClick={handleCreateTable}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#FF3D00] to-[#FF7A00] text-white font-bold rounded-2xl py-4 disabled:opacity-60"
                            >
                                {loading ? "Oluşturuluyor..." : "Masa + QR Oluştur"}
                            </button>
                        </div>
                    </section>
                )}

                {activeTab === "preview" && (
                    <section className="bg-white rounded-3xl p-6 border border-[#F1D8C2] shadow-sm">
                        {!selectedQr ? (
                            <div className="text-center py-20">
                                <h2 className="text-3xl font-black text-[#24140D]">
                                    QR Önizleme
                                </h2>
                                <p className="text-[#7B6A5F] mt-2">
                                    Bir masanın QR kodunu önizlemek için masa listesinden QR Önizle butonuna basın.
                                </p>

                                <button
                                    onClick={() => setActiveTab("tables")}
                                    className="mt-6 bg-[#FF6A00] text-white font-bold rounded-2xl px-6 py-3"
                                >
                                    Masa Listesine Git
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div className="bg-[#FFF6EC] rounded-3xl p-6 flex justify-center">
                                    <img
                                        src={selectedQr.imageUrl}
                                        alt={`Masa ${selectedQr.table.tableNo} QR`}
                                        className="w-80 h-80 bg-white rounded-2xl p-3"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-4xl font-black text-[#24140D]">
                                        Masa {selectedQr.table.tableNo} QR Kodu
                                    </h2>

                                    <p className="text-[#7B6A5F] mt-3">
                                        Bu QR kod masaya özel oluşturulmuştur. Restoran bu PNG dosyasını masaya yerleştirebilir.
                                    </p>

                                    <div className="bg-[#FFF6EC] rounded-2xl p-4 mt-5 break-all text-sm text-[#3B2418] border border-[#F1D8C2]">
                                        {selectedQr.qr.qrContent}
                                    </div>

                                    <p className="mt-4 text-sm text-[#7B6A5F]">
                                        QR Versiyon: {selectedQr.qr.versionNo}
                                    </p>

                                    <button
                                        onClick={() => setModalType("download")}
                                        className="mt-6 bg-gradient-to-r from-[#FF3D00] to-[#FF7A00] text-white font-bold rounded-2xl px-8 py-4"
                                    >
                                        PNG Olarak İndir
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </div>

            {modalType && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-black text-[#24140D] mb-3">
                            {modalType === "download"
                                ? "QR indirilsin mi?"
                                : modalType === "regenerate"
                                    ? "QR yenilensin mi?"
                                    : modalType === "deactivate"
                                        ? "Masa pasife alınsın mı?"
                                        : "Masa aktif edilsin mi?"}
                        </h2>

                        <p className="text-[#7B6A5F] mb-6">
                            {modalType === "download"
                                ? "Bu QR kod PNG olarak cihazınıza indirilecek."
                                : modalType === "regenerate"
                                    ? "Mevcut QR pasifleştirilecek ve masa için yeni QR oluşturulacak."
                                    : modalType === "deactivate"
                                        ? "Bu masa pasife alınacak. Pasif masaya ait QR kullanılamaz."
                                        : "Bu masa tekrar aktif hale getirilecek."}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setModalType(null)}
                                className="flex-1 bg-gray-100 rounded-2xl py-3 font-bold text-[#3B2418]"
                            >
                                Vazgeç
                            </button>

                            <button
                                onClick={
                                    modalType === "download"
                                        ? downloadQr
                                        : modalType === "regenerate"
                                            ? confirmRegenerateQr
                                            : confirmTableStatusChange
                                }
                                className="flex-1 bg-[#FF6A00] text-white rounded-2xl py-3 font-bold"
                            >
                                Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QrGeneratorPage;