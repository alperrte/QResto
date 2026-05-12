import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import Cart from "../../components/cart/Cart";
import HeaderIconButton from "../../components/ui/HeaderIconButton";
import MenuDetailAddToCartButton from "./components/MenuDetailAddToCartButton";
import MenuDetailBottomBar from "./components/MenuDetailBottomBar";
import MenuDetailExtrasSection from "./components/MenuDetailExtrasSection";
import MenuDetailHero from "./components/MenuDetailHero";
import MenuDetailNotFound from "./components/MenuDetailNotFound";
import MenuDetailOrderNote from "./components/MenuDetailOrderNote";
import MenuDetailOptionGroups, {
    buildDefaultOptionSelection,
    collectSelectedOptionLabels,
    type MenuDetailOptionSelection,
    sumSelectedOptionExtrasTry,
} from "./components/MenuDetailOptionGroups";
import type { PortionChoice } from "./components/MenuDetailPortionSection";
import MenuDetailPortionSection from "./components/MenuDetailPortionSection";
import MenuDetailQuantityStepper from "./components/MenuDetailQuantityStepper";
import MenuDetailSummary from "./components/MenuDetailSummary";
import { useMenuItemDetail } from "./hooks/useMenuItemDetail";
import { useProductRatingSummary } from "./hooks/useProductRatingSummary";
import { mapDetailResponseToMenuItem } from "./mappers/mapMenuItemDetail";
import type { MenuProductOptionGroupDto } from "./types/menuDetail.types";
import "./styles/menuDetailAnimations.css";
import "./styles/menuDetail.css";

