"use client"

import { BsFillPatchCheckFill } from "react-icons/bs"
import ProductButton from "../../../shared/components/product/ProductButton"
import { FaStar } from "react-icons/fa"
import Link from "next/link"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { getProduct, Product } from "@/actions/products"
import { useParams } from "next/navigation"
import { getReviewByProduct, Review } from "@/actions/reviews"
import { averageReviews } from "@/shared/utils/AverageReviews"
import { declineReviews } from "@/shared/utils/DeclineReviews"

const CACHE_DURATION = 10 * 60 * 1000; // 10 минут

const RightItem = () => {
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
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
      const [reviewsData, cachedProductData] = await Promise.allSettled([
        getReviewByProduct(Number(product_id)),
        (cachedProduct && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) 
          ? JSON.parse(cachedProduct) 
          : null
      ]);

      setReviews(reviewsData.status === 'fulfilled' ? reviewsData.value : null);

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

  // Мемоизированные значения для оптимизации рендеринга
  const averageRating = useMemo(() => averageReviews(reviews), [reviews]);
  const reviewsCount = useMemo(() => reviews?.length, [reviews]);
  const reviewsDeclension = useMemo(() => declineReviews(reviewsCount), [reviewsCount]);

  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) {
        const filterTop = filterRef.current.getBoundingClientRect().top - 45;
        setIsSticky(filterTop <= 0);
      }
    };

    handleScroll(); // Проверить начальную позицию
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Компоненты скелетонов для повторного использования
  const SkeletonLoader = ({ width, height, className = "" }: { width: string, height: string, className?: string }) => (
    <div 
      className={`animate-pulse bg-gray-200 rounded-[5px] ${className}`} 
      style={{ width, height }}
    />
  );

  const RatingStars = useMemo(() => {
    if (loading) {
      return <SkeletonLoader width="130px" height="25px" />;
    }
    
    const rating = Math.round(Number(averageRating));
    return (
      <div className="flex items-center gap-[4px]">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            <FaStar className="lg:w-[18px] lg:h-[18px] md:w-[16px] md:h-[16px] w-[14px] h-[14px]" />
          </div>
        ))}
      </div>
    );
  }, [loading, averageRating]);

  const renderDesktopContent = () => (
    <>
      {loading ? (
        <SkeletonLoader width="320px" height="40px" />
      ) : (
        <div className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black leading-[1.2]">
          от {product?.price} ₽ за час
        </div>
      )}
      
      <div className="flex flex-col gap-[6px]">
        <p className="text-[length:var(--size-mobile-small-text)] md:text-[length:var(--size-md-small-text)] lg:text-[length:var(--size-lg-small-text)] text-[var(--grey-text-color)] font-semibold flex items-center gap-[6px]">
          <BsFillPatchCheckFill size={18} color="#00AAFF" />Наличный / Безналичный расчет
        </p>
        <p className="text-[length:var(--size-mobile-small-text)] md:text-[length:var(--size-md-small-text)] lg:text-[length:var(--size-lg-small-text)] text-[var(--grey-text-color)] font-semibold flex items-center gap-[6px]">
          <BsFillPatchCheckFill size={18} color="#00AAFF" />НДС / Без НДС
        </p>
      </div>
      
      <ProductButton />
      
      <div className="felx flex-col gap-[6px]">
        <p className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] font-black">СТП-ГРУПП</p>
        <p className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] text-[var(--grey-text-color)] font-semibold">Аренда Спецтехники</p>
        <div className="flex gap-[12px] items-center relative z-5">
          {loading ? (
            <SkeletonLoader width="34px" height="25px" />
          ) : (
            <p className="lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] font-black">
              {averageRating}
            </p>
          )}
          
          {RatingStars}
          
          {loading ? (
            <SkeletonLoader width="100px" height="25px" />
          ) : (
            <Link 
              href="#reviews" 
              className="lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] text-[var(--blue-color)] hover:underline"
            >
              {reviewsCount} {reviewsDeclension}
            </Link>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-[6px]">
        <Link href="/catalog" aria-label="Перейти к каталогу всех кранов">
          <div className="w-full cursor-pointer flex justify-center lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] items-center text-white h-[35px] bg-[var(--grey-text-color)] rounded-[6px] hover:bg-[var(--grey-text-color-dark)] transition-colors">
            Все краны
          </div>
        </Link>
        <Link href="/catalog" aria-label="Перейти к каталогу всей техники и услуг">
          <div className="w-full cursor-pointer flex justify-center lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] items-center text-white h-[35px] bg-[var(--grey-text-color)] rounded-[6px] hover:bg-[var(--grey-text-color-dark)] transition-colors">
            Вся техника и услуги
          </div>
        </Link>
      </div>
    </>
  );

  const renderMobileContent = () => (
    <>
      {loading ? (
        <SkeletonLoader width="320px" height="25px" />
      ) : (
        <div className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black leading-[1.2]">
          от {product?.price} ₽ за час
        </div>
      )}
      <ProductButton />
    </>
  );

  const stickyClass = isSticky 
    ? 'fixed top-[45px] z-5 ml-[-12px] h-[45px] px-[12px]' 
    : 'sticky top-0';
  
  const mobileStickyClass = isSticky 
    ? 'fixed bottom-[0px] ml-[-12px] pt-[6px] w-dvw px-[12px] bg-[white] z-9 h-[75px]' 
    : 'sticky top-0';

  if (!loading && !product) {
    return null;
  }

  return (
    <aside className="h-fit" ref={filterRef} aria-label="Информация о товаре и действиях">
      {/* Desktop version */}
      <div className={`md:flex hidden flex-col gap-[20px] mt-[12px] ${stickyClass}`}>
        {renderDesktopContent()}
      </div>
      
      {/* Mobile version */}
      <div className={`md:hidden flex flex-col gap-[6px] mt-[12px] w-[calc(100dvw_-_24px)] ${mobileStickyClass}`}>
        {renderMobileContent()}
      </div>
    </aside>
  );
};

export default RightItem;