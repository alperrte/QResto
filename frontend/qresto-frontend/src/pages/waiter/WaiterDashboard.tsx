import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    CreditCard,
    LayoutDashboard,
    Loader2,
    LogOut,
    Moon,
    ReceiptText,
    ShieldCheck,
    ShoppingCart,
    Sun,
    Table2,
    TriangleAlert,
    WalletCards,
} from "lucide-react";

import { useAuth } from "../../auth/AuthContext";
import darkLogo from "../../assets/qresto_logo_dark.png";
import lightLogo from "../../assets/qresto_logo_light.png";
import {
    WAITER_API_URL,
    getActiveOrders,
    getActiveTableSession,
    getAllCalls,
    getCancelledOrders,
    getOrderDetail,
    getReadyOrders,
    getTables,
    markOrderServed,
    resolveCall,
    type KitchenOrderResponse,
    type OrderDetailResponse,
    type QrTableResponse,
    type TableCallResponse,
    type TableCallType,
    type TableSessionResponse,
} from "../../services/waiterService";

type TableVisualStatus = "occupied" | "ordered" | "bill" | "waiter" | "empty";
type WaiterView = "dashboard" | "tables" | "orders" | "calls" | "payments";

const viewMeta: Record<WaiterView, { title: string; subtitle: string }> = {
    dashboard: {
        title: "Garson Paneli",
        subtitle: "Masaları, siparişleri ve ödemeleri kolayca yönetin.",
    },
    tables: {
        title: "Masalar",
        subtitle: "Tüm masa durumlarını ve masa üstü bildirimleri takip edin.",
    },
    orders: {
        title: "Siparişler",
        subtitle: "Aktif ve geçmiş siparişleri ürün detaylarıyla izleyin.",
    },
    calls: {
        title: "Garson Çağrıları",
        subtitle: "Aktif ve geçmiş çağrı kayıtlarını yönetin.",
    },
    payments: {
        title: "Ödemeler",
        subtitle: "Ödeme durumlarını ve toplam ciroyu kontrol edin.",
    },
};

const tableStatusMeta: Record<
    TableVisualStatus,
    { label: string; color: string; bg: string; border: string; icon: ReactNode }
> = {
    occupied: {
        label: "Dolu",
        color: "#ef4444",
        bg: "#fff1f1",
        border: "#fecaca",
        icon: <Table2 size={22} />,
    },
    ordered: {
        label: "Sipariş Verildi",
        color: "#ff7a1a",
        bg: "#fff4e8",
        border: "#fed7aa",
        icon: <ShoppingCart size={22} />,
    },
    bill: {
        label: "Hesap İstendi",
        color: "#2f80ed",
        bg: "#eef5ff",
        border: "#bfdbfe",
        icon: <ReceiptText size={22} />,
    },
    waiter: {
        label: "Garson Çağırdı",
        color: "#7c4dff",
        bg: "#f3edff",
        border: "#d8c6ff",
        icon: <Bell size={22} />,
    },
    empty: {
        label: "Boş",
        color: "#219653",
        bg: "#f0fbf4",
        border: "#bbf7d0",
        icon: <Table2 size={22} />,
    },
};

function ensureArray<T>(value: unknown): T[] {
    if (Array.isArray(value)) return value;

    if (
        value &&
        typeof value === "object" &&
        "content" in value &&
        Array.isArray((value as { content: T[] }).content)
    ) {
        return (value as { content: T[] }).content;
    }

    if (
        value &&
        typeof value === "object" &&
        "data" in value &&
        Array.isArray((value as { data: T[] }).data)
    ) {
        return (value as { data: T[] }).data;
    }

    return [];
}

function normalizeOrderStatus(status?: string) {
    return (status || "UNKNOWN").toUpperCase();
}

function isOrderArchived(status?: string) {
    const normalized = normalizeOrderStatus(status);
    return normalized === "CANCELLED" || normalized === "COMPLETED" || normalized === "PAID";
}

function isOrderPaid(status?: string) {
    const normalized = normalizeOrderStatus(status);
    return normalized === "PAID" || normalized === "COMPLETED";
}

function isPaymentPending(status?: string) {
    return normalizeOrderStatus(status) === "PAYMENT_PENDING";
}

function getOrderStatusLabel(status?: string) {
    switch (normalizeOrderStatus(status)) {
        case "RECEIVED":
            return "Alındı";
        case "PREPARING":
            return "Hazırlanıyor";
        case "READY":
            return "Hazır";
        case "SERVED":
            return "Servis Edildi";
        case "PAYMENT_PENDING":
            return "Ödeme Bekliyor";
        case "PAID":
            return "Ödendi";
        case "COMPLETED":
            return "Tamamlandı";
        case "CANCELLED":
            return "İptal";
        default:
            return status || "Bilinmiyor";
    }
}

function getOrderStatusTone(status?: string) {
    switch (normalizeOrderStatus(status)) {
        case "READY":
            return { bg: "#eafaf1", text: "#1f8f4a" };
        case "PREPARING":
        case "RECEIVED":
            return { bg: "#fff4e8", text: "#d97706" };
        case "PAYMENT_PENDING":
            return { bg: "#fff4e8", text: "#e36414" };
        case "PAID":
        case "COMPLETED":
            return { bg: "#edf9f0", text: "#23864b" };
        case "CANCELLED":
            return { bg: "#fdecec", text: "#c0392b" };
        default:
            return { bg: "#eef5ff", text: "#2f80ed" };
    }
}

function getCallTypeLabel(type: TableCallType) {
    switch (type) {
        case "WAITER_CALL":
            return "Garson çağırdı.";
        case "BILL_REQUEST":
            return "Hesap istendi.";
        default:
            return "Yardım istendi.";
    }
}

function getCallStatusLabel(status?: TableCallResponse["status"]) {
    switch (status) {
        case "ACTIVE":
            return "Aktif";
        case "RESOLVED":
            return "Tamamlandı";
        case "CANCELLED":
            return "İptal Edildi";
        default:
            return status || "-";
    }
}

function formatDateTime(value?: string | null) {
    if (!value) return "-";

    try {
        const date = parseQrestoDate(value);

        return new Intl.DateTimeFormat("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            timeZone: "Europe/Istanbul",
        }).format(date);
    } catch {
        return value;
    }
}

function formatRelativeTime(value?: string | null) {
    if (!value) return "-";

    const started = parseQrestoDate(value).getTime();
    const diffMinutes = Math.max(1, Math.floor((Date.now() - started) / 60000));

    if (diffMinutes < 60) return `${diffMinutes} dk önce`;
    return `${Math.floor(diffMinutes / 60)} sa önce`;
}

