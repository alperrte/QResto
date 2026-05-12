import axios from "axios";

export const WAITER_API_URL = "http://localhost:7074";
const QR_API_URL =
    import.meta.env.VITE_QR_SERVICE_URL || "http://localhost:7072/api";

function getAuthHeader() {
    const token =
        localStorage.getItem("qresto-access-token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    return {
        Authorization: token ? `Bearer ${token}` : "",
    };
}

export type TableCallType = "WAITER_CALL" | "BILL_REQUEST" | "HELP_REQUEST";
export type TableCallStatus = "ACTIVE" | "RESOLVED" | "CANCELLED";

export interface TableSessionResponse {
    id: number;
    tableId: number;
    qrCodeId?: number | null;
    sessionCode: string;
    status: "ACTIVE" | "ORDERED" | "PAYMENT_PENDING" | "COMPLETED" | "CANCELLED" | "EXPIRED" | "CLOSED_BY_WAITER" | "CLOSED_BY_ADMIN";
    startedAt: string;
    lastActivityAt: string;
    closedAt?: string | null;
    closeReason?: string | null;
    createdAt: string;
    updatedAt?: string | null;
}

export interface TableCallResponse {
    id: number;
    tableId: number;
    tableNumber?: number;
    callType: TableCallType;
    status: TableCallStatus;
    message?: string;
    createdAt: string;
    resolvedAt?: string | null;
    resolvedBy?: string | null;
}


export interface CreateTableCallRequest {
    tableId: number;
    tableNumber?: number;
    callType: TableCallType;
    message?: string;
}

export interface QrTableResponse {
    id: number;
    name: string;
    capacity: number;
    active: boolean;
    createdAt: string;
    updatedAt?: string | null;
}

export interface KitchenOrderResponse {
    orderId: number;
    tableId: number;
    tableNumber?: number;
    orderNumber?: string;
    status: string;
    totalAmount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export async function getAllCalls() {
    const response = await axios.get<TableCallResponse[]>(
        `${WAITER_API_URL}/waiter/calls`,
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
}

export async function getActiveCalls() {
    const response = await axios.get<TableCallResponse[]>(
        `${WAITER_API_URL}/waiter/calls/active`,
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
}

export async function createTableCall(payload: CreateTableCallRequest) {
    const response = await axios.post<TableCallResponse>(
        `${WAITER_API_URL}/waiter/calls`,
        payload
    );

    return response.data;
}

export async function resolveCall(callId: number, resolvedBy: string) {
    const response = await axios.patch<TableCallResponse>(
        `${WAITER_API_URL}/waiter/calls/${callId}/resolve`,
        {
            resolvedBy,
        },
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
}

export async function getTables() {
    const response = await axios.get<QrTableResponse[]>(
        `${WAITER_API_URL}/waiter/tables`,
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
}

export async function getReadyOrders() {
    const response = await axios.get<KitchenOrderResponse[]>(
        `${WAITER_API_URL}/waiter/orders/ready`,
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
}

export async function getCancelledOrders() {
    const response = await axios.get<KitchenOrderResponse[]>(
        `${WAITER_API_URL}/waiter/orders/cancelled`,
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
}

export async function markOrderServed(orderId: number) {
    const response = await axios.patch(
        `${WAITER_API_URL}/waiter/orders/${orderId}/served`,
        {},
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
}
export async function getActiveTableSession(tableId: number) {
    try {
        const response = await axios.get<TableSessionResponse>(
            `${QR_API_URL}/table-sessions/active/table/${tableId}`,
            {
                headers: getAuthHeader(),
            }
        );

        return response.data;
    } catch {
        return null;
    }
}

export async function markBillPaid(callId: number, resolvedBy: string) {
    const response = await axios.patch<TableCallResponse>(
        `${WAITER_API_URL}/waiter/calls/${callId}/mark-paid`,
        {
            resolvedBy,
        },
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
}