import axios from "axios";

const MENU_SERVICE_BASE_URL =
    import.meta.env.VITE_MENU_SERVICE_URL ?? "http://localhost:7073/api/menu";

const menuProductApi = axios.create({
    baseURL: MENU_SERVICE_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export type MenuProductInfo = {
    id: number;
    name?: string;
    productName?: string;
    title?: string;
    description?: string | null;
    price?: number | null;
    imageUrl?: string | null;
    imagePath?: string | null;
    image?: string | null;
    productImageUrl?: string | null;
    active?: boolean;
    vatIncluded?: boolean;
    calorie?: number | null;
    gram?: number | null;
    preparationTimeMinutes?: number | null;
};

export const getMenuProductById = async (
    productId: number
): Promise<MenuProductInfo | null> => {
    const candidateUrls = [
        `/products/${productId}`,
        `/products/${productId}/order-info`,
        `/product/${productId}`,
        `/client/products/${productId}`,
    ];

    for (const url of candidateUrls) {
        try {
            const response = await menuProductApi.get<MenuProductInfo>(url);
            return response.data;
        } catch {
            // Diğer olası endpoint denenir.
        }
    }

    return null;
};

export default menuProductApi;