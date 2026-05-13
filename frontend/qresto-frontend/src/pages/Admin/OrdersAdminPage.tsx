import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Loader2,
    PackageCheck,
    ReceiptText,
    RefreshCw,
    ShoppingBag,
    X,
} from "lucide-react";

import {
    getAdminActiveOrders,
    getAdminCompletedOrders,
    getAdminOrderSummary,
    getOrderById,
} from "../../services/orderService";

import type {
    OrderAdminSummaryResponse,
    OrderResponse,
} from "../../types/cartTypes";
import { parseBackendLocalDateTime } from "../../utils/parseBackendLocalDateTime";

type OrderTab = "active" | "completed";

type LoadOptions = {
    silent?: boolean;
    preserveDetail?: boolean;
};

const statusLabelMap: Record<string, string> = {
    RECEIVED: "Alındı",
    PREPARING: "Hazırlanıyor",
    READY: "Hazır",
    SERVED: "Servis Edildi",
    COMPLETED: "Tamamlandı",
    PAYMENT_PENDING: "Ödeme Bekliyor",
    PAID: "Ödendi",
    CANCELLED: "İptal Edildi",
};

const statusClassMap: Record<string, string> = {
    RECEIVED:
        "border-blue-300 bg-blue-100 text-blue-800",
    PREPARING:
        "border-orange-300 bg-orange-100 text-orange-800",
    READY:
        "border-emerald-300 bg-emerald-100 text-emerald-800",
    SERVED:
        "border-indigo-300 bg-indigo-100 text-indigo-800",
    COMPLETED:
        "border-green-300 bg-green-100 text-green-800",
    PAYMENT_PENDING:
        "border-amber-300 bg-amber-100 text-amber-800",
    PAID:
        "border-teal-300 bg-teal-100 text-teal-800",
    CANCELLED:
        "border-red-300 bg-red-100 text-red-800",
};

const initialSummary: OrderAdminSummaryResponse = {
    activeOrderCount: 0,
    completedOrderCount: 0,
    cancelledOrderCount: 0,
    totalOrderCount: 0,
    todayRevenue: 0,
    operationDensity: 0,
};

