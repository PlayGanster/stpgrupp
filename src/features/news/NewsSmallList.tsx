"use client";

import { getNewsList, News } from "@/actions/news";
import { API_BASE_URL } from "@/constant/api-url";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useCity } from '@/hooks/useCity';
import { IoEye } from "react-icons/io5";
import { FaCalendarDays } from "react-icons/fa6";

const CACHE_DURATION = 10 * 60 * 1000; // 10 минут

// Функция для удаления HTML тегов из текста и замены переносов на пробелы
const stripHTML = (html: string): string => {
  if (!html) return '';
  
  return html
    .replace(/<[^>]*>/g, ' ') // Заменяем все HTML теги на пробелы
    .replace(/\n/g, ' ') // Заменяем переносы строк на пробелы
    .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
    .trim(); // Убираем пробелы в начале и конце
};

const NewsSmallList = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState<News[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { slug, isCityVersion } = useCity();

    // Функция для формирования ссылки с учетом города
    const getHrefWithCity = useCallback((href: string) => {
      if (isCityVersion) {
        return `/${slug}${href}`;
      }
      return href;
    }, [isCityVersion, slug]);

    const fetchNews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const cacheKey = isCityVersion ? `cachedNews_${slug}` : 'cachedNews';
            const timestampKey = isCityVersion ? `newsCacheTimestamp_${slug}` : 'newsCacheTimestamp';
            
            const cachedData = localStorage.getItem(cacheKey);
            const cacheTimestamp = localStorage.getItem(timestampKey);
            
            const now = Date.now();

            if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
                setNews(JSON.parse(cachedData));
                setLoading(false);
                return;
            }

            const data: News[] | null = await getNewsList();
            
            if (data) {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                localStorage.setItem(timestampKey, now.toString());
                setNews(data);
            } else {
                throw new Error('Не удалось загрузить новости');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
            console.error('Ошибка загрузки новостей:', err);
        } finally {
            setLoading(false);
        }
    }, [isCityVersion, slug]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const scrollLeft = useCallback(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        }
    }, []);

    const scrollRight = useCallback(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        }
    }, []);

    const truncateText = useCallback((text: string, maxLength: number) => {
        if (!text) return '';
        
        // Очищаем текст от HTML тегов
        const cleanText = stripHTML(text);
        
        if (cleanText.length <= maxLength) return cleanText;
        return cleanText.substring(0, maxLength) + '...';
    }, []);

    // Добавляем структурированные данные для новостей
    const newsStructuredData = useMemo(() => {
        if (!news) return null;
        
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": news.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "NewsArticle",
                    "headline": item.name,
                    "description": stripHTML(item.description),
                    "image": `${API_BASE_URL}/uploads/newss/${item.image}`,
                    "url": `${typeof window !== 'undefined' ? window.location.origin : ''}${getHrefWithCity(`/news/${item.id}`)}`,
                    "datePublished": item.created_at,
                    "dateModified": item.created_at
                }
            }))
        };
    }, [news, getHrefWithCity]);

    const LoadingSkeleton = useMemo(() => (
        <>
            {[...Array(5)].map((_, index) => (
                <div 
                    key={index} 
                    className="md:min-w-[300px] min-w-[200px] h-[150px] rounded-[20px] bg-gray-200 animate-pulse"
                    aria-hidden="true"
                />
            ))}
        </>
    ), []);

    const renderFullRead = (description: string) => {
        if (!description) return null;
        
        const cleanText = stripHTML(description);
        if(cleanText.length > 100) {
            return (
                <span className="underline font-black ml-[4px]">Читать полностью</span>
            )
        }
        return null;
    }

    const NewsItems = useMemo(() => (
        <>
            {news?.map((el) => (
                <article key={el.id} className="md:min-w-[300px] md:max-w-[300px] max-w-[200px] min-w-[200px]">
                    <Link 
                        href={getHrefWithCity(`/news/${el.id}`)}
                        className="block group"
                        aria-label={`Читать новость: ${el.name}`}
                    >
                        <div className="h-[150px] p-[12px] flex items-end justify-between rounded-[20px] overflow-hidden relative" itemProp="image" itemScope itemType="https://schema.org/ImageObject">
                            {/* Декоративное фоновое изображение */}
                            <Image
                                fill
                                alt=""
                                src={`${API_BASE_URL}/uploads/newss/${el.image}`}
                                className="object-cover brightness-65"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority={false}
                                aria-hidden="true"
                            />
                            {/* Основное изображение с SEO атрибутами */}
                            <meta itemProp="width" content="300" />
                            <meta itemProp="height" content="150" />
                            <h3 
                                className="relative text-white z-2 text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] mt-[6px] font-black group-hover:text-blue-100 transition-colors"
                                itemProp="headline"
                            >
                                {truncateText(el.name, 28)}
                            </h3>
                        </div>
                        <p 
                            className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] text-[var(--grey-text-color)] mt-[6px] mb-[12px]"
                            itemProp="description"
                        >
                            {truncateText(el.description, 100)}
                            {renderFullRead(el.description)}
                        </p>
                        <div className="mt-[6px] flex justify-between">
                            <div className="flex items-center text-[12px] text-[var(--grey-text-color)] gap-[4px]">
                                <IoEye size={16} />
                                {el.view}
                            </div>
                            <div className="flex items-center text-[var(--grey-text-color)] text-[12px] gap-[4px]">
                                <FaCalendarDays size={16} />
                                {el.date}
                            </div>
                        </div>
                    </Link>
                    <meta itemProp="datePublished" content={String(el.created_at)} />
                    <meta itemProp="dateModified" content={String(el.created_at)} />
                </article>
            ))}
        </>
    ), [news, truncateText, getHrefWithCity]);

    return (
        <section aria-labelledby="news-section-title">
            {/* Добавляем структурированные данные в скрытый script */}
            {newsStructuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(newsStructuredData) }}
                />
            )}
            
            <h2 id="news-section-title" className="sr-only">
                Последние новости
            </h2>
            
            <div className="relative mt-[20px]">
                <div className="relative mt-[12px]">
                    <button 
                        onClick={scrollLeft}
                        className="absolute left-[-12px] top-[75px] -translate-y-1/2 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Прокрутить новости влево"
                    >
                        &lt;
                    </button>
                    
                    <button 
                        onClick={scrollRight}
                        className="absolute right-[-12px] top-[75px] -translate-y-1/2 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Прокрутить новости вправо"
                    >
                        &gt;
                    </button>
                    
                    <div 
                        ref={scrollContainerRef}
                        className="w-full flex overflow-x-auto gap-[20px] scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        role="list"
                        aria-label="Список новостей"
                    >
                        {loading ? LoadingSkeleton : NewsItems}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default NewsSmallList;