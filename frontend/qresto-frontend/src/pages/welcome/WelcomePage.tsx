import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import HeaderIconButton from "../../components/ui/HeaderIconButton";
import "./welcomeStyles.css";
import "./welcomeAnimations.css";

const DEV_PREVIEW_TABLE = { tableNo: "12", tableName: "Örnek masa" };
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80";

const WelcomePage = () => {
  const MENU_TRANSITION_MS = 380;
  const navigate = useNavigate();
  const [isLeavingToMenu, setIsLeavingToMenu] = useState(false);
  let tableNo = localStorage.getItem("tableNo");
  let tableName = localStorage.getItem("tableName");
  const storedTableId = localStorage.getItem("tableId");

  const useDevPreview = import.meta.env.DEV && !storedTableId;

  if (useDevPreview) {
    tableNo = DEV_PREVIEW_TABLE.tableNo;
    tableName = DEV_PREVIEW_TABLE.tableName;
  }

  useEffect(() => {
    if (import.meta.env.PROD && !localStorage.getItem("tableId")) {
      navigate("/qr/scan", { replace: true });
    }
  }, [navigate]);

  const handleGoToMenu = () => {
    if (isLeavingToMenu) return;
    setIsLeavingToMenu(true);
    window.setTimeout(() => {
      navigate("/menu");
    }, MENU_TRANSITION_MS);
  };

  if (!import.meta.env.DEV && !localStorage.getItem("tableId")) {
    return (
      <div className="app-surface-page route-enter-from-left min-h-screen">
        <AppHeader
          className="sticky top-0 z-40 shadow-sm"
          rightAction={
            <HeaderIconButton
              icon="shopping_basket"
              label="Sepet"
              className="text-primary hover:opacity-80 transition-opacity active:scale-95"
            />
          }
        />
        <div className="flex items-center justify-center p-6">
          <p className="text-lg welcome-redirect-hint">Yönlendiriliyorsunuz…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`app-surface-page welcome-layout min-h-screen flex flex-col relative overflow-x-hidden ${
        isLeavingToMenu ? "route-exit-to-left" : "route-enter-from-left"
      }`}
    >
      <div className="welcome-hero-bg welcome-hero-entrance absolute inset-0 z-0 h-full w-full">
        <div className="welcome-hero-overlay absolute inset-0 z-10" />
        <img
          alt="QResto hero"
          className="welcome-hero-photo w-full h-full object-cover"
          src={HERO_IMAGE_URL}
        />
      </div>

      <AppHeader
        className="welcome-topbar welcome-topbar-reveal sticky top-0 z-50 shadow-sm"
        titleClassName="tracking-tight"
        rightAction={
          <HeaderIconButton
            icon="shopping_basket"
            label="Sepet"
            className="text-primary hover:opacity-80 transition-opacity active:scale-95"
          />
        }
      />

      <main className="flex-grow z-20 flex flex-col justify-center items-center px-container-margin py-10 md:py-16 max-w-4xl mx-auto w-full">
        <div className="w-full max-w-lg flex flex-col gap-stack-md">
          <div className="welcome-card welcome-card-rise welcome-glass-panel rounded-xl p-6 text-center shadow-lg">
            {useDevPreview ? (
              <p className="welcome-preview-badge text-xs font-medium rounded-lg py-2 px-3 mb-4">
                Geliştirici önizleme — QR oturumu yok; yalnızca{" "}
                <code className="text-[11px]">npm run dev</code> ortamında
              </p>
            ) : null}

            <h2 className="font-headline text-display-lg text-on-surface mb-2">
              Hoş Geldiniz
            </h2>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Bu menü üzerinden sipariş verebilir, ödeme yapabilir ve masanıza
              özel işlemleri hızlıca yönetebilirsiniz.
            </p>
            <div className="inline-flex items-center gap-2 welcome-info-box px-4 py-2 rounded-full border">
              <span
                className="material-symbols-outlined welcome-accent text-xl"
                data-weight="fill"
              >
                table_restaurant
              </span>
              <span className="font-bold text-label-bold text-on-surface">
                Masa: {tableNo ?? "—"}
              </span>
              {tableName ? (
                <span className="text-body-sm text-on-surface-variant">
                  ({tableName})
                </span>
              ) : null}
            </div>
          </div>

          <div className="welcome-actions-stagger grid grid-cols-2 gap-stack-sm">
            <button
              type="button"
              onClick={handleGoToMenu}
              disabled={isLeavingToMenu}
              className="col-span-2 welcome-cta welcome-cta-gradient welcome-primary-action rounded-xl p-6 flex items-center justify-between shadow-md active:scale-[0.98] group"
            >
              <div className="flex flex-col text-left gap-1">
                <span className="font-headline text-headline-md">
                  Menüyü Gör
                </span>
                <span className="font-sans text-body-sm text-on-primary/80">
                  Lezzetleri keşfet
                </span>
              </div>
              <div className="bg-on-primary/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  restaurant_menu
                </span>
              </div>
            </button>

            <button
              type="button"
              className="welcome-secondary-action rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm border transition-colors active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-primary text-3xl">
                room_service
              </span>
              <span className="font-bold text-label-bold">Garson Çağır</span>
            </button>

            <button
              type="button"
              className="welcome-secondary-action rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm border transition-colors active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-primary text-3xl">
                receipt_long
              </span>
              <span className="font-bold text-label-bold">Hesap İste</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;
