import {
    CalendarDays,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ImageOff,
    MessageSquareText,
    MoreHorizontal,
    Package2,
    RotateCcw,
    Star,
    TrendingUp,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { ProductRatingResponse } from "../../types/ratingTypes";
import { getRecentProductRatings } from "../../services/ratingService";
import {
    getMenuProductById,
    type MenuProductInfo,
} from "../../services/menuProductService";

type SortOption =
    | "rating-desc"
    | "rating-asc"
    | "count-desc"
    | "comments-desc"
    | "name-asc";

type ProductAnalyticsItem = {
    productId: number;
    productName: string;
    productDescription: string;
    imageUrl: string | null;
    averageRating: number;
    totalRatings: number;
    totalComments: number;
    latestComment: ProductRatingResponse | null;
    latestDate: string | null;
    ratings: ProductRatingResponse[];
    distribution: Record<number, number>;
    productInfo: MenuProductInfo | null;
};

type SelectedComment = {
    productName: string;
    comment: ProductRatingResponse;
};

function ProductRatingsPage() {
    const [ratings, setRatings] = useState<ProductRatingResponse[]>([]);
    const [productInfoMap, setProductInfoMap] = useState<
        Record<number, MenuProductInfo | null>
    >({});
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>("rating-desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProduct, setSelectedProduct] =
        useState<ProductAnalyticsItem | null>(null);
    const [selectedComment, setSelectedComment] =
        useState<SelectedComment | null>(null);
    const [dateModalOpen, setDateModalOpen] = useState(false);

    const toInputDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [startDate, setStartDate] = useState(toInputDate(firstDayOfMonth));
    const [endDate, setEndDate] = useState(toInputDate(lastDayOfMonth));
    const [draftStartDate, setDraftStartDate] = useState(toInputDate(firstDayOfMonth));
    const [draftEndDate, setDraftEndDate] = useState(toInputDate(lastDayOfMonth));

    const itemsPerPage = 6;

    useEffect(() => {
        const loadRatings = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                const response = await getRecentProductRatings();
                setRatings(response);

                const uniqueProductIds = Array.from(
                    new Set(response.map((rating) => rating.productId))
                );

                const productInfoEntries = await Promise.all(
                    uniqueProductIds.map(async (productId) => {
                        const productInfo = await getMenuProductById(productId);
                        return [productId, productInfo] as const;
                    })
                );

                setProductInfoMap(Object.fromEntries(productInfoEntries));
            } catch (error) {
                console.error("Ürün değerlendirmeleri alınırken hata oluştu:", error);
                setErrorMessage("Ürün değerlendirmeleri alınamadı.");
            } finally {
                setLoading(false);
            }
        };

        void loadRatings();
    }, []);

    const parseBackendDate = (value: string) => {
        const hasTimezone = value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value);
        return new Date(hasTimezone ? value : `${value}Z`);
    };

    const formatTurkeyDate = (value?: string | null) => {
        if (!value) return "-";

        return new Intl.DateTimeFormat("tr-TR", {
            timeZone: "Europe/Istanbul",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(parseBackendDate(value));
    };

    const formatTurkeyDateTime = (value?: string | null) => {
        if (!value) return "-";

        return new Intl.DateTimeFormat("tr-TR", {
            timeZone: "Europe/Istanbul",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(parseBackendDate(value));
    };

    const formatDateInputForLabel = (value: string) => {
        return new Intl.DateTimeFormat("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(new Date(`${value}T00:00:00`));
    };

    const getDateRangeLabel = () => {
        return `${formatDateInputForLabel(startDate)} - ${formatDateInputForLabel(endDate)}`;
    };

    const getProductName = (
        productInfo: MenuProductInfo | null,
        productId: number
    ) => {
        const info = productInfo as
            | (MenuProductInfo & {
            productName?: string;
            title?: string;
        })
            | null;

        return info?.name ?? info?.productName ?? info?.title ?? `Ürün ${productId}`;
    };

    const getImageUrl = (productInfo: MenuProductInfo | null) => {
        if (!productInfo) return null;

        const info = productInfo as MenuProductInfo & {
            image?: string | null;
            productImageUrl?: string | null;
        };

        const rawImage =
            info.imageUrl ??
            info.productImageUrl ??
            info.imagePath ??
            info.image ??
            null;

        if (!rawImage) return null;

        if (rawImage.startsWith("http")) {
            return rawImage;
        }

        const cleanPath = rawImage.startsWith("/") ? rawImage : `/${rawImage}`;

        return `http://localhost:7073${cleanPath}`;
    };

    const getRatingLabel = (rating: number) => {
        if (rating >= 4.5) return "Mükemmel";
        if (rating >= 3.5) return "İyi";
        if (rating >= 2.5) return "İdare eder";
        if (rating >= 1.5) return "Geliştirilmeli";
        if (rating > 0) return "Zayıf";
        return "Henüz puan yok";
    };

    const filteredRatings = useMemo(() => {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);

        return ratings.filter((rating) => {
            const createdAt = parseBackendDate(rating.createdAt);
            return createdAt >= start && createdAt <= end;
        });
    }, [ratings, startDate, endDate]);

    const groupedProducts = useMemo<ProductAnalyticsItem[]>(() => {
        const groupedMap = new Map<number, ProductRatingResponse[]>();

        filteredRatings.forEach((rating) => {
            const existing = groupedMap.get(rating.productId) ?? [];
            existing.push(rating);
            groupedMap.set(rating.productId, existing);
        });

        return Array.from(groupedMap.entries()).map(([productId, productRatings]) => {
            const productInfo = productInfoMap[productId] ?? null;
            const totalRatings = productRatings.length;
            const totalComments = productRatings.filter(
                (item) => item.comment && item.comment.trim().length > 0
            ).length;

            const totalScore = productRatings.reduce(
                (sum, item) => sum + item.rating,
                0
            );

            const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;

            const sortedByDate = [...productRatings].sort(
                (a, b) =>
                    parseBackendDate(b.createdAt).getTime() -
                    parseBackendDate(a.createdAt).getTime()
            );

            const latestComment =
                sortedByDate.find(
                    (item) => item.comment && item.comment.trim().length > 0
                ) ?? sortedByDate[0] ?? null;

            const distribution: Record<number, number> = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
            };

            productRatings.forEach((item) => {
                distribution[item.rating] = (distribution[item.rating] ?? 0) + 1;
            });

            return {
                productId,
                productName: getProductName(productInfo, productId),
                productDescription:
                    productInfo?.description ??
                    "Bu ürün için menü detay bilgisi bulunamadı.",
                imageUrl: getImageUrl(productInfo),
                averageRating,
                totalRatings,
                totalComments,
                latestComment,
                latestDate: sortedByDate[0]?.createdAt ?? null,
                ratings: sortedByDate,
                distribution,
                productInfo,
            };
        });
    }, [filteredRatings, productInfoMap]);

    const sortedProducts = useMemo(() => {
        const items = [...groupedProducts];

        switch (sortOption) {
            case "rating-desc":
                items.sort((a, b) => b.averageRating - a.averageRating);
                break;
            case "rating-asc":
                items.sort((a, b) => a.averageRating - b.averageRating);
                break;
            case "count-desc":
                items.sort((a, b) => b.totalRatings - a.totalRatings);
                break;
            case "comments-desc":
                items.sort((a, b) => b.totalComments - a.totalComments);
                break;
            case "name-asc":
                items.sort((a, b) => a.productName.localeCompare(b.productName, "tr"));
                break;
            default:
                break;
        }

        return items;
    }, [groupedProducts, sortOption]);

    const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    const currentProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedProducts.slice(start, start + itemsPerPage);
    }, [sortedProducts, currentPage]);

    const generalAverage = useMemo(() => {
        if (filteredRatings.length === 0) return 0;

        const total = filteredRatings.reduce((sum, item) => sum + item.rating, 0);
        return total / filteredRatings.length;
    }, [filteredRatings]);

    const totalComments = useMemo(() => {
        return filteredRatings.filter(
            (item) => item.comment && item.comment.trim().length > 0
        ).length;
    }, [filteredRatings]);

    const latestComments = useMemo(() => {
        return [...filteredRatings]
            .filter((item) => item.comment && item.comment.trim().length > 0)
            .sort(
                (a, b) =>
                    parseBackendDate(b.createdAt).getTime() -
                    parseBackendDate(a.createdAt).getTime()
            )
            .slice(0, 10);
    }, [filteredRatings]);

    const summaryCards = [
        {
            title: "Ortalama Ürün Puanı",
            value: generalAverage.toFixed(1),
            helper: getRatingLabel(generalAverage),
            Icon: Star,
        },
        {
            title: "Değerlendirilen Ürün",
            value: String(groupedProducts.length),
            helper: "Geri bildirim alan ürün",
            Icon: Package2,
        },
        {
            title: "Toplam Yorum",
            value: String(totalComments),
            helper: "Müşteri yorumu",
            Icon: MessageSquareText,
        },
    ];

    const renderStars = (rating: number, size = 16) => {
        return (
            <div className="flex items-center gap-0.5 text-[var(--qresto-primary)]">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={size}
                        fill={star <= Math.round(rating) ? "currentColor" : "none"}
                        className={
                            star <= Math.round(rating)
                                ? "text-[var(--qresto-primary)]"
                                : "text-[var(--qresto-border-strong)]"
                        }
                    />
                ))}
            </div>
        );
    };

    const renderProductImage = (
        imageUrl: string | null,
        productName: string,
        sizeClass = "h-16 w-16"
    ) => {
        if (!imageUrl) {
            return (
                <div
                    className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]`}
                >
                    <ImageOff size={24} />
                </div>
            );
        }

        return (
            <img
                src={imageUrl}
                alt={productName}
                className={`${sizeClass} shrink-0 rounded-2xl object-cover`}
                draggable="false"
            />
        );
    };

    const renderDistributionBar = (
        star: number,
        count: number,
        total: number
    ) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
            <div
                key={star}
                className="grid grid-cols-[34px_1fr_44px] items-center gap-3"
            >
                <div className="flex items-center gap-1 text-xs font-bold text-[var(--qresto-primary)]">
                    {star}
                    <Star size={12} fill="currentColor" />
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[var(--qresto-hover)]">
                    <div
                        className="h-full rounded-full bg-[var(--qresto-primary)] transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className="text-right text-xs font-bold text-[var(--qresto-muted)]">
                    {count}
                </div>
            </div>
        );
    };

    const applyDateFilter = () => {
        if (new Date(draftStartDate) > new Date(draftEndDate)) {
            setErrorMessage("Başlangıç tarihi bitiş tarihinden büyük olamaz.");
            return;
        }

        setStartDate(draftStartDate);
        setEndDate(draftEndDate);
        setCurrentPage(1);
        setDateModalOpen(false);
        setErrorMessage("");
    };

    const setQuickDateRange = (type: "today" | "week" | "month" | "all") => {
        const nowDate = new Date();

        if (type === "today") {
            const value = toInputDate(nowDate);
            setDraftStartDate(value);
            setDraftEndDate(value);
            return;
        }

        if (type === "week") {
            const weekStart = new Date(nowDate);
            weekStart.setDate(nowDate.getDate() - 6);

            setDraftStartDate(toInputDate(weekStart));
            setDraftEndDate(toInputDate(nowDate));
            return;
        }

        if (type === "month") {
            setDraftStartDate(toInputDate(new Date(nowDate.getFullYear(), nowDate.getMonth(), 1)));
            setDraftEndDate(toInputDate(nowDate));
            return;
        }

        if (type === "all") {
            if (ratings.length === 0) {
                setDraftStartDate(toInputDate(firstDayOfMonth));
                setDraftEndDate(toInputDate(nowDate));
                return;
            }

            const sortedDates = [...ratings].sort(
                (a, b) =>
                    parseBackendDate(a.createdAt).getTime() -
                    parseBackendDate(b.createdAt).getTime()
            );

            setDraftStartDate(toInputDate(parseBackendDate(sortedDates[0].createdAt)));
            setDraftEndDate(toInputDate(nowDate));
        }
    };

    const resetToToday = () => {
        const nowDate = new Date();
        setDraftStartDate(toInputDate(new Date(nowDate.getFullYear(), nowDate.getMonth(), 1)));
        setDraftEndDate(toInputDate(nowDate));
    };

    return (
        <div className="space-y-5">
            <section className="rounded-[26px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-7 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex items-start gap-5">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                            <Star size={30} />
                        </div>

                        <div>
                            <h2 className="text-[34px] font-black tracking-tight text-[var(--qresto-text)]">
                                Ürün Değerlendirmeleri
                            </h2>

                            <p className="mt-2 text-base font-medium text-[var(--qresto-muted)]">
                                Menü ürünlerinin puanlarını, yorumlarını ve müşteri geri bildirimlerini analiz edin.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setDraftStartDate(startDate);
                            setDraftEndDate(endDate);
                            setDateModalOpen(true);
                        }}
                        className="inline-flex items-center gap-3 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-5 py-4 text-sm font-semibold text-[var(--qresto-text)] shadow-sm transition hover:bg-[var(--qresto-hover)]"
                    >
                        <CalendarDays size={18} />
                        <span>{getDateRangeLabel()}</span>
                        <ChevronDown size={16} className="text-[var(--qresto-muted)]" />
                    </button>
                </div>
            </section>

            {errorMessage && (
                <section className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-500">
                    {errorMessage}
                </section>
            )}

            {loading ? (
                <section className="rounded-[26px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 text-sm font-semibold text-[var(--qresto-muted)] shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    Ürün değerlendirmeleri yükleniyor...
                </section>
            ) : (
                <>
                    <section className="grid gap-4 xl:grid-cols-3">
                        {summaryCards.map((card) => (
                            <article
                                key={card.title}
                                className="rounded-[24px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                        <card.Icon size={26} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                                            {card.title}
                                        </p>

                                        <p className="mt-2 text-4xl font-black leading-none text-[var(--qresto-text)]">
                                            {card.value}
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-[var(--qresto-muted)]">
                                            {card.helper}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>

                    <section className="rounded-[26px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--qresto-hover)] text-[var(--qresto-primary)]">
                                    <TrendingUp size={26} />
                                </div>

                                <div>
                                    <h3 className="text-[22px] font-black text-[var(--qresto-text)]">
                                        Ürün Bazlı Analiz
                                    </h3>

                                    <p className="mt-1 text-sm font-medium text-[var(--qresto-muted)]">
                                        Ürünlerin puan ve yorum performansı.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] px-4 py-3">
                                <p className="text-xs font-medium text-[var(--qresto-muted)]">
                                    Sıralama
                                </p>

                                <select
                                    value={sortOption}
                                    onChange={(event) => {
                                        setSortOption(event.target.value as SortOption);
                                        setCurrentPage(1);
                                    }}
                                    className="mt-1 bg-transparent text-sm font-semibold text-[var(--qresto-text)] outline-none"
                                >
                                    <option value="rating-desc">Puan yüksekten düşüğe</option>
                                    <option value="rating-asc">Puan düşükten yükseğe</option>
                                    <option value="count-desc">Değerlendirme sayısı</option>
                                    <option value="comments-desc">Yorum sayısı</option>
                                    <option value="name-asc">Ürün adı A-Z</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-5 overflow-hidden rounded-[22px] border border-[var(--qresto-border)]">
                            {currentProducts.length === 0 ? (
                                <div className="px-6 py-10 text-center text-sm font-semibold text-[var(--qresto-muted)]">
                                    Seçilen tarih aralığında ürün değerlendirmesi bulunmuyor.
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--qresto-border)]">
                                    {currentProducts.map((product) => (
                                        <div
                                            key={product.productId}
                                            className="w-full bg-[var(--qresto-surface)] px-5 py-4 transition hover:bg-[var(--qresto-hover)]"
                                        >
                                            <div className="grid gap-4 xl:grid-cols-[1.7fr_0.45fr_2fr_0.2fr] xl:items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedProduct(product)}
                                                    className="flex min-w-0 items-center gap-4 text-left"
                                                >
                                                    {renderProductImage(
                                                        product.imageUrl,
                                                        product.productName
                                                    )}

                                                    <div className="min-w-0">
                                                        <h4 className="truncate text-lg font-black text-[var(--qresto-text)]">
                                                            {product.productName}
                                                        </h4>

                                                        <p className="mt-1 line-clamp-1 text-sm font-medium text-[var(--qresto-muted)]">
                                                            {product.productDescription}
                                                        </p>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedProduct(product)}
                                                    className="text-left"
                                                >
                                                    <p className="text-2xl font-black text-[var(--qresto-text)]">
                                                        {product.averageRating.toFixed(1)}
                                                    </p>
                                                    {renderStars(product.averageRating)}
                                                </button>

                                                <div className="min-w-0">
                                                    {product.latestComment?.comment?.trim() ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedComment({
                                                                    productName: product.productName,
                                                                    comment: product.latestComment as ProductRatingResponse,
                                                                })
                                                            }
                                                            className="w-full rounded-2xl border border-transparent px-3 py-2 text-left transition hover:border-[var(--qresto-border)] hover:bg-[var(--qresto-surface)]"
                                                        >
                                                            <p className="line-clamp-1 text-sm font-semibold text-[var(--qresto-text)]">
                                                                {product.latestComment.comment}
                                                            </p>

                                                            <p className="mt-1 text-xs font-medium text-[var(--qresto-muted)]">
                                                                {product.totalRatings} değerlendirme • {product.totalComments} yorum
                                                            </p>
                                                        </button>
                                                    ) : (
                                                        <div className="px-3 py-2">
                                                            <p className="line-clamp-1 text-sm font-semibold text-[var(--qresto-text)]">
                                                                Bu ürün için henüz yazılı yorum yok.
                                                            </p>

                                                            <p className="mt-1 text-xs font-medium text-[var(--qresto-muted)]">
                                                                {product.totalRatings} değerlendirme • {product.totalComments} yorum
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedProduct(product)}
                                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-primary)] transition hover:bg-[var(--qresto-hover)]"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {sortedProducts.length > 0 && (
                            <div className="mt-5 flex items-center justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.max(1, prev - 1))
                                    }
                                    disabled={currentPage === 1}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <div className="flex h-10 min-w-[42px] items-center justify-center rounded-xl border border-[var(--qresto-primary)] bg-[var(--qresto-hover)] px-4 text-sm font-black text-[var(--qresto-primary)]">
                                    {currentPage}
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(totalPages, prev + 1)
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="rounded-[26px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                        <div className="flex items-center gap-3">
                            <MessageSquareText
                                size={22}
                                className="text-[var(--qresto-primary)]"
                            />

                            <h3 className="text-xl font-black text-[var(--qresto-text)]">
                                Son Ürün Yorumları
                            </h3>
                        </div>

                        {latestComments.length === 0 ? (
                            <div className="mt-4 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-5 text-sm font-semibold text-[var(--qresto-muted)]">
                                Seçilen tarih aralığında ürün yorumu bulunmuyor.
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {latestComments.map((comment) => {
                                    const productInfo =
                                        productInfoMap[comment.productId] ?? null;
                                    const productName = getProductName(
                                        productInfo,
                                        comment.productId
                                    );

                                    return (
                                        <button
                                            key={comment.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedComment({
                                                    productName,
                                                    comment,
                                                })
                                            }
                                            className="w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4 text-left transition hover:bg-[var(--qresto-hover)]"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-black text-[var(--qresto-text)]">
                                                            {productName}
                                                        </p>

                                                        {renderStars(comment.rating)}
                                                    </div>

                                                    <p className="mt-2 text-sm font-medium leading-6 text-[var(--qresto-muted)]">
                                                        {comment.comment}
                                                    </p>

                                                    <p className="mt-2 text-xs font-semibold text-[var(--qresto-muted)]">
                                                        Masa: {comment.tableName}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-[var(--qresto-hover)] px-3 py-1 text-sm font-black text-[var(--qresto-primary)]">
                                                    {comment.rating}/5
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}

            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[26px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-5">
                                {renderProductImage(
                                    selectedProduct.imageUrl,
                                    selectedProduct.productName,
                                    "h-28 w-28"
                                )}

                                <div>
                                    <h3 className="text-3xl font-black text-[var(--qresto-text)]">
                                        {selectedProduct.productName}
                                    </h3>

                                    <p className="mt-2 text-sm font-medium leading-6 text-[var(--qresto-muted)]">
                                        {selectedProduct.productDescription}
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center gap-4">
                                        {renderStars(selectedProduct.averageRating, 18)}

                                        <span className="rounded-full bg-[var(--qresto-hover)] px-3 py-1 text-sm font-black text-[var(--qresto-primary)]">
                                            {selectedProduct.averageRating.toFixed(1)} / 5
                                        </span>

                                        <span className="text-sm font-semibold text-[var(--qresto-muted)]">
                                            {selectedProduct.totalRatings} değerlendirme
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedProduct(null)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--qresto-border)] text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                                <p className="text-sm font-bold text-[var(--qresto-muted)]">
                                    Ortalama Puan
                                </p>

                                <p className="mt-2 text-3xl font-black text-[var(--qresto-text)]">
                                    {selectedProduct.averageRating.toFixed(1)}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                                <p className="text-sm font-bold text-[var(--qresto-muted)]">
                                    Toplam Yorum
                                </p>

                                <p className="mt-2 text-3xl font-black text-[var(--qresto-text)]">
                                    {selectedProduct.totalComments}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-4">
                                <p className="text-sm font-bold text-[var(--qresto-muted)]">
                                    Son Değerlendirme
                                </p>

                                <p className="mt-2 text-base font-black text-[var(--qresto-text)]">
                                    {selectedProduct.latestDate
                                        ? formatTurkeyDateTime(selectedProduct.latestDate)
                                        : "-"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                            <section className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-5">
                                <h4 className="text-lg font-black text-[var(--qresto-text)]">
                                    Puan Dağılımı
                                </h4>

                                <div className="mt-4 space-y-3">
                                    {[5, 4, 3, 2, 1].map((star) =>
                                        renderDistributionBar(
                                            star,
                                            selectedProduct.distribution[star] ?? 0,
                                            selectedProduct.totalRatings
                                        )
                                    )}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-5">
                                <h4 className="text-lg font-black text-[var(--qresto-text)]">
                                    Ürün Yorumları
                                </h4>

                                <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-2">
                                    {selectedProduct.ratings.length === 0 ? (
                                        <p className="text-sm font-semibold text-[var(--qresto-muted)]">
                                            Bu ürün için yorum bulunmuyor.
                                        </p>
                                    ) : (
                                        selectedProduct.ratings.map((rating) => (
                                            <article
                                                key={rating.id}
                                                className="rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-4"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    {renderStars(rating.rating)}

                                                    <span className="text-xs font-semibold text-[var(--qresto-muted)]">
                                                        {formatTurkeyDateTime(rating.createdAt)}
                                                    </span>
                                                </div>

                                                <p className="mt-3 text-sm font-medium leading-6 text-[var(--qresto-muted)]">
                                                    {rating.comment?.trim()
                                                        ? rating.comment
                                                        : "Yorum bırakılmadı."}
                                                </p>

                                                <p className="mt-2 text-xs font-semibold text-[var(--qresto-muted)]">
                                                    Masa: {rating.tableName}
                                                </p>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {selectedComment && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-xl rounded-[26px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-[var(--qresto-text)]">
                                    {selectedComment.productName}
                                </h3>

                                <p className="mt-2 text-sm font-medium text-[var(--qresto-muted)]">
                                    Ürün yorumu detayı
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedComment(null)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--qresto-border)] text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] p-5">
                            <div className="flex items-center justify-between gap-4">
                                {renderStars(selectedComment.comment.rating, 18)}

                                <span className="rounded-full bg-[var(--qresto-hover)] px-3 py-1 text-sm font-black text-[var(--qresto-primary)]">
                                    {selectedComment.comment.rating}/5
                                </span>
                            </div>

                            <p className="mt-4 text-sm font-medium leading-7 text-[var(--qresto-text)]">
                                {selectedComment.comment.comment?.trim()
                                    ? selectedComment.comment.comment
                                    : "Yorum bırakılmadı."}
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--qresto-muted)]">
                                <span className="rounded-full bg-[var(--qresto-hover)] px-3 py-1 text-[var(--qresto-primary)]">
                                    Masa: {selectedComment.comment.tableName}
                                </span>

                                <span>
                                    {formatTurkeyDateTime(selectedComment.comment.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {dateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-lg rounded-[30px] border border-[var(--qresto-border)] bg-[var(--qresto-surface)] p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-[var(--qresto-text)]">
                                    Tarih Aralığı Seç
                                </h3>

                                <p className="mt-2 text-sm font-medium text-[var(--qresto-muted)]">
                                    Ürün değerlendirmelerini seçilen tarih aralığına göre filtreleyin.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setDateModalOpen(false)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--qresto-border)] text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setQuickDateRange("today")}
                                className="rounded-2xl border border-[var(--qresto-border)] px-4 py-3 text-sm font-bold text-[var(--qresto-text)] transition hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                            >
                                Bugün
                            </button>

                            <button
                                type="button"
                                onClick={() => setQuickDateRange("week")}
                                className="rounded-2xl border border-[var(--qresto-border)] px-4 py-3 text-sm font-bold text-[var(--qresto-text)] transition hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                            >
                                Son 7 Gün
                            </button>

                            <button
                                type="button"
                                onClick={() => setQuickDateRange("month")}
                                className="rounded-2xl border border-[var(--qresto-border)] px-4 py-3 text-sm font-bold text-[var(--qresto-text)] transition hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                            >
                                Bu Ay
                            </button>

                            <button
                                type="button"
                                onClick={() => setQuickDateRange("all")}
                                className="rounded-2xl border border-[var(--qresto-border)] px-4 py-3 text-sm font-bold text-[var(--qresto-text)] transition hover:border-[var(--qresto-primary)] hover:bg-[var(--qresto-hover)]"
                            >
                                Tüm Zamanlar
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <label className="block">
                                <span className="text-sm font-bold text-[var(--qresto-text)]">
                                    Başlangıç Tarihi
                                </span>

                                <input
                                    type="date"
                                    value={draftStartDate}
                                    onChange={(event) =>
                                        setDraftStartDate(event.target.value)
                                    }
                                    className="mt-2 h-12 w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-4 text-sm font-semibold text-[var(--qresto-text)] outline-none focus:border-[var(--qresto-primary)]"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-bold text-[var(--qresto-text)]">
                                    Bitiş Tarihi
                                </span>

                                <input
                                    type="date"
                                    value={draftEndDate}
                                    onChange={(event) =>
                                        setDraftEndDate(event.target.value)
                                    }
                                    className="mt-2 h-12 w-full rounded-2xl border border-[var(--qresto-border)] bg-[var(--qresto-bg)] px-4 text-sm font-semibold text-[var(--qresto-text)] outline-none focus:border-[var(--qresto-primary)]"
                                />
                            </label>
                        </div>

                        <button
                            type="button"
                            onClick={resetToToday}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--qresto-border)] px-4 py-3 text-sm font-bold text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)]"
                        >
                            <RotateCcw size={17} />
                            Günümüze Dön
                        </button>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setDateModalOpen(false)}
                                className="h-11 rounded-full border border-[var(--qresto-border)] text-sm font-bold text-[var(--qresto-text)] transition hover:bg-[var(--qresto-hover)]"
                            >
                                Vazgeç
                            </button>

                            <button
                                type="button"
                                onClick={applyDateFilter}
                                className="flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--qresto-primary)] text-sm font-bold text-white transition hover:opacity-90"
                            >
                                <Check size={17} />
                                Uygula
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductRatingsPage;