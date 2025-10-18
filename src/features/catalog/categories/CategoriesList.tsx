"use client";

import Image from 'next/image'
import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Avtovishki from "@/assets/category/avtovishki.png"
import Ekskovatori from "@/assets/category/ekskovatori.png"
import Krani from "@/assets/category/krani.png"
import Manipulator from "@/assets/category/manipulator.png"
import Navesnoe from "@/assets/category/navesnoe.png"
import Prochee from "@/assets/category/prochee.png"
import Tral from "@/assets/category/tral.png"
import { API_BASE_URL } from '@/constant/api-url';
import { Category, getCategories } from '@/actions/categories';
import { useCity } from '@/hooks/useCity';
import { getReviews, Review } from '@/actions/reviews';
import { averageReviews } from '@/shared/utils/AverageReviews';
import { declineReviews } from '@/shared/utils/DeclineReviews';
import { IoIosArrowForward } from "react-icons/io";

const CACHE_KEY = 'categories_cache';
const REVIEWS_CACHE_KEY = 'reviews_cache';
const CACHE_DURATION = 30 * 60 * 1000;

interface CacheData {
  data: Category[];
  timestamp: number;
}

interface ReviewsCacheData {
  data: Review[];
  timestamp: number;
}

interface CategoriesListProps {
  initialCategories?: Category[];
}

const fallbackImages: Record<string, any> = {
  'краны': Krani,
  'автокраны': Krani,
  'автовышки': Avtovishki,
  'манипуляторы': Manipulator,
  'экскаваторы': Ekskovatori,
  'навесное': Navesnoe,
  'трал': Tral,
  'перевозки': Tral,
  'прочее': Prochee,
  'default': Prochee
};

const CategoriesList = ({ initialCategories = [] }: CategoriesListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(!initialCategories.length);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const { slug, isCityVersion } = useCity();
  const pathname = usePathname();

  // Проверяем, находимся ли на странице каталога
  const isCatalogPage = pathname?.includes('/catalog');

  const getHrefWithCity = (href: string) => {
    if (isCityVersion) {
      return `/${slug}${href}`;
    }
    return href;
  };

  // Функции для кэширования категорий
  const getCachedCategories = useCallback((): Category[] | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const cacheData: CacheData = JSON.parse(cached);
      if (Date.now() - cacheData.timestamp < CACHE_DURATION) {
        return cacheData.data;
      }
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  }, []);

  const setCacheCategories = useCallback((data: Category[]) => {
    if (typeof window === 'undefined') return;
    try {
      const cacheData: CacheData = { data, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch {}
  }, []);

  // Функции для кэширования отзывов
  const getCachedReviews = useCallback((): Review[] | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(REVIEWS_CACHE_KEY);
      if (!cached) return null;
      const cacheData: ReviewsCacheData = JSON.parse(cached);
      if (Date.now() - cacheData.timestamp < CACHE_DURATION) {
        return cacheData.data;
      }
      localStorage.removeItem(REVIEWS_CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  }, []);

  const setCacheReviews = useCallback((data: Review[]) => {
    if (typeof window === 'undefined') return;
    try {
      const cacheData: ReviewsCacheData = { data, timestamp: Date.now() };
      localStorage.setItem(REVIEWS_CACHE_KEY, JSON.stringify(cacheData));
    } catch {}
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setError(null);
      const cachedData = getCachedCategories();
      if (cachedData) {
        setCategories(cachedData);
        setCategoriesLoading(false);
        return;
      }
      const data = await getCategories();
      setCategories(data);
      setCacheCategories(data);
    } catch {
      setError('Не удалось загрузить категории');
      const cachedData = getCachedCategories();
      if (cachedData) setCategories(cachedData);
    } finally {
      setCategoriesLoading(false);
    }
  }, [getCachedCategories, setCacheCategories]);

  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const cachedData = getCachedReviews();
      if (cachedData) {
        setReviews(cachedData);
        setReviewsLoading(false);
        return;
      }
      const reviewsData: any = await getReviews();
      setReviews(reviewsData);
      setCacheReviews(reviewsData);
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [getCachedReviews, setCacheReviews]);

  useEffect(() => {
    if (initialCategories.length === 0) {
      fetchCategories();
    }
    if (isCatalogPage) {
      fetchReviews();
    }
  }, [initialCategories.length, fetchCategories, isCatalogPage, fetchReviews]);

  const checkScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
    setShowScrollButtons(hasHorizontalScroll);
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => {
      checkScrollButtons();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories, checkScrollButtons]);

  const scrollLeft = useCallback(() => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  }, []);

  const getFallbackImage = useCallback((categoryName: string) => {
    const lowerName = categoryName.toLowerCase();
    for (const [key, image] of Object.entries(fallbackImages)) {
      if (lowerName.includes(key)) {
        return image;
      }
    }
    return fallbackImages.default;
  }, []);

  const forceRefresh = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(REVIEWS_CACHE_KEY);
    }
    await fetchCategories();
    if (isCatalogPage) {
      await fetchReviews();
    }
  }, [fetchCategories, fetchReviews, isCatalogPage]);

  // Компонент для отзывов и хлебных крошек
