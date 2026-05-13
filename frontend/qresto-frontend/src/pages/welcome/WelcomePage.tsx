import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import qrestoLogoDark from "../../assets/qresto_logo_dark.png";
import OrderPaymentRatingModal from "../../components/rating/OrderPaymentRatingModal";
import WelcomeActionButtons from "./components/WelcomeActionButtons";
import WelcomeInfoCard from "./components/WelcomeInfoCard";
import WelcomePayChoiceModal from "./components/WelcomePayChoiceModal";
import WelcomeServiceModal, {
  type ServiceModalStep,
  type ServiceModalType,
} from "./components/WelcomeServiceModal";
import { createTableCall } from "../../services/waiterService";
import { getOrdersByTableSession } from "../../services/orderService";
import type { OrderResponse } from "../../types/cartTypes";

import {
  DEV_PREVIEW_TABLE,
  HERO_IMAGE_URL,
  MENU_TRANSITION_MS,
  SERVICE_LOADING_MS,
} from "./constants/welcome.constants";
import "./welcomeStyles.css";
import "./welcomeAnimations.css";

const readTableSessionId = (): number | null => {
  const raw =
    sessionStorage.getItem("qresto_table_session_id") ||
    localStorage.getItem("qresto_table_session_id");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const countSessionOrdersForListButton = (orders: OrderResponse[]): number =>
  orders.filter((o) => o.status !== "CANCELLED").length;

/** Bildirim + sallanma: ödendi (PAID) ve iptal hariç */
const countSessionOrdersNeedingAttention = (orders: OrderResponse[]): number =>
  orders.filter((o) => o.status !== "CANCELLED" && o.status !== "PAID").length;

const WelcomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLeavingToMenu, setIsLeavingToMenu] = useState(false);
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceModalType | null>(null);
  const [serviceModalStep, setServiceModalStep] = useState<ServiceModalStep>("confirm");
  const [serviceModalError, setServiceModalError] = useState<string | null>(null);
  const [payChoiceOpen, setPayChoiceOpen] = useState(false);
  const onlinePayLoading = false;
  const [payChoiceError, setPayChoiceError] = useState<string | null>(null);
  const [paymentRatingTableSessionId, setPaymentRatingTableSessionId] = useState<number | null>(null);
  const [sessionOrdersListCount, setSessionOrdersListCount] = useState(0);
  const [sessionOrdersAttentionCount, setSessionOrdersAttentionCount] = useState(0);
  const [sessionOrdersFetched, setSessionOrdersFetched] = useState(false);

  let tableName =
      sessionStorage.getItem("tableName") ||
      localStorage.getItem("tableName");

  const storedTableId =
      sessionStorage.getItem("tableId") ||
      localStorage.getItem("tableId");


  const useDevPreview = import.meta.env.DEV && !storedTableId;

  if (useDevPreview) {
    tableName = DEV_PREVIEW_TABLE.tableName;
  }

  useEffect(() => {
    if (
        import.meta.env.PROD &&
        !sessionStorage.getItem("tableId") &&
        !localStorage.getItem("tableId")
    ) {
      navigate("/qr/scan", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const st = location.state as { openPayChoice?: boolean } | null;
    if (st?.openPayChoice) {
      setPayChoiceError(null);
      setPayChoiceOpen(true);
      navigate("/welcome", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const refreshSessionOrderCount = useCallback(async () => {
    const sessionId = readTableSessionId();
    if (!sessionId) {
      setSessionOrdersListCount(0);
      setSessionOrdersAttentionCount(0);
      setSessionOrdersFetched(true);
      return;
    }
    try {
      const list = await getOrdersByTableSession(sessionId);
      setSessionOrdersListCount(countSessionOrdersForListButton(list));
      setSessionOrdersAttentionCount(countSessionOrdersNeedingAttention(list));
    } catch (e) {
      console.error(e);
      setSessionOrdersListCount(0);
      setSessionOrdersAttentionCount(0);
    } finally {
      setSessionOrdersFetched(true);
    }
  }, []);

  useEffect(() => {
    void refreshSessionOrderCount();
  }, [refreshSessionOrderCount, location.key]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshSessionOrderCount();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshSessionOrderCount]);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        void refreshSessionOrderCount();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [refreshSessionOrderCount]);

  const handleGoToMenu = () => {
    if (isLeavingToMenu) return;
    setIsLeavingToMenu(true);
    window.setTimeout(() => {
      navigate("/menu");
    }, MENU_TRANSITION_MS);
  };

  const handleOpenServiceModal = (type: ServiceModalType) => {
    setServiceModalStep("confirm");
    setServiceModalError(null);
    setActiveServiceModal(type);
  };

  const handleCloseServiceModal = () => {
    if (serviceModalStep === "loading") return;

    setActiveServiceModal(null);
    setServiceModalStep("confirm");
    setServiceModalError(null);
  };

  const handleOpenPayChoice = () => {
    setPayChoiceError(null);
    setPayChoiceOpen(true);
  };

  const handleClosePayChoice = () => {
    if (onlinePayLoading) return;
    setPayChoiceOpen(false);
    setPayChoiceError(null);
  };

  const handlePayChoiceBillRequest = () => {
    if (onlinePayLoading) return;
    setPayChoiceOpen(false);
    setPayChoiceError(null);
    handleOpenServiceModal("bill");
  };

  const handlePayChoiceOnlinePay = async () => {
    const sessionId = readTableSessionId();

    if (!sessionId) {
      setPayChoiceError("Oturum bulunamadı. QR kodu tekrar okutun.");
      return;
    }

    setPayChoiceError(null);
    setPayChoiceOpen(false);
    setPaymentRatingTableSessionId(sessionId);
  };

  const handleClosePaymentRatingModal = () => {
    setPaymentRatingTableSessionId(null);
    void refreshSessionOrderCount();
    window.setTimeout(() => {
      void refreshSessionOrderCount();
    }, 500);
  };

  const handleConfirmServiceCall = async () => {
    const currentTableId =
        sessionStorage.getItem("tableId") ||
        localStorage.getItem("tableId");

    const currentTableNo =
        sessionStorage.getItem("tableNo") ||
        localStorage.getItem("tableNo");

    const currentTableName =
        sessionStorage.getItem("tableName") ||
        localStorage.getItem("tableName");

    if (!currentTableId) {
      setServiceModalError("Masa bilgisi bulunamadı. QR kodu tekrar okutun.");
      return;
    }

    const tableId = Number(currentTableId);
    const tableNumber = currentTableNo ? Number(currentTableNo) : undefined;

    if (!Number.isFinite(tableId)) {
      setServiceModalError("Masa bilgisi hatalı. QR kodu tekrar okutun.");
      return;
    }

    const callType: "WAITER_CALL" | "BILL_REQUEST" =
        activeServiceModal === "bill" ? "BILL_REQUEST" : "WAITER_CALL";

    const message =
        callType === "WAITER_CALL"
            ? "Garson çağırma talebi"
            : "Hesap isteme talebi";

    console.log("GARSON ÇAĞRI PAYLOAD:", {
      tableId,
      tableNumber,
      tableName: currentTableName,
      callType,
      message,
    });

    try {
      setServiceModalStep("loading");
      setServiceModalError(null);

      await createTableCall({
        tableId,
        tableNumber: Number.isFinite(tableNumber) ? tableNumber : undefined,
        callType,
        message,
      });

      window.setTimeout(() => {
        setServiceModalStep("success");
      }, SERVICE_LOADING_MS);
    } catch (error) {
      console.error(error);
      setServiceModalError("Çağrı gönderilemedi. Lütfen tekrar deneyin.");
      setServiceModalStep("confirm");
    }
  };

  if (
      !import.meta.env.DEV &&
      !sessionStorage.getItem("tableId") &&
      !localStorage.getItem("tableId")
  ) {
    return (
      <div className="app-surface-page route-enter-from-left relative min-h-screen">
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
        <img
          alt="Restoran ortamı"
          className="welcome-hero-photo absolute inset-0 z-0 h-full w-full object-cover"
          src={HERO_IMAGE_URL}
          decoding="async"
          fetchPriority="high"
        />
        <div className="welcome-hero-overlay absolute inset-0 z-10 pointer-events-none" />
      </div>

      <main className="z-20 mx-auto flex min-h-0 w-full max-w-4xl flex-grow flex-col items-center justify-center px-container-margin pb-10 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))] md:pb-16 md:pt-10">
        <div className="flex w-full max-w-lg flex-col items-center">
          <img
            src={qrestoLogoDark}
            alt="QResto"
            className="welcome-brand-logo welcome-topbar-reveal mx-auto mb-4 block max-w-full select-none md:mb-5"
            draggable={false}
            decoding="async"
          />
          <div className="flex w-full flex-col gap-stack-md">
            <WelcomeInfoCard
              useDevPreview={useDevPreview}
              tableName={tableName}
              sessionOrdersListCount={sessionOrdersListCount}
              sessionOrdersAttentionCount={sessionOrdersAttentionCount}
              sessionOrdersFetched={sessionOrdersFetched}
              onOpenOrders={() => navigate("/orders")}
            />
            <WelcomeActionButtons
              onGoToMenu={handleGoToMenu}
              onCallWaiter={() => handleOpenServiceModal("waiter")}
              onOpenPayMenu={handleOpenPayChoice}
              isLeavingToMenu={isLeavingToMenu}
            />
          </div>
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
      <WelcomePayChoiceModal
        isOpen={payChoiceOpen}
        tableName={tableName}
        loadingOnline={onlinePayLoading}
        errorMessage={payChoiceError}
        onClose={handleClosePayChoice}
        onSelectOnlinePay={() => void handlePayChoiceOnlinePay()}
        onSelectBillRequest={handlePayChoiceBillRequest}
      />
      {paymentRatingTableSessionId ? (
          <OrderPaymentRatingModal
              tableSessionId={paymentRatingTableSessionId}
              onClose={handleClosePaymentRatingModal}
          />
      ) : null}
      {serviceModalError ? (
        <div className="fixed bottom-4 left-1/2 z-[110] -translate-x-1/2 rounded-xl bg-red-600 px-4 py-3 text-sm text-white shadow-lg">
          {serviceModalError}
        </div>
      ) : null}
    </div>
  );
};

export default WelcomePage;
