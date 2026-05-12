import { MessageSquareText, PackageCheck, Star, TrendingUp } from "lucide-react";

function ProductRatingsPage() {
    const products = [
        {
            id: 1,
            name: "Mercimek Çorbası",
            averageRating: 5,
            totalRatingCount: 1,
            totalCommentCount: 1,
            lastComment: "Mercimek çorbası çok iyiydi.",
        },
    ];

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
                <h2 className="text-3xl font-black text-[var(--qresto-text)]">
                    Ürün Değerlendirmeleri
                </h2>

                <p className="mt-2 text-sm font-medium text-[var(--qresto-muted)]">
                    Menü ürünlerinin puanlarını, yorumlarını ve müşteri geri bildirimlerini analiz edin.
                </p>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                            Ortalama Ürün Puanı
                        </p>
                        <Star className="text-[var(--qresto-primary)]" size={20} />
                    </div>
                    <p className="mt-4 text-3xl font-black text-[var(--qresto-text)]">
                        5.0
                    </p>
                </article>

                <article className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                            Değerlendirilen Ürün
                        </p>
                        <PackageCheck className="text-[var(--qresto-primary)]" size={20} />
                    </div>
                    <p className="mt-4 text-3xl font-black text-[var(--qresto-text)]">
                        1
                    </p>
                </article>

                <article className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                            Toplam Yorum
                        </p>
                        <MessageSquareText className="text-[var(--qresto-primary)]" size={20} />
                    </div>
                    <p className="mt-4 text-3xl font-black text-[var(--qresto-text)]">
                        1
                    </p>
                </article>
            </section>

            <section className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-[var(--qresto-text)]">
                            Ürün Bazlı Analiz
                        </h3>

                        <p className="mt-1 text-sm text-[var(--qresto-muted)]">
                            Ürünlerin puan ve yorum performansı.
                        </p>
                    </div>

                    <TrendingUp className="text-[var(--qresto-primary)]" size={22} />
                </div>

                <div className="mt-4 space-y-3">
                    {products.map((product) => (
                        <article
                            key={product.id}
                            className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h4 className="text-lg font-black text-[var(--qresto-text)]">
                                        {product.name}
                                    </h4>

                                    <p className="mt-1 text-sm text-[var(--qresto-muted)]">
                                        Son yorum: {product.lastComment}
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="rounded-xl bg-[var(--qresto-surface)] px-4 py-3">
                                        <p className="text-xs font-bold text-[var(--qresto-muted)]">
                                            Ortalama
                                        </p>
                                        <p className="mt-1 font-black text-[var(--qresto-primary)]">
                                            {product.averageRating}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-[var(--qresto-surface)] px-4 py-3">
                                        <p className="text-xs font-bold text-[var(--qresto-muted)]">
                                            Puan
                                        </p>
                                        <p className="mt-1 font-black text-[var(--qresto-text)]">
                                            {product.totalRatingCount}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-[var(--qresto-surface)] px-4 py-3">
                                        <p className="text-xs font-bold text-[var(--qresto-muted)]">
                                            Yorum
                                        </p>
                                        <p className="mt-1 font-black text-[var(--qresto-text)]">
                                            {product.totalCommentCount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default ProductRatingsPage;