"use client"

import { getNews, News } from "@/actions/news"
import { API_BASE_URL } from "@/constant/api-url"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { IoIosArrowForward } from "react-icons/io"
import { useCity } from '@/hooks/useCity' // Добавляем хук useCity
import { incrementNewsView } from '@/actions/news';
import { useNewsView } from "@/hooks/useNewsView"
import { useNewsViews } from "@/hooks/useNewsViews"

const CACHE_DURATION = 10 * 60 * 1000; // 10 минут

const NewsContent = () => {
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState<News | null>(null);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const news_id = params.id as string;
    const { slug, isCityVersion } = useCity(); // Получаем данные о городе
    const hasViewed = useNewsView(Number(news_id));
    const { views, loading: viewsLoading } = useNewsViews(Number(news_id));

    // Функция для формирования ссылки с учетом города
    const getHrefWithCity = (href: string) => {
        if (isCityVersion) {
            return `/${slug}${href}`;
        }
        return href;
    };

    const fetchNews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const cacheKey = `cachedNews${news_id}`;
            const timestampKey = `newsCacheTimestamp${news_id}`;
            
            const cachedData = localStorage.getItem(cacheKey);
            const cacheTimestamp = localStorage.getItem(timestampKey);
            
            const now = Date.now();

            // Проверяем кэш
            if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
                setNews(JSON.parse(cachedData));
                setLoading(false);
                return;
            }

            // Получаем данные с сервера
            const data: News | null = await getNews(Number(news_id));
            
            // Сохраняем в кэш
            if (data) {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                localStorage.setItem(timestampKey, now.toString());
            }
            
            setNews(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
            console.error('Ошибка загрузки новости:', err);
        } finally {
            setLoading(false);
        }
    }, [news_id]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // Формируем структурированные данные для новости
    const getStructuredData = () => {
        if (!news) return null;
        
        return {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": news.name,
            "description": news.description?.split('\n')[0] || news.name,
            "image": `${API_BASE_URL}/uploads/newss/${news.image}`,
            "datePublished": news.created_at || new Date().toISOString(),
            "dateModified": news.created_at || news.created_at || new Date().toISOString(),
            "author": {
                "@type": "Organization",
                "name": "СТП Групп"
            },
            "publisher": {
                "@type": "Organization",
                "name": "СТП Групп",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://ваш-сайт.ru/logo.png"
                }
            },
            // Добавляем URL с учетом города
            "url": `${typeof window !== 'undefined' ? window.location.origin : ''}${getHrefWithCity(`/news/${news_id}`)}`
        };
    };

    if (error) {
        return (
            <div className="mt-[20px] text-red-500">
                Ошибка: {error}
            </div>
        );
    }

    if (!news && !loading) {
        return (
            <h1 className="text-black mt-[20px] text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] leading-[1.2] font-black">
                Не найдена новость
            </h1>
        );
    }

    return (
        <>
            {/* Структурированные данные для SEO */}
            {news && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData()) }}
                />
            )}
            {views !== null && !viewsLoading && (
                <div className="mt-4 text-sm text-gray-500" itemProp="interactionStatistic" itemScope itemType="https://schema.org/InteractionCounter">
                    <meta itemProp="interactionType" content="https://schema.org/WatchAction" />
                    <span itemProp="userInteractionCount">{views}</span> просмотров
                </div>
            )}
            
            <section itemScope itemType="https://schema.org/NewsArticle">
                {/* Хлебные крошки с микроразметкой */}
                <nav aria-label="Хлебные крошки" className="flex items-center mt-[20px]">
                    <div className="flex items-end text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] text-[var(--grey-text-color)]">
                        {loading ? (
                            <div className="w-[80px] h-[15px] rounded-[5px] animate-pulse bg-gray-200" />
                        ) : (
                            <>
                                <Link 
                                    href={getHrefWithCity("/")} // Используем функцию для ссылки
                                    className="leading-[1] hover:text-[var(--orange-hover-color)]" 
                                    itemProp="item"
                                >
                                    <span itemProp="name">Главная</span>
                                    <meta itemProp="position" content="1" />
                                </Link>
                                <IoIosArrowForward size={12} aria-hidden="true" />
                                <Link 
                                    href={getHrefWithCity("/news")} // Используем функцию для ссылки
                                    className="leading-[1] hover:text-[var(--orange-hover-color)]" 
                                    itemProp="item"
                                >
                                    <span itemProp="name">Новости</span>
                                    <meta itemProp="position" content="2" />
                                </Link>
                                <IoIosArrowForward size={12} aria-hidden="true" />
                                <Link 
                                    href={getHrefWithCity(`/news/${news_id}`)} // Используем функцию для ссылки
                                    className="leading-[1] hover:text-[var(--orange-hover-color)]"
                                    itemProp="item"
                                    aria-current="page"
                                >
                                    <span itemProp="name">{news?.name}</span>
                                    <meta itemProp="position" content="3" />
                                </Link>
                            </>
                        )}
                    </div> 
                </nav>

                {/* Изображение новости */}
                {loading ? (
                    <div className="w-full lg:h-[500px] md:h-[300px] h-[200px] relative mt-[20px] animate-pulse rounded-[20px] bg-gray-200" />
                ) : (
                    <div className="w-full lg:h-[500px] md:h-[300px] h-[200px] relative mt-[20px]" itemProp="image" itemScope itemType="https://schema.org/ImageObject">
                        <Image
                            fill
                            alt={news?.name || "Изображение новости"}
                            src={`${API_BASE_URL}/uploads/newss/${news?.image}`}
                            className="object-cover brightness-50"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                        />
                        <Image 
                            src={`${API_BASE_URL}/uploads/newss/${news?.image}`} 
                            fill 
                            className="object-contain" 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            alt={news?.name || "Изображение новости"} 
                            priority
                            itemProp="url"
                        />
                        <meta itemProp="width" content="800" />
                        <meta itemProp="height" content="600" />
                    </div>
                )}

                {/* Заголовок новости */}
                {loading ? (
                    <div className="mt-[20px] w-full h-[35px] bg-gray-200 rounded-[20px] animate-pulse" />
                ) : (
                    <h1 
                        className="mt-[20px] text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black" 
                        itemProp="headline"
                    >
                        {news?.name}
                    </h1>
                )}

                {/* Дата публикации */}
                {news?.created_at && !loading && (
                    <time 
                        itemProp="datePublished" 
                        dateTime={new Date(news.created_at).toISOString()}
                        className="block mt-2 text-sm text-gray-500"
                    >
                        {new Date(news.created_at).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </time>
                )}

                {/* Описание новости */}
                {loading ? (
                    <div className="mt-[20px] w-full h-[100px] bg-gray-200 rounded-[20px] animate-pulse" />
                ) : (
                    <div 
                        className="mt-[20px] text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)]"
                        itemProp="articleBody"
                    >
                        {news?.description?.split('\n').map((paragraph, index) => 
                            paragraph.trim() && (
                                <p key={index} className="mb-4">
                                    {paragraph}
                                </p>
                            )
                        )}
                    </div>
                )}

                {/* Дополнительные мета-теги для микроразметки */}
                <meta itemProp="author" content="СТП Групп" />
                <meta itemProp="publisher" content="СТП Групп" />
            </section>
        </>
    );
}

export default NewsContent;