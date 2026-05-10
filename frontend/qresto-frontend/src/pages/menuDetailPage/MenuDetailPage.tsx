import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import HeaderIconButton from "../../components/ui/HeaderIconButton";
import MenuDetailAddToCartButton from "./components/MenuDetailAddToCartButton";
import MenuDetailBottomBar from "./components/MenuDetailBottomBar";
import MenuDetailExtrasSection from "./components/MenuDetailExtrasSection";
import MenuDetailHero from "./components/MenuDetailHero";
import MenuDetailNotFound from "./components/MenuDetailNotFound";
import MenuDetailOrderNote from "./components/MenuDetailOrderNote";
import MenuDetailPortionSection from "./components/MenuDetailPortionSection";
import type { PortionChoice } from "./components/MenuDetailPortionSection";
import MenuDetailQuantityStepper from "./components/MenuDetailQuantityStepper";
import MenuDetailSummary from "./components/MenuDetailSummary";
import { useMenuItemDetail } from "./hooks/useMenuItemDetail";
import { mapDetailResponseToMenuItem } from "./mappers/mapMenuItemDetail";
import "./styles/menuDetailAnimations.css";
import "./styles/menuDetail.css";

const MenuDetailPage = () => {
    const BACK_TRANSITION_MS = 360;
    const { itemId } = useParams<{ itemId: string }>();
    const navigate = useNavigate();
    const { data, loading, error } = useMenuItemDetail(itemId);
    const item = data ? mapDetailResponseToMenuItem(data) : undefined;
    const [quantity, setQuantity] = useState(1);
    const [orderNote, setOrderNote] = useState("");
    const [isLeavingToMenu, setIsLeavingToMenu] = useState(false);
    const [portion, setPortion] = useState<PortionChoice>("single");
    const [extras, setExtras] = useState({
        onion: false,
        mushroom: false,
        parmesan: false,
    });

    const basePrice = Number(item?.priceLabel.replace(/[^\d]/g, "") || 0);
    const portionExtra = portion === "large" ? 180 : 0;
    const extrasTotal =
        (extras.onion ? 25 : 0) + (extras.mushroom ? 40 : 0) + (extras.parmesan ? 35 : 0);
    const totalPrice = useMemo(
        () => (basePrice + portionExtra + extrasTotal) * quantity,
        [basePrice, portionExtra, extrasTotal, quantity]
    );

    const formatTry = (value: number) => `₺${value}`;

    const handleBackToMenu = () => {
        if (isLeavingToMenu) return;
        setIsLeavingToMenu(true);
        window.setTimeout(() => {
            navigate("/menu");
        }, BACK_TRANSITION_MS);
    };

    if (loading) {
        return (
            <div className="menu-detail-page-shell bg-surface text-on-surface min-h-screen flex items-center justify-center">
                Menü detayı yükleniyor...
            </div>
        );
    }

    if (!item || error) {
        return <MenuDetailNotFound />;
    }

    return (
        <div
            className={`menu-detail-page-shell bg-surface text-on-surface min-h-screen relative font-sans md:px-6 lg:px-10 ${
                isLeavingToMenu ? "route-exit-to-right" : "route-enter-from-right-slow"
            }`}
        >
            <AppHeader
                useSurface={false}
                className="menu-detail-top-actions"
                leftAction={
                    <HeaderIconButton
                        icon="arrow_back"
                        label="Geri"
                        onClick={handleBackToMenu}
                        disabled={isLeavingToMenu}
                        className="menu-detail-icon-btn shadow-sm flex items-center justify-center text-on-surface hover:bg-surface transition-colors active:scale-95"
                    />
                }
            />

            <MenuDetailHero name={item.name} imageUrl={item.imageUrl} />

            <main className="menu-detail-content-panel menu-detail-hero-panel-shadow bg-surface pt-8 px-container-margin flex flex-col gap-stack-md md:max-w-3xl md:mx-auto md:-mt-6 md:rounded-[28px]">
                <MenuDetailSummary
                    name={item.name}
                    description={item.description}
                    basePriceFormatted={formatTry(basePrice)}
                    prepMinutes={item.prepMinutes}
                    kcal={item.kcal}
                    rating={item.rating}
                />

                <MenuDetailPortionSection portion={portion} onPortionChange={setPortion} />

                <MenuDetailExtrasSection extras={extras} setExtras={setExtras} />

                <MenuDetailOrderNote value={orderNote} onChange={setOrderNote} />
            </main>

            <MenuDetailBottomBar style={{ animationDelay: "620ms" }}>
                <MenuDetailQuantityStepper
                    quantity={quantity}
                    onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
                    onIncrement={() => setQuantity((q) => q + 1)}
                />

                <MenuDetailAddToCartButton
                    totalPriceFormatted={formatTry(totalPrice)}
                    cartItem={{
                        productId: Number(item.id),
                        productName: item.name,
                        productPrice: totalPrice,
                        vatIncluded: true,
                        quantity: quantity,
                        addedIngredients: [
                            extras.onion ? "Soğan" : null,
                            extras.mushroom ? "Mantar" : null,
                            extras.parmesan ? "Parmesan" : null,
                        ]
                            .filter(Boolean)
                            .join(", "),
                        removedIngredients: portion === "single" ? "" : "",
                        note: orderNote,
                    }}
                />
            </MenuDetailBottomBar>
        </div>
    );
};

export default MenuDetailPage;