function parseQrestoDate(value: string) {
    const hasTimezone = /[Zz]|[+-]\d{2}:?\d{2}/.test(value);
    const isoWithoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/;

    return new Date(isoWithoutTimezone.test(value) && !hasTimezone ? `${value}Z` : value);
}

function getDateTimeMs(value?: string | null) {
    if (!value) return 0;
    const time = parseQrestoDate(value).getTime();
    return Number.isNaN(time) ? 0 : time;
}

function formatMoney(value?: number | null) {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function getCurrentUserEmail() {
    try {
        const token = localStorage.getItem("qresto-access-token");

        if (!token) return "waiter@qresto.com";

        const payload = JSON.parse(atob(token.split(".")[1])) as { email?: string };
        return payload.email || "waiter@qresto.com";
    } catch {
        return "waiter@qresto.com";
    }
}

export default function WaiterDashboard() {
    const { logout } = useAuth();
    const location = useLocation();
    const viewSegment = location.pathname.split("/").filter(Boolean).at(-1);
    const currentView: WaiterView =
        viewSegment === "tables" ||
        viewSegment === "orders" ||
        viewSegment === "calls" ||
        viewSegment === "payments"
            ? viewSegment
            : "dashboard";

    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem("qresto-theme");
        return savedTheme === "dark" || document.documentElement.classList.contains("dark");
    });
    const [calls, setCalls] = useState<TableCallResponse[]>([]);
    const [tables, setTables] = useState<QrTableResponse[]>([]);
    const [orders, setOrders] = useState<KitchenOrderResponse[]>([]);
    const [orderDetails, setOrderDetails] = useState<Record<number, OrderDetailResponse>>({});
    const [tableSessions, setTableSessions] = useState<TableSessionResponse[]>([]);
    const [heldTableTimestamps, setHeldTableTimestamps] = useState<Map<number, number>>(new Map());
    const [selectedOrder, setSelectedOrder] = useState<KitchenOrderResponse | null>(null);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetailResponse | null>(null);
    const [orderDetailOpen, setOrderDetailOpen] = useState(false);
    const [orderDetailLoading, setOrderDetailLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [orderActionLoadingId, setOrderActionLoadingId] = useState<number | null>(null);
    const [selectedCall, setSelectedCall] = useState<TableCallResponse | null>(null);
    const [confirmResolveCall, setConfirmResolveCall] = useState<TableCallResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const userEmail = getCurrentUserEmail();

    async function loadDashboard() {
        try {
            setError(null);

            const [allCallsResult, tablesResult, activeOrdersResult, readyOrdersResult, cancelledOrdersResult] =
                await Promise.allSettled([
                    getAllCalls(),
                    getTables(),
                    getActiveOrders(),
                    getReadyOrders(),
                    getCancelledOrders(),
                ]);

            const tableList =
                tablesResult.status === "fulfilled"
                    ? ensureArray<QrTableResponse>(tablesResult.value)
                    : tables;

            if (allCallsResult.status === "fulfilled") {
                setCalls(ensureArray<TableCallResponse>(allCallsResult.value));
            }

            if (tablesResult.status === "fulfilled") {
                setTables(tableList);

                const activeSessions = await Promise.all(
                    tableList.map(async (table) => getActiveTableSession(table.id).catch(() => null))
                );

                setTableSessions(
                    activeSessions.filter(
                        (session): session is TableSessionResponse => Boolean(session)
                    )
                );
            }

            const fetched = [
                ...(activeOrdersResult.status === "fulfilled"
                    ? ensureArray<KitchenOrderResponse>(activeOrdersResult.value)
                    : []),
                ...(readyOrdersResult.status === "fulfilled"
                    ? ensureArray<KitchenOrderResponse>(readyOrdersResult.value)
                    : []),
                ...(cancelledOrdersResult.status === "fulfilled"
                    ? ensureArray<KitchenOrderResponse>(cancelledOrdersResult.value)
                    : []),
            ];

            const releasedTableIds = fetched
                .filter((order) => isOrderPaid(order.status) || normalizeOrderStatus(order.status) === "COMPLETED")
                .map((order) => order.tableId)
                .filter((tableId): tableId is number => Boolean(tableId));

            if (releasedTableIds.length > 0) {
                setHeldTableTimestamps((prev) => {
                    const next = new Map(prev);
                    releasedTableIds.forEach((tableId) => next.delete(tableId));
                    return next;
                });
            }

            if (
                activeOrdersResult.status === "fulfilled" ||
                readyOrdersResult.status === "fulfilled" ||
                cancelledOrdersResult.status === "fulfilled"
            ) {
                setOrders((prev) => {
                    const map = new Map<number, KitchenOrderResponse>();

                    prev.forEach((order) => map.set(order.orderId, order));
                    fetched.forEach((order) => map.set(order.orderId, { ...map.get(order.orderId), ...order }));

                    return Array.from(map.values()).sort((a, b) =>
                        (b.createdAt || "").localeCompare(a.createdAt || "")
                    );
                });
            }
        } catch (err) {
            console.error(err);
            setError("Garson paneli verileri yüklenirken bir hata oluştu.");
        }
    }

    useEffect(() => {
        const savedTheme = localStorage.getItem("qresto-theme");
        const darkActive = savedTheme === "dark" || document.documentElement.classList.contains("dark");

        document.documentElement.classList.toggle("dark", darkActive);
        const timer = window.setTimeout(() => {
            loadDashboard().finally(() => setInitialLoading(false));
        }, 0);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let client: Client | null = null;
        let refreshTimer: number | undefined;

        try {
            client = new Client({
                webSocketFactory: () => new SockJS(`${WAITER_API_URL}/ws`),
                reconnectDelay: 5000,
                onConnect: () => {
                    if (!client) return;

                    loadDashboard().catch(() => undefined);

                    client.subscribe("/topic/waiter/calls", (message) => {
                        try {
                            const body = JSON.parse(message.body) as TableCallResponse;

                            setCalls((prev) => {
                                const exists = prev.some((call) => call.id === body.id);
                                return exists
                                    ? prev.map((call) => (call.id === body.id ? body : call))
                                    : [body, ...prev];
                            });

                            if (body.tableId && body.status === "ACTIVE") {
                                setHeldTableTimestamps((prev) => {
                                    const next = new Map(prev);
                                    next.set(body.tableId, Date.now());
                                    return next;
                                });
                            }
                        } catch (err) {
                            console.error("Error parsing waiter call message", err);
                        }
                    });

                    client.subscribe("/topic/waiter/orders", (message) => {
                        try {
                            const body = JSON.parse(message.body) as KitchenOrderResponse;

                            setOrders((prev) => {
                                const exists = prev.some((order) => order.orderId === body.orderId);
                                return exists
                                    ? prev.map((order) =>
                                          order.orderId === body.orderId ? { ...order, ...body } : order
                                      )
                                    : [body, ...prev];
                            });

                            if (body.tableId) {
                                setHeldTableTimestamps((prev) => {
                                    const next = new Map(prev);
                                    next.set(body.tableId, Date.now());
                                    return next;
                                });
                            }
                        } catch (err) {
                            console.error("Error parsing waiter order message", err);
                        }
                    });

                    refreshTimer = window.setInterval(() => {
                        loadDashboard().catch(() => undefined);
                    }, 5000);
                },
            });

            client.activate();
        } catch (err) {
            console.error("WebSocket init error", err);
        }

        return () => {
            if (refreshTimer) window.clearInterval(refreshTimer);
            if (client) void client.deactivate();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const missingOrderIds = orders
            .slice(0, 20)
            .map((order) => order.orderId)
            .filter((orderId) => !orderDetails[orderId]);

        if (missingOrderIds.length === 0) return;

        let cancelled = false;

        const loadOrderSummaries = async () => {
            const detailEntries = await Promise.all(
                missingOrderIds.map(async (orderId) => {
                    try {
                        return [orderId, await getOrderDetail(orderId)] as const;
                    } catch {
                        return null;
                    }
                })
            );

            if (cancelled) return;

            setOrderDetails((prev) => {
                const next = { ...prev };
                detailEntries.forEach((entry) => {
                    if (entry) next[entry[0]] = entry[1];
                });
                return next;
            });
        };

        void loadOrderSummaries();

        return () => {
            cancelled = true;
        };
    }, [orders, orderDetails]);

    const activeCalls = useMemo(
        () => calls.filter((call) => call.status === "ACTIVE"),
        [calls]
    );
    const archivedCalls = useMemo(
        () => calls.filter((call) => call.status !== "ACTIVE"),
        [calls]
    );
    const activeOrders = useMemo(
        () => orders.filter((order) => !isOrderArchived(order.status)),
        [orders]
    );
    const archivedOrders = useMemo(
        () => orders.filter((order) => isOrderArchived(order.status)),
        [orders]
    );
    const paymentRows = useMemo(
        () => orders.filter((order) => isOrderPaid(order.status) || isPaymentPending(order.status)),
        [orders]
    );
    const paidTotal = useMemo(
        () =>
            paymentRows
                .filter((order) => isOrderPaid(order.status))
                .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
        [paymentRows]
    );
    const pendingPaymentCount = useMemo(
        () => paymentRows.filter((order) => isPaymentPending(order.status)).length,
        [paymentRows]
    );
    const activeCallByTableId = useMemo(() => {
        const map = new Map<number, TableCallResponse[]>();
        activeCalls.forEach((call) => {
            const list = map.get(call.tableId) || [];
            map.set(call.tableId, [...list, call]);
        });
        return map;
    }, [activeCalls]);
    const activeOrderByTableId = useMemo(() => {
        const map = new Map<number, KitchenOrderResponse>();
        activeOrders.forEach((order) => {
            if (order.tableId) map.set(order.tableId, order);
        });
        return map;
    }, [activeOrders]);
    const activeTableSessionByTableId = useMemo(() => {
        const map = new Map<number, TableSessionResponse>();
        tableSessions.forEach((session) => {
            if (["ACTIVE", "ORDERED", "PAYMENT_PENDING"].includes(session.status)) {
                map.set(session.tableId, session);
            }
        });
        return map;
    }, [tableSessions]);

    const currentDate = new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const sidebarLogo = isDark ? darkLogo : lightLogo;

    function toggleTheme() {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("qresto-theme", next ? "dark" : "light");
    }

    function getTableDisplayName(tableId?: number, tableNumber?: number) {
        if (tableId) {
            const table = tables.find((item) => item.id === tableId);
            if (table?.name) return table.name;
        }

        if (tableNumber) return `Masa ${tableNumber}`;
        if (tableId) return `Masa ${tableId}`;
        return "Masa";
    }

    function getTableStatus(table: QrTableResponse): TableVisualStatus {
        const tableCalls = activeCallByTableId.get(table.id) || [];
        const activeOrder = activeOrderByTableId.get(table.id);
        const activeSession = activeTableSessionByTableId.get(table.id);
        const isHeld = heldTableTimestamps.has(table.id);
        const latestCall = tableCalls.reduce<TableCallResponse | null>((latest, call) => {
            if (!latest) return call;
            return getDateTimeMs(call.createdAt) > getDateTimeMs(latest.createdAt) ? call : latest;
        }, null);

        if (
            latestCall &&
            (!activeOrder || getDateTimeMs(latestCall.createdAt) >= getDateTimeMs(activeOrder.createdAt))
        ) {
            if (latestCall.callType === "WAITER_CALL") return "waiter";
            if (latestCall.callType === "BILL_REQUEST") return "bill";
        }

        if (activeOrder) return "ordered";
        if (activeSession || isHeld || tableCalls.length > 0) return "occupied";
        return "empty";
    }

    function getProductSummary(order: KitchenOrderResponse) {
        const detail = orderDetails[order.orderId];

        if (!detail?.items?.length) return "Ürün bilgisi yükleniyor";

        return detail.items
            .map((item) => `${item.quantity}x ${item.productName}`)
            .join(", ");
    }

    async function handleResolveCall(callId: number) {
        try {
            setActionLoadingId(callId);
            await resolveCall(callId, userEmail);
            await loadDashboard();
        } catch (err) {
            console.error(err);
            setError("Çağrı çözüldü olarak işaretlenemedi.");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleOpenOrderDetail(order: KitchenOrderResponse) {
        try {
            setOrderDetailOpen(true);
            setSelectedOrder(order);
            setSelectedOrderDetail(orderDetails[order.orderId] || null);
            setOrderDetailLoading(true);

            const detail = await getOrderDetail(order.orderId);
            setSelectedOrderDetail(detail);
            setOrderDetails((prev) => ({ ...prev, [order.orderId]: detail }));
        } catch (err) {
            console.error(err);
            setError("Sipariş detayı yüklenemedi.");
        } finally {
            setOrderDetailLoading(false);
        }
    }

    async function handleMarkOrderServed(orderId: number) {
        try {
            setOrderActionLoadingId(orderId);
            await markOrderServed(orderId);
            await loadDashboard();
        } catch (err) {
            console.error(err);
            setError("Sipariş servis edildi olarak işaretlenemedi.");
        } finally {
            setOrderActionLoadingId(null);
        }
    }

    return (
        <div className="flex min-h-screen bg-[var(--qresto-bg)] text-[var(--qresto-text)]">
            <aside className="sticky left-0 top-0 hidden h-screen w-[250px] shrink-0 flex-col bg-[var(--qresto-sidebar)] lg:flex">
                <div className="flex h-[92px] w-[250px] shrink-0 items-center justify-center overflow-hidden border-b border-[var(--qresto-border-strong)] bg-[var(--qresto-sidebar)]">
                    <img
                        src={sidebarLogo}
                        alt="QResto Logo"
                        className="block h-[84px] w-[238px] object-contain object-center"
                        draggable="false"
                    />
                </div>

                <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
                    <Link
                        to="/app/waiter/dashboard"
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                            currentView === "dashboard"
                                ? "bg-[var(--qresto-primary)] text-white shadow-lg shadow-orange-200/70"
                                : "text-[var(--qresto-muted)] hover:-translate-y-[2px] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] hover:shadow-lg hover:shadow-orange-200/20"
                        }`}
                    >
                        <LayoutDashboard size={19} />
                        Garson Paneli
                    </Link>
                    <SidebarJump to="/app/waiter/tables" active={currentView === "tables"} icon={<Table2 size={19} />} label="Masalar" />
                    <SidebarJump to="/app/waiter/orders" active={currentView === "orders"} icon={<ClipboardList size={19} />} label="Siparişler" />
                    <SidebarJump
                        to="/app/waiter/calls"
                        active={currentView === "calls"}
                        icon={<Bell size={19} />}
                        label="Garson Çağrıları"
                        badge={activeCalls.length}
                    />
                    <SidebarJump to="/app/waiter/payments" active={currentView === "payments"} icon={<CreditCard size={19} />} label="Ödemeler" />

                </nav>

                <div className="border-t border-[var(--qresto-border)] p-4">
                    <button
                        type="button"
                        onClick={() => void logout()}
                        className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-red-200 transition-all duration-200 hover:-translate-y-[2px] hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-300 active:translate-y-0"
                    >
                        <LogOut size={19} />
                        Çıkış Yap
                    </button>

                    <div className="mt-4 rounded-xl bg-[var(--qresto-hover)] p-4 text-xs text-[var(--qresto-muted)]">
                        <ShieldCheck size={18} className="mb-2 text-[var(--qresto-text)]" />
                        Hızlı, kolay ve kapsamlı yönetim QResto ile her şey kontrolünüz altında.
                    </div>
                </div>
            </aside>

            <main className="min-w-0 flex-1">
                <header className="sticky top-0 z-30 flex h-[92px] items-center justify-between border-b border-[var(--qresto-border-strong)] bg-[var(--qresto-surface)] px-5 shadow-[0_1px_10px_rgba(15,23,42,0.06)] md:px-7">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--qresto-text)]">{viewMeta[currentView].title}</h1>
                        <p className="mt-1 text-sm text-[var(--qresto-muted)]">
                            {viewMeta[currentView].subtitle}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative hidden h-11 items-center gap-3 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 text-sm font-bold text-[var(--qresto-text)] sm:flex">
                            <CalendarDays size={18} />
                            {currentDate}
                        </div>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)]"
                            aria-label="Tema değiştir"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                    </div>
                </header>

                <div className="p-4 md:p-6">
                    {error ? (
                        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 py-3 text-sm">
                            <TriangleAlert size={18} className="text-[var(--qresto-primary)]" />
                            {error}
                        </div>
                    ) : null}

                    {currentView !== "dashboard" ? (
                        <div className="space-y-5">
                            {currentView === "tables" ? (
                                <DashboardCard title="Masalar" count={tables.length}>
                                    {initialLoading ? <LoadingBox text="Masalar yükleniyor..." /> : null}
                                    {!initialLoading && tables.length === 0 ? <EmptyBox text="Henüz masa bulunamadı." /> : null}
                                    <TableCardsGrid
                                        tables={tables}
                                        getTableStatus={getTableStatus}
                                        activeCallByTableId={activeCallByTableId}
                                    />
                                </DashboardCard>
                            ) : null}

                            {currentView === "orders" ? (
                                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                    <DashboardCard title="Aktif Siparişler" count={activeOrders.length}>
                                        <OrdersTable
                                            orders={activeOrders}
                                            loading={initialLoading}
                                            orderDetails={orderDetails}
                                            getProductSummary={getProductSummary}
                                            getTableDisplayName={getTableDisplayName}
                                            orderActionLoadingId={orderActionLoadingId}
                                            onOpenDetail={handleOpenOrderDetail}
                                            onMarkServed={handleMarkOrderServed}
                                            limit={false}
                                        />
                                    </DashboardCard>
                                    <DashboardCard title="Geçmiş Siparişler" count={archivedOrders.length}>
                                        <RecentOrdersList
                                            orders={archivedOrders}
                                            getProductSummary={getProductSummary}
                                            getTableDisplayName={getTableDisplayName}
                                            onOpenDetail={handleOpenOrderDetail}
                                        />
                                    </DashboardCard>
                                </div>
                            ) : null}

                            {currentView === "calls" ? (
                                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                    <DashboardCard title="Aktif Garson Çağrıları" count={activeCalls.length}>
                                        <CallsList
                                            calls={activeCalls}
                                            actionLoadingId={actionLoadingId}
                                            getTableDisplayName={getTableDisplayName}
                                            onOpenDetail={setSelectedCall}
                                            onAskResolve={setConfirmResolveCall}
                                        />
                                    </DashboardCard>
                                    <DashboardCard title="Geçmiş Çağrılar" count={archivedCalls.length}>
                                        <ArchivedCallsList
                                            calls={archivedCalls}
                                            getTableDisplayName={getTableDisplayName}
                                            onOpenDetail={setSelectedCall}
                                        />
                                    </DashboardCard>
                                </div>
                            ) : null}

                            {currentView === "payments" ? (
                                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                                    <DashboardCard title="Ödeme Durumları" count={paymentRows.length}>
                                        <PaymentStatusList
                                            rows={paymentRows}
                                            getTableDisplayName={getTableDisplayName}
                                        />
                                    </DashboardCard>
                                    <div className="space-y-4">
                                        <SummaryCard
                                            icon={<WalletCards size={24} />}
                                            title="Toplam Ciro"
                                            value={formatMoney(paidTotal)}
                                            tone="green"
                                        />
                                        <SummaryCard
                                            icon={<CreditCard size={24} />}
                                            title="Bekleyen Ödeme"
                                            value={String(pendingPaymentCount)}
                                            tone="orange"
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="space-y-5">
                            <section id="tables" className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-sm">
                                <SectionTitle title="Masalar">
                                    <LegendDot color={tableStatusMeta.ordered.color} label="Sipariş Verildi" />
                                    <LegendDot color={tableStatusMeta.bill.color} label="Hesap İstendi" />
                                    <LegendDot color={tableStatusMeta.waiter.color} label="Garson Çağırdı" />
                                    <LegendDot color={tableStatusMeta.empty.color} label="Boş" />
                                </SectionTitle>

                                {initialLoading ? <LoadingBox text="Masalar yükleniyor..." /> : null}
                                {!initialLoading && tables.length === 0 ? <EmptyBox text="Henüz masa bulunamadı." /> : null}

                                <TableCardsGrid
                                    tables={tables}
                                    getTableStatus={getTableStatus}
                                    activeCallByTableId={activeCallByTableId}
                                />
                            </section>

                            <section id="orders" className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
                                <DashboardCard
                                    title="Aktif Siparişler"
                                    actionLabel="Tümünü Gör"
                                    actionTo="/app/waiter/orders"
                                    count={activeOrders.length}
                                >
                                    <OrdersTable
                                        orders={activeOrders}
                                        loading={initialLoading}
                                        orderDetails={orderDetails}
                                        getProductSummary={getProductSummary}
                                        getTableDisplayName={getTableDisplayName}
                                        orderActionLoadingId={orderActionLoadingId}
                                        onOpenDetail={handleOpenOrderDetail}
                                        onMarkServed={handleMarkOrderServed}
                                    />
                                </DashboardCard>

                                <DashboardCard
                                    title="Son Siparişler"
                                    actionLabel="Tümünü Gör"
                                    actionTo="/app/waiter/orders"
                                    count={archivedOrders.length}
                                >
                                    <RecentOrdersList
                                        orders={archivedOrders.slice(0, 6)}
                                        getProductSummary={getProductSummary}
                                        getTableDisplayName={getTableDisplayName}
                                        onOpenDetail={handleOpenOrderDetail}
                                    />
                                </DashboardCard>
                            </section>
                        </div>

                        <aside className="space-y-5">
                            <DashboardCard id="calls" title="Garson Çağrıları" actionLabel="Tümünü Gör" actionTo="/app/waiter/calls" count={activeCalls.length}>
                                <CallsList
                                    calls={activeCalls.slice(0, 5)}
                                    actionLoadingId={actionLoadingId}
                                    getTableDisplayName={getTableDisplayName}
                                    onOpenDetail={setSelectedCall}
                                    onAskResolve={setConfirmResolveCall}
                                />
                            </DashboardCard>

                            <DashboardCard id="payments" title="Ödeme Durumları" actionLabel="Tümünü Gör" actionTo="/app/waiter/payments" count={paymentRows.length}>
                                <PaymentStatusList
                                    rows={paymentRows.slice(0, 6)}
                                    getTableDisplayName={getTableDisplayName}
                                />
                            </DashboardCard>

                            <DashboardCard title="Geçmiş Çağrılar" actionLabel="Tümünü Gör" actionTo="/app/waiter/calls" count={archivedCalls.length}>
                                <ArchivedCallsList
                                    calls={archivedCalls.slice(0, 5)}
                                    getTableDisplayName={getTableDisplayName}
                                    onOpenDetail={setSelectedCall}
                                />
                            </DashboardCard>

                            <div className="grid grid-cols-1 gap-4">
                                <SummaryCard
                                    icon={<WalletCards size={24} />}
                                    title="Toplam Ciro"
                                    value={formatMoney(paidTotal)}
                                    tone="green"
                                />
                                <SummaryCard
                                    icon={<CreditCard size={24} />}
                                    title="Bekleyen Ödeme"
                                    value={String(pendingPaymentCount)}
                                    tone="orange"
                                />
                            </div>
                        </aside>
                    </div>
                    )}
                </div>
            </main>

            {orderDetailOpen && selectedOrder ? (
                <OrderDetailModal
                    order={selectedOrder}
                    detail={selectedOrderDetail}
                    loading={orderDetailLoading}
                    tableName={
                        selectedOrderDetail?.tableName ||
                        getTableDisplayName(selectedOrder.tableId, selectedOrder.tableNumber)
                    }
                    onClose={() => {
                        setOrderDetailOpen(false);
                        setSelectedOrder(null);
                        setSelectedOrderDetail(null);
                    }}
                    onMarkServed={handleMarkOrderServed}
                    actionLoadingId={orderActionLoadingId}
                />
            ) : null}

            {selectedCall ? (
                <CallDetailModal
                    call={selectedCall}
                    tableName={getTableDisplayName(selectedCall.tableId, selectedCall.tableNumber)}
                    actionLoadingId={actionLoadingId}
                    onClose={() => setSelectedCall(null)}
                    onAskResolve={() => setConfirmResolveCall(selectedCall)}
                />
            ) : null}

            {confirmResolveCall ? (
                <ConfirmResolveCallModal
                    call={confirmResolveCall}
                    tableName={getTableDisplayName(confirmResolveCall.tableId, confirmResolveCall.tableNumber)}
                    actionLoading={actionLoadingId === confirmResolveCall.id}
                    onCancel={() => setConfirmResolveCall(null)}
                    onConfirm={async () => {
                        await handleResolveCall(confirmResolveCall.id);
                        setConfirmResolveCall(null);
                        setSelectedCall(null);
                    }}
                />
            ) : null}
        </div>
    );
}

function SidebarJump({
    to,
    active = false,
    icon,
    label,
    badge,
}: {
    to: string;
    active?: boolean;
    icon: ReactNode;
    label: string;
    badge?: number;
}) {
    return (
        <Link
            to={to}
            className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-[2px] ${
                active
                    ? "bg-[var(--qresto-primary)] text-white shadow-lg shadow-orange-200/70"
                    : "text-[var(--qresto-muted)] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] hover:shadow-lg hover:shadow-orange-200/20"
            }`}
        >
            <span className="flex items-center gap-3">
                {icon}
                {label}
            </span>
            {badge ? (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-black text-white">
                    {badge}
                </span>
            ) : null}
        </Link>
    );
}

function SectionTitle({ title, children }: { title: string; children?: ReactNode }) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-lg font-black">{title}</h2>
            {children ? (
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[var(--qresto-muted)]">
                    {children}
                </div>
            ) : null}
        </div>
    );
}

