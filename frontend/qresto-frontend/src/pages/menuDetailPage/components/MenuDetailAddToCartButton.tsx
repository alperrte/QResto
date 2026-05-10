import { useState } from "react";

import type { AddCartItemRequest } from "../../../types/cartTypes";
import { addCartItem, createCart } from "../../../services/orderService";

type MenuDetailAddToCartButtonProps = {
    totalPriceFormatted: string;
    cartItem?: AddCartItemRequest;
    onAddedToCart?: () => void;
};

const MenuDetailAddToCartButton = ({
                                       totalPriceFormatted,
                                       cartItem,
                                       onAddedToCart,
                                   }: MenuDetailAddToCartButtonProps) => {
    const [isAdding, setIsAdding] = useState(false);

    const getStorageNumber = (key: string): number | null => {
        const value = localStorage.getItem(key);

        if (!value) {
            return null;
        }

        const numberValue = Number(value);

        if (Number.isNaN(numberValue) || numberValue <= 0) {
            return null;
        }

        return numberValue;
    };

    const getOrCreateCartId = async (): Promise<number | null> => {
        const existingCartId = getStorageNumber("qresto_cart_id");

        if (existingCartId) {
            return existingCartId;
        }

        const tableSessionId = getStorageNumber("qresto_table_session_id");
        const guestSessionId = getStorageNumber("qresto_guest_session_id");
        const tableId = getStorageNumber("qresto_table_id");
        const tableName = localStorage.getItem("qresto_table_name") ?? "Masa";

        if (!tableSessionId || !guestSessionId || !tableId) {
            console.error("Eksik QR session bilgisi:", {
                tableSessionId,
                guestSessionId,
                tableId,
                tableName,
                localStorageTableSessionId: localStorage.getItem("qresto_table_session_id"),
                localStorageGuestSessionId: localStorage.getItem("qresto_guest_session_id"),
                localStorageTableId: localStorage.getItem("qresto_table_id"),
                localStorageTableName: localStorage.getItem("qresto_table_name"),
            });

            alert("Masa oturumu bulunamadı. Lütfen QR kodu tekrar okutun.");
            return null;
        }

        const createdCart = await createCart(
            tableSessionId,
            guestSessionId,
            tableId,
            tableName
        );

        localStorage.setItem("qresto_cart_id", String(createdCart.id));

        return createdCart.id;
    };

    const isValidCartItem = (item?: AddCartItemRequest) => {
        if (!item) {
            return false;
        }

        if (!item.productId || item.productId <= 0) {
            return false;
        }

        if (!item.productName || item.productName.trim() === "") {
            return false;
        }

        if (item.productPrice === undefined || item.productPrice < 0) {
            return false;
        }

        if (!item.quantity || item.quantity <= 0) {
            return false;
        }

        return true;
    };

    const handleAddToCart = async () => {
        if (!isValidCartItem(cartItem)) {
            console.error("Sepete eklenecek ürün bilgisi eksik:", cartItem);
            alert("Ürün bilgisi eksik. Ürün detay sayfasındaki cartItem gönderimini kontrol et.");
            return;
        }

        setIsAdding(true);

        try {
            const cartId = await getOrCreateCartId();

            if (!cartId) {
                return;
            }

            const requestBody: AddCartItemRequest = {
                productId: cartItem.productId,
                productName: cartItem.productName,
                productPrice: cartItem.productPrice,
                vatIncluded: cartItem.vatIncluded,
                quantity: cartItem.quantity,
                removedIngredients: cartItem.removedIngredients,
                addedIngredients: cartItem.addedIngredients,
                note: cartItem.note,
            };

            console.log("ADD CART ITEM BODY:", requestBody);

            await addCartItem(cartId, requestBody);

            if (onAddedToCart) {
                onAddedToCart();
            }

            alert("Ürün sepete eklendi.");
        } catch (error) {
            console.error("Ürün sepete eklenirken hata oluştu:", error);
            alert("Ürün sepete eklenirken hata oluştu.");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 h-[48px] bg-primary text-on-primary rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest disabled:opacity-60 disabled:cursor-not-allowed"
        >
            <span className="material-symbols-outlined text-[20px]">
                shopping_basket
            </span>

            <span className="font-bold text-label-bold">
                {isAdding
                    ? "Sepete Ekleniyor..."
                    : `Sepete Ekle - ${totalPriceFormatted}`}
            </span>
        </button>
    );
};

export default MenuDetailAddToCartButton;