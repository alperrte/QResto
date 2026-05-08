import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    QrCode,
    LogOut,
} from "lucide-react";

import qrestoLogo from "../../assets/qresto_logo2.png";

function MainSidebar() {
    return (
        <aside className="sticky left-0 top-0 flex h-screen w-[250px] shrink-0 flex-col bg-[var(--qresto-sidebar)]">
            <div className="flex h-[92px] w-full items-center justify-center overflow-hidden border-b border-[var(--qresto-border-strong)] bg-[var(--qresto-sidebar)]">
                <img
                    src={qrestoLogo}
                    alt="QResto Logo"
                    className="h-[120px] w-[280px] object-cover object-center"
                />
            </div>

            <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
                <NavLink
                    to="/app/dashboard"
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-[2px] ${
                            isActive
                                ? "bg-[var(--qresto-primary)] text-white shadow-lg shadow-orange-200/70"
                                : "text-[var(--qresto-muted)] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] hover:shadow-lg hover:shadow-orange-200/20"
                        }`
                    }
                >
                    <LayoutDashboard size={19} />
                    Kontrol Paneli
                </NavLink>

                <NavLink
                    to="/app/tables-qr"
                    onClick={() => {
                        window.dispatchEvent(new Event("qresto-qr-page-reset"));
                    }}
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-[2px] ${
                            isActive
                                ? "bg-[var(--qresto-primary)] text-white shadow-lg shadow-orange-200/70"
                                : "text-[var(--qresto-muted)] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] hover:shadow-lg hover:shadow-orange-200/20"
                        }`
                    }
                >
                    <QrCode size={19} />
                    Masalar & QR Kodlar
                </NavLink>
            </nav>

            <div className="border-t border-[var(--qresto-border)] p-4">
                <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-red-200 transition-all duration-200 hover:-translate-y-[2px] hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-300 active:translate-y-0"
                >
                    <LogOut size={19} />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}

export default MainSidebar;