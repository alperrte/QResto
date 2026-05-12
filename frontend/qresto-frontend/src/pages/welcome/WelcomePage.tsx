import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import HeaderIconButton from "../../components/ui/HeaderIconButton";
import OrderPaymentRatingModal from "../../components/rating/OrderPaymentRatingModal";
import OrderRatingModal from "../../components/rating/OrderRatingModal";
import WelcomeActionButtons from "./components/WelcomeActionButtons";
import WelcomeInfoCard from "./components/WelcomeInfoCard";
import WelcomePayChoiceModal from "./components/WelcomePayChoiceModal";
import WelcomeServiceModal, {
  type ServiceModalStep,
  type ServiceModalType,
} from "./components/WelcomeServiceModal";
import { createTableCall } from "../../services/waiterService";
import { getOrdersByTableSession } from "../../services/orderService";
import { getRatingSettings } from "../../services/ratingService";
import { isOrderRatingFlowEnabled } from "../../components/rating/orderRatingFlowGate";
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

const pickOrderForOnlinePay = (orders: OrderResponse[]): OrderResponse | null => {
  const eligible = orders.filter((o) => o.status !== "PAID" && o.status !== "CANCELLED");
  if (eligible.length === 0) return null;
  return [...eligible].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
};

const pickOrderForRatingOnly = (orders: OrderResponse[]): OrderResponse | null => {
  const unpaid = pickOrderForOnlinePay(orders);
  if (unpaid) return unpaid;
  const nonCancelled = orders.filter((o) => o.status !== "CANCELLED");
  if (nonCancelled.length === 0) return null;
  return [...nonCancelled].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
};

/** Hesap talebinden sonra: önce ödenmemiş sipariş, yoksa değerlendirme için son sipariş. */
const fetchOrderForRatingOnly = async (): Promise<OrderResponse | null> => {
  const sessionId = readTableSessionId();
  if (!sessionId) return null;
  const list = await getOrdersByTableSession(sessionId);
  return pickOrderForRatingOnly(list);
};

/** Oturumdaki ödenmemiş en yeni siparişi bulur; online ödeme modalı için. */
const fetchOrderForPaymentRating = async (): Promise<OrderResponse | null> => {
  const sessionId = readTableSessionId();
  if (!sessionId) return null;
  const list = await getOrdersByTableSession(sessionId);
  return pickOrderForOnlinePay(list);
};

const WelcomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLeavingToMenu, setIsLeavingToMenu] = useState(false);
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceModalType | null>(null);
  const [serviceModalStep, setServiceModalStep] = useState<ServiceModalStep>("confirm");
  const [serviceModalError, setServiceModalError] = useState<string | null>(null);
  const [payChoiceOpen, setPayChoiceOpen] = useState(false);
  const [onlinePayLoading, setOnlinePayLoading] = useState(false);
  const [payChoiceError, setPayChoiceError] = useState<string | null>(null);
  const [paymentRatingOrder, setPaymentRatingOrder] = useState<OrderResponse | null>(null);
  const [ratingOnlyOrder, setRatingOnlyOrder] = useState<OrderResponse | null>(null);
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
    const closedType = activeServiceModal;
    const closedStep = serviceModalStep;
    setActiveServiceModal(null);
    setServiceModalStep("confirm");
    setServiceModalError(null);
    /* Hesap talebi onayı tamamlandıktan sonra değerlendirme (ödeme) modalı */
    if (closedType === "bill" && closedStep === "success") {
      void (async () => {
        try {
          const [settings, order] = await Promise.all([
            getRatingSettings(),
            fetchOrderForRatingOnly(),
          ]);
          if (!isOrderRatingFlowEnabled(settings)) return;
          if (order) setRatingOnlyOrder(order);
        } catch (e) {
          console.error(e);
        }
      })();
    }
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
    if (!readTableSessionId()) {
      setPayChoiceError("Oturum bulunamadı. QR kodu tekrar okutun.");
      return;
    }
    setOnlinePayLoading(true);
    setPayChoiceError(null);
    try {
      const order = await fetchOrderForPaymentRating();
      if (!order) {
        setPayChoiceError(
          "Ödenecek sipariş bulunamadı. Önce menüden sipariş verin veya Siparişlerim sayfasından kontrol edin."
        );
        return;
      }
      setPayChoiceOpen(false);
      setPaymentRatingOrder(order);
    } catch (e) {
      console.error(e);
      setPayChoiceError("Siparişler yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setOnlinePayLoading(false);
    }
  };

  const handleCloseRatingOnlyModal = () => {
    setRatingOnlyOrder(null);
  };

  const handleClosePaymentRatingModal = () => {
    setPaymentRatingOrder(null);
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
      <div className="app-surface-page route-enter-from-left min-h-screen">
        <AppHeader
          className="sticky top-0 z-40 shadow-sm"
          rightAction={
            <HeaderIconButton
              icon="receipt_long"
              label="Siparişlerim"
              onClick={() => navigate("/orders")}
              className="text-primary hover:opacity-80 transition-opacity active:scale-95 flex h-10 w-10 items-center justify-center rounded-full"
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
        <img
          alt="Restoran ortamı"
          className="welcome-hero-photo absolute inset-0 z-0 h-full w-full object-cover"
          src={HERO_IMAGE_URL}
          decoding="async"
          fetchPriority="high"
        />
        <div className="welcome-hero-overlay absolute inset-0 z-10 pointer-events-none" />
      </div>

      <AppHeader
        className="welcome-topbar welcome-topbar-reveal sticky top-0 z-50 shadow-sm"
        titleClassName="tracking-tight"
        rightAction={
          <HeaderIconButton
            icon="receipt_long"
            label="Siparişlerim"
            onClick={() => navigate("/orders")}
            className="text-primary hover:opacity-80 transition-opacity active:scale-95 flex h-10 w-10 items-center justify-center rounded-full"
          />
        }
      />

      <main className="flex-grow z-20 flex flex-col justify-center items-center px-container-margin py-10 md:py-16 max-w-4xl mx-auto w-full">
        <div className="w-full max-w-lg flex flex-col gap-stack-md">
          <WelcomeInfoCard useDevPreview={useDevPreview} tableName={tableName} />
          <WelcomeActionButtons
            onGoToMenu={handleGoToMenu}
            onCallWaiter={() => handleOpenServiceModal("waiter")}
            onOpenPayMenu={handleOpenPayChoice}
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
      <WelcomePayChoiceModal
        isOpen={payChoiceOpen}
        tableName={tableName}
        loadingOnline={onlinePayLoading}
        errorMessage={payChoiceError}
        onClose={handleClosePayChoice}
        onSelectOnlinePay={() => void handlePayChoiceOnlinePay()}
        onSelectBillRequest={handlePayChoiceBillRequest}
      />
      {paymentRatingOrder ? (
        <OrderPaymentRatingModal order={paymentRatingOrder} onClose={handleClosePaymentRatingModal} />
      ) : null}
      {ratingOnlyOrder ? (
        <OrderRatingModal order={ratingOnlyOrder} onClose={handleCloseRatingOnlyModal} />
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
