import { useEffect, useState } from "react";
import { Bell, ChevronDown, Moon, Sun } from "lucide-react";

import {
    activateQrCode,
    activateTable,
    deactivateQrCode,
    deactivateTable,
    getTables,
} from "../../services/qrService";

function PanelHeader() {
    const [isDark, setIsDark] = useState(false);
    const [qrSystemOpen, setQrSystemOpen] = useState(true);
    const [systemDropdownOpen, setSystemDropdownOpen] = useState(false);
    const [systemLoading, setSystemLoading] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingQrStatus, setPendingQrStatus] = useState<boolean | null>(null);

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

        loadQrSystemStatus();
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

    const loadQrSystemStatus = async () => {
        try {
            const tables = await getTables();

            if (tables.length === 0) {
                setQrSystemOpen(true);
                return;
            }

            const hasActiveTable = tables.some((table) => table.active);
            setQrSystemOpen(hasActiveTable);
        } catch (error) {
            console.error(error);
        }
    };

    const openQrSystemConfirm = (open: boolean) => {
        setPendingQrStatus(open);
        setSystemDropdownOpen(false);
        setConfirmModalOpen(true);
    };

    const changeQrSystemStatus = async (open: boolean) => {
        setSystemLoading(true);

        try {
            const tables = await getTables();

            await Promise.all(
                tables.map(async (table) => {
                    if (open) {
                        await activateTable(table.id);
                        await activateQrCode(table.id);
                    } else {
                        await deactivateTable(table.id);
                        await deactivateQrCode(table.id);
                    }
                })
            );

            setQrSystemOpen(open);
            setSystemDropdownOpen(false);
            setConfirmModalOpen(false);
            setPendingQrStatus(null);

            window.dispatchEvent(new Event("qresto-tables-updated"));
        } catch (error) {
            console.error(error);
            alert("QR sistemi durumu güncellenemedi.");
        } finally {
            setSystemLoading(false);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 flex h-[92px] items-center justify-between border-b border-[var(--qresto-border-strong)] bg-[var(--qresto-surface)] px-7 shadow-[0_1px_10px_rgba(15,23,42,0.06)] transition-colors duration-300">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--qresto-text)]">
                        Yönetim Paneli
                    </h1>

                    <p className="mt-1 text-sm text-[var(--qresto-muted)]">
                        Restoranınızı kolayca ve hızla yönetin.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] transition-all duration-200 hover:-translate-y-[2px] hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]">
                        <Bell size={20} className="text-[var(--qresto-text)]" />
                        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                    </button>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] transition-all duration-200 hover:-translate-y-[2px] hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="flex items-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 py-3 text-sm font-medium text-[var(--qresto-text)]">
                        {currentDate}
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setSystemDropdownOpen((prev) => !prev)}
                            disabled={systemLoading}
                            className="flex items-center gap-3 rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 py-3 text-sm font-semibold text-[var(--qresto-text)] transition-all duration-200 hover:-translate-y-[2px] hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)] disabled:opacity-60"
                        >
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                    qrSystemOpen ? "bg-emerald-500" : "bg-red-500"
                                }`}
                            />

                            {systemLoading
                                ? "Güncelleniyor..."
                                : qrSystemOpen
                                    ? "QR Sistemi Açık"
                                    : "QR Sistemi Kapalı"}

                            <ChevronDown size={16} />
                        </button>

                        {systemDropdownOpen && (
                            <div className="absolute right-0 top-14 z-50 w-52 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-2 shadow-xl">
                                <button
                                    type="button"
                                    onClick={() => openQrSystemConfirm(true)}
                                    className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-emerald-600 hover:bg-[var(--qresto-hover)]"
                                >
                                    QR Sistemini Aç
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openQrSystemConfirm(false)}
                                    className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-[var(--qresto-hover)]"
                                >
                                    QR Sistemini Kapat
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {confirmModalOpen && pendingQrStatus !== null && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-7 shadow-2xl">
                        <h2 className="text-2xl font-black text-[var(--qresto-text)]">
                            {pendingQrStatus
                                ? "QR sistemi açılsın mı?"
                                : "QR sistemi kapatılsın mı?"}
                        </h2>

                        <p className="mt-3 text-[var(--qresto-muted)]">
                            {pendingQrStatus
                                ? "QR sistemi açıldığında masalara ait QR kodlar tekrar kullanılabilir hale gelir."
                                : "QR sistemi kapatıldığında müşteriler QR okutsa bile masa oturumu başlatamaz ve sipariş akışına geçemez."}
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setConfirmModalOpen(false);
                                    setPendingQrStatus(null);
                                }}
                                className="flex-1 rounded-2xl bg-[var(--qresto-bg)] py-3 font-bold text-[var(--qresto-text)]"
                            >
                                Vazgeç
                            </button>

                            <button
                                type="button"
                                disabled={systemLoading}
                                onClick={() => changeQrSystemStatus(pendingQrStatus)}
                                className="flex-1 rounded-2xl bg-[var(--qresto-primary)] py-3 font-bold text-white disabled:opacity-60"
                            >
                                {systemLoading ? "Güncelleniyor..." : "Onayla"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PanelHeader;