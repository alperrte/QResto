export type ServiceModalType = "waiter" | "bill";
export type ServiceModalStep = "confirm" | "loading" | "success";

type WelcomeServiceModalProps = {
  isOpen: boolean;
  modalType: ServiceModalType | null;
  step: ServiceModalStep;
  tableName: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

const WelcomeServiceModal = ({
  isOpen,
  modalType,
  step,
  tableName,
  onClose,
  onConfirm,
}: WelcomeServiceModalProps) => {
  if (!isOpen || !modalType) return null;

  const isWaiter = modalType === "waiter";
  const isLoading = step === "loading";
  const isSuccess = step === "success";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Onay penceresini kapat"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
        disabled={isLoading}
      />
      <div
        className={`relative z-10 w-full max-w-sm rounded-xl p-6 shadow-xl transition-colors ${
          isSuccess ? "bg-green-50 border border-green-200" : "bg-white"
        }`}
      >
        {step === "confirm" ? (
          <>
            <h3 className="text-lg font-bold text-on-surface mb-2">
              {isWaiter ? "Garson yakında geliyor" : "Hesap yakında masanıza geliyor"}
            </h3>
            <p className="text-sm text-on-surface-variant mb-2">
              Masa: <span className="font-semibold">{tableName ?? "-"}</span>
            </p>
            <p className="text-sm text-on-surface-variant mb-5">
              {isWaiter
                ? "Bu masa için garson çağrısı başlatılsın mı? Onaylıyor musunuz?"
                : "Bu masa için hesap talebi gönderilsin mi? Onaylıyor musunuz?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border text-on-surface hover:bg-slate-100 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity"
              >
                Onayla
              </button>
            </div>
          </>
        ) : null}

        {step === "loading" ? (
          <div className="flex flex-col items-center text-center py-4">
            <span className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
            <h3 className="text-lg font-bold text-on-surface mb-2">
              {isWaiter ? "Garson çağrınız gönderiliyor" : "Hesap talebiniz gönderiliyor"}
            </h3>
            <p className="text-sm text-on-surface-variant">
              {isWaiter
                ? "Lütfen bekleyin, masanız için çağrı iletiliyor..."
                : "Lütfen bekleyin, hesap talebiniz kasaya iletiliyor..."}
            </p>
          </div>
        ) : null}

        {step === "success" ? (
          <div className="flex flex-col items-center text-center py-2">
            <span className="material-symbols-outlined text-green-600 text-5xl mb-3">
              check_circle
            </span>
            <h3 className="text-lg font-bold text-green-700 mb-2">
              {isWaiter ? "Çağrı Onaylandı" : "Hesap Talebi Onaylandı"}
            </h3>
            <p className="text-sm text-green-800 mb-5">
              {isWaiter
                ? "Garson en yakında sizinle olacaktır. Ekip size yönlendiriliyor."
                : "Hesabınız en kısa sürede masanıza yönlendiriliyor."}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Tamam
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default WelcomeServiceModal;
