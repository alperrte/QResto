import { Star } from "lucide-react";

type RatingPageHeroProps = {
    title: string;
    description: string;
};

function RatingPageHero({ title, description }: RatingPageHeroProps) {
    return (
        <section className="relative overflow-hidden rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-6 py-5 shadow-[0_10px_26px_rgba(15,23,42,0.07)]">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--qresto-hover)] via-transparent to-[var(--qresto-hover)] opacity-60" />

            <div className="relative z-10 flex items-center justify-between gap-5">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[var(--qresto-primary)] text-white shadow-[0_10px_24px_rgba(255,75,22,0.28)]">
                        <Star size={25} />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-[26px] font-black tracking-tight text-[var(--qresto-text)]">
                            {title}
                        </h2>

                        <p className="mt-1.5 max-w-[720px] text-sm font-medium leading-5 text-[var(--qresto-muted)]">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="pointer-events-none hidden shrink-0 items-center justify-center lg:flex">
                    <div className="relative flex h-20 w-32 items-center justify-center">
                        <div className="absolute bottom-1 h-8 w-20 rounded-full bg-[var(--qresto-primary)]/20 blur-xl" />

                        <div className="absolute right-1 top-0 text-base text-[var(--qresto-primary)] opacity-35">
                            ✦
                        </div>

                        <div className="absolute left-2 top-2 text-sm text-[var(--qresto-primary)] opacity-35">
                            ✦
                        </div>

                        <div className="relative rounded-full bg-[var(--qresto-hover)] p-2.5 shadow-[0_10px_24px_rgba(255,75,22,0.16)]">
                            <Star
                                size={46}
                                fill="currentColor"
                                className="text-[var(--qresto-primary)]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default RatingPageHero;