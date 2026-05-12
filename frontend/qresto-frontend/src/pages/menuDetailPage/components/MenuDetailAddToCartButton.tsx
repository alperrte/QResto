import { useCallback, useState } from "react";

import { QRESTO_OPEN_CART_EVENT } from "../../../components/cart/Cart";
import type { AddCartItemRequest } from "../../../types/cartTypes";
import { addCartItem, createCart } from "../../../services/orderService";
import type { MenuDetailCartFeedbackVariant } from "./MenuDetailCartFeedbackModal";
import MenuDetailCartFeedbackModal from "./MenuDetailCartFeedbackModal";

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
    const [feedback, setFeedback] = useState<{
        open: boolean;
        variant: MenuDetailCartFeedbackVariant;
        message: string;
    }>({ open: false, variant: "info", message: "" });

    const closeFeedback = useCallback(() => {
        setFeedback((prev) => ({ ...prev, open: false }));
    }, []);

    const showFeedback = (variant: MenuDetailCartFeedbackVariant, message: string) => {
        setFeedback({ open: true, variant, message });
    };

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

            showFeedback(
                "info",
                "Masa oturumu bulunamadı. Lütfen masanızdaki QR kodu tekrar okutun."
            );
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

    const isValidCartItem = (
        item?: AddCartItemRequest
    ): item is AddCartItemRequest => {
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
            showFeedback(
                "error",
                "Ürün bilgisi eksik. Sayfayı yenileyip tekrar deneyin veya destek ile iletişime geçin."
            );
            return;
        }

        setIsAdding(true);

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

        try {
            let cartId = await getOrCreateCartId();

            if (!cartId) {
                return;
            }

            const tryAdd = async (id: number) => addCartItem(id, requestBody);

            try {
                await tryAdd(cartId);
            } catch (firstError) {
                /* Eski sipariş sonrası kalan sepet ID’si ORDERED olabilir — bir kez temizleyip yeni sepetle yeniden dene */
                localStorage.removeItem("qresto_cart_id");
                const freshId = await getOrCreateCartId();
                if (!freshId) {
                    throw firstError;
                }
                await tryAdd(freshId);
            }

            if (onAddedToCart) {
                onAddedToCart();
            }

            window.dispatchEvent(new CustomEvent(QRESTO_OPEN_CART_EVENT));
        } catch (error) {
            console.error("Ürün sepete eklenirken hata oluştu:", error);
            showFeedback(
                "error",
                "Ürün sepete eklenirken bir hata oluştu. Bağlantınızı ve sipariş servisini kontrol edip tekrar deneyin."
            );
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <>
            <MenuDetailCartFeedbackModal
                isOpen={feedback.open}
                variant={feedback.variant}
                message={feedback.message}
                onClose={closeFeedback}
            />

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
        </>
    );
};

export default MenuDetailAddToCartButton;