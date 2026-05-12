type WelcomeActionButtonsProps = {
  onGoToMenu: () => void;
  onCallWaiter: () => void;
  onOpenPayMenu: () => void;
  isLeavingToMenu: boolean;
};

const WelcomeActionButtons = ({
  onGoToMenu,
  onCallWaiter,
  onOpenPayMenu,
  isLeavingToMenu,
}: WelcomeActionButtonsProps) => {
  return (
    <div className="welcome-actions-stagger grid grid-cols-2 gap-stack-sm">
      <button
        type="button"
        onClick={onGoToMenu}
        disabled={isLeavingToMenu}
        className="col-span-2 welcome-cta welcome-cta-gradient welcome-primary-action rounded-xl p-6 flex items-center justify-between shadow-md active:scale-[0.98] group"
      >
        <div className="flex flex-col text-left gap-1">
          <span className="font-headline text-headline-md">Menüyü Gör</span>
          <span className="font-sans text-body-sm text-on-primary/80">Lezzetleri keşfet</span>
        </div>
        <div className="bg-on-primary/20 p-3 rounded-full group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-3xl">restaurant_menu</span>
        </div>
      </button>

      <button
        type="button"
        onClick={onCallWaiter}
        className="welcome-secondary-action rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm border transition-colors active:scale-[0.98]"
      >
        <span className="material-symbols-outlined text-primary text-3xl">room_service</span>
        <span className="font-bold text-label-bold">Garson Çağır</span>
      </button>

      <button
        type="button"
        onClick={onOpenPayMenu}
        className="welcome-secondary-action rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm border transition-colors active:scale-[0.98]"
      >
        <span className="material-symbols-outlined text-primary text-3xl">payments</span>
        <span className="font-bold text-label-bold">Öde</span>
      </button>
    </div>
  );
};

export default WelcomeActionButtons;
