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
        <div className="text-[var(--qresto-text)] transition-colors duration-300">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-[var(--qresto-text)] lg:text-5xl">
                            Masalar & QR Kodlar
                        </h1>

                        <p className="mt-3 text-base text-[var(--qresto-muted)]">
                            Masalarınızı yönetin, QR kodları önizleyin, yenileyin ve PNG olarak indirin.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-5 py-3 shadow-sm">
                        <span className="font-bold text-emerald-600">
                            ● QR Sistemi Aktif
                        </span>
                    </div>
                </header>

                <section className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-[var(--qresto-muted)]">
                                Toplam Masa
                            </p>
                            <span className="text-3xl">🍽️</span>
                        </div>

                        <h2 className="mt-2 text-4xl font-black text-[var(--qresto-text)]">
                            {tables.length}
                        </h2>
                    </div>

                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-emerald-800">
                                Aktif Masa
                            </p>
                            <span className="text-3xl">✅</span>
                        </div>

                        <h2 className="mt-2 text-4xl font-black text-emerald-800">
                            {tables.filter((table) => table.active).length}
                        </h2>
                    </div>

                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-red-800">
                                Pasif Masa
                            </p>
                            <span className="text-3xl">⛔</span>
                        </div>

                        <h2 className="mt-2 text-4xl font-black text-red-800">
                            {tables.filter((table) => !table.active).length}
                        </h2>
                    </div>
                </section>

                <section className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-3 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <button
                            onClick={() => setActiveTab("tables")}
                            className={`rounded-2xl py-4 font-bold transition-all duration-200 ${
                                activeTab === "tables"
                                    ? "bg-gradient-to-r from-[#FF3D00] to-[#FF7A00] text-white shadow-md shadow-orange-200"
                                    : "bg-[var(--qresto-bg)] text-[var(--qresto-text)] hover:text-[var(--qresto-primary)]"
                            }`}
                        >
                            Masalar
                        </button>

                        <button
                            onClick={() => setActiveTab("create")}
                            className={`rounded-2xl py-4 font-bold transition-all duration-200 ${
                                activeTab === "create"
                                    ? "bg-gradient-to-r from-[#FF3D00] to-[#FF7A00] text-white shadow-md shadow-orange-200"
                                    : "bg-[var(--qresto-bg)] text-[var(--qresto-text)] hover:text-[var(--qresto-primary)]"
                            }`}
                        >
                            Yeni Masa + QR
                        </button>
                    </div>
                </section>

                {activeTab === "tables" && (
                    <section className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-sm">
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-[var(--qresto-text)]">
                                    Masa Listesi
                                </h2>

                                <p className="mt-1 text-[var(--qresto-muted)]">
                                    Masaların QR kodlarını önizleyebilir veya yenileyebilirsiniz.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {tables.map((table) => (
                                <div
                                    key={table.id}
                                    className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-[var(--qresto-text)]">
                                                Masa {table.tableNo}
                                            </h3>

                                            <p className="mt-1 font-medium text-[var(--qresto-muted)]">
                                                {table.name}
                                            </p>

                                            <p className="mt-1 text-sm text-[var(--qresto-muted)]">
                                                Kapasite: {table.capacity ?? "-"}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-4 py-2 text-xs font-bold ${
                                                table.active
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {table.active ? "Aktif" : "Pasif"}
                                        </span>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <button
                                            onClick={() => handleShowQr(table)}
                                            className="rounded-2xl bg-[var(--qresto-primary)] py-3 font-bold text-white transition-all duration-200 hover:-translate-y-[2px] hover:opacity-90"
                                        >
                                            QR Önizle
                                        </button>

                                        <button
                                            onClick={() => openRegenerateModal(table)}
                                            className="rounded-2xl bg-[var(--qresto-text)] py-3 font-bold text-[var(--qresto-surface)] transition-all duration-200 hover:-translate-y-[2px] hover:opacity-90"
                                        >
                                            Yenile
                                        </button>

                                        <button
                                            onClick={() => openTableStatusModal(table)}
                                            className={`rounded-2xl py-3 font-bold transition-all duration-200 hover:-translate-y-[2px] ${
                                                table.active
                                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                            }`}
                                        >
                                            {table.active ? "Pasife Al" : "Aktif Et"}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {tables.length === 0 && (
                                <div className="py-20 text-center xl:col-span-3">
                                    <p className="font-medium text-[var(--qresto-muted)]">
                                        Henüz masa oluşturulmadı.
                                    </p>

                                    <button
                                        onClick={() => setActiveTab("create")}
                                        className="mt-5 rounded-2xl bg-[var(--qresto-primary)] px-6 py-3 font-bold text-white"
                                    >
                                        İlk Masayı Oluştur
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === "create" && (
                    <section className="mx-auto max-w-2xl rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-8 shadow-sm">
                        <h2 className="text-center text-3xl font-black text-[var(--qresto-text)]">
                            Yeni Masa + QR Oluştur
                        </h2>

                        <p className="mb-6 mt-2 text-center text-[var(--qresto-muted)]">
                            Yeni masa oluşturulduktan sonra masaya özel QR kod otomatik hazırlanır.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="number"
                                placeholder="Masa No"
                                value={tableNo}
                                onChange={(e) => setTableNo(e.target.value)}
                                className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)]"
                            />

                            <input
                                type="text"
                                placeholder="Masa Adı"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)]"
                            />

                            <input
                                type="number"
                                placeholder="Kapasite"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)]"
                            />

                            <button
                                onClick={handleCreateTable}
                                disabled={loading}
                                className="w-full rounded-2xl bg-gradient-to-r from-[#FF3D00] to-[#FF7A00] py-4 font-bold text-white disabled:opacity-60"
                            >
                                {loading ? "Oluşturuluyor..." : "Masa + QR Oluştur"}
                            </button>
                        </div>
                    </section>
                )}

                {activeTab === "preview" && (
                    <section className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-sm">
                        {!selectedQr ? (
                            <div className="py-20 text-center">
                                <h2 className="text-3xl font-black text-[var(--qresto-text)]">
                                    QR Önizleme
                                </h2>

                                <p className="mt-2 text-[var(--qresto-muted)]">
                                    Bir masanın QR kodunu önizlemek için masa listesinden QR Önizle butonuna basın.
                                </p>

                                <button
                                    onClick={() => setActiveTab("tables")}
                                    className="mt-6 rounded-2xl bg-[var(--qresto-primary)] px-6 py-3 font-bold text-white"
                                >
                                    Masa Listesine Git
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                                <div className="flex justify-center rounded-3xl bg-[var(--qresto-bg)] p-6">
                                    <img
                                        src={selectedQr.imageUrl}
                                        alt={`Masa ${selectedQr.table.tableNo} QR`}
                                        className="h-80 w-80 rounded-2xl bg-white p-3"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-4xl font-black text-[var(--qresto-text)]">
                                        Masa {selectedQr.table.tableNo} QR Kodu
                                    </h2>

                                    <p className="mt-3 text-[var(--qresto-muted)]">
                                        Bu QR kod masaya özel oluşturulmuştur. Restoran bu PNG dosyasını masaya yerleştirebilir.
                                    </p>

                                    <div className="mt-5 break-all rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4 text-sm text-[var(--qresto-text)]">
                                        {selectedQr.qr.qrContent}
                                    </div>

                                    <p className="mt-4 text-sm text-[var(--qresto-muted)]">
                                        QR Versiyon: {selectedQr.qr.versionNo}
                                    </p>

                                    <button
                                        onClick={() => setModalType("download")}
                                        className="mt-6 rounded-2xl bg-gradient-to-r from-[#FF3D00] to-[#FF7A00] px-8 py-4 font-bold text-white"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-[var(--qresto-surface)] p-7 shadow-2xl">
                        <h2 className="mb-3 text-2xl font-black text-[var(--qresto-text)]">
                            {modalType === "download"
                                ? "QR indirilsin mi?"
                                : modalType === "regenerate"
                                    ? "QR yenilensin mi?"
                                    : modalType === "deactivate"
                                        ? "Masa pasife alınsın mı?"
                                        : "Masa aktif edilsin mi?"}
                        </h2>

                        <p className="mb-6 text-[var(--qresto-muted)]">
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
                                className="flex-1 rounded-2xl bg-[var(--qresto-bg)] py-3 font-bold text-[var(--qresto-text)]"
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
                                className="flex-1 rounded-2xl bg-[var(--qresto-primary)] py-3 font-bold text-white"
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