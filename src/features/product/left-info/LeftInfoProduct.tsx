"use client"

import { getProduct, getProductSpecification, Product, Specification } from "@/actions/products"
import FeedbackList from "@/features/feedback/FeedbackList"
import ReelsList from "@/features/news/ReelsList"
import RightItem from "@/features/product/right-item/rightItem"
import ProductImages from "@/shared/components/product/ProductImages"
import Button from "@/shared/ui/button/Button"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import { IoHeartOutline, IoHeart } from "react-icons/io5"
import { isFavorite, toggleFavorite, FavoriteItem } from "@/shared/utils/favorites"
import { useCity } from "@/hooks/useCity"
import { CITY_CASES } from "@/config/cities"

const CACHE_DURATION = 10 * 60 * 1000; // 10 минут

const LeftInfoProduct = () => {
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [specifications, setSpecifications] = useState<Specification[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [favoriteState, setFavoriteState] = useState(false);
    const { slug, isCityVersion } = useCity();
    const params = useParams();
    const product_id = params.id as string;

    // Функция для переключения избранного
    const handleToggleFavorite = useCallback(() => {
        if (!product) return;

        const favoriteItem: Omit<FavoriteItem, 'addedAt'> = {
            id: Number(product.id),
            name: product.name,
            price: product.price,
            image: product.images?.[0]
        };

        const newState = toggleFavorite(favoriteItem);
        setFavoriteState(newState);
    }, [product]);

    // Проверяем, есть ли товар в избранном при загрузке
    useEffect(() => {
        if (product) {
            setFavoriteState(isFavorite(Number(product.id)));
        }
    }, [product]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const now = Date.now();
            const cachedProduct = localStorage.getItem(`cachedProduct${product_id}`);
            const cacheTimestamp = localStorage.getItem(`productCacheTimestamp${product_id}`);
            
            // Параллельная загрузка спецификаций и проверка кэша
            const [specificationData, cachedProductData] = await Promise.allSettled([
                getProductSpecification(Number(product_id)),
                (cachedProduct && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) 
                    ? JSON.parse(cachedProduct) 
                    : null
            ]);

            setSpecifications(specificationData.status === 'fulfilled' ? specificationData.value : null);

            if (cachedProductData.status === 'fulfilled' && cachedProductData.value) {
                setProduct(cachedProductData.value);
                setLoading(false);
                return;
            }

            // Если кэша нет или он устарел, загружаем продукт
            const productData = await getProduct(Number(product_id));
            
            if (productData) {
                setProduct(productData);
                localStorage.setItem(`cachedProduct${product_id}`, JSON.stringify(productData));
                localStorage.setItem(`productCacheTimestamp${product_id}`, now.toString());
            } else {
                throw new Error('Не удалось загрузить товар');
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
            console.error('Ошибка загрузки товара:', err);
        } finally {
            setLoading(false);
        }
    }, [product_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderNull = useCallback((item: any) => {
        if (!item || item.length === 0) {
            return (
                <p className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] leading-[1.2]">
                    Нет данных
                </p>
            );
        }
        return null;
    }, []);

    const SkeletonLoader = useMemo(() => ({ 
        width, height, className = "" 
    }: { 
        width?: string; height: string; className?: string 
    }) => (
        <div 
            className={`animate-pulse bg-gray-200 rounded-[5px] ${className}`} 
            style={{ width: width || '100%', height }}
        />
    ), []);

    const getCityName = useCallback(() => {
        if (!isCityVersion) return 'Вся Россия';
        const cityData = CITY_CASES[slug as keyof typeof CITY_CASES];
        return cityData ? cityData.nominative : 'Неизвестный город';
    }, [isCityVersion, slug]);

    // Мемоизированные значения для оптимизации рендеринга
    const descriptionParagraphs = useMemo(() => 
        product?.description?.split('\n').filter(paragraph => paragraph.trim()) || []
    , [product?.description]);

    if (!product && !loading) return null;

    return (
        <div className="lg:max-w-[610px] md:max-w-[500px] w-full mt-[12px]">
            {/* Заголовок товара - h1 для SEO */}
            <div className="flex gap-[20px]">
                <div className="w-full">
                    {loading ? (
                        <SkeletonLoader height="40px" />
                    ) : (
                        <h1 className="text-black text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] leading-[1.2] font-black">
                            {product?.name}
                        </h1>
                    )}
                    
                    <div className="mt-[12px] hidden items-center gap-[12px] md:flex">
                        <Button 
                            height={35} 
                            padding="normal" 
                            size="default" 
                            icon={favoriteState ? IoHeart : IoHeartOutline} 
                            name={favoriteState ? "Удалить из избранного" : "Добавить в избранное"} 
                            color={favoriteState ? "red" : "light-gray"} 
                            onClick={handleToggleFavorite}
                        />
                    </div>
                    <div className="mt-[12px] flex items-center gap-[12px] md:hidden">
                        <Button 
                            height={35} 
                            padding="normal" 
                            size="small" 
                            icon={favoriteState ? IoHeart : IoHeartOutline} 
                            name={favoriteState ? "Удалить из избранного" : "Добавить в избранное"} 
                            color={favoriteState ? "red" : "light-gray"} 
                            onClick={handleToggleFavorite}
                        />
                    </div>
                </div>
            </div>

            {/* Изображения товара с alt атрибутами */}
            {loading ? (
                <SkeletonLoader 
                    height="200px" 
                    className="mt-[12px] min-[450px]:h-[350px] lg:h-[400px]" 
                />
            ) : (
                <ProductImages imgs={product?.images} />
            )}

            <div className="md:hidden flex w-full h-[75px]">
                <RightItem />
            </div>
            {/* Расположение - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Расположение
                </h2>
                {loading ? (
                    <SkeletonLoader height="25px" />
                ) : (
                    <>
                        {getCityName()}
                    </>
                )}
            </div>

            {/* Характеристики - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Характеристики
                </h2>
                {loading ? (
                    <SkeletonLoader height="100px" />
                ) : (
                    <>
                        {renderNull(specifications)}
                        {specifications && specifications.length > 0 && (
                            <ul className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] leading-[1.2]">
                                {specifications.map((el, index) => (
                                    <li key={index} className="flex gap-[4px] mb-[6px] items-baseline">
                                        <p className="whitespace-nowrap">{el.name}:</p>
                                        <p className="text-[var(--grey-text-color)] whitespace-nowrap overflow-hidden text-ellipsis">{el.value}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>

            {/* Описание - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Описание
                </h2>
                {loading ? (
                    <SkeletonLoader height="100px" />
                ) : (
                    <>
                        {renderNull(product?.description)}
                        {descriptionParagraphs.length > 0 && (
                            <div className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] leading-[1.2]">
                                    {descriptionParagraphs.map((paragraph, index) => (
                                        <p key={index} className="mb-2">
                                            {paragraph}
                                        </p>
                                    ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Отзывы - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col" id="reviews">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Отзывы
                </h2>
                {loading ? (
                    <SkeletonLoader height="400px" className="mt-[12px]" />
                ) : (
                    <div className="w-full max-h-[485px] overflow-hidden relative">
                        <FeedbackList view={6} />
                    </div>
                )}
            </div>

            {/* Наши работы - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Наши работы
                </h2>
                <ReelsList />
            </div>

        </div>
    );
};

export default LeftInfoProduct;