const MenuDetailPage = () => {
    const BACK_TRANSITION_MS = 360;
    const { itemId } = useParams<{ itemId: string }>();
    const navigate = useNavigate();
    const { data, loading, error } = useMenuItemDetail(itemId);
    const item = data ? mapDetailResponseToMenuItem(data) : undefined;
    const productIdNum = itemId != null ? Number(itemId) : undefined;
    const { summary: ratingSummary, loading: ratingSummaryLoading } =
        useProductRatingSummary(Number.isFinite(productIdNum) ? productIdNum : undefined);
    const [quantity, setQuantity] = useState(1);
    const [orderNote, setOrderNote] = useState("");
    const [isLeavingToMenu, setIsLeavingToMenu] = useState(false);
    const [portion, setPortion] = useState<PortionChoice>("single");
    const [extras, setExtras] = useState({
        onion: false,
        mushroom: false,
        parmesan: false,
    });
    const [apiOptionSelection, setApiOptionSelection] = useState<MenuDetailOptionSelection>({
        radioByGroupId: {},
        multiByGroupId: {},
    });

    const apiGroups: MenuProductOptionGroupDto[] | null = useMemo(() => {
        const raw = data?.optionGroups;
        if (!raw?.length) return null;
        return [...raw].sort((a, b) => a.sortOrder - b.sortOrder);
    }, [data?.optionGroups]);

    const hasApiOptions = Boolean(apiGroups?.length);

    useEffect(() => {
        if (!apiGroups?.length) {
            setApiOptionSelection({ radioByGroupId: {}, multiByGroupId: {} });
            return;
        }
        setApiOptionSelection(
            buildDefaultOptionSelection(apiGroups, { productName: data?.name })
        );
    }, [itemId, apiGroups, data?.name]);

    const basePrice = Number(data?.price ?? 0);
    const portionExtra = !hasApiOptions && portion === "large" ? 180 : 0;
    const extrasTotal = !hasApiOptions
        ? (extras.onion ? 25 : 0) + (extras.mushroom ? 40 : 0) + (extras.parmesan ? 35 : 0)
        : 0;
    const apiOptionsExtra = hasApiOptions && apiGroups
        ? sumSelectedOptionExtrasTry(apiGroups, apiOptionSelection)
        : 0;
    const unitPrice = useMemo(
        () => basePrice + portionExtra + extrasTotal + apiOptionsExtra,
        [basePrice, portionExtra, extrasTotal, apiOptionsExtra]
    );
    const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

    const formatTry = (value: number) => `₺${value}`;

    const orderNoteHeading =
        data?.orderNoteEnabled && data.orderNoteTitle?.trim()
            ? data.orderNoteTitle.trim()
            : "Sipariş Notu";

    const addedIngredientsSummary = useMemo(() => {
        if (hasApiOptions && apiGroups) {
            return collectSelectedOptionLabels(apiGroups, apiOptionSelection).join(", ");
        }
        return [extras.onion ? "Soğan" : null, extras.mushroom ? "Mantar" : null, extras.parmesan ? "Parmesan" : null]
            .filter(Boolean)
            .join(", ");
    }, [hasApiOptions, apiGroups, apiOptionSelection, extras.onion, extras.mushroom, extras.parmesan]);

    const handleBackToMenu = () => {
        if (isLeavingToMenu) return;
        setIsLeavingToMenu(true);
        window.setTimeout(() => {
            navigate("/menu");
        }, BACK_TRANSITION_MS);
    };

    if (loading) {
        return (
            <div className="menu-detail-page-shell text-on-surface min-h-screen flex items-center justify-center">
                Menü detayı yükleniyor...
            </div>
        );
    }

    if (!item || error) {
        return <MenuDetailNotFound />;
    }

    return (
        <>
            <AppHeader
                useSurface={false}
                title=""
                className="menu-detail-top-bar"
                leftAction={
                    <HeaderIconButton
                        icon="arrow_back"
                        label="Geri"
                        onClick={handleBackToMenu}
                        disabled={isLeavingToMenu}
                        className="menu-detail-top-bar-action menu-detail-icon-btn shadow-sm flex items-center justify-center text-on-surface hover:bg-surface transition-colors active:scale-95"
                    />
                }
                rightAction={
                    <div className="menu-detail-top-bar-action flex items-center justify-end">
                        <Cart />
                    </div>
                }
            />

            <div
                className={`menu-detail-page-shell text-on-surface min-h-screen relative font-sans md:px-6 lg:px-10 ${
                    isLeavingToMenu ? "route-exit-to-right" : "route-enter-from-right-slow"
                }`}
            >
                <MenuDetailHero name={item.name} imageUrl={item.imageUrl} />

                <main className="menu-detail-content-panel px-container-margin pb-2 flex flex-col gap-stack-md md:max-w-3xl md:mx-auto">
                    <MenuDetailSummary
                        name={item.name}
                        description={item.description}
                        basePriceFormatted={formatTry(basePrice)}
                        prepMinutes={item.prepMinutes}
                        kcal={item.kcal}
                        gram={item.gram}
                        ratingSummary={ratingSummary}
                        ratingLoading={ratingSummaryLoading}
                    />

                    {hasApiOptions && apiGroups ? (
                        <MenuDetailOptionGroups
                            groups={apiGroups}
                            value={apiOptionSelection}
                            onChange={setApiOptionSelection}
                        />
                    ) : (
                        <>
                            <MenuDetailPortionSection portion={portion} onPortionChange={setPortion} />
                            <MenuDetailExtrasSection extras={extras} setExtras={setExtras} />
                        </>
                    )}

                    {data?.orderNoteEnabled ? (
                        <MenuDetailOrderNote
                            value={orderNote}
                            onChange={setOrderNote}
                            heading={orderNoteHeading}
                        />
                    ) : null}
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
                            productPrice: unitPrice,
                            vatIncluded: true,
                            quantity: quantity,
                            addedIngredients: addedIngredientsSummary,
                            removedIngredients: !hasApiOptions && portion === "single" ? "" : "",
                            note: orderNote,
                        }}
                    />
                </MenuDetailBottomBar>
            </div>
        </>
    );
};

export default MenuDetailPage;
