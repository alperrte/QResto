import { useEffect, useState } from "react";
import { Bell, CalendarDays, Moon, Sun } from "lucide-react";

function KitchenHeader() {
    const [isDark, setIsDark] = useState(false);

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

    return (
        <header className="sticky top-0 z-40 flex h-[92px] items-center justify-between border-b border-[var(--qresto-border-strong)] bg-[var(--qresto-surface)] px-7 shadow-[0_1px_10px_rgba(15,23,42,0.06)] transition-colors duration-300">
            <div>
                <h1 className="text-3xl font-bold text-[var(--qresto-text)]">
                    Mutfak Paneli
                </h1>

                <p className="mt-1 text-sm text-[var(--qresto-muted)]">
                    Siparişleri hazırlayın, stokları yönetin.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] transition-all duration-200 hover:-translate-y-[2px] hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="flex items-center gap-2 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 py-3 text-sm font-medium text-[var(--qresto-text)]">
                    <CalendarDays size={18} className="text-[var(--qresto-muted)]" />
                    {currentDate}
                </div>

                <button
                    type="button"
                    className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] transition-all duration-200 hover:-translate-y-[2px] hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                >
                    <Bell size={20} className="text-[var(--qresto-text)]" />
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                </button>
            </div>
        </header>
    );
}

export default KitchenHeader;