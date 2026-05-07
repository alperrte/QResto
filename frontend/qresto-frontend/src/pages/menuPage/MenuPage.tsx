import { useMemo, useRef, useState, type WheelEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  MENU_CATEGORIES,
  SAMPLE_MENU_ITEMS,
  type MenuCategoryFilterId,
} from "./menuItems";
import AppHeader from "../../components/layout/AppHeader";
import HeaderIconButton from "../../components/ui/HeaderIconButton";
import MenuCategoryButton from "./components/MenuCategoryButton";
import MenuCategoryHeading from "./components/MenuCategoryHeading";
import MenuItemCard from "./components/MenuItemCard";
import MenuSearchBar from "./components/MenuSearchBar";
import "./styles/menuAnimations.css";

const MenuPage = () => {
  const WELCOME_TRANSITION_MS = 360;
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<MenuCategoryFilterId>("all");
  const [isLeavingToWelcome, setIsLeavingToWelcome] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE_MENU_ITEMS.filter((item) => {
      const catOk =
        selectedCategory === "all" || item.categoryId === selectedCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [query, selectedCategory]);
  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === "all") return "Tüm Kategoriler";
    return (
      MENU_CATEGORIES.find((category) => category.id === selectedCategory)
        ?.label ?? "Tüm Kategoriler"
    );
  }, [selectedCategory]);

  const shouldAnimateCardStagger =
    selectedCategory === "all" && query.trim() === "";
  const CATEGORY_STEP_MS = 56;
  const CATEGORY_ANIMATION_MS = 700;
  const HEADING_GAP_MS = -170;
  const HEADING_TO_CARD_GAP_MS = 90;
  const CARD_STEP_MS = 64;
  const categoryHalfPointMs =
    Math.max(0, Math.floor((MENU_CATEGORIES.length - 1) / 2)) *
      CATEGORY_STEP_MS +
    CATEGORY_ANIMATION_MS * 0.55;
  const headingDelayMs = Math.max(0, categoryHalfPointMs + HEADING_GAP_MS);
  const cardBaseDelayMs = Math.max(0, headingDelayMs + HEADING_TO_CARD_GAP_MS);

  const handleCategoryWheel = (event: WheelEvent<HTMLDivElement>) => {
    const container = categoryScrollRef.current;
    if (!container) return;

    // Trackpad/mouse tekerleğini yatay kaydırmaya çevirerek chip listesini kolay kaydırır.
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      container.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  };

  const handleOpenWelcome = () => {
    if (isLeavingToWelcome) return;
    setIsLeavingToWelcome(true);
    window.setTimeout(() => {
      navigate("/welcome");
    }, WELCOME_TRANSITION_MS);
  };

  return (
    <div
      className={`app-surface-page min-h-screen font-sans text-body-lg pb-stack-md ${
        isLeavingToWelcome ? "route-exit-to-right" : "route-enter-from-right"
      }`}
    >
      <AppHeader
        className="sticky top-0 z-40 shadow-sm"
        leftAction={
          <HeaderIconButton
            icon="arrow_back"
            label="Geri oku"
            onClick={handleOpenWelcome}
            disabled={isLeavingToWelcome}
            className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center p-2 rounded-full"
          />
        }
        rightAction={
          <HeaderIconButton
            icon="shopping_basket"
            label="Sepet"
            badge={2}
            className="text-primary hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center p-2 rounded-full relative"
          />
        }
      />

      <main className="w-full max-w-[1200px] mx-auto px-container-margin py-stack-md flex flex-col gap-stack-md">
        <MenuSearchBar value={query} onChange={setQuery} />

        <section
          aria-label="Kategoriler"
          className="relative z-20 overflow-hidden pt-7 -mt-7"
        >
          <div
            ref={categoryScrollRef}
            onWheel={handleCategoryWheel}
            className="flex overflow-x-auto hide-scrollbar gap-stack-sm pb-2 -mx-container-margin px-container-margin scroll-smooth"
          >
            {MENU_CATEGORIES.map((cat, idx) => {
              const isActive = selectedCategory === cat.id;
              return (
                <MenuCategoryButton
                  key={cat.id}
                  id={cat.id}
                  icon={cat.icon}
                  defaultFill={cat.defaultFill}
                  fallbackLabel={cat.label}
                  isActive={isActive}
                  animationDelayMs={idx * CATEGORY_STEP_MS}
                  onClick={setSelectedCategory}
                />
              );
            })}
          </div>
        </section>

        <section
          className="flex flex-col gap-stack-md"
          aria-label="Öne çıkanlar"
        >
          <MenuCategoryHeading
            title={selectedCategoryLabel}
            animationDelayMs={headingDelayMs}
          />

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 px-4">
              <p className="text-on-surface-variant text-body-sm text-center">
                Bu filtreye uygun ürün bulunamadı.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setQuery("");
                }}
                className="rounded-full bg-primary-container text-on-primary-container font-sans text-label-bold py-3 px-6 hover:opacity-90 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Arama ve kategori filtresini temizle"
              >
                Filtreyi temizle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
              {filteredItems.map((item, idx) => (
                <MenuItemCard
                  key={`${selectedCategory}:${query.trim().toLowerCase()}:${
                    item.id
                  }`}
                  item={item}
                  animationDelay={
                    shouldAnimateCardStagger
                      ? `${cardBaseDelayMs + idx * CARD_STEP_MS}ms`
                      : `${idx * 28}ms`
                  }
                  animationClassName={
                    shouldAnimateCardStagger
                      ? "menu-card-stagger"
                      : "menu-card-stagger-fast"
                  }
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MenuPage;
