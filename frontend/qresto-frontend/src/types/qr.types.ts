export interface RestaurantTableResponse {
    id: number;
    tableNo: number;
    name: string;
    capacity: number | null;
    active: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateRestaurantTableRequest {
    tableNo: number;
    name: string;
    capacity?: number;
}

export interface TableQrCodeResponse {
    id: number;
    tableId: number;
    qrUuid: string;
    qrToken: string;
    qrImageUrl: string | null;
    versionNo: number;
    active: boolean;
    createdAt: string;
    updatedAt: string | null;
    qrContent: string;
}

export interface QrPreview {
    table: RestaurantTableResponse;
    qr: TableQrCodeResponse;
    imageUrl: string;
}