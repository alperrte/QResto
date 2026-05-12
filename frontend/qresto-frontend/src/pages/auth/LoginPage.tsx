import { useEffect, useRef, useState } from "react";
import type { ComponentType, CSSProperties, FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ChefHat, ShieldCheck, HandPlatter } from "lucide-react";
import axios from "axios";
import loginBg from "../../assets/QResto Login Page BG.png";
import { useAuth } from "../../auth/AuthContext";
import { getRoleHomePath } from "../../auth/routeGuards";
import type { AuthRole } from "../../auth/auth.types";

const ROLE_OPTIONS: Array<{
    role: AuthRole;
    title: string;
    subtitle: string;
    Icon: ComponentType<{ size?: number; className?: string }>;
}> = [
    {
        role: "ADMIN",
        title: "Yönetici Paneli",
        subtitle: "Tüm yönetim yetkilerine erişim",
        Icon: ShieldCheck,
    },
    {
        role: "WAITER",
        title: "Garson Paneli",
        subtitle: "Masa ve sipariş operasyonları",
        Icon: HandPlatter,
    },
    {
        role: "KITCHEN",
        title: "Mutfak Paneli",
        subtitle: "Sipariş hazırlama süreçleri",
        Icon: ChefHat,
    },
];

const getRoleName = (role: AuthRole) => {
    if (role === "ADMIN") {
        return "Yönetici";
    }

    if (role === "WAITER") {
        return "Garson";
    }

    return "Mutfak";
};

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, logout, isAuthenticated, user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState<AuthRole | null>(null);
    const [displayRole, setDisplayRole] = useState<AuthRole | null>(null);
    const [isClosingRoleForm, setIsClosingRoleForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [suspendAutoRedirect, setSuspendAutoRedirect] = useState(false);
    const closeTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (closeTimerRef.current) {
                window.clearTimeout(closeTimerRef.current);
            }
        };
    }, []);

    if (isAuthenticated && user && !suspendAutoRedirect) {
        return <Navigate to={getRoleHomePath(user.role)} replace />;
    }

    const submitLoginForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);
        setSuspendAutoRedirect(true);

        try {
            const loggedInUser = await login(email, password);

            if (!selectedRole || loggedInUser.role !== selectedRole) {
                await logout({ redirect: false });
                setErrorMessage(
                    `${getRoleName(selectedRole ?? "ADMIN")} paneline ${getRoleName(loggedInUser.role)} olarak giriş yapmaya çalışıyorsunuz. Lütfen doğru paneli seçtiğinizden emin olun.`
                );
                return;
            }

            const redirectTo =
                (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
                getRoleHomePath(loggedInUser.role);

            navigate(redirectTo, { replace: true });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const backendMessage =
                    (error.response?.data as { message?: string } | undefined)?.message || "";

                if (backendMessage.toLowerCase().includes("invalid email or password")) {
                    setErrorMessage("E-posta veya şifre hatalı.");
                } else if (backendMessage) {
                    setErrorMessage(backendMessage);
                } else {
                    setErrorMessage("Giriş sırasında sunucu hatası oluştu.");
                }
            } else {
                setErrorMessage("E-posta veya şifre hatalı.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRoleSelect = (role: AuthRole) => {
        if (closeTimerRef.current) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }

        setIsClosingRoleForm(false);
        setSelectedRole(role);
        setDisplayRole(role);
        setErrorMessage("");
    };

    const handleRoleBack = () => {
        setIsClosingRoleForm(true);
        setEmail("");
        setPassword("");
        setErrorMessage("");

        closeTimerRef.current = window.setTimeout(() => {
            setSelectedRole(null);
            setDisplayRole(null);
            setIsClosingRoleForm(false);
            closeTimerRef.current = null;
        }, 260);
    };

    const isRoleFormOpen = Boolean(selectedRole) && !isClosingRoleForm;

    return (
        <div
            className="qresto-login-stage"
            style={
                {
                    "--qresto-login-bg": `url("${loginBg}")`,
                } as CSSProperties
            }
        >
            <div className="qresto-login-shell">
                <section className="qresto-login-card">
                    <div className="qresto-login-brand">
                        <h1 className="qresto-login-title">Hoş Geldiniz</h1>
                        <p className="qresto-login-subtitle">QResto yönetim sistemine giriş yapın.</p>
                    </div>

                    <div className={`qresto-role-grid ${isRoleFormOpen ? "is-condensed" : ""}`}>
                        {ROLE_OPTIONS.map((roleOption) => {
                            const selected = selectedRole === roleOption.role;
                            const { Icon } = roleOption;

                            return (
                                <button
                                    key={roleOption.role}
                                    type="button"
                                    onClick={() => handleRoleSelect(roleOption.role)}
                                    className={`qresto-role-card ${selected ? "is-selected" : ""}`}
                                >
                                    <div className="qresto-role-icon-wrap">
                                        <Icon size={24} />
                                    </div>

                                    <div>
                                        <p className="qresto-role-title">{roleOption.title}</p>
                                        <p className="qresto-role-description">
                                            {roleOption.subtitle}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {selectedRole ? (
                        <form
                            onSubmit={submitLoginForm}
                            className={`qresto-login-form space-y-4 ${isRoleFormOpen ? "is-open" : "is-closed"}`}
                        >
                            <h1 className="text-2xl font-black tracking-tight text-[var(--qresto-text)]">
                                {ROLE_OPTIONS.find((option) => option.role === displayRole)?.title} Girişi
                            </h1>

                            <label className="block space-y-2">
                                <span className="text-sm font-semibold text-[var(--qresto-text)]">E-posta</span>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="ornek@qresto.com"
                                    required
                                    className="qresto-login-input"
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-sm font-semibold text-[var(--qresto-text)]">Şifre</span>

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="******"
                                    required
                                    className="qresto-login-input"
                                />
                            </label>

                            {errorMessage ? (
                                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                                    {errorMessage}
                                </p>
                            ) : null}

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleRoleBack}
                                    className="qresto-login-btn-secondary"
                                >
                                    Geri
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="qresto-login-btn-primary"
                                >
                                    {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
                                </button>
                            </div>
                        </form>
                    ) : null}

                    <p className="qresto-login-footer">QResto © 2026</p>
                </section>
            </div>
        </div>
    );
}

export default LoginPage;
