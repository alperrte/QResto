import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Compass, Home, LogIn, Sparkles } from "lucide-react";

import brandLogo from "../../assets/qresto-brand-full-logo.png";

const WHIMSICAL_LINES = [
    "Bu tabak menüde yok — URL şefin el çantasını karıştırmış olabilir.",
    "404: Lezzet bu köşede değilmiş. Belki bir sonraki masada?",
    "Garson da aradı; bu sayfa mutfakta da yok.",
    "QR kod doğru olsa bile, bu rota haritada çizilmemiş.",
    "Tavada kızaran şey bu sayfa değilmiş. Bir üst kata çıkın.",
    "Mutfak notu: «404 — porsiyon bulunamadı».",
    "Bu link pişmemiş; biraz daha bekleyin ya da ana menüye dönün.",
];

function pickLine() {
    return WHIMSICAL_LINES[Math.floor(Math.random() * WHIMSICAL_LINES.length)];
}

export default function NotFoundPage() {
    const location = useLocation();
    const line = useMemo(pickLine, []);

    return (
        <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[var(--qresto-bg)] px-5 py-12 text-[var(--qresto-text)]">
            <style>{`
                @keyframes qresto-404-float {
                    0%, 100% { transform: translateY(0) rotate(-1deg); }
                    50% { transform: translateY(-10px) rotate(1deg); }
                }
                @keyframes qresto-404-glow {
                    0%, 100% { opacity: 0.35; transform: scale(1); }
                    50% { opacity: 0.55; transform: scale(1.08); }
                }
                .qresto-404-logo {
                    animation: qresto-404-float 5.5s ease-in-out infinite;
                }
            `}</style>

            <div
                className="pointer-events-none absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[var(--qresto-primary)] blur-[100px]"
                style={{ animation: "qresto-404-glow 8s ease-in-out infinite" }}
                aria-hidden
            />

            <div className="relative z-[1] flex w-full max-w-lg flex-col items-center text-center">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-3 py-1 text-xs font-bold text-[var(--qresto-muted)] shadow-sm">
                    <Sparkles size={14} className="text-[var(--qresto-primary)]" aria-hidden />
                    Sayfa bulunamadı
                </div>

                <div className="qresto-404-logo relative mt-2 mb-6">
                    <img
                        src={brandLogo}
                        alt="QResto"
                        className="mx-auto w-[min(280px,78vw)] drop-shadow-[0_18px_40px_rgba(255,75,22,0.18)]"
                        width={280}
                        height={200}
                        decoding="async"
                    />
                </div>

                <p
                    className="select-none font-black tracking-tighter text-transparent"
                    style={{
                        fontSize: "clamp(4.5rem, 18vw, 7.5rem)",
                        lineHeight: 0.9,
                        backgroundImage:
                            "linear-gradient(135deg, var(--qresto-primary) 0%, #c2410c 45%, var(--qresto-success) 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                    }}
                    aria-hidden
                >
                    404
                </p>

                <h1 className="mt-4 font-black tracking-tight text-2xl sm:text-3xl">
                    Lezzete giden yol burada bitiyor
                </h1>

                <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-[var(--qresto-muted)] sm:text-base">
                    {line}
                </p>

                <p
                    className="mt-4 max-w-full truncate rounded-xl border border-dashed border-[var(--qresto-border-strong)] bg-[var(--qresto-hover)] px-3 py-2 font-mono text-[11px] text-[var(--qresto-muted)] sm:text-xs"
                    title={location.pathname + (location.search || "")}
                >
                    <span className="font-sans font-bold text-[var(--qresto-text)]">Aranan rota:</span>{" "}
                    {location.pathname}
                    {location.search || ""}
                </p>

                <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                    <Link
                        to="/welcome"
                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--qresto-primary)] px-5 text-sm font-extrabold text-white shadow-[0_14px_32px_rgba(255,75,22,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(255,75,22,0.32)] active:scale-[0.98] sm:min-w-[140px] sm:flex-none"
                    >
                        <Home size={18} aria-hidden />
                        Misafir ana sayfa
                    </Link>
                    <Link
                        to="/login"
                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--qresto-border-strong)] bg-[var(--qresto-surface)] px-5 text-sm font-extrabold text-[var(--qresto-text)] transition hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)] active:scale-[0.98] sm:min-w-[140px] sm:flex-none"
                    >
                        <LogIn size={18} aria-hidden />
                        Giriş yap
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--qresto-muted)] underline-offset-4 transition hover:text-[var(--qresto-primary)] hover:underline"
                >
                    <ArrowLeft size={16} aria-hidden />
                    Bir önceki sayfaya dön
                </button>

                <p className="mt-10 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--qresto-muted)]">
                    <Compass size={14} aria-hidden />
                    Kaybolmak bazen en iyi garnitürdür.
                </p>
            </div>
        </div>
    );
}
