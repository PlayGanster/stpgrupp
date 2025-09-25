"use client";

import Image from 'next/image'
import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link';

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

const CACHE_KEY = 'categories_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 минут

interface CacheData {
  data: Category[];
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
  const [loading, setLoading] = useState(!initialCategories.length);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const { slug, isCityVersion } = useCity();

  const getHrefWithCity = (href: string) => {
    if (isCityVersion) {
      return `/${slug}${href}`;
    }
    return href;
  }

  const getCachedData = useCallback((): Category[] | null => {
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

  const setCacheData = useCallback((data: Category[]) => {
    if (typeof window === 'undefined') return;
    try {
      const cacheData: CacheData = { data, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch {}
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cachedData = getCachedData();
      if (cachedData) {
        setCategories(cachedData);
        setLoading(false);
        return;
      }
      const data = await getCategories();
      setCategories(data);
      setCacheData(data);
    } catch {
      setError('Не удалось загрузить категории');
      const cachedData = getCachedData();
      if (cachedData) setCategories(cachedData);
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCacheData]);

  useEffect(() => {
    if (initialCategories.length === 0) {
      fetchCategories();
    }
  }, [initialCategories.length, fetchCategories]);

  // Функция для проверки необходимости показа стрелок
  const checkScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Проверяем, есть ли переполнение по горизонтали
    const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
    setShowScrollButtons(hasHorizontalScroll);
  }, []);

  useEffect(() => {
    // Проверяем при загрузке категорий
    checkScrollButtons();

    // Также проверяем при изменении размера окна
    const handleResize = () => {
      checkScrollButtons();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories, checkScrollButtons]); // Зависимость от categories - проверяем при изменении количества категорий

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
    }
    await fetchCategories();
  }, [fetchCategories]);

  const renderSkeleton = () => (
    <section aria-label="Загрузка категорий спецтехники" className="relative">
      <h2 className="mt-5 text-lg md:text-xl lg:text-2xl font-black">Категории спецтехники</h2>
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

  if (loading) return renderSkeleton();
  if (error && categories.length === 0) return renderError();

  return (
    <section aria-label="Категории спецтехники" className="relative">
      <h2 className="mt-5 text-lg md:text-xl lg:text-2xl font-black">Категории спецтехники</h2>
      
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
          onScroll={checkScrollButtons} // Проверяем при прокрутке
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