"use client"

import { Category, getCategory } from "@/actions/categories";
import { getProduct, Product } from "@/actions/products";
import { getReviewByProduct, Review } from "@/actions/reviews";
import { averageReviews } from "@/shared/utils/AverageReviews";
import { declineReviews } from "@/shared/utils/DeclineReviews";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react"
import { IoIosArrowForward } from "react-icons/io";

const CACHE_DURATION = 10 * 60 * 1000; // 10 минут

const TopBlockProduct = () => {
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [category, setCategory] = useState<Category | null>(null);
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const product_id = params.id as string;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const now = Date.now();
            const cachedProduct = localStorage.getItem(`cachedProduct${product_id}`);
            const cacheTimestamp = localStorage.getItem(`productCacheTimestamp${product_id}`);
            
            // Параллельная загрузка отзывов и проверка кэша
            const [reviewsData] = await Promise.allSettled([
                getReviewByProduct(Number(product_id))
            ]);

            setReviews(reviewsData.status === 'fulfilled' ? reviewsData.value : null);

            // Проверяем есть ли актуальный кэш товара
            if (cachedProduct && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
                const cachedProductData = JSON.parse(cachedProduct);
                setProduct(cachedProductData);
                
                // Загружаем категорию для кэшированного товара
                const categoryData = await getCategory(Number(cachedProductData.category_id));
                setCategory(categoryData);
                setLoading(false);
                return;
            }

            // Если кэша нет или он устарел, загружаем все данные
            const [productData] = await Promise.allSettled([
                getProduct(Number(product_id))
            ]);

            if (productData.status === 'fulfilled' && productData.value) {
                const freshProduct = productData.value;
                setProduct(freshProduct);
                localStorage.setItem(`cachedProduct${product_id}`, JSON.stringify(freshProduct));
                localStorage.setItem(`productCacheTimestamp${product_id}`, now.toString());
                
                // Загружаем категорию для нового товара
                const categoryData = await getCategory(Number(freshProduct.category_id));
                setCategory(categoryData);
            } else {
                throw new Error('Не удалось загрузить товар');
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
            console.error('Ошибка загрузки данных:', err);
        } finally {
            setLoading(false);
        }
    }, [product_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (!product && !loading) {
        return (
            <h1 className="text-black mt-[20px] text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] leading-[1.2] font-black">
                Не найден товар
            </h1>
        );
    }

    const renderSkeleton = (width: string) => (
        <div 
            className="h-[15px] rounded-[5px] animate-pulse bg-gray-200" 
            style={{ width }}
        />
    );

    return (
        <nav className="flex gap-[12px] items-center mt-[20px] flex-wrap" aria-label="Хлебные крошки">
            {/* Рейтинг товара */}
            <div className="flex gap-[6px] items-center text-[var(--green-text-color)] text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)]">
                {loading ? (
                    <div className="w-[34px] h-[25px] rounded-[5px] animate-pulse bg-gray-200"></div>
                ) : (
                    <div 
                        className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] px-[6px] py-[1px] rounded-[5px] flex justify-center items-center text-white bg-[var(--green-text-color)]"
                        aria-label={`Рейтинг товара: ${averageReviews(reviews)} из 5`}
                    >
                        {averageReviews(reviews)}
                    </div>
                )}
                {loading ? renderSkeleton("80px") : (
                    <span aria-label={`Количество отзывов: ${reviews?.length} ${declineReviews(reviews?.length)}`}>
                        {reviews?.length} {declineReviews(reviews?.length)} клиентов
                    </span>
                )}
            </div>
            
            {/* Хлебные крошки */}
            <div className="flex items-end text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] text-[var(--grey-text-color)]">
                {loading ? (
                    renderSkeleton("80px")
                ) : (
                    <Link 
                        href="/catalog" 
                        className="leading-[1] hover:text-[var(--orange-hover-color)] transition-colors"
                        aria-label="Перейти в каталог"
                    >
                        Каталог
                    </Link>
                )}
                <IoIosArrowForward size={12} aria-hidden="true" />
                
                {loading ? (
                    renderSkeleton("80px")
                ) : (
                    <Link 
                        href={`/catalog/${category?.slug}`} 
                        className="leading-[1] hover:text-[var(--orange-hover-color)] transition-colors"
                        aria-label={`Перейти в категорию: ${category?.name}`}
                    >
                        {category?.name}
                    </Link>
                )}
                <IoIosArrowForward size={12} aria-hidden="true" />
                
                {loading ? (
                    renderSkeleton("80px")
                ) : (
                    <span 
                        className="leading-[1] text-[var(--grey-text-color)]"
                        aria-current="page"
                    >
                        {product?.name}
                    </span>
                )}
            </div>
        </nav>
    );
};

export default TopBlockProduct;