import {
    forwardRef,
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type AdminInfoSpeechBubbleHandle = {
    close: () => void;
};

export type AdminInfoSpeechBubbleProps = {
    /** Tetikleyici (mavi i) için erişilebilir ad */
    ariaLabel: string;
    children: ReactNode;
    /** Satır / hücre tıklamasına karışmasın (ürün tablosu vb.) */
    stopPointerBubbling?: boolean;
    /** Balon kuyruğu ikona göre sağ veya sol */
    tail?: "right" | "left";
    /** `sm`: sıkı satırlar, `md`: sihirbaz başlığı yanı */
    triggerSize?: "sm" | "md";
};

const triggerSizeClass: Record<NonNullable<AdminInfoSpeechBubbleProps["triggerSize"]>, string> = {
    sm: "h-6 w-6 [&>span]:text-[15px]",
    md: "h-7 w-7 [&>span]:text-[18px]",
};

/**
 * Mavi bilgi (i) düğmesi + tıklanınca açılan sohbet balonu. Dışarı tıklama ve Esc ile kapanır.
 */
const AdminInfoSpeechBubble = forwardRef<AdminInfoSpeechBubbleHandle, AdminInfoSpeechBubbleProps>(
    function AdminInfoSpeechBubble(
        { ariaLabel, children, stopPointerBubbling = true, tail = "right", triggerSize = "md" },
        ref,
    ) {
    const [open, setOpen] = useState(false);
    const [panelStyle, setPanelStyle] = useState<CSSProperties>({ visibility: "hidden" });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const reactId = useId();
    const safeId = reactId.replace(/:/g, "");

    useImperativeHandle(ref, () => ({ close: () => setOpen(false) }), []);

    useEffect(() => {
        if (!open) {
            setPanelStyle({ visibility: "hidden" });
        }
    }, [open]);

    useLayoutEffect(() => {
        if (!open) return;
        const updatePosition = () => {
            const r = triggerRef.current?.getBoundingClientRect();
            if (!r) return;
            const gap = 10;
            if (tail === "right") {
                setPanelStyle({
                    position: "fixed",
                    top: r.bottom + gap,
                    left: r.right,
                    transform: "translateX(-100%)",
                    width: "min(calc(100vw - 2rem), 18.5rem)",
                    zIndex: 10050,
                    visibility: "visible",
                });
            } else {
                setPanelStyle({
                    position: "fixed",
                    top: r.bottom + gap,
                    left: r.left,
                    width: "min(calc(100vw - 2rem), 18.5rem)",
                    zIndex: 10050,
                    visibility: "visible",
                });
            }
        };
        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open, tail]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (triggerRef.current?.contains(target)) return;
            if (panelRef.current?.contains(target)) return;
            setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown, true);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown, true);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const panelId = `admin-info-bubble-panel-${safeId}`;
    const triggerId = `admin-info-bubble-tr-${safeId}`;
    const tailRight = tail === "right";

    return (
        <div className="relative inline-flex shrink-0 align-middle">
            <button
                ref={triggerRef}
                type="button"
                id={triggerId}
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={ariaLabel}
                onClick={(event) => {
                    if (stopPointerBubbling) event.stopPropagation();
                    setOpen((prev) => !prev);
                }}
                className={`inline-flex flex-shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 shadow-sm transition-colors hover:bg-blue-100 hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${triggerSizeClass[triggerSize]}`}
            >
                <span className="material-symbols-outlined leading-none" aria-hidden>
                    info
                </span>
            </button>

            {open
                ? createPortal(
                      <div
                          ref={panelRef}
                          id={panelId}
                          role="tooltip"
                          style={panelStyle}
                          className="pointer-events-auto"
                      >
                          <div className="relative rounded-2xl border border-blue-200/90 bg-white px-4 py-3.5 text-neutral-800 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.08)]">
                              <div
                                  className={`absolute -top-[7px] h-3 w-3 rotate-45 border-l border-t border-blue-200 bg-white ${
                                      tailRight ? "right-4" : "left-4"
                                  }`}
                                  aria-hidden
                              />
                              <div className="relative z-[1] text-body-sm leading-relaxed text-neutral-800 [&_p]:m-0 [&_p]:text-neutral-800">
                                  {children}
                              </div>
                          </div>
                      </div>,
                      document.body,
                  )
                : null}
        </div>
    );
    }
);

export default AdminInfoSpeechBubble;
