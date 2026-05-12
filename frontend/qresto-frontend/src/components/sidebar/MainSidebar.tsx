import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, QrCode, LogOut, UtensilsCrossed, ChevronDown } from "lucide-react";

import { useAuth } from "../../auth/AuthContext";
import { getRoleHomePath } from "../../auth/routeGuards";

import lightLogo from "../../assets/qresto_logo_light.png";
import darkLogo from "../../assets/qresto_logo_dark.png";

function MainSidebar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [menuDropdownOpen, setMenuDropdownOpen] = useState(true);
    const { user, logout } = useAuth();
    const location = useLocation();
    const isMenuProductsSection =
        location.pathname.startsWith("/app/admin/menu-products") ||
        location.pathname.startsWith("/app/admin/menu-categories");

    useEffect(() => {
        const checkTheme = () => {
            const htmlHasDark = document.documentElement.classList.contains("dark");
            const bodyHasDark = document.body.classList.contains("dark");
            const dataTheme = document.documentElement.getAttribute("data-theme");

            setIsDarkMode(htmlHasDark || bodyHasDark || dataTheme === "dark");
        };

        checkTheme();

        const observer = new MutationObserver(checkTheme);

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    if (!user) {
        return null;
    }

    const sidebarLogo = isDarkMode ? darkLogo : lightLogo;

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-[2px] ${
            isActive
                ? "bg-[var(--qresto-primary)] text-white shadow-lg shadow-orange-200/70"
                : "text-[var(--qresto-muted)] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] hover:shadow-lg hover:shadow-orange-200/20"
        }`;

    return (
        <aside className="sticky left-0 top-0 flex h-screen w-[250px] shrink-0 flex-col bg-[var(--qresto-sidebar)]">
            <div className="flex h-[92px] w-[250px] shrink-0 items-center justify-center overflow-hidden border-b border-[var(--qresto-border-strong)] bg-[var(--qresto-sidebar)]">
                <img
                    src={sidebarLogo}
                    alt="QResto Logo"
                    className="block h-[84px] w-[238px] object-contain object-center"
                    draggable="false"
                />
            </div>

            <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
                <NavLink to={getRoleHomePath(user.role)} className={navLinkClass}>
                    <LayoutDashboard size={19} />
                    Kontrol Paneli
                </NavLink>

                {user.role === "ADMIN" ? (
                    <>
                        <button
                            type="button"
                            onClick={() => setMenuDropdownOpen((prev) => !prev)}
                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                                isMenuProductsSection
                                    ? "border border-[var(--qresto-primary)]/30 bg-[var(--qresto-hover)] text-[var(--qresto-primary)] shadow-sm"
                                    : "text-[var(--qresto-muted)] hover:-translate-y-[2px] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] hover:shadow-lg hover:shadow-orange-200/20"
                            }`}
                        >
                            <span className="flex items-center gap-3">
                                <UtensilsCrossed size={19} />
                                Menü & Ürün
                            </span>
                            <ChevronDown
                                size={16}
                                className={`shrink-0 transition-transform ${
                                    menuDropdownOpen ? "rotate-180" : ""
                                } ${isMenuProductsSection ? "text-[var(--qresto-primary)]" : "text-[var(--qresto-muted)]"}`}
                            />
                        </button>

                        {menuDropdownOpen ? (
                            <div className="ml-4 flex flex-col gap-1">
                                <NavLink
                                    to="/app/admin/menu-products"
                                    end
                                    className={({ isActive }) =>
                                        `rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                                            isActive
                                                ? "bg-[var(--qresto-primary)] text-white shadow-md shadow-orange-200/50"
                                                : "text-[var(--qresto-muted)] hover:-translate-y-[2px] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] hover:shadow-md hover:shadow-orange-200/20"
                                        }`
                                    }
                                >
                                    Genel Menü
                                </NavLink>
                                <NavLink
                                    to="/app/admin/menu-categories"
                                    className={({ isActive }) =>
                                        `rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                                            isActive
                                                ? "bg-[var(--qresto-primary)] text-white shadow-md shadow-orange-200/50"
                                                : "text-[var(--qresto-muted)] hover:-translate-y-[2px] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] hover:shadow-md hover:shadow-orange-200/20"
                                        }`
                                    }
                                >
                                    Kategoriler
                                </NavLink>
                                <NavLink
                                    to="/app/admin/menu-products/create"
                                    className={({ isActive }) =>
                                        `rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                                            isActive
                                                ? "bg-[var(--qresto-primary)] text-white shadow-md shadow-orange-200/50"
                                                : "text-[var(--qresto-muted)] hover:-translate-y-[2px] hover:bg-[var(--qresto-hover)] hover:text-[var(--qresto-primary)] hover:shadow-md hover:shadow-orange-200/20"
                                        }`
                                    }
                                >
                                    Ürün Ekle
                                </NavLink>
                            </div>
                        ) : null}

                        <NavLink
                            to="/app/tables-qr"
                            onClick={() => {
                                window.dispatchEvent(new Event("qresto-qr-page-reset"));
                            }}
                            className={navLinkClass}
                        >
                            <QrCode size={19} />
                            Masalar & QR Kodlar
                        </NavLink>
                    </>
                ) : null}
            </nav>

            <div className="border-t border-[var(--qresto-border)] p-4">
                <button
                    type="button"
                    onClick={() => {
                        void logout();
                    }}
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