import type { ComponentType } from "react";
import {
    CheckCircle2,
    ClipboardList,
    Hourglass,
    ShoppingCart,
    XCircle,
} from "lucide-react";

import type { OrderResponse } from "../../types/cartTypes";

export type KitchenPipelineStatus = Extract<
    OrderResponse["status"],
    "RECEIVED" | "PREPARING" | "READY" | "CANCELLED"
>;

export type KitchenTab = "all" | "received" | "preparing" | "ready" | "cancelled";

const KITCHEN_STATUS_SORT_WEIGHT: Record<string, number> = {
    RECEIVED: 0,
    PREPARING: 1,
    READY: 2,
    CANCELLED: 3,
};

function parseBackendDate(iso?: string | null): Date | null {
    if (!iso) {
        return null;
    }

    const hasTimezone =
        iso.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(iso);

    const normalizedIso = hasTimezone ? iso : `${iso}Z`;
    const date = new Date(normalizedIso);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

export function isKitchenPipelineStatus(
    s: OrderResponse["status"]
): s is KitchenPipelineStatus {
    return (
        s === "RECEIVED" ||
        s === "PREPARING" ||
        s === "READY" ||
        s === "CANCELLED"
    );
}

export function formatOrderClock(iso?: string | null): string {
    const date = parseBackendDate(iso);

    if (!date) {
        return "-";
    }

    return date.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Istanbul",
    });
}

export function formatRelativeTr(iso?: string | null): string {
    const date = parseBackendDate(iso);

    if (!date) {
        return "-";
    }

    const t = date.getTime();
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - t) / 1000));

    if (diffSec < 45) {
        return "Az önce";
    }

    const min = Math.floor(diffSec / 60);

    if (min < 60) {
        return `${min} dk önce`;
    }

    const hr = Math.floor(min / 60);

    if (hr < 24) {
        return `${hr} saat önce`;
    }

    const day = Math.floor(hr / 24);

    return `${day} gün önce`;
}

export function summarizeOrderItems(
    order: OrderResponse,
    maxLen = 72
): string {
    const items = order.items ?? [];

    if (items.length === 0) {
        return "Ürün bilgisi yok";
    }

    const parts = items.map((i) => {
        const quantity = i.quantity ?? 0;
        const productName = i.productName || "Ürün";
        return `${quantity}x ${productName}`;
    });

    const text = parts.join(", ");

    if (text.length <= maxLen) {
        return text;
    }

    return `${text.slice(0, maxLen - 1)}…`;
}

export function itemCountLabel(order: OrderResponse): string {
    const items = order.items ?? [];
    const n = items.reduce((acc, i) => acc + (i.quantity ?? 0), 0);

    return `${n} ürün`;
}

export function statusBadgeConfig(status: OrderResponse["status"]): {
    label: string;
    className: string;
    Icon: ComponentType<{ size?: number; className?: string }>;
    iconWrap: string;
} {
    switch (status) {
        case "RECEIVED":
            return {
                label: "YENİ",
                className:
                    "bg-orange-500 text-white shadow-sm shadow-orange-500/20 ring-1 ring-orange-600/20",
                Icon: ShoppingCart,
                iconWrap: "bg-orange-500 text-white shadow-sm shadow-orange-500/20",
            };

        case "PREPARING":
            return {
                label: "HAZIRLANIYOR",
                className:
                    "bg-blue-500 text-white shadow-sm shadow-blue-500/20 ring-1 ring-blue-600/20",
                Icon: Hourglass,
                iconWrap: "bg-blue-500 text-white shadow-sm shadow-blue-500/20",
            };

        case "READY":
            return {
                label: "HAZIR",
                className:
                    "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-600/20",
                Icon: CheckCircle2,
                iconWrap:
                    "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20",
            };

        case "CANCELLED":
            return {
                label: "İPTAL EDİLDİ",
                className:
                    "bg-red-500 text-white shadow-sm shadow-red-500/20 ring-1 ring-red-600/20",
                Icon: XCircle,
                iconWrap:
                    "bg-red-500 text-white shadow-sm shadow-red-500/20",
            };

        default:
            return {
                label: String(status),
                className:
                    "bg-[var(--qresto-hover)] text-[var(--qresto-muted)] ring-1 ring-[var(--qresto-border)]",
                Icon: ClipboardList,
                iconWrap:
                    "bg-[var(--qresto-hover)] text-[var(--qresto-muted)]",
            };
    }
}

export function tabLabel(tab: KitchenTab): string {
    switch (tab) {
        case "all":
            return "Tümü";

        case "received":
            return "Yeni";

        case "preparing":
            return "Hazırlanıyor";

        case "ready":
            return "Hazır";

        case "cancelled":
            return "İptal Edilen";
    }
}

function orderSortDate(order: OrderResponse): Date | null {
    return parseBackendDate(
        order.receivedAt ||
        order.createdAt ||
        order.updatedAt ||
        null
    );
}

export function sortKitchenOrdersForKitchenView(
    orders: OrderResponse[]
): OrderResponse[] {
    return [...orders].sort((a, b) => {
        const statusDiff =
            (KITCHEN_STATUS_SORT_WEIGHT[a.status] ?? 99) -
            (KITCHEN_STATUS_SORT_WEIGHT[b.status] ?? 99);

        if (statusDiff !== 0) {
            return statusDiff;
        }

        const aTime = orderSortDate(a)?.getTime() ?? 0;
        const bTime = orderSortDate(b)?.getTime() ?? 0;

        return bTime - aTime;
    });
}

export function filterOrdersForKitchenView(
    orders: OrderResponse[],
    tab: KitchenTab,
    tableName: string | "all"
): OrderResponse[] {
    return sortKitchenOrdersForKitchenView(orders.filter((o) => {
        if (tableName !== "all" && o.tableName !== tableName) {
            return false;
        }

        if (tab === "all") {
            return true;
        }

        if (tab === "received") {
            return o.status === "RECEIVED" || o.status === "PREPARING";
        }

        if (tab === "preparing") {
            return o.status === "PREPARING";
        }

        if (tab === "ready") {
            return o.status === "READY";
        }

        if (tab === "cancelled") {
            return o.status === "CANCELLED";
        }

        return true;
    }));
}

export function countByStatus(
    orders: OrderResponse[]
): {
    received: number;
    preparing: number;
    ready: number;
    cancelledToday: number;
} {
    let received = 0;
    let preparing = 0;
    let ready = 0;
    let cancelledToday = 0;

    for (const o of orders) {
        if (o.status === "RECEIVED") {
            received += 1;
        } else if (o.status === "PREPARING") {
            preparing += 1;
        } else if (o.status === "READY") {
            ready += 1;
        } else if (o.status === "CANCELLED") {
            cancelledToday += 1;
        }
    }

    return {
        received,
        preparing,
        ready,
        cancelledToday,
    };
}
