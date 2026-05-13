import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import {
    ArrowLeft,
    Table2,
    Check,
    CheckCircle2,
    ChevronDown,
    Copy,
    Download,
    Edit3,
    Eye,
    MoreHorizontal,
    PauseCircle,
    Plus,
    Power,
    PowerOff,
    RefreshCw,
    Search,
    Trash2,
    Users,
} from "lucide-react";

import {
    activateTable,
    createTable,
    deactivateTable,
    deleteTable,
    generateQrCode,
    getActiveSessionByTable,
    getTables,
    refreshTableSessions,
    updateTable,
} from "../../services/qrService";

import type {
    RestaurantTableResponse,
    TableQrCodeResponse,
    QrPreview,
    TableSessionResponse,
} from "../../types/qr.types";

type ActiveView = "main" | "create" | "preview";
type TableFilter = "all" | "active" | "passive";
type SortType = "name-asc" | "name-desc" | "capacity-asc" | "capacity-desc";

type ModalType =
    | "download"
    | "refresh"
    | "refreshSuccess"
    | "refreshAll"
    | "refreshAllSuccess"
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

    const [searchText, setSearchText] = useState("");
    const [sortType, setSortType] = useState<SortType>("name-asc");

    const [cardQrImages, setCardQrImages] = useState<Record<number, string>>({});
    const [activeSessions, setActiveSessions] = useState<
        Record<number, TableSessionResponse | null>
    >({});

    const [openMenuTableId, setOpenMenuTableId] = useState<number | null>(null);
    const [copiedQrUrl, setCopiedQrUrl] = useState(false);
    const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
    const [refreshAllCountdown, setRefreshAllCountdown] = useState(0);
    const refreshAllCountdownTimerRef = useRef<number | null>(null);

    const activeCount = tables.filter((table) => table.active).length;
    const passiveCount = tables.filter((table) => !table.active).length;
    const activeSessionCount = Object.values(activeSessions).filter(Boolean).length;

    const getSessionGuestCount = (tableId: number) => {
        const session = activeSessions[tableId];

        if (!session) return 0;

        return (
            session.activeGuestCount ??
            session.sessionGuestCount ??
            session.guestCount ??
            session.activeSessionGuestCount ??
            session.activeSessionCount ??
            0
        );
    };

    const hasActiveSession = (tableId: number) => {
        return Boolean(activeSessions[tableId]);
    };

    const normalizeTableName = (name: string) =>
        name.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");

    const hasDuplicateTableName = (name: string, exceptTableId?: number) => {
        const normalizedName = normalizeTableName(name);

        return tables.some((table) => {
            if (exceptTableId && table.id === exceptTableId) {
                return false;
            }

            return normalizeTableName(table.name) === normalizedName;
        });
    };

    const showNotice = (message: string) => {
        setNoticeMessage(message);
    };

    const filteredTables = useMemo(() => {
        let result = [...tables];

        if (tableFilter === "active") {
            result = result.filter((table) => table.active);
        }

        if (tableFilter === "passive") {
            result = result.filter((table) => !table.active);
        }

        const search = searchText.trim().toLowerCase();

        if (search) {
            result = result.filter((table) => {
                return (
                    table.name.toLowerCase().includes(search) ||
                    String(table.id).includes(search) ||
                    String(table.capacity ?? "").includes(search)
                );
            });
        }

        result.sort((a, b) => {
            if (sortType === "name-asc") {
                return a.name.localeCompare(b.name, "tr", { numeric: true });
            }

            if (sortType === "name-desc") {
                return b.name.localeCompare(a.name, "tr", { numeric: true });
            }

            if (sortType === "capacity-asc") {
                return (a.capacity ?? 0) - (b.capacity ?? 0);
            }

            return (b.capacity ?? 0) - (a.capacity ?? 0);
        });

        return result;
    }, [tables, tableFilter, searchText, sortType]);

    const hydrateCardQrImages = async (tableList: RestaurantTableResponse[]) => {
        const images: Record<number, string> = {};

        await Promise.all(
            tableList.map(async (table) => {
                try {
                    const qr = await generateQrCode(table.id);
                    const imageUrl = await QRCode.toDataURL(qr.qrContent, {
                        width: 180,
                        margin: 1,
                    });

                    images[table.id] = imageUrl;
                } catch (error) {
                    console.error("Kart QR görseli oluşturulamadı:", table.id, error);
                }
            })
        );

        setCardQrImages(images);
    };

    const hydrateActiveSessions = async (tableList: RestaurantTableResponse[]) => {
        const sessions: Record<number, TableSessionResponse | null> = {};

        await Promise.all(
            tableList.map(async (table) => {
                try {
                    sessions[table.id] = await getActiveSessionByTable(table.id);
                } catch (error) {
                    console.error("Aktif oturum bilgisi alınamadı:", table.id, error);
                    sessions[table.id] = null;
                }
            })
        );

        setActiveSessions(sessions);
    };

    const loadTables = async () => {
        const data = await getTables();

        setTables(data);

        await Promise.all([
            hydrateCardQrImages(data),
            hydrateActiveSessions(data),
        ]);
    };

    const refreshTableSessionStatuses = async () => {
        const data = await getTables();

        setTables(data);
        await hydrateActiveSessions(data);
    };

    useEffect(() => {
        loadTables();
        const activeSessionRefreshTimer = window.setInterval(() => {
            refreshTableSessionStatuses().catch((error) => {
                console.error("Aktif oturum durumu guncellenemedi:", error);
            });
        }, 5000);

        const handleTablesUpdated = () => {
            loadTables();
        };

        const handleQrPageReset = () => {
            setActiveView("main");
            setTableFilter("all");
            setSearchText("");
            setSortType("name-asc");
            setSelectedQr(null);
            setSelectedTable(null);
            setModalType(null);
            setOpenMenuTableId(null);
            loadTables();
        };

        window.addEventListener("qresto-tables-updated", handleTablesUpdated);
        window.addEventListener("qresto-qr-page-reset", handleQrPageReset);

        return () => {
            window.clearInterval(activeSessionRefreshTimer);
            window.removeEventListener("qresto-tables-updated", handleTablesUpdated);
            window.removeEventListener("qresto-qr-page-reset", handleQrPageReset);
        };
    }, []);

    useEffect(() => {
        setOpenMenuTableId(null);
    }, [tableFilter, searchText, sortType]);

    const goMainPage = () => {
        setActiveView("main");
        setSelectedQr(null);
        setSelectedTable(null);
        setModalType(null);
        setOpenMenuTableId(null);
    };

    const clearRefreshAllCountdownTimer = () => {
        if (refreshAllCountdownTimerRef.current) {
            window.clearInterval(refreshAllCountdownTimerRef.current);
            refreshAllCountdownTimerRef.current = null;
        }
    };

    useEffect(() => {
        return () => clearRefreshAllCountdownTimer();
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
        if (!tableName.trim()) {
            alert("Masa adı zorunlu.");
            return;
        }

        if (hasDuplicateTableName(tableName)) {
            showNotice("Bu isimde bir masa zaten var. Lütfen farklı bir masa adı girin.");
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
            alert("Masa veya QR oluşturulamadı. Aynı isimde masa olmadığından emin olun.");
        } finally {
            setLoading(false);
        }
    };

    const handleShowQr = async (table: RestaurantTableResponse) => {
        setLoading(true);
        setOpenMenuTableId(null);

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
        setOpenMenuTableId(null);
        setSelectedTable(table);
        setEditName(table.name);
        setEditCapacity(table.capacity ? String(table.capacity) : "");
        setModalType("edit");
    };

    const openRefreshModal = (table: RestaurantTableResponse) => {
        setOpenMenuTableId(null);
        setSelectedTable(table);
        setModalType("refresh");
    };

    const openRefreshAllModal = () => {
        setOpenMenuTableId(null);
        setSelectedTable(null);
        setRefreshAllCountdown(5);
        clearRefreshAllCountdownTimer();
        refreshAllCountdownTimerRef.current = window.setInterval(() => {
            setRefreshAllCountdown((current) => {
                if (current <= 1) {
                    clearRefreshAllCountdownTimer();
                    return 0;
                }

                return current - 1;
            });
        }, 1000);
        setModalType("refreshAll");
    };

    const openDeleteModal = (table: RestaurantTableResponse) => {
        setOpenMenuTableId(null);
        setSelectedTable(table);
        setModalType("delete");
    };

    const openTableStatusModal = (table: RestaurantTableResponse) => {
        setOpenMenuTableId(null);
        setSelectedTable(table);
        setModalType(table.active ? "deactivate" : "activate");
    };

    const confirmEditTable = async () => {
        if (!selectedTable) return;

        if (!editName.trim()) {
            alert("Masa adı boş olamaz.");
            return;
        }

        if (hasDuplicateTableName(editName, selectedTable.id)) {
            showNotice("Bu isimde bir masa zaten var. Lütfen farklı bir masa adı girin.");
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
            alert("Masa güncellenemedi. Aynı isimde masa olmadığından emin olun.");
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

    const confirmRefreshAllTables = async () => {
        if (tables.length === 0) return;

        setLoading(true);

        try {
            await Promise.all(tables.map((table) => refreshTableSessions(table.id)));
            await loadTables();

            setModalType("refreshAllSuccess");
        } catch (error) {
            console.error(error);
            alert("Tüm masalar yenilenemedi.");
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

    const downloadTableQr = async (table: RestaurantTableResponse) => {
        setLoading(true);
        setOpenMenuTableId(null);

        try {
            const qr = await generateQrCode(table.id);
            const imageUrl = await QRCode.toDataURL(qr.qrContent, {
                width: 420,
                margin: 2,
            });

            const safeName = table.name
                .toLowerCase()
                .trim()
                .replaceAll(" ", "-");

            const link = document.createElement("a");
            link.href = imageUrl;
            link.download = `qresto-${safeName}-qr.png`;
            link.click();
        } catch (error) {
            console.error(error);
            alert("QR indirilemedi.");
        } finally {
            setLoading(false);
        }
    };

    const copyQrUrl = async () => {
        if (!selectedQr) return;

        try {
            await navigator.clipboard.writeText(selectedQr.qr.qrContent);
            setCopiedQrUrl(true);

            window.setTimeout(() => {
                setCopiedQrUrl(false);
            }, 1800);
        } catch (error) {
            console.error(error);
            alert("URL kopyalanamadı.");
        }
    };

    const selectFilter = (filter: TableFilter) => {
        setTableFilter(filter);
        setActiveView("main");
        setOpenMenuTableId(null);
    };

    const getModalTitle = () => {
        if (modalType === "download") return "QR indirilsin mi?";
        if (modalType === "refresh") return "Masa yenilensin mi?";
        if (modalType === "refreshSuccess") return "Masa yenilendi";
        if (modalType === "refreshAll") return "Tüm masalar yenilensin mi?";
        if (modalType === "refreshAllSuccess") return "Tüm masalar yenilendi";
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

        if (modalType === "refreshAll") {
            return refreshAllCountdown > 0
                ? `Tüm masalardaki aktif oturumlar kapatılacaktır. Onay butonu ${refreshAllCountdown} saniye sonra açılacak.`
                : "Tüm masalardaki aktif oturumlar kapatılacaktır. Bu işlem yeni QR oluşturmaz; müşteriler aynı QR kodu tekrar okuttuğunda yeni oturum başlar.";
        }

        if (modalType === "refreshAllSuccess") {
            return "Tüm masalar başarıyla yenilendi. Aktif masa oturumları kapatıldı.";
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
        clearRefreshAllCountdownTimer();
        setRefreshAllCountdown(0);
        setModalType(null);
        setSelectedTable(null);
    };

    const getTableStatusBadgeClass = (active: boolean) => {
        if (active) {
            return "border border-[var(--qresto-success-border)] bg-[var(--qresto-success-soft)] text-[var(--qresto-success)] shadow-[0_6px_14px_rgba(35,165,89,0.12)]";
        }

        return "border border-slate-200 bg-slate-100 text-slate-600 shadow-sm dark:border-slate-600/40 dark:bg-slate-700/50 dark:text-slate-300";
    };

    const StatCard = ({
                          icon,
                          title,
                          value,
                          description,
                          variant,
                      }: {
        icon: ReactNode;
        title: string;
        value: number;
        description: string;
        variant: "blue" | "green" | "orange" | "purple";
    }) => {
        const variantClass = {
            blue:
                "bg-[#0b3a4d] text-[#38bdf8] ring-1 ring-[#155e75]",
            green:
                "bg-[#063f2e] text-[#23a559] ring-1 ring-[#1f8b4c]",
            orange:
                "bg-[#3b2a22] text-[#ff9f43] ring-1 ring-[#7c3d1f]",
            purple:
                "bg-[#2e2454] text-[#c4b5fd] ring-1 ring-[#6d5bd0]",
        }[variant];

        const cardClass =
            "border-[var(--qresto-border)] bg-[var(--qresto-surface)] shadow-[0_14px_34px_rgba(15,23,42,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.18)]";

        return (
            <div className={`rounded-[22px] border p-6 ${cardClass}`}>
                <div className="flex items-center gap-5">
                    <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${variantClass}`}
                    >
                        {icon}
                    </div>

                    <div>
                        <p className="text-sm font-extrabold text-[var(--qresto-text)]">
                            {title}
                        </p>

                        <h3 className="mt-1 text-3xl font-black leading-none text-[var(--qresto-text)]">
                            {value}
                        </h3>

                        <p className="mt-2 text-sm text-[var(--qresto-muted)]">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-full w-full bg-[var(--qresto-bg)] px-1 text-[var(--qresto-text)] transition-colors duration-300">
            <div className="w-full space-y-7 pb-8">
                <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        {(activeView === "create" || activeView === "preview") && (
                            <button
                                type="button"
                                onClick={goMainPage}
                                className="mb-5 flex w-fit items-center gap-2 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-5 py-3 font-bold text-[var(--qresto-text)] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
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
                            <h1 className="text-3xl font-black tracking-tight text-[var(--qresto-text)] transition-colors hover:text-[var(--qresto-primary)] lg:text-4xl">
                                Masalar & QR Kodlar
                            </h1>
                        </button>

                        <p className="mt-3 max-w-5xl text-sm leading-6 text-[var(--qresto-muted)]">
                            Masalarınızı yönetin, QR kodları oluşturun ve masa durumlarını takip edin.
                        </p>
                    </div>

                    {activeView === "main" && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={openRefreshAllModal}
                                disabled={tables.length === 0 || loading}
                                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-5 font-bold text-[var(--qresto-text)] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw size={18} />
                                Tüm Masaları Yenile
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveView("create")}
                                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--qresto-primary)] px-6 font-bold text-white shadow-[0_14px_28px_rgba(255,75,22,0.25)] transition-all duration-200 hover:-translate-y-1 hover:opacity-95"
                            >
                                <Plus size={19} />
                                Yeni Masa
                            </button>
                        </div>
                    )}
                </header>

                {activeView === "main" && (
                    <>
                        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                icon={<Table2 size={28} />}
                                title="Toplam Masa"
                                value={tables.length}
                                description="Tüm masalar"
                                variant="blue"
                            />

                            <StatCard
                                icon={<CheckCircle2 size={30} />}
                                title="Aktif Masa"
                                value={activeCount}
                                description="Kullanıma açık"
                                variant="green"
                            />

                            <StatCard
                                icon={<PauseCircle size={30} />}
                                title="Pasif Masa"
                                value={passiveCount}
                                description="Kullanıma kapalı"
                                variant="orange"
                            />

                            <StatCard
                                icon={<Users size={30} />}
                                title="Aktif Oturum"
                                value={activeSessionCount}
                                description="Şu an aktif oturum"
                                variant="purple"
                            />
                        </section>

                        <section className="rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-3 shadow-[0_10px_30px_rgba(15,23,42,0.055)]">
                            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex w-full flex-col gap-3 md:flex-row xl:w-auto">
                                    <div className="relative w-full xl:w-[430px]">
                                        <Search
                                            size={19}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--qresto-muted)]"
                                        />

                                        <input
                                            value={searchText}
                                            onChange={(event) =>
                                                setSearchText(event.target.value)
                                            }
                                            placeholder="Masa adı veya numarası ara..."
                                            className="h-12 w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] pl-12 pr-4 text-sm font-semibold text-[var(--qresto-text)] outline-none transition-all placeholder:text-[var(--qresto-muted)] focus:border-[var(--qresto-primary)] focus:bg-[var(--qresto-surface)] focus:shadow-[0_0_0_4px_rgba(255,75,22,0.08)]"
                                        />
                                    </div>

                                    <div className="relative w-full md:w-[250px]">
                                        <select
                                            value={sortType}
                                            onChange={(event) =>
                                                setSortType(event.target.value as SortType)
                                            }
                                            className="h-12 w-full appearance-none rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 pr-12 text-sm font-extrabold text-[var(--qresto-muted)] outline-none transition-all focus:border-[var(--qresto-primary)] focus:bg-[var(--qresto-surface)] focus:shadow-[0_0_0_4px_rgba(255,75,22,0.08)]"
                                        >
                                            <option value="name-asc">Masa No (A-Z)</option>
                                            <option value="name-desc">Masa No (Z-A)</option>
                                            <option value="capacity-asc">Kapasite Artan</option>
                                            <option value="capacity-desc">Kapasite Azalan</option>
                                        </select>

                                        <ChevronDown
                                            size={19}
                                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--qresto-muted)]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[var(--qresto-bg)] p-1.5 sm:w-[340px]">
                                    <button
                                        type="button"
                                        onClick={() => selectFilter("all")}
                                        className={`h-11 rounded-xl text-sm font-extrabold transition-all ${
                                            tableFilter === "all"
                                                ? "bg-[var(--qresto-primary)] text-white shadow-[0_10px_22px_rgba(255,75,22,0.22)]"
                                                : "text-[var(--qresto-muted)] hover:bg-[var(--qresto-surface)] hover:text-[var(--qresto-primary)]"
                                        }`}
                                    >
                                        Tümü
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => selectFilter("active")}
                                        className={`h-11 rounded-xl text-sm font-extrabold transition-all ${
                                            tableFilter === "active"
                                                ? "bg-[var(--qresto-primary)] text-white shadow-[0_10px_22px_rgba(255,75,22,0.22)]"
                                                : "text-[var(--qresto-muted)] hover:bg-[var(--qresto-surface)] hover:text-[var(--qresto-primary)]"
                                        }`}
                                    >
                                        Aktif
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => selectFilter("passive")}
                                        className={`h-11 rounded-xl text-sm font-extrabold transition-all ${
                                            tableFilter === "passive"
                                                ? "bg-[var(--qresto-primary)] text-white shadow-[0_10px_22px_rgba(255,75,22,0.22)]"
                                                : "text-[var(--qresto-muted)] hover:bg-[var(--qresto-surface)] hover:text-[var(--qresto-primary)]"
                                        }`}
                                    >
                                        Pasif
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {filteredTables.map((table) => {
                                    const sessionGuestCount = getSessionGuestCount(table.id);
                                    const tableHasActiveSession = hasActiveSession(table.id);
                                    const qrImage = cardQrImages[table.id];

                                    return (
                                        <div
                                            key={table.id}
                                            className="group rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.055)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-2xl font-black tracking-tight text-[var(--qresto-text)]">
                                                        {table.name}
                                                    </h3>

                                                    <p className="mt-1 text-sm font-medium text-[var(--qresto-muted)]">
                                                        Kapasite: {table.capacity ?? "-"} Kişi
                                                    </p>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold ${getTableStatusBadgeClass(
                                                        table.active
                                                    )}`}
                                                >
                                                    {table.active
                                                        ? "Kullanıma Açık"
                                                        : "Kullanıma Kapalı"}
                                                </span>
                                            </div>

                                            <div className="mt-6 grid grid-cols-[1fr_104px] gap-4">
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xs font-bold text-[var(--qresto-muted)]">
                                                            QR Durumu
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-2 text-sm font-bold text-[var(--qresto-text)]">
                                                    <span
                                                        className={`h-2.5 w-2.5 rounded-full ${
                                                            table.active
                                                                ? "bg-[var(--qresto-success)] shadow-[0_0_0_4px_rgba(35,165,89,0.14)]"
                                                                : "bg-slate-400 dark:bg-slate-500"
                                                        }`}
                                                    />

                                                            {table.active ? "QR Aktif" : "QR Pasif"}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-bold text-[var(--qresto-muted)]">
                                                            Oturum Durumu
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-2 text-sm font-bold text-[var(--qresto-text)]">
                                                            <span
                                                                className={`h-2.5 w-2.5 rounded-full ${
                                                                    tableHasActiveSession
                                                                        ? "bg-[var(--qresto-primary)]"
                                                                        : "bg-slate-400"
                                                                }`}
                                                            />

                                                            {tableHasActiveSession
                                                                ? sessionGuestCount > 0
                                                                    ? `${sessionGuestCount} Kişi`
                                                                    : "Oturum Aktif"
                                                                : "Oturum Yok"}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div
                                                    className={`flex h-[104px] w-[104px] items-center justify-center rounded-2xl border border-[var(--qresto-border)] bg-white p-2 shadow-sm ${
                                                        table.active ? "" : "opacity-35 grayscale"
                                                    }`}
                                                >
                                                    {qrImage ? (
                                                        <img
                                                            src={qrImage}
                                                            alt={`${table.name} QR`}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="grid h-full w-full grid-cols-4 gap-1 opacity-50">
                                                            {Array.from({ length: 16 }).map((_, index) => (
                                                                <span
                                                                    key={index}
                                                                    className={`rounded-sm ${
                                                                        index % 3 === 0 || index % 5 === 0
                                                                            ? "bg-slate-900"
                                                                            : "bg-slate-200"
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-6 space-y-3">
                                                {table.active ? (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleShowQr(table)}
                                                                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--qresto-primary)] bg-[var(--qresto-surface)] text-sm font-extrabold text-[var(--qresto-primary)] transition-all hover:bg-[var(--qresto-hover)]"
                                                            >
                                                                <Eye size={16} />
                                                                QR Önizle
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => downloadTableQr(table)}
                                                                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--qresto-primary)] bg-[var(--qresto-surface)] text-sm font-extrabold text-[var(--qresto-primary)] transition-all hover:bg-[var(--qresto-hover)]"
                                                            >
                                                                <Download size={16} />
                                                                QR İndir
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-[1fr_1fr_44px] gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openRefreshModal(table)}
                                                                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-xs font-extrabold text-[var(--qresto-text)] transition-all hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                                                            >
                                                                <RefreshCw size={15} />
                                                                Masayı Yenile
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(table)}
                                                                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-xs font-extrabold text-[var(--qresto-text)] transition-all hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                                                            >
                                                                <Edit3 size={15} />
                                                                Düzenle
                                                            </button>

                                                            <div className="relative">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setOpenMenuTableId((current) =>
                                                                            current === table.id
                                                                                ? null
                                                                                : table.id
                                                                        )
                                                                    }
                                                                    className="flex h-10 w-full items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] transition-all hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                                                                >
                                                                    <MoreHorizontal size={18} />
                                                                </button>

                                                                {openMenuTableId === table.id && (
                                                                    <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openTableStatusModal(table)
                                                                            }
                                                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[var(--qresto-text)] transition-all hover:bg-[var(--qresto-hover)]"
                                                                        >
                                                                            <PowerOff size={16} />
                                                                            Masayı Kullanıma Kapat
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openDeleteModal(table)
                                                                            }
                                                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/40"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                            Masayı Sil
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => openTableStatusModal(table)}
                                                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--qresto-success-border)] bg-[var(--qresto-success)] text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(35,165,89,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[var(--qresto-success-hover)] dark:border-[var(--qresto-success-border)] dark:bg-[var(--qresto-success)] dark:text-white dark:shadow-[0_10px_26px_rgba(35,165,89,0.18)] dark:hover:bg-[var(--qresto-success-hover)]"
                                                        >
                                                            <Power size={17} />
                                                            Masayı Kullanıma Aç
                                                        </button>

                                                        <div className="grid grid-cols-[1fr_1fr_44px] gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(table)}
                                                                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-xs font-extrabold text-[var(--qresto-text)] transition-all hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                                                            >
                                                                <Edit3 size={15} />
                                                                Düzenle
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => openDeleteModal(table)}
                                                                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-[var(--qresto-surface)] text-xs font-extrabold text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/40"
                                                            >
                                                                <Trash2 size={15} />
                                                                Sil
                                                            </button>

                                                            <div className="relative">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setOpenMenuTableId((current) =>
                                                                            current === table.id
                                                                                ? null
                                                                                : table.id
                                                                        )
                                                                    }
                                                                    className="flex h-10 w-full items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] transition-all hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                                                                >
                                                                    <MoreHorizontal size={18} />
                                                                </button>

                                                                {openMenuTableId === table.id && (
                                                                    <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openTableStatusModal(table)
                                                                            }
                                                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[var(--qresto-success)] transition-all hover:bg-[var(--qresto-success-soft)]"
                                                                        >
                                                                            <Power size={16} />
                                                                            Masayı Kullanıma Aç
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openDeleteModal(table)
                                                                            }
                                                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/40"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                            Masayı Sil
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredTables.length === 0 && (
                                    <div className="rounded-[24px] border border-dashed border-[var(--qresto-border)] bg-[var(--qresto-surface)] py-20 text-center md:col-span-2 xl:col-span-3 2xl:col-span-4">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                            <Search size={28} />
                                        </div>

                                        <p className="mt-5 font-bold text-[var(--qresto-text)]">
                                            Bu filtreye uygun masa bulunamadı.
                                        </p>

                                        <p className="mt-2 text-sm text-[var(--qresto-muted)]">
                                            Arama kelimesini veya filtreyi değiştirerek tekrar deneyin.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => setActiveView("create")}
                                            className="mt-6 rounded-2xl bg-[var(--qresto-primary)] px-6 py-3 font-bold text-white"
                                        >
                                            Yeni Masa Oluştur
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-7 border-t border-[var(--qresto-border)] pt-5">
                                <p className="text-sm font-medium text-[var(--qresto-muted)]">
                                    Toplam {filteredTables.length} masa
                                </p>
                            </div>
                        </section>
                    </>
                )}

                {activeView === "create" && (
                    <section className="mx-auto max-w-3xl rounded-[28px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                            <Plus size={30} />
                        </div>

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
                                    className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)] focus:border-[var(--qresto-primary)]"
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
                                    className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)] focus:border-[var(--qresto-primary)]"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={handleCreateTable}
                                disabled={loading}
                                className="w-full rounded-2xl bg-[var(--qresto-primary)] py-4 font-bold text-white shadow-[0_14px_28px_rgba(255,75,22,0.25)] transition-all hover:-translate-y-1 disabled:opacity-60"
                            >
                                {loading ? "Oluşturuluyor..." : "Masa + QR Oluştur"}
                            </button>
                        </div>
                    </section>
                )}

                {activeView === "preview" && (
                    <section className="rounded-[28px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                        {!selectedQr ? (
                            <div className="py-20 text-center">
                                <h2 className="text-3xl font-black text-[var(--qresto-text)]">
                                    QR Önizleme
                                </h2>

                                <p className="mt-2 text-[var(--qresto-muted)]">
                                    Bir masanın QR kodunu önizlemek için masa listesinden QR Önizle butonuna basın.
                                </p>

                                <button
                                    type="button"
                                    onClick={goMainPage}
                                    className="mt-6 rounded-2xl bg-[var(--qresto-primary)] px-6 py-3 font-bold text-white"
                                >
                                    Masa Listesine Git
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                                <div className="flex justify-center rounded-[28px] bg-[var(--qresto-bg)] p-6">
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

                                    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4 md:flex-row md:items-center">
                                        <div className="min-w-0 flex-1 break-all text-sm font-medium text-[var(--qresto-text)]">
                                            {selectedQr.qr.qrContent}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={copyQrUrl}
                                            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 text-sm font-extrabold text-[var(--qresto-text)] transition-all hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)]"
                                        >
                                            {copiedQrUrl ? (
                                                <>
                                                    <Check size={16} />
                                                    Kopyalandı
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={16} />
                                                    URL Kopyala
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <p className="mt-4 text-sm text-[var(--qresto-muted)]">
                                        QR Versiyon: {selectedQr.qr.versionNo}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => setModalType("download")}
                                        className="mt-6 rounded-2xl bg-[var(--qresto-primary)] px-8 py-4 font-bold text-white shadow-[0_14px_28px_rgba(255,75,22,0.25)]"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[28px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-7 shadow-2xl">
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
                                        className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)] focus:border-[var(--qresto-primary)]"
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
                                        className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-5 py-4 text-[var(--qresto-text)] outline-none placeholder:text-[var(--qresto-muted)] focus:border-[var(--qresto-primary)]"
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
                                type="button"
                                onClick={closeModal}
                                className="flex-1 rounded-2xl bg-[var(--qresto-bg)] py-3 font-bold text-[var(--qresto-text)] transition-all hover:bg-[var(--qresto-hover)]"
                            >
                                {modalType === "refreshSuccess" || modalType === "refreshAllSuccess" ? "Kapat" : "Vazgeç"}
                            </button>

                            {modalType !== "refreshSuccess" && modalType !== "refreshAllSuccess" && (
                                <button
                                    type="button"
                                    disabled={loading || (modalType === "refreshAll" && refreshAllCountdown > 0)}
                                    onClick={
                                        modalType === "download"
                                            ? downloadQr
                                            : modalType === "refresh"
                                                ? confirmRefreshTable
                                                : modalType === "refreshAll"
                                                    ? confirmRefreshAllTables
                                                    : modalType === "delete"
                                                        ? confirmDeleteTable
                                                        : modalType === "edit"
                                                            ? confirmEditTable
                                                            : confirmTableStatusChange
                                    }
                                    className="flex-1 rounded-2xl bg-[var(--qresto-primary)] py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                                >
                                    {loading
                                        ? "İşleniyor..."
                                        : modalType === "refreshAll" && refreshAllCountdown > 0
                                            ? `${refreshAllCountdown} sn`
                                            : "Onayla"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {noticeMessage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[28px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-7 shadow-2xl">
                        <h2 className="mb-3 text-2xl font-black text-[var(--qresto-text)]">
                            Uyarı
                        </h2>
                        <p className="mb-6 text-[var(--qresto-muted)]">
                            {noticeMessage}
                        </p>
                        <button
                            type="button"
                            onClick={() => setNoticeMessage(null)}
                            className="w-full rounded-2xl bg-[var(--qresto-primary)] py-3 font-bold text-white transition-all hover:opacity-90"
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QrGeneratorPage;
