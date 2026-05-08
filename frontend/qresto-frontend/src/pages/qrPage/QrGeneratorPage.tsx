import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
    ArrowLeft,
    Edit3,
    Eye,
    Plus,
    Power,
    PowerOff,
    RefreshCw,
    Trash2,
} from "lucide-react";

import {
    activateTable,
    createTable,
    deactivateTable,
    deleteTable,
    generateQrCode,
    getTables,
    refreshTableSessions,
    updateTable,
} from "../../services/qrService";

import type {
    RestaurantTableResponse,
    TableQrCodeResponse,
    QrPreview,
} from "../../types/qr.types";

type ActiveView = "main" | "create" | "preview";
type TableFilter = "all" | "active" | "passive";

type ModalType =
    | "download"
    | "refresh"
    | "refreshSuccess"
    | "deactivate"
    | "activate"
    | "delete"
    | "edit"
    | null;

const QrGeneratorPage = () => {
    const [tables, setTables] = useState<RestaurantTableResponse[]>([]);
    const [selectedQr, setSelectedQr] = useState<QrPreview | null>(null);
    const [selectedTable, setSelectedTable] =
        useState<RestaurantTableResponse | null>(null);

    const [activeView, setActiveView] = useState<ActiveView>("main");
    const [tableFilter, setTableFilter] = useState<TableFilter>("all");
    const [modalType, setModalType] = useState<ModalType>(null);
    const [loading, setLoading] = useState(false);

    const [tableName, setTableName] = useState("");
    const [capacity, setCapacity] = useState("");

    const [editName, setEditName] = useState("");
    const [editCapacity, setEditCapacity] = useState("");

    const activeCount = tables.filter((table) => table.active).length;
    const passiveCount = tables.filter((table) => !table.active).length;

    const filteredTables = useMemo(() => {
        if (tableFilter === "active") {
            return tables.filter((table) => table.active);
        }

        if (tableFilter === "passive") {
            return tables.filter((table) => !table.active);
        }

        return tables;
    }, [tables, tableFilter]);

    const loadTables = async () => {
        const data = await getTables();
        setTables(data);
    };

    useEffect(() => {
        loadTables();

        const handleTablesUpdated = () => {
            loadTables();
        };

        const handleQrPageReset = () => {
            setActiveView("main");
            setTableFilter("all");
            setSelectedQr(null);
            setSelectedTable(null);
            setModalType(null);
            loadTables();
        };

        window.addEventListener("qresto-tables-updated", handleTablesUpdated);
        window.addEventListener("qresto-qr-page-reset", handleQrPageReset);

        return () => {
            window.removeEventListener("qresto-tables-updated", handleTablesUpdated);
            window.removeEventListener("qresto-qr-page-reset", handleQrPageReset);
        };
    }, []);

    const goMainPage = () => {
        setActiveView("main");
        setSelectedQr(null);
        setSelectedTable(null);
        setModalType(null);
    };

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
        if (!tableName.trim()) {
            alert("Masa adı zorunlu.");
            return;
        }

        setLoading(true);

        try {
            const newTable = await createTable({
                name: tableName.trim(),
                capacity: capacity ? Number(capacity) : undefined,
            });

            await generateQrCode(newTable.id);

            setTableName("");
            setCapacity("");

            await loadTables();
            setActiveView("main");
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
            setActiveView("preview");
        } catch (error) {
            console.error(error);
            alert("QR görüntülenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (table: RestaurantTableResponse) => {
        setSelectedTable(table);
        setEditName(table.name);
        setEditCapacity(table.capacity ? String(table.capacity) : "");
        setModalType("edit");
    };

    const openRefreshModal = (table: RestaurantTableResponse) => {
        setSelectedTable(table);
        setModalType("refresh");
    };

    const openDeleteModal = (table: RestaurantTableResponse) => {
        setSelectedTable(table);
        setModalType("delete");
    };

    const openTableStatusModal = (table: RestaurantTableResponse) => {
        setSelectedTable(table);
        setModalType(table.active ? "deactivate" : "activate");
    };

    const confirmEditTable = async () => {
        if (!selectedTable) return;

        if (!editName.trim()) {
            alert("Masa adı boş olamaz.");
            return;
        }

        setLoading(true);

        try {
            await updateTable(selectedTable.id, {
                name: editName.trim(),
                capacity: editCapacity ? Number(editCapacity) : undefined,
                active: selectedTable.active,
            });

            await loadTables();
            setModalType(null);
            setSelectedTable(null);
        } catch (error) {
            console.error(error);
            alert("Masa güncellenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteTable = async () => {
        if (!selectedTable) return;

        setLoading(true);

        try {
            await deleteTable(selectedTable.id);

            if (selectedQr?.table.id === selectedTable.id) {
                setSelectedQr(null);
                setActiveView("main");
            }

            await loadTables();
            setModalType(null);
            setSelectedTable(null);
        } catch (error) {
            console.error(error);
            alert("Masa silinemedi.");
        } finally {
            setLoading(false);
        }
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
            setSelectedTable(null);
        } catch (error) {
            console.error(error);
            alert("Masa durumu güncellenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const confirmRefreshTable = async () => {
        if (!selectedTable) return;

        setLoading(true);

        try {
            await refreshTableSessions(selectedTable.id);
            await loadTables();

            setModalType("refreshSuccess");
        } catch (error) {
            console.error(error);
            alert("Masa yenilenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const downloadQr = () => {
        if (!selectedQr) return;

        const safeName = selectedQr.table.name
            .toLowerCase()
            .trim()
            .replaceAll(" ", "-");

        const link = document.createElement("a");
        link.href = selectedQr.imageUrl;
        link.download = `qresto-${safeName}-qr.png`;
        link.click();

        setModalType(null);
    };

    const selectFilter = (filter: TableFilter) => {
        setTableFilter(filter);
        setActiveView("main");
    };

    const getModalTitle = () => {
        if (modalType === "download") return "QR indirilsin mi?";
        if (modalType === "refresh") return "Masa yenilensin mi?";
        if (modalType === "refreshSuccess") return "Masa yenilendi";
        if (modalType === "deactivate") return "Masa kullanıma kapatılsın mı?";
        if (modalType === "activate") return "Masa kullanıma açılsın mı?";
        if (modalType === "delete") return "Masa silinsin mi?";
        if (modalType === "edit") return "Masa bilgilerini düzenle";
        return "";
    };

    const getModalDescription = () => {
        if (modalType === "download") {
            return "Bu QR kod PNG olarak cihazınıza indirilecek.";
        }

        if (modalType === "refresh") {
            return "Bu işlem yeni QR oluşturmaz. Sadece bu masadaki aktif oturumları kapatır. Aynı QR tekrar okutulduğunda yeni masa oturumu başlar.";
        }

        if (modalType === "refreshSuccess") {
            return "Masa başarıyla yenilendi. Aktif masa oturumları kapatıldı. Müşteri aynı QR kodu tekrar okuttuğunda yeni oturum başlayacak.";
        }

        if (modalType === "deactivate") {
            return "Bu masa kullanıma kapatılacak. Kapalı masada QR okutulsa bile sipariş akışı başlatılamaz.";
        }

        if (modalType === "activate") {
            return "Bu masa tekrar kullanıma açılacak. QR kod okutulduğunda masa oturumu başlatılabilir.";
        }

        if (modalType === "delete") {
            return "Bu masa silinecek. Masaya bağlı QR kayıtları da silinir. Bu işlem geri alınamaz.";
        }

        return "";
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedTable(null);
    };

    return (
        <div className="min-h-screen text-[var(--qresto-text)] transition-colors duration-300">
            <div className="mx-auto w-full max-w-[1500px] space-y-8 px-4 pb-10 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-5">
                    {(activeView === "create" || activeView === "preview") && (
                        <button
                            type="button"
                            onClick={goMainPage}
                            className="flex w-fit items-center gap-2 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-5 py-3 font-bold text-[var(--qresto-text)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                        >
                            <ArrowLeft size={19} />
                            Geri
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={goMainPage}
                        className="w-fit text-left"
                    >
                        <h1 className="text-4xl font-black text-[var(--qresto-text)] transition-colors hover:text-[var(--qresto-primary)] lg:text-5xl">
                            Masalar & QR Kodlar
                        </h1>
                    </button>

                    <p className="max-w-4xl text-base leading-7 text-[var(--qresto-muted)]">
                        Masalarınızı yönetin, QR kodları önizleyin, masa oturumlarını yenileyin ve QR kodları PNG olarak indirin.
                    </p>
                </header>

                <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <button
                        type="button"
                        onClick={() => selectFilter("all")}
                        className={`rounded-3xl border p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 ${
                            tableFilter === "all"
                                ? "border-[var(--qresto-primary)] bg-[var(--qresto-hover)]"
                                : "border-[var(--qresto-border)] bg-[var(--qresto-surface)]"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-[var(--qresto-muted)]">
                                Toplam Masa
                            </p>
                            <span className="text-3xl">🪑</span>
                        </div>

                        <h2 className="mt-3 text-4xl font-black text-[var(--qresto-text)]">
                            {tables.length}
                        </h2>
                    </button>

                    <button
                        type="button"
                        onClick={() => selectFilter("active")}
                        className={`rounded-3xl border p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 ${
                            tableFilter === "active"
                                ? "border-emerald-400 bg-emerald-100 dark:bg-emerald-950/40"
                                : "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-emerald-700 dark:text-emerald-300">
                                Aktif Masa
                            </p>
                            <span className="text-3xl">🟢</span>
                        </div>

                        <h2 className="mt-3 text-4xl font-black text-emerald-800 dark:text-emerald-300">
                            {activeCount}
                        </h2>
                    </button>

                    <button
                        type="button"
                        onClick={() => selectFilter("passive")}
                        className={`rounded-3xl border p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 ${
                            tableFilter === "passive"
                                ? "border-slate-400 bg-slate-200 dark:bg-slate-800"
                                : "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-600 dark:text-slate-300">
                                Pasif Masa
                            </p>
                            <span className="text-3xl">⚪</span>
                        </div>

                        <h2 className="mt-3 text-4xl font-black text-slate-700 dark:text-slate-200">
                            {passiveCount}
                        </h2>
                    </button>
                </section>

                {activeView === "main" && (
                    <section className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-sm">
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-[var(--qresto-text)]">
                                    Masa Listesi
                                </h2>

                                <p className="mt-1 text-[var(--qresto-muted)]">
                                    {tableFilter === "all" && "Tüm masalar listeleniyor."}
                                    {tableFilter === "active" && "Sadece aktif masalar listeleniyor."}
                                    {tableFilter === "passive" && "Sadece pasif masalar listeleniyor."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveView("create")}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--qresto-primary)] px-6 py-3 font-bold text-white transition-all duration-200 hover:-translate-y-1"
                            >
                                <Plus size={19} />
                                Yeni Masa Ekle
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {filteredTables.map((table) => (
                                <div
                                    key={table.id}
                                    className={`rounded-3xl border p-5 transition-all duration-200 ${
                                        table.active
                                            ? "border-[var(--qresto-border)] bg-[var(--qresto-bg)]"
                                            : "border-slate-300 bg-slate-100 opacity-80 dark:border-slate-700 dark:bg-slate-800/60"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-[var(--qresto-text)]">
                                                {table.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-[var(--qresto-muted)]">
                                                Masa ID: {table.id}
                                            </p>

                                            <p className="mt-1 text-sm text-[var(--qresto-muted)]">
                                                Kapasite: {table.capacity ?? "-"}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-4 py-2 text-xs font-bold ${
                                                table.active
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                                            }`}
                                        >
                                            {table.active ? "Kullanıma Açık" : "Kullanıma Kapalı"}
                                        </span>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 gap-3">
                                        <button
                                            onClick={() => handleShowQr(table)}
                                            className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--qresto-primary)] py-3 font-bold text-white transition-all duration-200 hover:-translate-y-[2px] hover:opacity-90"
                                        >
                                            <Eye size={18} />
                                            QR Önizle
                                        </button>

                                        <button
                                            onClick={() => openRefreshModal(table)}
                                            className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--qresto-text)] py-3 font-bold text-[var(--qresto-surface)] transition-all duration-200 hover:-translate-y-[2px] hover:opacity-90"
                                        >
                                            <RefreshCw size={18} />
                                            Masayı Yenile
                                        </button>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => openEditModal(table)}
                                                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-100 py-3 font-bold text-blue-700 transition-all duration-200 hover:-translate-y-[2px] hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300"
                                            >
                                                <Edit3 size={17} />
                                                Düzenle
                                            </button>

                                            <button
                                                onClick={() => openDeleteModal(table)}
                                                className="flex items-center justify-center gap-2 rounded-2xl bg-red-100 py-3 font-bold text-red-700 transition-all duration-200 hover:-translate-y-[2px] hover:bg-red-200 dark:bg-red-950 dark:text-red-300"
                                            >
                                                <Trash2 size={17} />
                                                Sil
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => openTableStatusModal(table)}
                                            className={`flex items-center justify-center gap-2 rounded-2xl py-3 font-bold transition-all duration-200 hover:-translate-y-[2px] ${
                                                table.active
                                                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100"
                                                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                                            }`}
                                        >
                                            {table.active ? (
                                                <>
                                                    <PowerOff size={18} />
                                                    Masayı Kullanıma Kapat
                                                </>
                                            ) : (
                                                <>
                                                    <Power size={18} />
                                                    Masayı Kullanıma Aç
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {filteredTables.length === 0 && (
                                <div className="py-20 text-center sm:col-span-2 xl:col-span-3 2xl:col-span-4">
                                    <p className="font-medium text-[var(--qresto-muted)]">
                                        Bu filtreye uygun masa bulunamadı.
                                    </p>

                                    <button
                                        onClick={() => setActiveView("create")}
                                        className="mt-5 rounded-2xl bg-[var(--qresto-primary)] px-6 py-3 font-bold text-white"
                                    >
                                        Yeni Masa Oluştur
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeView === "create" && (
                    <section className="mx-auto max-w-3xl rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-8 shadow-sm">
                        <h2 className="text-center text-3xl font-black text-[var(--qresto-text)]">
                            Yeni Masa + QR Oluştur
                        </h2>

                        <p className="mb-8 mt-2 text-center text-[var(--qresto-muted)]">
                            Yeni masa oluşturulduktan sonra masaya özel QR kod otomatik hazırlanır.
                        </p>

                        <div className="space-y-5">
                            <label className="block">
                                <span className="mb-2 block text-sm font-bold text-[var(--qresto-text)]">
                                    Masa Adı
                                </span>
                                <input
                                    type="text"
                                    placeholder="Örn: Balkon 1, Bahçe Masa, VIP Masa"
                                    value={tableName}
                                    onChange={(e) => setTableName(e.target.value)}
                                    className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)]"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-bold text-[var(--qresto-text)]">
                                    Kapasite
                                </span>
                                <input
                                    type="number"
                                    placeholder="Örn: 4"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)]"
                                />
                            </label>

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

                {activeView === "preview" && (
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
                                    onClick={goMainPage}
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
                                        alt={`${selectedQr.table.name} QR`}
                                        className="h-80 w-80 rounded-2xl bg-white p-3"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-4xl font-black text-[var(--qresto-text)]">
                                        {selectedQr.table.name} QR Kodu
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
                    <div className="w-full max-w-md rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-7 shadow-2xl">
                        <h2 className="mb-3 text-2xl font-black text-[var(--qresto-text)]">
                            {getModalTitle()}
                        </h2>

                        {modalType === "edit" ? (
                            <div className="space-y-5">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-bold text-[var(--qresto-text)]">
                                        Masa Adı
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Örn: Balkon 1"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)]"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-bold text-[var(--qresto-text)]">
                                        Kapasite
                                    </span>
                                    <input
                                        type="number"
                                        placeholder="Örn: 4"
                                        value={editCapacity}
                                        onChange={(e) => setEditCapacity(e.target.value)}
                                        className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)]"
                                    />
                                </label>
                            </div>
                        ) : (
                            <p className="mb-6 text-[var(--qresto-muted)]">
                                {getModalDescription()}
                            </p>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 rounded-2xl bg-[var(--qresto-bg)] py-3 font-bold text-[var(--qresto-text)]"
                            >
                                {modalType === "refreshSuccess" ? "Kapat" : "Vazgeç"}
                            </button>

                            {modalType !== "refreshSuccess" && (
                                <button
                                    disabled={loading}
                                    onClick={
                                        modalType === "download"
                                            ? downloadQr
                                            : modalType === "refresh"
                                                ? confirmRefreshTable
                                                : modalType === "delete"
                                                    ? confirmDeleteTable
                                                    : modalType === "edit"
                                                        ? confirmEditTable
                                                        : confirmTableStatusChange
                                    }
                                    className="flex-1 rounded-2xl bg-[var(--qresto-primary)] py-3 font-bold text-white disabled:opacity-60"
                                >
                                    {loading ? "İşleniyor..." : "Onayla"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QrGeneratorPage;