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
export interface OrderItemDetailResponse {
    id: number;
    productId: number;
    productName: string;
    productPrice: number;
    vatIncluded: boolean;
    quantity: number;
    removedIngredients?: string | null;
    addedIngredients?: string | null;
    note?: string | null;
    lineTotal: number;
    status: string;
    cancelReason?: string | null;
    cancelledAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface OrderDetailResponse {
    id: number;
    orderNo: string;
    cartId?: number | null;
    tableSessionId: number;
    guestSessionId: number;
    tableId: number;
    tableName?: string | null;
    status: string;
    subtotalAmount: number;
    vatAmount: number;
    totalAmount: number;
    cancelReason?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    receivedAt?: string | null;
    preparingAt?: string | null;
    readyAt?: string | null;
    servedAt?: string | null;
    completedAt?: string | null;
    paymentPendingAt?: string | null;
    paidAt?: string | null;
    cancelledAt?: string | null;
    items: OrderItemDetailResponse[];
}
export const getOrderDetail = async (
    orderId: number
): Promise<OrderDetailResponse> => {
    const response = await axios.get<OrderDetailResponse>(
        `${WAITER_API_URL}/waiter/orders/${orderId}/detail`,
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
};
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
export async function getActiveTableSession(tableId: number): Promise<TableSessionResponse | null> {
    try {
        const response = await axios.get<TableSessionResponse>(
            `${QR_API_URL}/table-sessions/active/table/${tableId}`,
            {
                headers: getAuthHeader(),
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
            return null;
        }

        return null;
    }
}
export async function getActiveOrders() {
    const response = await axios.get<KitchenOrderResponse[]>(
        `${WAITER_API_URL}/waiter/orders/active`,
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
}

export async function refreshTableSession(
    tableId: number
): Promise<TableSessionResponse | null> {
    try {
        const response = await axios.get<TableSessionResponse | "">(
            `${WAITER_API_URL}/waiter/tables/${tableId}/session/refresh`,
            {
                headers: getAuthHeader(),
            }
        );

        return response.data ? (response.data as TableSessionResponse) : null;
    } catch {
        return null;
    }
}
export async function closeTableSession(tableId: number) {
    const response = await axios.patch(
        `${WAITER_API_URL}/waiter/tables/${tableId}/session/close`,
        {},
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
}
export async function closeTableSessionByWaiter(tableSessionId: number) {
    const response = await axios.patch(
        `${WAITER_API_URL}/waiter/table-sessions/${tableSessionId}/close-by-waiter`,
        {},
        {
            headers: getAuthHeader(),
        }
    );

    return response.data;
}