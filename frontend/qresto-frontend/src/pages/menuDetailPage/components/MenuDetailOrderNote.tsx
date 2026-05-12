type MenuDetailOrderNoteProps = {
    value: string;
    onChange: (value: string) => void;
    heading?: string;
    animationDelayMs?: string;
};

const MenuDetailOrderNote = ({
    value,
    onChange,
    heading = "Sipariş Notu",
    animationDelayMs = "470ms",
}: MenuDetailOrderNoteProps) => {
    return (
        <section
            className="flex flex-col gap-stack-sm mb-4 menu-detail-fade-up"
            style={{ animationDelay: animationDelayMs }}
        >
            <label htmlFor="menu-detail-order-note" className="font-headline text-headline-md text-on-surface">
                {heading}
            </label>
            <textarea
                id="menu-detail-order-note"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-body-sm placeholder:text-on-surface-variant/50 resize-none h-24"
                placeholder="Örn: Etim iyi pişmiş olsun, sosu ayrı gelsin..."
            />
        </section>
    );
};

export default MenuDetailOrderNote;
