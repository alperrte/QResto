import { BellRing, Users } from "lucide-react";

export type WaiterTableStatus =
    | "EMPTY"
    | "OCCUPIED"
    | "ORDERED"
    | "BILL_REQUESTED"
    | "WAITER_CALLED";

interface TableStatusCardProps {
    tableName: string;
    capacity: number;
    currentGuests?: number | null;
    status: WaiterTableStatus;
}

const statusConfig: Record<
    WaiterTableStatus,
    {
        label: string;
        color: string;
        softBg?: string;
    }
> = {
    OCCUPIED: {
        label: "DOLU",
        color: "#e53e3e",
    },
    ORDERED: {
        label: "SİPARİŞ VAR",
        color: "#dd6b20",
    },
    BILL_REQUESTED: {
        label: "HESAP İSTENDİ",
        color: "#3182ce",
    },
    WAITER_CALLED: {
        label: "GARSON ÇAĞRILDI",
        color: "#805ad5",
        softBg: "rgba(128, 90, 213, 0.08)",
    },
    EMPTY: {
        label: "BOŞ",
        color: "#38a169",
    },
};

function TableStatusCard({
                             tableName,
                             capacity,
                             currentGuests,
                             status,
                         }: TableStatusCardProps) {
    const config = statusConfig[status];
    const isWaiterCalled = status === "WAITER_CALLED";
    const guestsText = currentGuests && currentGuests > 0 ? currentGuests : "-";

    return (
        <button
            type="button"
            className={`group relative min-h-[170px] overflow-hidden rounded-[24px] border bg-[var(--qresto-surface)] p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                isWaiterCalled
                    ? "border-2 shadow-purple-500/20"
                    : "border-[var(--qresto-border)]"
            }`}
            style={{
                borderColor: isWaiterCalled ? config.color : undefined,
                background: isWaiterCalled
                    ? `linear-gradient(135deg, ${config.softBg}, var(--qresto-surface))`
                    : undefined,
            }}
        >
      <span
          className={`absolute left-0 top-0 h-full ${
              isWaiterCalled ? "w-2" : "w-1"
          }`}
          style={{ backgroundColor: config.color }}
      />

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-[var(--qresto-text)]">
                        {tableName}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-[var(--qresto-muted)]">
                        {capacity} Kişilik
                    </p>
                </div>

                {isWaiterCalled ? (
                    <div
                        className="flex h-10 w-10 animate-pulse items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: config.color }}
                    >
                        <BellRing size={19} />
                    </div>
                ) : null}
            </div>

            <div className="mt-10 flex items-end justify-between gap-4">
        <span
            className="text-sm font-black tracking-wide"
            style={{ color: config.color }}
        >
          {config.label}
        </span>

                <div
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-black ${
                        status === "EMPTY" ? "opacity-50" : ""
                    }`}
                    style={{
                        color: isWaiterCalled ? config.color : "var(--qresto-muted)",
                        borderColor: isWaiterCalled ? `${config.color}55` : "transparent",
                        backgroundColor: isWaiterCalled
                            ? "var(--qresto-surface)"
                            : "var(--qresto-bg)",
                    }}
                >
                    <Users size={16} />
                    {guestsText}
                </div>
            </div>
        </button>
    );
}

export default TableStatusCard;