import { X } from "lucide-react";

import type { OrderResponse } from "../../types/cartTypes";

import OrderRatingForm from "./OrderRatingForm";

type OrderRatingModalProps = {
    order: OrderResponse;
    onClose: () => void;
};

const OrderRatingModal = ({ order, onClose }: OrderRatingModalProps) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
            <div className="relative max-h-[92vh] w-full max-w-[560px] overflow-hidden rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--qresto-border)] px-5 py-4">
                    <div>
                        <h2 className="text-xl font-extrabold">Değerlendirme</h2>
                        <p className="text-sm text-[var(--qresto-muted)]">Sipariş No: {order.orderNo}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--qresto-border)] transition hover:bg-[var(--qresto-hover)]"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="max-h-[calc(92vh-90px)] overflow-y-auto p-5">
                    <OrderRatingForm order={order} onClose={onClose} />
                </div>
            </div>
        </div>
    );
};

export default OrderRatingModal;