const formatCurrency = (value?: number | null) => {
    const safeValue = Number(value ?? 0);

    return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(safeValue);
};

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return "-";
    }

    const d = parseBackendLocalDateTime(value);
    if (Number.isNaN(d.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
};

const getStatusLabel = (status: string) => {
    return statusLabelMap[status] ?? status;
};

const getStatusClass = (status: string) => {
    return (
        statusClassMap[status] ??
        "border-[var(--qresto-border)] bg-[var(--qresto-hover)] text-[var(--qresto-muted)]"
    );
};

function OrdersAdminPage() {
    const [summary, setSummary] = useState<OrderAdminSummaryResponse>(initialSummary);
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [activeTab, setActiveTab] = useState<OrderTab>("active");
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const totalRevenue = useMemo(() => {
        return orders.reduce((total, order) => total + Number(order.totalAmount ?? 0), 0);
    }, [orders]);

    const loadOrders = useCallback(
        async (tab: OrderTab = activeTab, options: LoadOptions = {}) => {
            const shouldPreserveDetail = options.preserveDetail ?? true;
            const selectedOrderId = selectedOrder?.id ?? null;

            try {
                if (options.silent) {
                    setIsRefreshing(true);
                } else {
                    setIsLoading(true);
                }

                setErrorMessage(null);

                const [summaryResponse, orderResponse] = await Promise.all([
                    getAdminOrderSummary(),
                    tab === "active" ? getAdminActiveOrders() : getAdminCompletedOrders(),
                ]);

                setSummary(summaryResponse);
                setOrders(orderResponse);

                if (shouldPreserveDetail && selectedOrderId) {
                    const updatedSelectedFromList = orderResponse.find(
                        (order) => order.id === selectedOrderId
                    );

                    if (updatedSelectedFromList) {
                        try {
                            const detail = await getOrderById(selectedOrderId);
                            setSelectedOrder(detail);
                        } catch {
                            setSelectedOrder(updatedSelectedFromList);
                        }
                    } else {
                        try {
                            const detail = await getOrderById(selectedOrderId);
                            setSelectedOrder(detail);
                        } catch {
                            setSelectedOrder((current) => current);
                        }
                    }

                    return;
                }

                if (!shouldPreserveDetail) {
                    if (orderResponse.length > 0) {
                        setSelectedOrder(orderResponse[0]);
                    } else {
                        setSelectedOrder(null);
                    }
                }
            } catch {
                setErrorMessage("Sipariş verileri alınırken bir hata oluştu.");
                setOrders([]);

                if (!shouldPreserveDetail) {
                    setSelectedOrder(null);
                }
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [activeTab, selectedOrder?.id]
    );

    const handleTabChange = (tab: OrderTab) => {
        setActiveTab(tab);
        void loadOrders(tab, {
            silent: false,
            preserveDetail: false,
        });
    };

    const handleSelectOrder = async (order: OrderResponse) => {
        try {
            setSelectedOrder(order);
            setIsDetailLoading(true);

            const detail = await getOrderById(order.id);
            setSelectedOrder(detail);
        } catch {
            setSelectedOrder(order);
        } finally {
            setIsDetailLoading(false);
        }
    };

    useEffect(() => {
        void loadOrders("active", {
            silent: false,
            preserveDetail: false,
        });
    }, []);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            void loadOrders(activeTab, {
                silent: true,
                preserveDetail: true,
            });
        }, 10000);

        return () => window.clearInterval(intervalId);
    }, [activeTab, loadOrders]);

    return (
        <div className="flex h-[calc(100vh-132px)] min-h-[720px] min-w-0 flex-col overflow-hidden">
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                <section className="flex min-h-0 flex-col gap-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-[var(--qresto-text)]">
                                Siparişler
                            </h1>
                            <p className="mt-2 text-sm font-medium text-[var(--qresto-muted)]">
                                Aktif ve tamamlanan siparişleri tek ekrandan takip et.
                            </p>
                            <p className="mt-1 text-xs font-bold text-[var(--qresto-muted)]">
                                Sayfa her 10 saniyede bir otomatik yenilenir.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                void loadOrders(activeTab, {
                                    silent: false,
                                    preserveDetail: true,
                                })
                            }
                            className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-5 py-3 text-sm font-black text-[var(--qresto-text)] shadow-sm transition hover:-translate-y-[1px] hover:border-[var(--qresto-primary)] hover:text-[var(--qresto-primary)]"
                        >
                            <RefreshCw
                                size={17}
                                className={isRefreshing ? "animate-spin" : ""}
                            />
                            Yenile
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-[var(--qresto-surface)] p-4 shadow-sm dark:border-orange-500/20 dark:from-orange-500/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-black text-[var(--qresto-muted)]">
                                        Aktif Siparişler
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-[var(--qresto-muted)]">
                                        Şu anda devam eden siparişler
                                    </p>

                                    <p className="mt-3 text-2xl font-black leading-none text-[var(--qresto-text)]">
                                        {summary.activeOrderCount}
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--qresto-primary)]/10 text-[var(--qresto-primary)]">
                                    <ShoppingBag size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-[var(--qresto-surface)] p-4 shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-black text-[var(--qresto-muted)]">
                                        Tamamlanan Siparişler
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-[var(--qresto-muted)]">
                                        Bugün tamamlanan siparişler
                                    </p>

                                    <p className="mt-3 text-2xl font-black leading-none text-[var(--qresto-text)]">
                                        {summary.completedOrderCount}
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                                    <CheckCircle2 size={24} />
                                </div>
                            </div>

                        </div>

                        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-[var(--qresto-surface)] p-4 shadow-sm dark:border-amber-500/20 dark:from-amber-500/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-black text-[var(--qresto-muted)]">
                                        Bugünkü Ciro
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-[var(--qresto-muted)]">
                                        Ödenmiş / tamamlanmış siparişlerden
                                    </p>

                                    <p className="mt-3 text-[22px] font-black leading-none text-[var(--qresto-text)]">
                                        {formatCurrency(summary.todayRevenue)} TL
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                                    <ReceiptText size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-[var(--qresto-border)] p-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleTabChange("active")}
                                    className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                                        activeTab === "active"
                                            ? "bg-[var(--qresto-primary)] text-white shadow-lg shadow-orange-200/60"
                                            : "bg-[var(--qresto-hover)] text-[var(--qresto-muted)] hover:text-[var(--qresto-primary)]"
                                    }`}
                                >
                                    Aktif Siparişler
                                    <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                                        {summary.activeOrderCount}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleTabChange("completed")}
                                    className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                                        activeTab === "completed"
                                            ? "bg-[var(--qresto-primary)] text-white shadow-lg shadow-orange-200/60"
                                            : "bg-[var(--qresto-hover)] text-[var(--qresto-muted)] hover:text-[var(--qresto-primary)]"
                                    }`}
                                >
                                    Tamamlananlar
                                    <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                                        {summary.completedOrderCount}
                                    </span>
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                {isRefreshing ? (
                                    <div className="flex items-center gap-2 text-xs font-black text-[var(--qresto-muted)]">
                                        <Loader2 size={14} className="animate-spin" />
                                        Güncelleniyor
                                    </div>
                                ) : null}

                                <div className="rounded-2xl bg-[var(--qresto-hover)] px-4 py-2 text-sm font-bold text-[var(--qresto-muted)]">
                                    Liste Toplamı:{" "}
                                    <span className="text-[var(--qresto-text)]">
                                        {formatCurrency(totalRevenue)} TL
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-auto p-4">
                            {isLoading ? (
                                <div className="flex h-full min-h-[360px] items-center justify-center">
                                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-hover)] px-5 py-4 text-sm font-bold text-[var(--qresto-muted)]">
                                        <Loader2 size={20} className="animate-spin" />
                                        Siparişler yükleniyor...
                                    </div>
                                </div>
                            ) : errorMessage ? (
                                <div className="flex h-full min-h-[360px] items-center justify-center">
                                    <div className="flex max-w-md items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                                        <AlertCircle size={20} />
                                        {errorMessage}
                                    </div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="flex h-full min-h-[360px] items-center justify-center">
                                    <div className="text-center">
                                        <PackageCheck
                                            className="mx-auto text-[var(--qresto-muted)]"
                                            size={42}
                                        />
                                        <p className="mt-3 text-lg font-black text-[var(--qresto-text)]">
                                            Sipariş bulunamadı
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-[var(--qresto-muted)]">
                                            Bu sekmede görüntülenecek sipariş yok.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-[var(--qresto-border)]">
                                    <table className="w-full min-w-[860px] border-collapse text-left">
                                        <thead className="bg-[var(--qresto-hover)]">
                                        <tr className="text-xs font-black uppercase tracking-wide text-[var(--qresto-muted)]">
                                            <th className="px-4 py-4">Sipariş No</th>
                                            <th className="px-4 py-4">Masa</th>
                                            <th className="px-4 py-4">Durum</th>
                                            <th className="px-4 py-4">Ürün Sayısı</th>
                                            <th className="px-4 py-4">Toplam Tutar</th>
                                            <th className="px-4 py-4">Oluşturulma</th>
                                            <th className="px-4 py-4 text-right">İşlem</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {orders.map((order) => {
                                            const isSelected = selectedOrder?.id === order.id;

                                            return (
                                                <tr
                                                    key={order.id}
                                                    className={`border-t border-[var(--qresto-border)] transition hover:bg-[var(--qresto-hover)] ${
                                                        isSelected
                                                            ? "bg-[var(--qresto-hover)]"
                                                            : ""
                                                    }`}
                                                >
                                                    <td className="px-4 py-4 text-sm font-black text-[var(--qresto-primary)]">
                                                        {order.orderNo}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm font-bold text-[var(--qresto-text)]">
                                                        {order.tableName || `Masa ${order.tableId}`}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                            <span
                                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getStatusClass(
                                                                    order.status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(order.status)}
                                                            </span>
                                                    </td>

                                                    <td className="px-4 py-4 text-sm font-bold text-[var(--qresto-text)]">
                                                        {order.items?.length ?? 0}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm font-black text-[var(--qresto-text)]">
                                                        {formatCurrency(order.totalAmount)} TL
                                                    </td>

                                                    <td className="px-4 py-4 text-sm font-semibold text-[var(--qresto-muted)]">
                                                        {formatDateTime(order.createdAt)}
                                                    </td>

                                                    <td className="px-4 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void handleSelectOrder(order)
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-3 py-2 text-xs font-black text-[var(--qresto-text)] transition hover:border-[var(--qresto-primary)] hover:text-[var(--qresto-primary)]"
                                                        >
                                                            Detay
                                                            <ChevronRight size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <aside className="flex min-h-0 flex-col rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] shadow-sm">
                    <div className="flex items-center justify-between border-b border-[var(--qresto-border)] p-5">
                        <div>
                            <h2 className="text-lg font-black text-[var(--qresto-text)]">
                                Sipariş Detayı
                            </h2>
                            <p className="mt-1 text-xs font-semibold text-[var(--qresto-muted)]">
                                Seçili sipariş bilgileri
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedOrder(null)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--qresto-muted)] transition hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)]"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-auto p-5">
                        {isDetailLoading ? (
                            <div className="flex h-full min-h-[300px] items-center justify-center">
                                <Loader2
                                    className="animate-spin text-[var(--qresto-primary)]"
                                    size={28}
                                />
                            </div>
                        ) : !selectedOrder ? (
                            <div className="flex h-full min-h-[520px] items-center justify-center text-center">
                                <div>
                                    <ReceiptText
                                        className="mx-auto text-[var(--qresto-muted)]"
                                        size={42}
                                    />
                                    <p className="mt-3 text-sm font-bold text-[var(--qresto-muted)]">
                                        Detay görmek için bir sipariş seç.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xl font-black text-[var(--qresto-primary)]">
                                                {selectedOrder.orderNo}
                                            </p>
                                            <p className="mt-2 text-sm font-bold text-[var(--qresto-text)]">
                                                {selectedOrder.tableName ||
                                                    `Masa ${selectedOrder.tableId}`}
                                            </p>
                                        </div>

                                        <span
                                            className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-black ${getStatusClass(
                                                selectedOrder.status
                                            )}`}
                                        >
                                            {getStatusLabel(selectedOrder.status)}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm font-semibold text-[var(--qresto-muted)]">
                                        <div className="flex items-center gap-2">
                                            <Clock3 size={16} />
                                            {formatDateTime(selectedOrder.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-[var(--qresto-border)]" />

                                <div>
                                    <h3 className="mb-3 text-sm font-black text-[var(--qresto-text)]">
                                        Ürünler
                                    </h3>

                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-hover)] p-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex min-w-0 gap-3">
                                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[var(--qresto-surface)]">
                                                            {item.productImageUrl ? (
                                                                <img
                                                                    src={item.productImageUrl}
                                                                    alt={item.productName}
                                                                    className="h-full w-full object-cover"
                                                                    draggable="false"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-[var(--qresto-primary)]">
                                                                    <ShoppingBag size={20} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-black text-[var(--qresto-text)]">
                                                                {item.productName}
                                                            </p>

                                                            <p className="mt-1 text-xs font-semibold text-[var(--qresto-muted)]">
                                                                {item.quantity} x{" "}
                                                                {formatCurrency(item.productPrice)} TL
                                                            </p>

                                                            {item.removedIngredients ? (
                                                                <p className="mt-1 text-xs font-semibold text-red-500">
                                                                    Çıkarılan:{" "}
                                                                    {item.removedIngredients}
                                                                </p>
                                                            ) : null}

                                                            {item.addedIngredients ? (
                                                                <p className="mt-1 text-xs font-semibold text-emerald-600">
                                                                    Eklenen: {item.addedIngredients}
                                                                </p>
                                                            ) : null}

                                                            {item.note ? (
                                                                <p className="mt-1 text-xs font-semibold text-[var(--qresto-muted)]">
                                                                    Not: {item.note}
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    <p className="shrink-0 text-sm font-black text-[var(--qresto-text)]">
                                                        {formatCurrency(item.lineTotal)} TL
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-[var(--qresto-border)]" />

                                <div className="space-y-3 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-hover)] p-4">
                                    <div className="flex items-center justify-between text-sm font-bold text-[var(--qresto-muted)]">
                                        <span>Ara Toplam</span>
                                        <span>
                                            {formatCurrency(selectedOrder.subtotalAmount)} TL
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-[var(--qresto-border)] pt-3 text-base font-black text-[var(--qresto-text)]">
                                        <span>Toplam Tutar</span>
                                        <span className="text-[var(--qresto-primary)]">
                                            {formatCurrency(selectedOrder.totalAmount)} TL
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default OrdersAdminPage;