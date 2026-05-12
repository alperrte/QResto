import { useEffect, useMemo, useState } from "react";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
    Bell,
    CheckCircle2,
    ClipboardList,
    Coffee,
    Loader2,
    ReceiptText,
    Soup,
    Table2,
    TriangleAlert,
} from "lucide-react";

import {
    WAITER_API_URL,
    getAllCalls,
    getCancelledOrders,
    getReadyOrders,
    getTables,
    markOrderServed,
    resolveCall,
    markBillPaid,
    getActiveTableSession,
    type KitchenOrderResponse,
    type QrTableResponse,
    type TableCallResponse,
    type TableCallType,
    type TableSessionResponse,
} from "../../services/waiterService";



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

function getCallTypeLabel(type: TableCallType) {
    switch (type) {
        case "WAITER_CALL":
            return "Garson Çağırdı";
        case "BILL_REQUEST":
            return "Hesap İstedi";
        default:
            return type;
    }
}

function getCallStatusLabel(status: TableCallResponse["status"]) {
    switch (status) {
        case "ACTIVE":
            return "Aktif";
        case "RESOLVED":
            return "Tamamlandı";
        case "CANCELLED":
            return "İptal Edildi";
        default:
            return status;
    }
}

function getCallTypeIcon(type: TableCallType) {
    switch (type) {
        case "WAITER_CALL":
            return <Bell size={18} />;
        case "BILL_REQUEST":
            return <ReceiptText size={18} />;
        default:
            return <Bell size={18} />;
    }
}

function formatDateTime(value?: string | null) {
    if (!value) return "-";

    try {
        // Parse date defensively: if incoming string lacks timezone, treat it as UTC
        const parseToDate = (v: string) => {
            if (!v) return new Date(0);
            // numeric epoch
            if (/^\d+$/.test(v)) return new Date(Number(v));

            // contains timezone designator (Z or +hh:mm or -hh:mm)
            if (/[Zz]|[+\-]\d{2}:?\d{2}/.test(v)) return new Date(v);

            // iso-like without timezone -> append Z to treat as UTC
            const isoLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/;
            if (isoLike.test(v)) return new Date(v + "Z");

            // fallback
            return new Date(v);
        };

        const dt = parseToDate(value);

        return new Intl.DateTimeFormat("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "Europe/Istanbul",
        }).format(dt);
    } catch {
        return value;
    }
}

function normalizeOrderStatus(status?: string) {
    return (status || "UNKNOWN").toUpperCase();
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
        case "RECEIVED":
            return { bg: "#eef5ff", text: "#2f80ed" };
        case "PREPARING":
            return { bg: "#fff4e8", text: "#d97706" };
        case "READY":
            return { bg: "#eafaf1", text: "#1f8f4a" };
        case "SERVED":
            return { bg: "#f2ecff", text: "#7c4dff" };
        case "PAYMENT_PENDING":
            return { bg: "#fff8e6", text: "#c79200" };
        case "PAID":
            return { bg: "#edf9f0", text: "#2f9d57" };
        case "COMPLETED":
            return { bg: "#edf9f0", text: "#2f9d57" };
        case "CANCELLED":
            return { bg: "#fdecec", text: "#c0392b" };
        default:
            return { bg: "#eef5ff", text: "#2f80ed" };
    }
}

function isOrderArchived(status?: string) {
    const normalized = normalizeOrderStatus(status);
    return normalized === "CANCELLED" || normalized === "COMPLETED" || normalized === "PAID";
}

