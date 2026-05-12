import HeaderIconButton from "../../../components/ui/HeaderIconButton";

type WelcomeInfoCardProps = {
  useDevPreview: boolean;
  tableName: string | null;
  sessionOrdersListCount: number;
  sessionOrdersAttentionCount: number;
  sessionOrdersFetched: boolean;
  onOpenOrders: () => void;
};

const WelcomeInfoCard = ({
  useDevPreview,
  tableName,
  sessionOrdersListCount,
  sessionOrdersAttentionCount,
  sessionOrdersFetched,
  onOpenOrders,
}: WelcomeInfoCardProps) => {
  const showOrdersCta = sessionOrdersFetched && sessionOrdersListCount > 0;
  const showAttention = sessionOrdersAttentionCount > 0;
  const badge =
    sessionOrdersAttentionCount > 99 ? "99+" : sessionOrdersAttentionCount;

  const ordersLabel = showAttention
    ? `Siparişlerim, ${sessionOrdersAttentionCount} devam eden sipariş`
    : `Siparişlerim, ${sessionOrdersListCount} kayıt`;

  return (
    <div className="welcome-card welcome-card-rise welcome-glass-panel rounded-xl p-6 text-center shadow-lg">
      {useDevPreview ? (
        <p className="welcome-preview-badge text-xs font-medium rounded-lg py-2 px-3 mb-4">
          Geliştirici önizleme - QR oturumu yok; yalnızca{" "}
          <code className="text-[11px]">npm run dev</code> ortamında
        </p>
      ) : null}

      <h2 className="font-headline text-display-lg text-on-surface mb-2">Hoş Geldiniz</h2>
      <p className="text-body-sm text-on-surface-variant mb-4">
        Bu menü üzerinden sipariş verebilir, ödeme yapabilir ve masanıza özel
        işlemleri hızlıca yönetebilirsiniz.
      </p>
      <div className="inline-flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 welcome-info-box px-4 py-2 rounded-full border">
          <span
            className="material-symbols-outlined welcome-accent text-xl"
            data-weight="fill"
          >
            table_restaurant
          </span>
          <span className="font-bold text-label-bold text-on-surface">Masa: {tableName ?? "-"}</span>
        </div>
        {showOrdersCta ? (
          <div
            className={`flex justify-center${showAttention ? " welcome-orders-nudge" : ""}`}
          >
            <div className="welcome-orders-inline-shell">
              <HeaderIconButton
                icon="receipt_long"
                label={ordersLabel}
                onClick={onOpenOrders}
                badge={showAttention ? badge : undefined}
                className="text-primary transition-opacity hover:opacity-90 active:scale-95 flex h-11 w-11 items-center justify-center rounded-full"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default WelcomeInfoCard;
