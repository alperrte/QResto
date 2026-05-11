import { ClipboardList, QrCode, TrendingUp, Users } from "lucide-react";

function DashboardPage() {
    const summaryCards = [
        { title: "Bugünkü Sipariş", value: "184", Icon: ClipboardList },
        { title: "Aktif Masa", value: "27", Icon: QrCode },
        { title: "Anlık Yoğunluk", value: "%68", Icon: Users },
        { title: "Günlük Ciro", value: "₺42.360", Icon: TrendingUp },
    ];

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
                <h2 className="text-3xl font-black text-[var(--qresto-text)]">
                    QResto Yönetim Dashboard
                </h2>
                <p className="mt-2 text-sm font-medium text-[var(--qresto-muted)]">
                    Operasyon, masa akışı ve satış performansını tek ekrandan takip edin.
                </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                    <article
                        key={card.title}
                        className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_8px_22px_rgba(15,23,42,0.07)] transition-transform duration-200 hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                                {card.title}
                            </p>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                <card.Icon size={20} />
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-black text-[var(--qresto-text)]">{card.value}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5">
                    <h3 className="text-lg font-black text-[var(--qresto-text)]">Operasyon Durumu</h3>
                    <p className="mt-2 text-sm text-[var(--qresto-muted)]">
                        QR sistemi açık, servis akışı stabil ve ortalama hazırlık süresi 14 dakika.
                    </p>
                </article>
                <article className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5">
                    <h3 className="text-lg font-black text-[var(--qresto-text)]">Aksiyon Önerisi</h3>
                    <p className="mt-2 text-sm text-[var(--qresto-muted)]">
                        Yoğun saat için mutfak vardiya dağılımını artırarak teslim sürelerini düşürebilirsiniz.
                    </p>
                </article>
            </section>
        </div>
    );
}

export default DashboardPage;