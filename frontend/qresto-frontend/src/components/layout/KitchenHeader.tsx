import { useEffect, useState } from "react";
import { CalendarDays, ChefHat, ChevronDown, Moon, Sun } from "lucide-react";

function KitchenHeader() {
    const [isDark, setIsDark] = useState(false);
    const [kitchenOpen, setKitchenOpen] = useState(true);
    const [kitchenDropdownOpen, setKitchenDropdownOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingKitchenStatus, setPendingKitchenStatus] = useState<boolean | null>(null);

    const currentDate = new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem("qresto-theme");

        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        } else {
            document.documentElement.classList.remove("dark");
            setIsDark(false);
        }

        const savedKitchenStatus = localStorage.getItem("qresto-kitchen-open");
        setKitchenOpen(savedKitchenStatus !== "false");
    }, []);

    const toggleTheme = () => {
        const nextTheme = !isDark;
        setIsDark(nextTheme);

        if (nextTheme) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("qresto-theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("qresto-theme", "light");
        }
    };

    const openKitchenConfirm = (open: boolean) => {
        setPendingKitchenStatus(open);
        setKitchenDropdownOpen(false);
        setConfirmModalOpen(true);
    };

    const changeKitchenStatus = (open: boolean) => {
        setKitchenOpen(open);
        localStorage.setItem("qresto-kitchen-open", String(open));
        setConfirmModalOpen(false);
        setPendingKitchenStatus(null);
    };

    return (
        <>
            <header className="sticky top-0 z-40 flex min-h-[96px] items-center justify-between gap-5 border-b border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-7 shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition-colors duration-300">
                <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-500/15 bg-orange-500/10 text-[var(--qresto-primary)] shadow-[0_10px_24px_rgba(249,115,22,0.12)]">
                        <ChefHat size={28} />
                    </span>

                    <div className="min-w-0">
                        <h1 className="truncate text-2xl font-black text-[var(--qresto-text)] md:text-3xl">
                            Mutfak Paneli
                        </h1>

                        <p className="mt-1 truncate text-sm font-medium text-[var(--qresto-muted)]">
                            Siparişleri hazırlayın, süreçleri yönetin.
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                        aria-label="Temayı değiştir"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="hidden h-12 items-center gap-2 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 text-sm font-black text-[var(--qresto-text)] shadow-sm sm:flex">
                        <CalendarDays size={18} className="text-[var(--qresto-muted)]" />
                        {currentDate}
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setKitchenDropdownOpen((prev) => !prev)}
                            className={`flex h-12 items-center gap-3 rounded-xl border px-4 text-sm font-black shadow-sm transition-all duration-200 hover:-translate-y-[1px] ${
                                kitchenOpen
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                    : "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300"
                            }`}
                        >
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                    kitchenOpen ? "bg-emerald-500" : "bg-red-500"
                                }`}
                            />

                            {kitchenOpen ? "Mutfak Açık" : "Mutfak Kapalı"}

                            <ChevronDown size={16} />
                        </button>

                        {kitchenDropdownOpen ? (
                            <div className="absolute right-0 top-14 z-50 w-52 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-2 shadow-xl">
                                <button
                                    type="button"
                                    onClick={() => openKitchenConfirm(true)}
                                    className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-emerald-600 hover:bg-[var(--qresto-hover)]"
                                >
                                    Mutfağı Aç
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openKitchenConfirm(false)}
                                    className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-[var(--qresto-hover)]"
                                >
                                    Mutfağı Kapat
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </header>

            {confirmModalOpen && pendingKitchenStatus !== null ? (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-7 shadow-2xl">
                        <div className="flex items-start gap-3">
                            <span
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                                    pendingKitchenStatus
                                        ? "bg-emerald-500/15 text-emerald-600"
                                        : "bg-red-500/15 text-red-600"
                                }`}
                            >
                                <ChefHat size={22} />
                            </span>

                            <div>
                                <h2 className="text-2xl font-black text-[var(--qresto-text)]">
                                    {pendingKitchenStatus
                                        ? "Mutfak açılsın mı?"
                                        : "Mutfak kapatılsın mı?"}
                                </h2>

                                <p className="mt-3 text-[var(--qresto-muted)]">
                                    {pendingKitchenStatus
                                        ? "Mutfak açıldığında yeni sipariş akışı aktif olarak takip edilir."
                                        : "Mutfak kapalı durumuna alındığında ekip yeni sipariş kabul etmiyor olarak görünür."}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setConfirmModalOpen(false);
                                    setPendingKitchenStatus(null);
                                }}
                                className="flex-1 rounded-2xl bg-[var(--qresto-bg)] py-3 font-bold text-[var(--qresto-text)]"
                            >
                                Vazgeç
                            </button>

                            <button
                                type="button"
                                onClick={() => changeKitchenStatus(pendingKitchenStatus)}
                                className="flex-1 rounded-2xl bg-[var(--qresto-primary)] py-3 font-bold text-white"
                            >
                                Onayla
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}

export default KitchenHeader;
