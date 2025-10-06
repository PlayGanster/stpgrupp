"use client"

import Button from "@/shared/ui/button/Button";
import { useEffect, useState, useCallback, memo, useRef } from "react";
import { FaStar } from "react-icons/fa";
import FeedbackPopup from "./FeedbackPopup";
import { useParams } from "next/navigation";
import { getReviewByProduct, getReviews, Review } from "@/actions/reviews";
import { getProductsList, Product } from "@/actions/products";
import { averageReviews } from "@/shared/utils/AverageReviews";
import { declineReviews } from "@/shared/utils/DeclineReviews";
import Link from "next/link";
import { useCity } from '@/hooks/useCity';
import Image from "next/image";
import { API_BASE_URL } from "@/constant/api-url";

interface FeedbackListType {
    view: number | "all";
    name?: boolean;
}

const StarRating = memo(({ rating, size = 20 }: { rating: number; size?: number }) => (
    <div className="flex" aria-label={`Рейтинг: ${rating.toFixed(1)} из 5 звезд`} role="img">
        {[...Array(5)].map((_, i) => (
            <div 
                key={i}
                className={`${size === 14 ? 'w-[14px] h-[14px]' : 'w-5 h-5'} ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                aria-hidden="true"
            >
                <FaStar size={size} />
            </div>
        ))}
    </div>
));
StarRating.displayName = "StarRating";

const ReviewItem = memo(({ review, products, getHrefWithCity }: { 
    review: Review; 
    products?: Product[];
    getHrefWithCity: (href: string) => string;
}) => {
    const productName = products?.find(product => product.id === review.product_id)?.name;

    return (
        <li className="flex flex-col gap-[6px] min-h-[120px] flex-shrink-0" tabIndex={0} aria-label={`Отзыв от ${review.customer_name}, рейтинг ${review.rating} звезд`}>
            <div className="flex items-center gap-[6px]">
                <div className="bg-gray-400 text-white flex uppercase justify-center items-center rounded-full overflow-hidden min-w-[35px] h-[35px] relative" aria-hidden="true">
                    {review.images === "" ? review.customer_name[0] : null}
                    {
                        review.images ? (
                            <Image src={`${API_BASE_URL}/uploads/reviews/${review.images}`} alt={String(review.id)} fill className="object-cover" />
                        ) : ""
                    }
                </div>
                <div className="flex flex-col">
                    <p className="text-[12px] font-semibold">{review.customer_name}</p>
                    <p className="text-[11px] text-gray-600">{review.date} - Клиент</p>
                </div>
            </div>
            <div className="flex gap-[6px] text-[12px] text-gray-600 items-center">
                <StarRating rating={review.rating} size={14} />
                <span> - Сделка состоялась</span>
            </div>
            {productName && (
                <Link href={getHrefWithCity(`/catalog/product/${review.product_id}`)}>
                    <p className="text-[12px] font-semibold text-gray-600 mt-[-6px] underline focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {productName}
                    </p>
                </Link>
            )}
            <p className="text-[14px] font-semibold">{review.description}</p>
        </li>
    );
});
ReviewItem.displayName = "ReviewItem";

const LoadingSkeleton = memo(() => (
    <div className="flex gap-[12px] items-center relative z-5" role="status" aria-live="polite" aria-busy="true">
        <div className="w-[34px] h-[25px] rounded-[5px] animate-pulse bg-gray-200"></div>
        <div className="w-[130px] h-[25px] rounded-[5px] animate-pulse bg-gray-200"></div>
        <div className="w-[100px] h-[25px] rounded-[5px] animate-pulse bg-gray-200"></div>
        <span className="sr-only">Загрузка отзывов...</span>
    </div>
));
LoadingSkeleton.displayName = "LoadingSkeleton";

const ViewAllButton = memo(({ onClick }: { onClick: () => void }) => (
    <div className="absolute flex justify-center items-start w-full h-[73px] left-0 
                    bg-gradient-to-t from-white to-320% bottom-0 to-transparent from-650% shadow-[0px_-10px_20px_30px_rgba(255,255,255,0.95)] z-10">
        <div className="md:flex hidden">
            <Button 
              name="Смотреть все" 
              weight="bold" 
              size="large" 
              height={45} 
              onClick={onClick} 
              color="gray" 
              aria-label="Показать все отзывы"
            />
        </div>
        <div className="md:hidden flex">
            <Button 
              name="Смотреть все" 
              weight="bold" 
              size="small" 
              height={35} 
              onClick={onClick} 
              color="gray" 
              aria-label="Показать все отзывы"
            />
        </div>
    </div>
));
ViewAllButton.displayName = "ViewAllButton";

const FeedbackList: React.FC<FeedbackListType> = memo(({ view, name=true }) => {
    const [openAll, setOpenAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const params = useParams();
    const product_id = params.id as string;
    const { slug, isCityVersion } = useCity();

    // Функция для формирования ссылки с учетом города
    const getHrefWithCity = useCallback((href: string) => {
        if (isCityVersion) {
            return `/${slug}${href}`;
        }
        return href;
    }, [isCityVersion, slug]);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const now = Date.now();
            const cacheDuration = 10 * 60 * 1000;

            // ВСЕГДА загружаем все отзывы, независимо от того, на странице товара мы или нет
            const cachedDataReviews = localStorage.getItem(`cachedReviews`);
            const cacheTimestampReviews = localStorage.getItem(`reviewsCacheTimestamp`);
            
            if (cachedDataReviews && cacheTimestampReviews && 
                (now - parseInt(cacheTimestampReviews)) < cacheDuration) {
                const reviewsData = JSON.parse(cachedDataReviews);
                setReviews(reviewsData);
            } else {
                const reviewsData: Review[] | null = await getReviews();
                setReviews(reviewsData);
                localStorage.setItem(`cachedReviews`, JSON.stringify(reviewsData));
                localStorage.setItem(`reviewsCacheTimestamp` , now.toString());
            }

            const cachedData = localStorage.getItem(`cachedProducts`);
            const cacheTimestamp = localStorage.getItem(`productsCacheTimestamp`);
            
            if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheDuration) {
                setProducts(JSON.parse(cachedData));
            } else {
                const data: Product[] | null = await getProductsList();
                setProducts(data);
                localStorage.setItem(`cachedProducts`, JSON.stringify(data));
                localStorage.setItem(`productsCacheTimestamp`, now.toString());
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
            console.error('Ошибка загрузки товара:', err);
        } finally {
            setLoading(false);
        }
    }, []); // Убрана зависимость от product_id

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const handleOpenAll = useCallback(() => setOpenAll(true), []);

    const shouldShowViewAllButton = useCallback(() => {
        if (view === "all") return false;
        if (!reviews || reviews.length === 0 || reviews.length < 4) return false;
        return true;
    }, [view, reviews]);

    const renderReviews = useCallback(() => {
        if (!reviews || reviews.length === 0) {
            return (
                <p className="lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] font-black" role="status" aria-live="polite">
                    Нет отзывов
                </p>
            );
        }

        if (view === "all" || reviews.length < 4) {
            return (
                <ul className="flex flex-col gap-[16px]" aria-label="Список отзывов">
                    {reviews.map((review, index) => (
                        <ReviewItem 
                            key={review.id || index} 
                            review={review} 
                            products={products || undefined}
                            getHrefWithCity={getHrefWithCity}
                        />
                    ))}
                </ul>
            );
        }

        // Для бесконечной анимации - дублируем контент и используем CSS анимацию
        const duplicatedReviews = [...reviews, ...reviews];
        const animationDuration = 15; // Фиксированная длительность 8 секунд

        return (
            <div className="overflow-hidden h-[400px] relative">
                <div 
                    ref={containerRef}
                    className="flex flex-col gap-[16px] animate-scroll-reviews"
                    style={{ 
                        animation: `scrollReviews ${animationDuration}s linear infinite` 
                    }}
                >
                    {duplicatedReviews.map((review, index) => (
                        <ReviewItem 
                            key={`${review.id}-${index}`} 
                            review={review} 
                            products={products || undefined}
                            getHrefWithCity={getHrefWithCity}
                        />
                    ))}
                </div>
                
                <style jsx>{`
                    @keyframes scrollReviews {
                        0% {
                            transform: translateY(0);
                        }
                        100% {
                            transform: translateY(-50%);
                        }
                    }
                    .animate-scroll-reviews {
                        animation: scrollReviews ${animationDuration}s linear infinite;
                    }
                `}</style>
            </div>
        );
    }, [reviews, view, products, getHrefWithCity]);

    const containerHeightClass = !reviews || reviews.length === 0 || location.pathname.includes("catalog") ? "h-auto" : "lg:h-[485px] md:h-[460px]";

    return (
        <section 
            aria-labelledby="feedback-list-heading" 
            className={`relative ${containerHeightClass}`}
        >
            {
                name ? (
                    <h2 id="feedback-list-heading" className="font-black text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] mb-3">
                        Отзывы клиентов
                    </h2>
                ) : null
            }

            {openAll && <FeedbackPopup setOpen={setOpenAll} />}
            
            {loading ? (
                <LoadingSkeleton />
            ) : error ? (
                <p role="alert" className="text-red-600">{error}</p>
            ) : (
                <>
                    <div className="flex gap-[12px] items-center relative z-5 mb-4" aria-label="Средний рейтинг и количество отзывов">
                        <p className="font-black text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)]">
                            {averageReviews(reviews)}
                        </p>
                        <StarRating rating={Number(averageReviews(reviews))} />
                        <p className="text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] text-[var(--blue-color)]">
                            {reviews?.length} {declineReviews(reviews?.length)}
                        </p>
                    </div>

                    <div className="relative">
                        {renderReviews()}
                    </div>
                    
                    {shouldShowViewAllButton() && <ViewAllButton onClick={handleOpenAll} />}
                </>
            )}
        </section>
    );
});

FeedbackList.displayName = "FeedbackList";

export default FeedbackList;