// Компонент для отзывов и хлебных крошек
const ReviewsBreadcrumbsBlock = () => {
  // Получаем текущий путь и разбиваем его на части
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  
  // Определяем, находимся ли мы в конкретной категории
  const isInCategory = pathSegments.length > (isCityVersion ? 2 : 1) && pathSegments[isCityVersion ? 1 : 0] === 'catalog';
  
  // Получаем slug категории из URL
  const categorySlug = isInCategory 
    ? pathSegments[isCityVersion ? 2 : 1] 
    : null;
  
  // Находим название категории по slug
  const currentCategory = categorySlug 
    ? categories.find(cat => cat.slug === categorySlug)
    : null;

  return (
    <nav className="flex gap-[12px] items-center mt-[12px] flex-wrap" aria-label="Хлебные крошки">
      {/* Рейтинг всех отзывов */}
      <div className="flex gap-[6px] items-center text-[var(--green-text-color)] text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)]">
        {reviewsLoading ? (
          <div className="w-[34px] h-[25px] rounded-[5px] animate-pulse bg-gray-200"></div>
        ) : (
          <div 
            className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] px-[6px] py-[1px] rounded-[5px] flex justify-center items-center text-white bg-[var(--green-text-color)]"
            aria-label={`Общий рейтинг: ${averageReviews(reviews)} из 5`}
          >
            {averageReviews(reviews)}
          </div>
        )}
        {reviewsLoading ? (
          <div className="h-[15px] w-[120px] rounded-[5px] animate-pulse bg-gray-200" />
        ) : (
          <span aria-label={`Количество отзывов: ${reviews?.length} ${declineReviews(reviews?.length)}`}>
            {reviews?.length} {declineReviews(reviews?.length)} клиентов
          </span>
        )}
      </div>
      
      {/* Хлебные крошки */}
      <div className="flex items-center text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] text-[var(--grey-text-color)]">
        {reviewsLoading ? (
          <div className="flex items-center gap-1">
            <div className="h-[15px] w-[60px] rounded-[5px] animate-pulse bg-gray-200" />
            <IoIosArrowForward size={12} aria-hidden="true" />
            <div className="h-[15px] w-[80px] rounded-[5px] animate-pulse bg-gray-200" />
          </div>
        ) : (
          <>
            <Link 
              href={getHrefWithCity("/catalog")} 
              className="leading-[1] hover:text-[var(--orange-hover-color)] transition-colors"
              aria-label="Перейти в каталог"
            >
              Каталог
            </Link>
            
            {isInCategory && currentCategory && (
              <>
                <IoIosArrowForward size={12} aria-hidden="true" />
                <span 
                  className="leading-[1] text-[var(--grey-text-color)]"
                  aria-current="page"
                >
                  {currentCategory.name}
                </span>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

const renderSkeleton = () => (
  <section aria-label="Загрузка категорий спецтехники" className="relative">
    <h2 className="mt-5 text-lg md:text-xl lg:text-2xl font-black">Категории спецтехники</h2>
    {isCatalogPage && (
      <div className="mt-5 flex gap-[12px] items-center flex-wrap">
        <div className="flex gap-[6px] items-center">
          <div className="w-[34px] h-[25px] rounded-[5px] animate-pulse bg-gray-200"></div>
          <div className="h-[15px] w-[120px] rounded-[5px] animate-pulse bg-gray-200" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-[15px] w-[60px] rounded-[5px] animate-pulse bg-gray-200" />
          <div className="w-[12px] h-[12px] rounded-[5px] animate-pulse bg-gray-200" />
          <div className="h-[15px] w-[80px] rounded-[5px] animate-pulse bg-gray-200" />
        </div>
      </div>
    )}
    <div className="mt-3 flex gap-2 overflow-hidden" aria-busy="true" aria-live="polite">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-[90px] min-w-[184px] flex-shrink-0 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  </section>
);

  const renderError = () => (
    <section aria-label="Ошибка загрузки категорий спецтехники" className="relative">
      <h2 className="mt-5 text-lg md:text-xl lg:text-2xl font-black">Категории спецтехники</h2>
      <div className="mt-3 text-red-600" role="alert">
        {error}
        <button 
          onClick={forceRefresh}
          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Повторить загрузку категорий"
        >
          Повторить
        </button>
      </div>
    </section>
  );

  if (categoriesLoading) return renderSkeleton();
  if (error && categories.length === 0) return renderError();

  return (
    <section aria-label="Категории спецтехники" className="relative">
      <h2 className="mt-5 text-lg md:text-xl lg:text-2xl font-black">Категории спецтехники</h2>
      
      {/* Блок с отзывами и хлебными крошками для страниц каталога */}
      {isCatalogPage && <ReviewsBreadcrumbsBlock />}
      
      <div className="relative mt-3">
        {showScrollButtons && (
          <>
            <button 
              onClick={scrollLeft}
              className="absolute left-[-12px] top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Прокрутить влево"
              type="button"
            >
              &lt;
            </button>
            
            <button 
              onClick={scrollRight}
              className="absolute right-[-12px] top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Прокрутить вправо"
              type="button"
            >
              &gt;
            </button>
          </>
        )}
        
        <div 
          ref={scrollContainerRef}
          className="w-full flex overflow-x-auto gap-2 scrollbar-hide py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          role="list"
          onScroll={checkScrollButtons}
        >
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={getHrefWithCity(`/catalog/${category.slug}/`)}
              prefetch={false}
              role="listitem"
              aria-label={`Перейти в категорию ${category.name}`}
            >
              <p className="h-[90px] min-w-[184px] flex-shrink-0 overflow-hidden relative hover:bg-[#EBEAE8] rounded-lg py-2 px-3 bg-[var(--grey-color)] focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span className="text-[13px] relative z-10">{category.name}</span>
                <Image 
                  alt={`Изображение категории ${category.name}`} 
                  src={category.image ? `${API_BASE_URL}/uploads/categorys/${category.image}` : getFallbackImage(category.name)}
                  className='absolute right-0 bottom-0 h-auto max-w-[80%] object-contain'
                  width={170}
                  height={100}
                  style={{ width: 'auto', height: 'auto', maxWidth: '80%', maxHeight: '100px' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getFallbackImage(category.name).src;
                  }}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoriesList;