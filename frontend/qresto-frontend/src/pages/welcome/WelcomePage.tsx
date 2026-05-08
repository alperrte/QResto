import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import HeaderIconButton from "../../components/ui/HeaderIconButton";
import WelcomeActionButtons from "./components/WelcomeActionButtons";
import WelcomeInfoCard from "./components/WelcomeInfoCard";
import WelcomeServiceModal, {
  type ServiceModalStep,
  type ServiceModalType,
} from "./components/WelcomeServiceModal";
import {
  DEV_PREVIEW_TABLE,
  HERO_IMAGE_URL,
  MENU_TRANSITION_MS,
  SERVICE_LOADING_MS,
} from "./constants/welcome.constants";
import "./welcomeStyles.css";
import "./welcomeAnimations.css";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [isLeavingToMenu, setIsLeavingToMenu] = useState(false);
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceModalType | null>(null);
  const [serviceModalStep, setServiceModalStep] = useState<ServiceModalStep>("confirm");
  let tableName = localStorage.getItem("tableName");
  const storedTableId = localStorage.getItem("tableId");

  const useDevPreview = import.meta.env.DEV && !storedTableId;

  if (useDevPreview) {
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

  const handleOpenServiceModal = (type: ServiceModalType) => {
    setServiceModalStep("confirm");
    setActiveServiceModal(type);
  };

  const handleCloseServiceModal = () => {
    if (serviceModalStep === "loading") return;
    setActiveServiceModal(null);
    setServiceModalStep("confirm");
  };

  const handleConfirmServiceCall = () => {
    setServiceModalStep("loading");
    window.setTimeout(() => {
      setServiceModalStep("success");
    }, SERVICE_LOADING_MS);
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
          <WelcomeInfoCard useDevPreview={useDevPreview} tableName={tableName} />
          <WelcomeActionButtons
            onGoToMenu={handleGoToMenu}
            onCallWaiter={() => handleOpenServiceModal("waiter")}
            onRequestBill={() => handleOpenServiceModal("bill")}
            isLeavingToMenu={isLeavingToMenu}
          />
        </div>
      </main>
      <WelcomeServiceModal
        isOpen={Boolean(activeServiceModal)}
        modalType={activeServiceModal}
        step={serviceModalStep}
        tableName={tableName}
        onClose={handleCloseServiceModal}
        onConfirm={handleConfirmServiceCall}
      />
    </div>
  );
};

export default WelcomePage;