export default function WaiterDashboard() {
    const [calls, setCalls] = useState<TableCallResponse[]>([]);
    const [tables, setTables] = useState<QrTableResponse[]>([]);
    const [orders, setOrders] = useState<KitchenOrderResponse[]>([]);
    const [tableSessions, setTableSessions] = useState<TableSessionResponse[]>([]);
    const [heldTableTimestamps, setHeldTableTimestamps] = useState<Map<number, number>>(new Map());

    const [initialLoading, setInitialLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [orderActionLoadingId, setOrderActionLoadingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    function getCurrentUserEmail() {
        try {
            const token = localStorage.getItem("qresto-access-token");

            if (!token) return "waiter@qresto.com";

            const payloadBase64 = token.split(".")[1];
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson) as { email?: string };

            return payload.email || "waiter@qresto.com";
        } catch {
            return "waiter@qresto.com";
        }
    }
    const userEmail = getCurrentUserEmail();

    async function loadDashboard({ showLoading = false }: { showLoading?: boolean } = {}) {
        try {
            setError(null);

            const [allCallsData, tablesData, readyOrdersData, cancelledOrdersData] = await Promise.all([
                getAllCalls().catch(() => []),
                getTables().catch(() => []),
                getReadyOrders().catch(() => []),
                getCancelledOrders().catch(() => []),
            ]);

            setCalls(ensureArray<TableCallResponse>(allCallsData));

            const tableList = ensureArray<QrTableResponse>(tablesData);
            setTables(tableList);

            const activeSessions = await Promise.all(
                tableList.map(async (table) => {
                    const session = await getActiveTableSession(table.id);
                    return session;
                })
            );

            setTableSessions(
                activeSessions.filter(
                    (session): session is TableSessionResponse => Boolean(session)
                )
            );



            const fetched = [
                ...ensureArray<KitchenOrderResponse>(readyOrdersData),
                ...ensureArray<KitchenOrderResponse>(cancelledOrdersData),
            ];

            // Merge fetched orders with existing orders to avoid briefly losing STOMP-driven items.
            setOrders((prev) => {
                const map = new Map<number, KitchenOrderResponse>();

                // keep previous entries first
                prev.forEach((o) => map.set(o.orderId, o));

                // overwrite/insert fetched entries
                fetched.forEach((o) => map.set(o.orderId, { ...map.get(o.orderId), ...o }));

                // also keep recent STOMP-added orders that backend polling might not return yet
                const now = Date.now();
                prev.forEach((o) => {
                    if (!map.has(o.orderId)) {
                        const created = o.createdAt ? new Date(o.createdAt).getTime() : now;
                        // keep if created within last 30 seconds
                        if (now - created < 30_000) {
                            map.set(o.orderId, o);
                        }
                    }
                });

                return Array.from(map.values()).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
            });
        } catch (err) {
            console.error(err);
            setCalls([]);
            setTables([]);
            setOrders([]);
            setError("Garson paneli verileri yüklenirken bir hata oluştu.");
        } finally {
            if (showLoading) {
                setInitialLoading(false);
            }
        }
    }

    useEffect(() => {
        loadDashboard({ showLoading: true }).finally(() => {
            setInitialLoading(false);
        });
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

                    loadDashboard().catch(() => {
                        // ignore; websocket data will continue to update the live list
                    });

                    client.subscribe('/topic/waiter/calls', (message) => {
                        try {
                            const body = JSON.parse(message.body) as TableCallResponse;

                            setCalls((prev) => {
                                if (!body) return prev;

                                // update held state timestamps: record last activity when waiter call active
                                try {
                                    if (body.tableId) {
                                        if (body.callType === "WAITER_CALL" && body.status === "ACTIVE") {
                                            setHeldTableTimestamps((prev) => {
                                                const next = new Map(prev);
                                                next.set(body.tableId!, Date.now());
                                                return next;
                                            });
                                        }

                                        // if a bill request was resolved, release hold
                                        if (body.callType === "BILL_REQUEST" && body.status === "RESOLVED") {
                                            setHeldTableTimestamps((prev) => {
                                                const next = new Map(prev);
                                                next.delete(body.tableId!);
                                                return next;
                                            });
                                        }
                                    }
                                } catch (e) {
                                    // ignore held state errors
                                }

                                const exists = prev.find((c) => c.id === body.id);
                                if (exists) {
                                    return prev.map((c) => (c.id === body.id ? body : c));
                                }

                                return [body, ...prev];
                            });
                        } catch (err) {
                            console.error('Error parsing STOMP message', err);
                        }
                    });

                    client.subscribe('/topic/waiter/orders', (message) => {
                        try {
                            const body = JSON.parse(message.body) as KitchenOrderResponse;

                            setOrders((prev) => {
                                if (!body) return prev;

                                const exists = prev.find((o) => o.orderId === body.orderId);
                                if (exists) {
                                    return prev.map((o) => (o.orderId === body.orderId ? { ...o, ...body } : o));
                                }

                                // when an order arrives, update last-activity timestamp to hold the table
                                try {
                                                    if (body.tableId) {
                                                        setHeldTableTimestamps((prev) => {
                                                            const next = new Map(prev);
                                                            next.set(body.tableId!, Date.now());
                                                            return next;
                                                        });
                                                    }
                                } catch (e) {
                                    /* ignore */
                                }

                                return [body, ...prev];
                            });
                        } catch (err) {
                            console.error('Error parsing STOMP order message', err);
                        }
                    });

                    if (!refreshTimer) {
                                refreshTimer = window.setInterval(() => {
                                    loadDashboard().catch(() => {
                                        // keep the live view running even if polling briefly fails
                                    });

                                    // periodically cleanup held timestamps older than 30 minutes
                                    setHeldTableTimestamps((prev) => {
                                        const next = new Map(prev);
                                        const now = Date.now();
                                        const ttl = 30 * 60 * 1000; // 30 minutes
                                        Array.from(next.entries()).forEach(([tableId, ts]) => {
                                            if (now - ts > ttl) next.delete(tableId);
                                        });
                                        return next;
                                    });
                                }, 15000);
                    }
                },
                onWebSocketError: (event) => {
                    console.error('WebSocket error', event);
                },
                onWebSocketClose: () => {
                    console.warn('WebSocket connection closed, reconnecting...');
                },
                onStompError: (frame) => console.error('STOMP error', frame),
            });

            client.activate();
        } catch (err) {
            console.error('WebSocket init error', err);
        }

        return () => {
            try {
                if (refreshTimer) {
                    window.clearInterval(refreshTimer);
                }

                if (client) client.deactivate();
            } catch (e) {
                /* ignore */
            }
        };
    }, []);

    const billRequestCount = useMemo(
        () => calls.filter((call) => call.status === "ACTIVE" && call.callType === "BILL_REQUEST").length,
        [calls]
    );

    const waiterCallCount = useMemo(
        () => calls.filter((call) => call.status === "ACTIVE" && call.callType === "WAITER_CALL").length,
        [calls]
    );

    const activeCalls = useMemo(
        () => calls.filter((call) => call.status === "ACTIVE"),
        [calls]
    );

    const archivedCalls = useMemo(
        () => calls.filter((call) => call.status !== "ACTIVE"),
        [calls]
    );

    function formatDuration(start?: string | null, end?: string | null) {
        try {
            const parse = (v?: string | null) => {
                if (!v) return Date.now();
                // reuse parsing logic: if iso without tz, treat as UTC
                if (/^\d+$/.test(v)) return Number(v);
                if (/[Zz]|[+\-]\d{2}:?\d{2}/.test(v)) return new Date(v).getTime();
                const isoLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/;
                if (isoLike.test(v)) return new Date(v + "Z").getTime();
                return new Date(v).getTime();
            };

            const s = parse(start);
            const e = end ? parse(end) : Date.now();

            const diff = Math.max(0, e - s);
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);

            if (mins > 0) return `${mins} dk ${secs} sn`;
            return `${secs} sn`;
        } catch {
            return "-";
        }
    }

    const activeOrders = useMemo(
        () => orders.filter((order) => !isOrderArchived(order.status)),
        [orders]
    );
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
            if (
                session.tableId &&
                ["ACTIVE", "ORDERED", "PAYMENT_PENDING"].includes(session.status)
            ) {
                map.set(session.tableId, session);
            }
        });

        return map;
    }, [tableSessions]);


    const getTableDisplayName = (tableId?: number, tableNumber?: number) => {
        if (tableId) {
            const t = tables.find((x) => x.id === tableId);
            if (t && t.name) return t.name;
        }

        if (tableNumber) return `Masa ${tableNumber}`;
        if (tableId) return `Masa ID: ${tableId}`;
        return "Masa";
    };

    const archivedOrders = useMemo(
        () => orders.filter((order) => isOrderArchived(order.status)),
        [orders]
    );

    const activeCallByTableId = useMemo(() => {
        const map = new Map<number, TableCallResponse>();

        activeCalls.forEach((call) => {
            map.set(call.tableId, call);
        });

        return map;
    }, [activeCalls]);

    function getTableCallTone(callType?: TableCallType) {
        switch (callType) {
            case "WAITER_CALL":
                return {
                    borderColor: "#d7c9ff",
                    textColor: "#7c4dff",
                    badgeBg: "#f2ecff",
                };
            case "BILL_REQUEST":
                return {
                    borderColor: "#cfe1ff",
                    textColor: "#2f80ed",
                    badgeBg: "#eef5ff",
                };
            case "HELP_REQUEST":
                return {
                    borderColor: "#cdeed7",
                    textColor: "#2f9d57",
                    badgeBg: "#edf9f0",
                };
            default:
                return {
                    borderColor: "#dbe7d7",
                    textColor: "#2f9d57",
                    badgeBg: "#edf9f0",
                };
        }
    }

    async function handleResolveCall(callId: number) {
        try {
            setActionLoadingId(callId);
            await resolveCall(callId, userEmail);

            // if resolved call is a bill request, release held table immediately
            try {
                const resolvedCall = calls.find((c) => c.id === callId);
                if (resolvedCall && resolvedCall.callType === "BILL_REQUEST" && resolvedCall.tableId) {
                    setHeldTableTimestamps((prev) => {
                        const next = new Map(prev);
                        next.delete(resolvedCall.tableId!);
                        return next;
                    });
                }
            } catch (e) {
                /* ignore */
            }
            await loadDashboard();
        } catch (err) {
            console.error(err);
            setError("Çağrı çözüldü olarak işaretlenemedi.");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleMarkBillPaid(callId: number) {
        try {
            setActionLoadingId(callId);

            await markBillPaid(callId, userEmail);

            const paidCall = calls.find((c) => c.id === callId);

            if (paidCall?.tableId) {
                setHeldTableTimestamps((prev) => {
                    const next = new Map(prev);
                    next.delete(paidCall.tableId!);
                    return next;
                });
            }

            await loadDashboard();
        } catch (err) {
            console.error(err);
            setError("Hesap ödendi olarak işaretlenemedi.");
        } finally {
            setActionLoadingId(null);
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
        <div
            className="min-h-screen px-6 py-6"
            style={{
                background: "var(--qresto-bg)",
                color: "var(--qresto-text)",
            }}
        >
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <div
                    className="rounded-3xl border p-6 shadow-sm"
                    style={{
                        background: "var(--qresto-surface)",
                        borderColor: "var(--qresto-border)",
                    }}
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div
                                className="mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                                style={{
                                    borderColor: "var(--qresto-border)",
                                    color: "var(--qresto-muted)",
                                    background: "var(--qresto-hover)",
                                }}
                            >
                                <Coffee size={14} />
                                QResto Garson Paneli
                            </div>

                            <h1 className="text-2xl font-bold md:text-3xl">
                                Garson Paneli
                            </h1>

                            <p
                                className="mt-2 max-w-2xl text-sm"
                                style={{ color: "var(--qresto-muted)" }}
                            >
                                Masaları, aktif garson çağrılarını ve geçmiş talepleri tek ekranda takip edin.
                            </p>
                        </div>

                        {/* Yenile butonu kaldırıldı (dev ortamda STOMP ile anlık güncelleniyor) */}
                    </div>
                </div>

                {error && (
                    <div
                        className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm"
                        style={{
                            background: "var(--qresto-surface)",
                            borderColor: "var(--qresto-border)",
                            color: "var(--qresto-text)",
                        }}
                    >
                        <TriangleAlert size={18} style={{ color: "var(--qresto-primary)" }} />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <StatCard
                        title="Aktif Çağrı"
                        value={activeCalls.length}
                        icon={<Bell size={22} />}
                        description="Çözülmeyi bekleyen tüm çağrılar"
                    />

                    <StatCard
                        title="Garson Çağrısı"
                        value={waiterCallCount}
                        icon={<Coffee size={22} />}
                        description="Müşteri garson talebi"
                    />

                    <StatCard
                        title="Hesap İsteği"
                        value={billRequestCount}
                        icon={<ReceiptText size={22} />}
                        description="Ödeme bekleyen masalar"
                    />

                    <StatCard
                        title="Geçmiş Çağrı"
                        value={archivedCalls.length}
                        icon={<ClipboardList size={22} />}
                        description="Tamamlanan ve iptal edilen çağrılar"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <section
                        className="rounded-3xl border p-5 shadow-sm xl:col-span-2"
                        style={{
                            background: "var(--qresto-surface)",
                            borderColor: "var(--qresto-border)",
                        }}
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <SectionHeader
                                icon={<Table2 size={20} />}
                                title="Masalar"
                                description="Aktif çağrılarla birlikte masa durumları"
                            />

                            <div className="flex flex-wrap items-center gap-3 text-xs font-medium" style={{ color: "var(--qresto-muted)" }}>
                                <LegendChip label="Garson Çağırdı" color="#7c4dff" />
                                <LegendChip label="Hesap İstedi" color="#2f80ed" />
                                <LegendChip label="Boş" color="#2f9d57" muted />
                            </div>
                        </div>

                        {initialLoading ? (
                            <LoadingBox text="Masalar yükleniyor..." />
                        ) : tables.length === 0 ? (
                            <EmptyBox text="Henüz masa bulunamadı." />
                        ) : (
                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {tables.map((table) => {
                                    const activeCall = activeCallByTableId.get(table.id);
                                    const activeSession = activeTableSessionByTableId.get(table.id);
                                    const hasActiveOrder = activeOrderByTableId.has(table.id);

                                    const now = Date.now();
                                    const ttl = 30 * 60 * 1000;
                                    const heldTs = heldTableTimestamps.get(table.id) as number | undefined;
                                    const isHeld = typeof heldTs === "number" && now - heldTs < ttl;

                                    const isOccupied =
                                        Boolean(activeSession) ||
                                        Boolean(activeCall) ||
                                        hasActiveOrder ||
                                        isHeld;
                                    const tone = isOccupied
                                        ? { borderColor: "#fdecec", textColor: "#c0392b", badgeBg: "#fdecec" }
                                        : getTableCallTone(activeCall?.callType);
                                    const statusLabel = isOccupied ? "Dolu" : "Boş";

                                    return (
                                        <div
                                            key={table.id}
                                            className="rounded-3xl border p-4 transition hover:-translate-y-0.5"
                                            style={{
                                                background: table.active ? "var(--qresto-bg)" : "#fafafa",
                                                borderColor: activeCall ? tone.borderColor : "#dbe7d7",
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-lg font-bold">{table.name}</h3>
                                                    <p className="mt-1 text-sm" style={{ color: "var(--qresto-muted)" }}>
                                                        {table.capacity || "-"} kişilik
                                                    </p>
                                                </div>

                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: activeCall ? tone.badgeBg : "#edf9f0", color: activeCall ? tone.textColor : "#2f9d57" }}>
                                                    <Table2 size={18} />
                                                </div>
                                            </div>

                                                <div className="mt-5 flex items-center justify-between gap-3">
                                                    <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: isOccupied ? tone.badgeBg : "#edf9f0", color: isOccupied ? tone.textColor : "#2f9d57" }}>
                                                        {statusLabel}
                                                    </span>

                                                    <span className="text-xs font-medium" style={{ color: "var(--qresto-muted)" }}>
                                                        {isOccupied ? "Dolu" : table.active ? "Aktif masa" : "Boş"}
                                                    </span>
                                                </div>

                                            {activeCall ? (
                                                <div className="mt-4 rounded-2xl border px-3 py-3 text-sm" style={{ borderColor: tone.borderColor, background: tone.badgeBg, color: tone.textColor }}>
                                                    <p className="font-semibold">{getCallTypeLabel(activeCall.callType)}</p>
                                                    <p className="mt-1 text-xs" style={{ color: tone.textColor }}>
                                                        {activeCall.message || "Mesaj girilmedi."}
                                                    </p>
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section
                        className="rounded-3xl border p-5 shadow-sm"
                        style={{
                            background: "var(--qresto-surface)",
                            borderColor: "var(--qresto-border)",
                        }}
                    >
                        <SectionHeader
                            icon={<Bell size={20} />}
                            title="Garson Çağrıları"
                            description="Canlı aktif çağrılar"
                        />

                        {initialLoading ? (
                            <LoadingBox text="Çağrılar yükleniyor..." />
                        ) : activeCalls.length === 0 ? (
                            <EmptyBox text="Şu anda aktif garson çağrısı yok." />
                        ) : (
                            <div className="mt-5 flex flex-col gap-3">
                                {activeCalls.map((call) => (
                                    <div
                                        key={call.id}
                                        className="rounded-2xl border p-4"
                                        style={{
                                            borderColor: "var(--qresto-border)",
                                            background: "var(--qresto-bg)",
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "#f4edff", color: "#7c4dff" }}>
                                                    {getCallTypeIcon(call.callType)}
                                                </div>

                                                <div>
                                                        <h3 className="font-bold">
                                                            {getTableDisplayName(call.tableId, call.tableNumber)}
                                                        </h3>
                                                    <p className="text-xs font-medium" style={{ color: "var(--qresto-muted)" }}>
                                                        {getCallTypeLabel(call.callType)}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: "var(--qresto-muted)" }}>
                                                        <span style={{ fontWeight: 600, marginRight: 6 }}>Çağrı zamanı:</span>
                                                        {formatDateTime(call.createdAt)}
                                                        <span style={{ marginLeft: 8, fontSize: 12, color: "var(--qresto-muted)" }}>
                                                            ({formatDuration(call.createdAt)})
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "#f4edff", color: "#7c4dff" }}>
                                                Aktif
                                            </span>
                                        </div>

                                        <p className="mt-3 min-h-[40px] text-sm" style={{ color: "var(--qresto-muted)" }}>
                                            {call.message || "Mesaj girilmedi."}
                                        </p>

                                        <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--qresto-border)" }}>
                                            <div className="text-xs" style={{ color: "var(--qresto-muted)" }}>
                                                {call.resolvedAt ? (
                                                    <>
                                                        <div><strong>Çağrı zamanı:</strong> {formatDateTime(call.createdAt)}</div>
                                                        <div style={{ marginTop: 4 }}><strong>Tamamlama zamanı:</strong> {formatDateTime(call.resolvedAt)}</div>
                                                        <div style={{ fontSize: 12, marginTop: 6 }}>{formatDuration(call.createdAt, call.resolvedAt)}</div>
                                                    </>
                                                ) : null}
                                            </div>

                                            <button
                                                onClick={() => {
                                                    if (call.callType === "BILL_REQUEST") {
                                                        void handleMarkBillPaid(call.id);
                                                        return;
                                                    }

                                                    void handleResolveCall(call.id);
                                                }}
                                                disabled={actionLoadingId === call.id}
                                                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition hover:scale-[1.03] disabled:opacity-60"
                                                style={{
                                                    background: "var(--qresto-primary)",
                                                    color: "#fff",
                                                }}
                                            >
                                                {actionLoadingId === call.id ? (
                                                    <Loader2 size={15} className="animate-spin" />
                                                ) : (
                                                    <CheckCircle2 size={15} />
                                                )}
                                                {call.callType === "BILL_REQUEST" ? "Hesap Ödendi" : "Tamamlandı"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section
                        className="rounded-3xl border p-5 shadow-sm"
                        style={{
                            background: "var(--qresto-surface)",
                            borderColor: "var(--qresto-border)",
                        }}
                    >
                        <SectionHeader
                            icon={<Soup size={20} />}
                            title="Siparişler"
                            description="Hazır olan ve geçmiş siparişler"
                        />

                        <div className="mt-5 flex flex-col gap-6">
                            <div>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--qresto-muted)]">
                                        Aktif Siparişler
                                    </h3>
                                    <span className="text-xs text-[var(--qresto-muted)]">{activeOrders.length}</span>
                                </div>

                                {initialLoading ? (
                                    <LoadingBox text="Siparişler yükleniyor..." />
                                ) : activeOrders.length === 0 ? (
                                    <EmptyBox text="Aktif sipariş yok." />
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {activeOrders.map((order) => (
                                            <div
                                                key={order.orderId}
                                                className="rounded-2xl border p-4"
                                                style={{
                                                    background: "var(--qresto-bg)",
                                                    borderColor: "var(--qresto-border)",
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h4 className="font-bold">{getTableDisplayName(order.tableId, order.tableNumber)}</h4>
                                                        <p className="mt-1 text-xs" style={{ color: "var(--qresto-muted)" }}>
                                                            Sipariş No: {order.orderNumber || order.orderId}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: "var(--qresto-muted)" }}>
                                                            <span style={{ fontWeight: 600, marginRight: 6 }}>Sipariş zamanı:</span>
                                                            {formatDateTime(order.createdAt)}
                                                            <span style={{ marginLeft: 8, fontSize: 12, color: "var(--qresto-muted)" }}>
                                                                ({formatDuration(order.createdAt)})
                                                            </span>
                                                        </p>
                                                    </div>

                                                    <span
                                                        className="rounded-full px-3 py-1 text-xs font-bold"
                                                        style={{
                                                            background: getOrderStatusTone(order.status).bg,
                                                            color: getOrderStatusTone(order.status).text,
                                                        }}
                                                    >
                                                        {getOrderStatusLabel(order.status)}
                                                    </span>
                                                </div>

                                                {normalizeOrderStatus(order.status) === "READY" ? (
                                                    <button
                                                        onClick={() => handleMarkOrderServed(order.orderId)}
                                                        disabled={orderActionLoadingId === order.orderId}
                                                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition hover:scale-[1.02] disabled:opacity-60"
                                                        style={{
                                                            background: "var(--qresto-primary)",
                                                            color: "#fff",
                                                        }}
                                                    >
                                                        {orderActionLoadingId === order.orderId ? (
                                                            <Loader2 size={15} className="animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 size={15} />
                                                        )}
                                                        Servis Edildi
                                                    </button>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--qresto-muted)]">
                                        Geçmiş Siparişler
                                    </h3>
                                    <span className="text-xs text-[var(--qresto-muted)]">{archivedOrders.length}</span>
                                </div>

                                {initialLoading ? (
                                    <LoadingBox text="Geçmiş siparişler yükleniyor..." />
                                ) : archivedOrders.length === 0 ? (
                                    <EmptyBox text="Geçmiş sipariş yok." />
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {archivedOrders.map((order) => (
                                            <div
                                                key={order.orderId}
                                                className="rounded-2xl border p-4"
                                                style={{
                                                    background: "var(--qresto-bg)",
                                                    borderColor: "var(--qresto-border)",
                                                }}
                                            >
                                                <h4 className="font-bold">
                                                    {order.tableNumber
                                                        ? `Masa ${order.tableNumber}`
                                                        : `Masa ID: ${order.tableId}`}
                                                </h4>

                                                <p className="mt-1 text-xs" style={{ color: "var(--qresto-muted)" }}>
                                                    Sipariş No: {order.orderNumber || order.orderId}
                                                </p>

                                                <div style={{ marginTop: 8 }}>
                                                    <div style={{ fontSize: 13, color: "var(--qresto-muted)" }}>
                                                        Oluşturuldu: {formatDateTime(order.createdAt)}
                                                    </div>
                                                    <div style={{ fontSize: 13, color: "var(--qresto-muted)", marginTop: 4 }}>
                                                        Güncellendi: {formatDateTime(order.updatedAt)}
                                                    </div>
                                                    <div style={{ marginTop: 6 }}>
                                                        <span
                                                            className="inline-flex rounded-full px-3 py-1 text-xs font-bold"
                                                            style={{
                                                                background: getOrderStatusTone(order.status).bg,
                                                                color: getOrderStatusTone(order.status).text,
                                                            }}
                                                        >
                                                            {getOrderStatusLabel(order.status)}
                                                        </span>
                                                        <span style={{ marginLeft: 8, fontSize: 12, color: "var(--qresto-muted)" }}>
                                                            {formatDuration(order.createdAt, order.updatedAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <section
                        className="rounded-3xl border p-5 shadow-sm"
                        style={{
                            background: "var(--qresto-surface)",
                            borderColor: "var(--qresto-border)",
                        }}
                    >
                        <SectionHeader
                            icon={<ClipboardList size={20} />}
                            title="Geçmiş Çağrılar"
                            description="Tamamlanan ve iptal edilen önceki masa çağrıları"
                        />

                        {initialLoading ? (
                            <LoadingBox text="Geçmiş çağrılar yükleniyor..." />
                        ) : archivedCalls.length === 0 ? (
                            <EmptyBox text="Henüz geçmiş çağrı yok." />
                        ) : (
                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {archivedCalls.map((call) => (
                                    <div
                                        key={call.id}
                                        className="rounded-3xl border p-4"
                                        style={{
                                            borderColor: "var(--qresto-border)",
                                            background: "var(--qresto-bg)",
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                                                    style={{
                                                        background: "var(--qresto-hover)",
                                                        color: "var(--qresto-primary)",
                                                    }}
                                                >
                                                    {getCallTypeIcon(call.callType)}
                                                </div>

                                                <div>
                                                    <h3 className="font-bold">
                                                        {call.tableNumber
                                                            ? `Masa ${call.tableNumber}`
                                                            : `Masa ID: ${call.tableId}`}
                                                    </h3>
                                                    <p
                                                        className="text-xs font-medium"
                                                        style={{ color: "var(--qresto-muted)" }}
                                                    >
                                                        {getCallTypeLabel(call.callType)}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className="rounded-full px-3 py-1 text-xs font-bold"
                                                style={{
                                                    background: "var(--qresto-hover)",
                                                    color: "var(--qresto-primary)",
                                                }}
                                            >
                                                {getCallStatusLabel(call.status)}
                                            </span>
                                        </div>

                                        <p
                                            className="mt-4 min-h-[44px] text-sm"
                                            style={{ color: "var(--qresto-muted)" }}
                                        >
                                            {call.message || "Mesaj girilmedi."}
                                        </p>

                                        <div
                                            className="mt-4 border-t pt-4"
                                            style={{ borderColor: "var(--qresto-border)" }}
                                        >
                                            <div
                                                className="flex items-center justify-between gap-3 text-xs"
                                                style={{ color: "var(--qresto-muted)" }}
                                            >
                                                <span>
                                                    <strong>Çağrı zamanı:</strong> {formatDateTime(call.createdAt)}
                                                    <span style={{ marginLeft: 8, fontSize: 12, color: "var(--qresto-muted)" }}>
                                                        ({formatDuration(call.createdAt, call.resolvedAt)})
                                                    </span>
                                                </span>

                                                <span>
                                                    <strong>Tamamlama zamanı:</strong> {call.resolvedAt ? formatDateTime(call.resolvedAt) : "-"}
                                                </span>
                                            </div>

                                            {call.resolvedBy ? (
                                                <p className="mt-2 text-xs" style={{ color: "var(--qresto-muted)" }}>
                                                    Tamamlayan: {call.resolvedBy}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

function StatCard({
                      title,
                      value,
                      icon,
                      description,
                  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    description: string;
}) {
    return (
        <div
            className="rounded-3xl border p-5 shadow-sm"
            style={{
                background: "var(--qresto-surface)",
                borderColor: "var(--qresto-border)",
            }}
        >
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--qresto-muted)" }}>
                        {title}
                    </p>
                    <h2 className="mt-2 text-3xl font-black">{value}</h2>
                </div>

                <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                        background: "var(--qresto-hover)",
                        color: "var(--qresto-primary)",
                    }}
                >
                    {icon}
                </div>
            </div>

            <p className="mt-4 text-xs" style={{ color: "var(--qresto-muted)" }}>
                {description}
            </p>
        </div>
    );
}

function SectionHeader({
                           icon,
                           title,
                           description,
                       }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{
                    background: "var(--qresto-hover)",
                    color: "var(--qresto-primary)",
                }}
            >
                {icon}
            </div>

            <div>
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="mt-1 text-sm" style={{ color: "var(--qresto-muted)" }}>
                    {description}
                </p>
            </div>
        </div>
    );
}

function LegendChip({
    label,
    color,
    muted = false,
}: {
    label: string;
    color: string;
    muted?: boolean;
}) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: muted ? "var(--qresto-border)" : color, color: muted ? "var(--qresto-muted)" : color, background: muted ? "var(--qresto-bg)" : "#fff" }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: muted ? "var(--qresto-muted)" : color }} />
            {label}
        </span>
    );
}

function LoadingBox({ text }: { text: string }) {
    return (
        <div
            className="mt-5 flex items-center justify-center gap-3 rounded-2xl border p-8 text-sm"
            style={{
                borderColor: "var(--qresto-border)",
                color: "var(--qresto-muted)",
            }}
        >
            <Loader2 size={18} className="animate-spin" />
            {text}
        </div>
    );
}

function EmptyBox({ text }: { text: string }) {
    return (
        <div
            className="mt-5 flex items-center justify-center rounded-2xl border p-8 text-center text-sm"
            style={{
                borderColor: "var(--qresto-border)",
                color: "var(--qresto-muted)",
            }}
        >
            {text}
        </div>
    );
}