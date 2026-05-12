import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBasket, ShoppingCart, Trash2, X } from "lucide-react";

import type { CartResponse, OrderResponse } from "../../types/cartTypes";
import OrderPaymentRatingModal from "../rating/OrderPaymentRatingModal";


import {
    clearCart,
    createOrderFromCart,
    getCartById,
    removeCartItem,
    updateCartItemQuantity,
} from "../../services/orderService";
import "./cartAnimations.css";

const Cart = () => {
    const [cartOpen, setCartOpen] = useState(false);
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);

    const storedCartId = sessionStorage.getItem("qresto_cart_id");
    const cartId = storedCartId ? Number(storedCartId) : null;

    const cartItems = cart?.items ?? [];

    const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const totalAmount =
        cart?.totalAmount ??
        cartItems.reduce(
            (sum, item) =>
                sum + (item.lineTotal ?? item.productPrice * item.quantity),
            0
        );

    const openCart = () => {
        setCartOpen(true);
        window.requestAnimationFrame(() => {
            setIsCartVisible(true);
        });
    };

    const closeCart = () => {
        setIsCartVisible(false);
        window.setTimeout(() => {
            setCartOpen(false);
        }, 240);
    };

    const toggleCart = () => {
        if (cartOpen) {
            closeCart();
            return;
        }
        openCart();
    };

    const formatPrice = (price: number) => {
        return `₺${price.toFixed(2)}`;
    };

    const loadCart = async () => {
        if (!cartId) return;

        setIsLoading(true);

        try {
            const response = await getCartById(cartId);
            setCart(response);
        } catch (error) {
            console.error("Sepet getirilirken hata oluştu:", error);
            setCart(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (cartOpen) {
            loadCart();
        }
    }, [cartOpen]);

    const handleDecrease = async (itemId: number | undefined, quantity: number) => {
        if (!cartId || !itemId) return;

        try {
            if (quantity <= 1) {
                const updatedCart = await removeCartItem(cartId, itemId);
                setCart(updatedCart);
                return;
            }

            const updatedCart = await updateCartItemQuantity(
                cartId,
                itemId,
                quantity - 1
            );

            setCart(updatedCart);
        } catch (error) {
            console.error("Ürün adedi azaltılırken hata oluştu:", error);
        }
    };

    const handleIncrease = async (itemId: number | undefined, quantity: number) => {
        if (!cartId || !itemId) return;

        try {
            const updatedCart = await updateCartItemQuantity(
                cartId,
                itemId,
                quantity + 1
            );

            setCart(updatedCart);
        } catch (error) {
            console.error("Ürün adedi artırılırken hata oluştu:", error);
        }
    };

    const handleRemove = async (itemId: number | undefined) => {
        if (!cartId || !itemId) return;

        try {
            const updatedCart = await removeCartItem(cartId, itemId);
            setCart(updatedCart);
        } catch (error) {
            console.error("Ürün sepetten silinirken hata oluştu:", error);
        }
    };

    const handleClearCart = async () => {
        if (!cartId) return;

        try {
            const updatedCart = await clearCart(cartId);
            setCart(updatedCart);
        } catch (error) {
            console.error("Sepet temizlenirken hata oluştu:", error);
        }
    };

    const handleCreateOrder = async () => {
        if (!cartId || cartItems.length === 0) return;

        setIsOrdering(true);

        try {
            const order = await createOrderFromCart(cartId);

            sessionStorage.removeItem("qresto_cart_id");
            setCart(null);
            setCreatedOrder(order);
            closeCart();
        } catch (error) {
            console.error("Sipariş oluşturulurken hata oluştu:", error);
            alert("Sipariş oluşturulurken hata oluştu.");
        } finally {
            setIsOrdering(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={toggleCart}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--qresto-primary)] transition hover:bg-[var(--qresto-hover)]"
            >
                <ShoppingCart size={24} />

                {totalQuantity > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--qresto-primary)] px-1 text-[11px] font-bold leading-none text-white">
                        {totalQuantity}
                    </span>
                )}
            </button>

            {cartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <button
                        type="button"
                        aria-label="Sepeti kapat"
                        onClick={closeCart}
                        className={`absolute inset-0 bg-black/40 cart-overlay ${
                            isCartVisible ? "cart-overlay-open" : ""
                        }`}
                    />

                    <aside
                        className={`relative flex h-full w-full max-w-[420px] flex-col bg-[var(--qresto-surface)] p-6 text-[var(--qresto-text)] shadow-2xl cart-drawer ${
                            isCartVisible ? "cart-drawer-open" : ""
                        }`}
                    >
                        <div className="mb-6 flex items-center justify-between border-b border-[var(--qresto-border)] pb-4">
                            <div>
                                <h2 className="text-xl font-bold">Sepetim</h2>

                                <p className="text-sm text-[var(--qresto-muted)]">
                                    {totalQuantity > 0
                                        ? `${totalQuantity} ürün seçildi`
                                        : "Sepetiniz boş"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeCart}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--qresto-border)] transition hover:bg-[var(--qresto-hover)]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex h-full items-center justify-center text-sm text-[var(--qresto-muted)]">
                                    Sepet yükleniyor...
                                </div>
                            ) : cartItems.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                        <ShoppingBasket size={30} />
                                    </div>

                                    <h3 className="text-lg font-bold">
                                        Sepetiniz boş
                                    </h3>

                                    <p className="mt-2 max-w-[260px] text-sm text-[var(--qresto-muted)]">
                                        Menüden ürün eklediğinizde burada görünecek.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div
                                            key={item.id ?? item.productId}
                                            className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className="font-bold">
                                                        {item.productName}
                                                    </p>

                                                    <p className="mt-1 text-sm text-[var(--qresto-muted)]">
                                                        {formatPrice(item.productPrice)} x{" "}
                                                        {item.quantity}
                                                    </p>

                                                    {item.removedIngredients && (
                                                        <p className="mt-1 text-xs text-[var(--qresto-muted)]">
                                                            Çıkarılan:{" "}
                                                            {item.removedIngredients}
                                                        </p>
                                                    )}

                                                    {item.addedIngredients && (
                                                        <p className="mt-1 text-xs text-[var(--qresto-muted)]">
                                                            Eklenen:{" "}
                                                            {item.addedIngredients}
                                                        </p>
                                                    )}

                                                    {item.note && (
                                                        <p className="mt-1 text-xs text-[var(--qresto-muted)]">
                                                            Not: {item.note}
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemove(item.id)}
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center rounded-full border border-[var(--qresto-border)] bg-[var(--qresto-surface)]">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDecrease(
                                                                item.id,
                                                                item.quantity
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[var(--qresto-hover)]"
                                                    >
                                                        <Minus size={16} />
                                                    </button>

                                                    <span className="w-8 text-center text-sm font-bold">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleIncrease(
                                                                item.id,
                                                                item.quantity
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[var(--qresto-hover)]"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>

                                                <span className="text-lg font-bold text-[var(--qresto-primary)]">
                                                    {formatPrice(
                                                        item.lineTotal ??
                                                        item.productPrice *
                                                        item.quantity
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 border-t border-[var(--qresto-border)] pt-4">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="font-semibold text-[var(--qresto-muted)]">
                                    Toplam
                                </span>

                                <span className="text-2xl font-extrabold text-[var(--qresto-primary)]">
                                    {formatPrice(totalAmount)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={handleClearCart}
                                    disabled={!cartId || cartItems.length === 0}
                                    className="h-12 rounded-full border border-[var(--qresto-border)] font-bold text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Temizle
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCreateOrder}
                                    disabled={
                                        !cartId ||
                                        cartItems.length === 0 ||
                                        isOrdering
                                    }
                                    className="h-12 rounded-full bg-[var(--qresto-primary)] font-bold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isOrdering ? "Gönderiliyor..." : "Sipariş Ver"}
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {createdOrder && (
                <OrderPaymentRatingModal
                    order={createdOrder}
                    onClose={() => setCreatedOrder(null)}
                />
            )}
        </>
    );
};

export default Cart;