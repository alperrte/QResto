export type AdminTableSort = { key: string; dir: "asc" | "desc" };

type AdminSortableThProps = {
    label: string;
    columnKey: string;
    sort: AdminTableSort;
    onSort: (columnKey: string) => void;
    className?: string;
};

/**
 * Tablo başlığında ada göre sıralama: tek küçük üçgen, tıklayınca yön değişir.
 */
const AdminSortableTh = ({ label, columnKey, sort, onSort, className = "" }: AdminSortableThProps) => {
    const active = sort.key === columnKey;
    const pointUp = active && sort.dir === "asc";
    const triColor = active
        ? "text-primary"
        : "text-on-surface-variant/50 group-hover:text-on-surface-variant";

    return (
        <th
            className={`p-3 text-label-bold text-secondary select-none text-left ${className}`.trim()}
        >
            <button
                type="button"
                onClick={() => onSort(columnKey)}
                className="group inline-flex items-center gap-1 max-w-full rounded px-1 -mx-1 py-0.5 hover:text-on-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
                <span className="leading-none">{label}</span>
                <span
                    className={`inline-flex items-center justify-center shrink-0 leading-none ${triColor}`}
                    aria-hidden
                >
                    {pointUp ? (
                        <span className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-current" />
                    ) : (
                        <span className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-current" />
                    )}
                </span>
            </button>
        </th>
    );
};

export default AdminSortableTh;