function DashboardCard({
    id,
    title,
    actionLabel,
    actionTo,
    count,
    children,
}: {
    id?: string;
    title: string;
    actionLabel?: string;
    actionTo?: string;
    count?: number;
    children: ReactNode;
}) {
    return (
        <section id={id} className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black">{title}</h2>
                    {typeof count === "number" ? (
                        <span className="rounded-full bg-[var(--qresto-hover)] px-2.5 py-1 text-xs font-black text-[var(--qresto-primary)]">
                            {count}
                        </span>
                    ) : null}
                </div>
                {actionLabel && actionTo ? (
                    <Link to={actionTo} className="text-xs font-black text-[#2f80ed]">
                        {actionLabel}
                    </Link>
                ) : actionLabel ? (
                    <span className="text-xs font-black text-[#2f80ed]">{actionLabel}</span>
                ) : null}
            </div>
            {children}
        </section>
    );
}

function TableCardsGrid({
    tables,
    getTableStatus,
    activeCallByTableId,
}: {
    tables: QrTableResponse[];
    getTableStatus: (table: QrTableResponse) => TableVisualStatus;
    activeCallByTableId: Map<number, TableCallResponse[]>;
}) {
    return (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {tables.map((table) => {
                const status = getTableStatus(table);
                const meta = tableStatusMeta[status];
                const tableCalls = activeCallByTableId.get(table.id) || [];
                const hasWaiterCall = tableCalls.some((call) => call.callType === "WAITER_CALL");
                const hasBillCall = tableCalls.some((call) => call.callType === "BILL_REQUEST");

                return (
                    <article
                        key={table.id}
                        className="relative min-h-[150px] rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ borderColor: meta.border, background: meta.bg }}
                    >
                        <div className="absolute right-3 top-3 flex gap-1.5">
                            {hasWaiterCall ? <AlertBubble color="#7c4dff" icon={<Bell size={14} />} /> : null}
                            {hasBillCall ? <AlertBubble color="#2f80ed" icon={<ReceiptText size={14} />} /> : null}
                        </div>

                        <h2 className="text-lg font-black text-[#111827]">{table.name}</h2>
                        <p className="mt-1 text-sm font-semibold text-[#475569]">
                            {table.capacity || "-"} Kişilik
                        </p>

                        <div className="mt-6 flex items-center gap-3 font-black" style={{ color: meta.color }}>
                            {meta.icon}
                            <span>{meta.label}</span>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

function OrdersTable({
    orders,
    loading,
    getProductSummary,
    getTableDisplayName,
    orderActionLoadingId,
    onOpenDetail,
    onMarkServed,
    limit = true,
}: {
    orders: KitchenOrderResponse[];
    loading: boolean;
    orderDetails: Record<number, OrderDetailResponse>;
    getProductSummary: (order: KitchenOrderResponse) => string;
    getTableDisplayName: (tableId?: number, tableNumber?: number) => string;
    orderActionLoadingId: number | null;
    onOpenDetail: (order: KitchenOrderResponse) => void;
    onMarkServed: (orderId: number) => void;
    limit?: boolean;
}) {
    if (loading) return <LoadingBox text="Siparişler yükleniyor..." />;
    if (orders.length === 0) return <EmptyBox text="Aktif sipariş yok." />;

    const visibleOrders = limit ? orders.slice(0, 7) : orders;

    return (
        <div className="w-full overflow-hidden">
            <table className="w-full table-fixed border-collapse text-left text-sm">
                <thead className="text-xs font-black text-[var(--qresto-muted)]">
                    <tr>
                        <th className="w-[18%] px-2 py-3">Masa</th>
                        <th className="w-[34%] px-2 py-3">Ürünler</th>
                        <th className="w-[18%] px-2 py-3">Durum</th>
                        <th className="w-[18%] px-2 py-3">Sipariş Saati</th>
                        <th className="w-[12%] px-2 py-3" />
                    </tr>
                </thead>
                <tbody>
                    {visibleOrders.map((order) => (
                        <tr
                            key={order.orderId}
                            role="button"
                            tabIndex={0}
                            onClick={() => onOpenDetail(order)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onOpenDetail(order);
                                }
                            }}
                            className="cursor-pointer border-t border-[var(--qresto-border)] transition hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--qresto-primary)]/30"
                        >
                            <td className="px-2 py-3 font-black">
                                <span className="inline-flex min-w-0 items-center gap-2">
                                    <ShoppingCart size={18} className="text-[#ff7a1a]" />
                                    <span className="truncate">{getTableDisplayName(order.tableId, order.tableNumber)}</span>
                                </span>
                            </td>
                            <td className="max-w-[340px] truncate px-2 py-3 text-xs font-semibold text-[var(--qresto-muted)]">
                                {getProductSummary(order)}
                            </td>
                            <td className="px-2 py-3">
                                <StatusPill status={order.status} />
                            </td>
                            <td className="px-2 py-3 text-xs font-black text-[var(--qresto-muted)]">
                                {formatDateTime(order.createdAt)}
                            </td>
                            <td className="px-2 py-3 pr-6">
                                <div className="flex justify-start gap-2">
                                    {normalizeOrderStatus(order.status) === "READY" ? (
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onMarkServed(order.orderId);
                                            }}
                                            disabled={orderActionLoadingId === order.orderId}
                                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[var(--qresto-primary)] text-white disabled:cursor-not-allowed disabled:opacity-60"
                                            aria-label="Servis edildi"
                                        >
                                            {orderActionLoadingId === order.orderId ? (
                                                <Loader2 size={15} className="animate-spin" />
                                            ) : (
                                                <CheckCircle2 size={15} />
                                            )}
                                        </button>
                                    ) : null}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function RecentOrdersList({
    orders,
    getProductSummary,
    getTableDisplayName,
    onOpenDetail,
}: {
    orders: KitchenOrderResponse[];
    getProductSummary: (order: KitchenOrderResponse) => string;
    getTableDisplayName: (tableId?: number, tableNumber?: number) => string;
    onOpenDetail: (order: KitchenOrderResponse) => void;
}) {
    if (orders.length === 0) return <EmptyBox text="Geçmiş sipariş yok." />;

    return (
        <div className="divide-y divide-[var(--qresto-border)]">
            {orders.map((order) => (
                <button
                    key={order.orderId}
                    type="button"
                    onClick={() => onOpenDetail(order)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-3 text-left text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)]"
                >
                    <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-black transition group-hover:text-[var(--qresto-primary)]">
                            <ShoppingCart size={17} className="text-[#ff7a1a]" />
                            {getTableDisplayName(order.tableId, order.tableNumber)}
                        </span>
                        <span className="mt-1 block truncate text-xs font-semibold text-[var(--qresto-muted)]">
                            {getProductSummary(order)}
                        </span>
                    </span>
                    <span className="shrink-0 text-xs font-black text-[var(--qresto-muted)]">
                        {formatRelativeTime(order.updatedAt || order.createdAt)}
                    </span>
                </button>
            ))}
        </div>
    );
}

function CallsList({
    calls,
    actionLoadingId,
    getTableDisplayName,
    onOpenDetail,
    onAskResolve,
}: {
    calls: TableCallResponse[];
    actionLoadingId: number | null;
    getTableDisplayName: (tableId?: number, tableNumber?: number) => string;
    onOpenDetail: (call: TableCallResponse) => void;
    onAskResolve: (call: TableCallResponse) => void;
}) {
    if (calls.length === 0) return <EmptyBox text="Aktif çağrı bulunmuyor." />;

    return (
        <div className="space-y-3">
            {calls.map((call) => {
                const isBill = call.callType === "BILL_REQUEST";
                const color = isBill ? "#2f80ed" : "#7c4dff";

                return (
                    <div
                        key={call.id}
                        onClick={() => onOpenDetail(call)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onOpenDetail(call);
                            }
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--qresto-primary)]/30 ${
                            actionLoadingId === call.id ? "opacity-60" : ""
                        }`}
                    >
                        <span className="flex min-w-0 items-center gap-3">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: `${color}18`, color }}>
                                {actionLoadingId === call.id ? <Loader2 size={18} className="animate-spin" /> : <Bell size={19} />}
                            </span>
                            <span className="min-w-0">
                                <strong className="block text-sm">{getTableDisplayName(call.tableId, call.tableNumber)}</strong>
                                <span className="mt-0.5 block truncate text-xs font-semibold text-[var(--qresto-muted)]">
                                    {getCallTypeLabel(call.callType)}
                                </span>
                            </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                            <span className="text-xs font-black text-red-500">{formatRelativeTime(call.createdAt)}</span>
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onAskResolve(call);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onAskResolve(call);
                                    }
                                }}
                                className="cursor-pointer rounded-lg bg-[var(--qresto-primary)] px-3 py-1.5 text-xs font-black text-white"
                            >
                                Tamamla
                            </span>
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function PaymentStatusList({
    rows,
    getTableDisplayName,
}: {
    rows: KitchenOrderResponse[];
    getTableDisplayName: (tableId?: number, tableNumber?: number) => string;
}) {
    if (rows.length === 0) return <EmptyBox text="Ödeme kaydı bulunmuyor." />;

    return (
        <div className="divide-y divide-[var(--qresto-border)]">
            {rows.map((order, index) => {
                const paid = isOrderPaid(order.status);
                const iconColor = paid ? "#23864b" : index % 2 === 0 ? "#f59e0b" : "#7c4dff";
                const label = paid ? "Ödendi" : index % 2 === 0 ? "Hesap Bekleniyor" : "Masada Ödeme";

                return (
                    <div key={order.orderId} className="flex items-center justify-between gap-3 py-3">
                        <span className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: iconColor }}>
                                {paid ? <CheckCircle2 size={16} /> : <CreditCard size={16} />}
                            </span>
                            <strong className="text-sm">{getTableDisplayName(order.tableId, order.tableNumber)}</strong>
                        </span>
                        <span className="text-xs font-bold text-[var(--qresto-muted)]">{label}</span>
                        <ChevronRight size={17} className="text-[var(--qresto-muted)]" />
                    </div>
                );
            })}
        </div>
    );
}

function ArchivedCallsList({
    calls,
    getTableDisplayName,
    onOpenDetail,
}: {
    calls: TableCallResponse[];
    getTableDisplayName: (tableId?: number, tableNumber?: number) => string;
    onOpenDetail: (call: TableCallResponse) => void;
}) {
    if (calls.length === 0) return <EmptyBox text="Geçmiş çağrı yok." />;

    return (
        <div className="divide-y divide-[var(--qresto-border)]">
            {calls.map((call) => (
                <div
                    key={call.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenDetail(call)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onOpenDetail(call);
                        }
                    }}
                    className="cursor-pointer rounded-xl px-2 py-3 text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--qresto-primary)]/30"
                >
                    <div className="flex items-center justify-between gap-3">
                        <strong className="text-sm">{getTableDisplayName(call.tableId, call.tableNumber)}</strong>
                        <span className="text-xs font-black text-[var(--qresto-muted)]">
                            {formatDateTime(call.resolvedAt || call.createdAt)}
                        </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-[var(--qresto-muted)]">
                        {getCallTypeLabel(call.callType)}
                    </p>
                </div>
            ))}
        </div>
    );
}

function CallDetailModal({
    call,
    tableName,
    actionLoadingId,
    onClose,
    onAskResolve,
}: {
    call: TableCallResponse;
    tableName: string;
    actionLoadingId: number | null;
    onClose: () => void;
    onAskResolve: () => void;
}) {
    const isActive = call.status === "ACTIVE";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Kapat" />

            <div className="relative z-10 w-full max-w-xl rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--qresto-border)] pb-4">
                    <div>
                        <span className="inline-flex rounded-md bg-[var(--qresto-hover)] px-3 py-1 text-xs font-black text-[var(--qresto-primary)]">
                            {isActive ? "Aktif Çağrı" : "Geçmiş Çağrı"}
                        </span>
                        <h2 className="mt-3 text-xl font-black">{tableName}</h2>
                        <p className="mt-1 text-sm font-semibold text-[var(--qresto-muted)]">
                            {getCallTypeLabel(call.callType)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--qresto-border)] text-xl font-black"
                    >
                        ×
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoTile label="Oluşturan" value="Müşteri" />
                    <InfoTile label="Oluşturulma Tarihi" value={formatDateTime(call.createdAt)} />
                    {!isActive ? (
                        <>
                            <InfoTile label="Tamamlanma Tarihi" value={call.resolvedAt ? formatDateTime(call.resolvedAt) : "-"} />
                            <InfoTile label="Tamamlayan" value={call.resolvedBy || "-"} />
                        </>
                    ) : null}
                    <InfoTile label="Durum" value={getCallStatusLabel(call.status)} />
                </div>

                <div className="mt-4 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                    <p className="text-xs font-black text-[var(--qresto-muted)]">Mesaj</p>
                    <p className="mt-2 text-sm font-semibold">
                        {call.message || "Mesaj girilmedi."}
                    </p>
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-[var(--qresto-border)] pt-4">
                    <button type="button" onClick={onClose} className="rounded-xl border border-[var(--qresto-border)] px-4 py-2 text-sm font-bold">
                        Kapat
                    </button>
                    {isActive ? (
                        <button
                            type="button"
                            onClick={onAskResolve}
                            disabled={actionLoadingId === call.id}
                            className="cursor-pointer rounded-xl bg-[var(--qresto-primary)] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Tamamla
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function ConfirmResolveCallModal({
    call,
    tableName,
    actionLoading,
    onCancel,
    onConfirm,
}: {
    call: TableCallResponse;
    tableName: string;
    actionLoading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
            <button type="button" className="absolute inset-0 bg-black/60" onClick={onCancel} aria-label="Vazgeç" />

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-2xl">
                <h2 className="text-xl font-black">Çağrı tamamlansın mı?</h2>
                <p className="mt-3 text-sm font-semibold text-[var(--qresto-muted)]">
                    {tableName} için {getCallTypeLabel(call.callType).toLowerCase()} kaydını tamamlandı olarak işaretleyeceksiniz.
                </p>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 rounded-xl border border-[var(--qresto-border)] px-4 py-3 text-sm font-black"
                    >
                        Vazgeç
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={actionLoading}
                        className="flex-1 cursor-pointer rounded-xl bg-[var(--qresto-primary)] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {actionLoading ? "Tamamlanıyor..." : "Tamamla"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function AlertBubble({ color, icon }: { color: string; icon: ReactNode }) {
    return (
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg" style={{ background: color }}>
            {icon}
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500" />
        </span>
    );
}

function StatusPill({ status }: { status?: string }) {
    const tone = getOrderStatusTone(status);

    return (
        <span className="inline-flex rounded-md px-2.5 py-1 text-xs font-black" style={{ background: tone.bg, color: tone.text }}>
            {getOrderStatusLabel(status)}
        </span>
    );
}

function SummaryCard({
    icon,
    title,
    value,
    tone,
}: {
    icon: ReactNode;
    title: string;
    value: string;
    tone: "green" | "orange";
}) {
    const isGreen = tone === "green";

    return (
        <div
            className="flex items-center gap-5 rounded-2xl p-5 shadow-sm"
            style={{
                background: isGreen ? "#f0faef" : "#fff3ea",
                color: isGreen ? "#178545" : "#f05a1a",
            }}
        >
            {icon}
            <div>
                <p className="text-sm font-black text-[var(--qresto-muted)]">{title}</p>
                <p className="mt-1 text-2xl font-black">{value}</p>
            </div>
        </div>
    );
}

function LegendDot({ color, label }: { color: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {label}
        </span>
    );
}

function LoadingBox({ text }: { text: string }) {
    return (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-[var(--qresto-border)] p-8 text-sm font-bold text-[var(--qresto-muted)]">
            <Loader2 size={18} className="animate-spin" />
            {text}
        </div>
    );
}

function EmptyBox({ text }: { text: string }) {
    return (
        <div className="rounded-xl border border-[var(--qresto-border)] p-6 text-center text-sm font-bold text-[var(--qresto-muted)]">
            {text}
        </div>
    );
}

function OrderDetailModal({
    order,
    detail,
    loading,
    tableName,
    onClose,
    onMarkServed,
    actionLoadingId,
}: {
    order: KitchenOrderResponse;
    detail: OrderDetailResponse | null;
    loading: boolean;
    tableName: string;
    onClose: () => void;
    onMarkServed: (orderId: number) => void;
    actionLoadingId: number | null;
}) {
    const items = Array.isArray(detail?.items) ? detail.items : [];
    const status = detail?.status || order.status;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Kapat" />

            <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--qresto-border)] pb-4">
                    <div>
                        <StatusPill status={status} />
                        <h2 className="mt-3 text-xl font-black">{tableName}</h2>
                        <p className="mt-1 text-sm text-[var(--qresto-muted)]">
                            Sipariş No: {detail?.orderNo || order.orderNumber || order.orderId}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--qresto-border)] text-xl font-black"
                    >
                        ×
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <InfoTile label="Oluşturulma" value={formatDateTime(detail?.createdAt || order.createdAt)} />
                    <InfoTile label="Güncellenme" value={formatDateTime(detail?.updatedAt || order.updatedAt)} />
                    <InfoTile label="Toplam" value={formatMoney(detail?.totalAmount ?? order.totalAmount)} />
                </div>

                <div className="mt-5">
                    <h3 className="text-sm font-black text-[var(--qresto-muted)]">Sipariş İçeriği</h3>

                    {loading ? (
                        <LoadingBox text="Detaylar yükleniyor..." />
                    ) : items.length === 0 ? (
                        <EmptyBox text="Bu sipariş için ürün detayı bulunamadı." />
                    ) : (
                        <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
                            {items.map((item) => (
                                <div key={item.id} className="rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h4 className="font-black">{item.productName}</h4>
                                            <p className="mt-1 text-xs text-[var(--qresto-muted)]">
                                                Birim: {formatMoney(item.productPrice)}
                                            </p>
                                        </div>
                                        <span className="rounded-md bg-[var(--qresto-hover)] px-3 py-1 text-xs font-black text-[var(--qresto-primary)]">
                                            x{item.quantity}
                                        </span>
                                    </div>

                                    {item.note ? (
                                        <p className="mt-3 text-xs text-[var(--qresto-muted)]">Not: {item.note}</p>
                                    ) : null}

                                    {item.removedIngredients ? (
                                        <p className="mt-2 text-xs text-[var(--qresto-muted)]">
                                            Çıkarılanlar: {item.removedIngredients}
                                        </p>
                                    ) : null}

                                    {item.addedIngredients ? (
                                        <p className="mt-2 text-xs text-[var(--qresto-muted)]">
                                            Eklenenler: {item.addedIngredients}
                                        </p>
                                    ) : null}

                                    {item.cancelReason ? (
                                        <p className="mt-2 text-xs text-red-500">
                                            İptal nedeni: {item.cancelReason}
                                        </p>
                                    ) : null}

                                    {item.cancelledAt ? (
                                        <p className="mt-2 text-xs text-[var(--qresto-muted)]">
                                            İptal zamanı: {formatDateTime(item.cancelledAt)}
                                        </p>
                                    ) : null}

                                    <p className="mt-3 text-right text-sm font-black">{formatMoney(item.lineTotal)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-[var(--qresto-border)] pt-4">
                    <button type="button" onClick={onClose} className="rounded-xl border border-[var(--qresto-border)] px-4 py-2 text-sm font-bold">
                        Kapat
                    </button>
                    {normalizeOrderStatus(status) === "READY" ? (
                        <button
                            type="button"
                            onClick={() => onMarkServed(order.orderId)}
                            disabled={actionLoadingId === order.orderId}
                            className="rounded-xl bg-[var(--qresto-primary)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                        >
                            Servis Edildi
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function InfoTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-3">
            <p className="text-xs font-bold text-[var(--qresto-muted)]">{label}</p>
            <p className="mt-1 text-sm font-black">{value}</p>
        </div>
    );
}
