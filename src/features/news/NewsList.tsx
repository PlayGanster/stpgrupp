"use client"
import { getNewsList, News } from "@/actions/news"
import { API_BASE_URL } from "@/constant/api-url"
import Button from "@/shared/ui/button/Button"
import { truncateText } from "@/shared/utils/Truncate"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useCity } from '@/hooks/useCity'
import { FaCalendarDays } from "react-icons/fa6"
import { IoEye } from "react-icons/io5"
import { getNews } from "@/actions/news" // Добавляем импорт getNews

const NewsList = () => {
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState<News[] | null>();
    const [error, setError] = useState<string | null>(null);
    const [actualViews, setActualViews] = useState<Record<number, number>>({});
    const { slug, isCityVersion } = useCity();

    // Функция для формирования ссылки с учетом города
    const getHrefWithCity = (href: string) => {
        if (isCityVersion) {
            return `/${slug}${href}`;
        }
        return href;
    };

    const fetchNews = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const cacheKey = isCityVersion ? `cachedNews_${slug}` : 'cachedNews';
            const timestampKey = isCityVersion ? `newsCacheTimestamp_${slug}` : 'newsCacheTimestamp';
            
            const cachedData = localStorage.getItem(cacheKey);
            const cacheTimestamp = localStorage.getItem(timestampKey);
            
            const now = Date.now();
            const cacheDuration = 10 * 60 * 1000;

            if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheDuration) {
                const cachedNews = JSON.parse(cachedData);
                setNews(cachedNews);
                updateActualViews(cachedNews);
                setLoading(false);
                return;
            }

            const data: News[] | null = await getNewsList();
            
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(timestampKey, now.toString());
            setNews(data);
            if (data) {
                updateActualViews(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
            console.error('Ошибка загрузки новостей:', err);
        } finally {
            setLoading(false);
        }
    };

    // Функция для обновления актуальных просмотров
    const updateActualViews = async (newsList: News[]) => {
        const newViews: Record<number, number> = {};
        
        for (const newsItem of newsList) {
            try {
                const freshNews = await getNews(newsItem.id, true); // noCache = true
                newViews[newsItem.id] = freshNews?.view || 0;
            } catch (error) {
                newViews[newsItem.id] = newsItem.view; // fallback
            }
        }
        
        setActualViews(newViews);
    };

    useEffect(() => {
        fetchNews();
    }, [isCityVersion, slug]);

    // Интервал для обновления просмотров
    useEffect(() => {
        if (!news) return;

        const interval = setInterval(() => {
            updateActualViews(news);
        }, 30000); // Обновляем каждые 30 секунд

        return () => clearInterval(interval);
    }, [news]);

    return (
        <div className="grid grid-cols-3 max-[600px]:grid-cols-2 max-[400px]:grid-cols-1 pb-[20px] gap-[20px] mt-[20px]">
            {loading ? (
                <>
                    <div className="w-full h-[350px] rounded-[20px] bg-gray-200 animate-pulse"></div>
                    <div className="w-full h-[350px] rounded-[20px] bg-gray-200 animate-pulse"></div>
                    <div className="w-full h-[350px] rounded-[20px] bg-gray-200 animate-pulse"></div>
                </>
            ) : (
                news?.map((el, index) => {
                    // Используем актуальные просмотры или данные из кэша
                    const viewsCount = actualViews[el.id] !== undefined ? actualViews[el.id] : el.view;
                    const publishedDate = new Date(el.created_at || Date.now()).toISOString();
                    
                    return (
                        <article 
                            className="w-full h-[400px] flex flex-col justify-between rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            key={index}
                            itemScope
                            itemType="https://schema.org/NewsArticle"
                        >
                            {/* Микроразметка для новости */}
                            <script
                                type="application/ld+json"
                                dangerouslySetInnerHTML={{
                                    __html: JSON.stringify({
                                        "@context": "https://schema.org",
                                        "@type": "NewsArticle",
                                        "headline": el.name,
                                        "description": truncateText(el.description, 100),
                                        "datePublished": publishedDate,
                                        "dateModified": publishedDate,
                                        "image": `${API_BASE_URL}/uploads/newss/${el.image}`,
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
                                        "url": `${typeof window !== 'undefined' ? window.location.origin : ''}${getHrefWithCity(`/news/${el.id}`)}`
                                    })
                                }}
                            />
                            
                            <div className="flex-1 flex flex-col">
                                <div className="w-full h-[150px] md:h-[170px] relative flex-shrink-0">
                                    <Image
                                        fill
                                        alt={`Задний фон ${el.name}`}
                                        src={`${API_BASE_URL}/uploads/newss/${el.image}`}
                                        className="object-cover brightness-50"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <Image 
                                        src={`${API_BASE_URL}/uploads/newss/${el.image}`} 
                                        fill 
                                        className="object-contain" 
                                        sizes="(max-width: 610px) 100vw, 50vw" 
                                        alt={el.name} 
                                        itemProp="image"
                                    />
                                </div>
                                
                                <div className="p-4 flex-1 flex flex-col">
                                    <h2 
                                        className="text-[length:var(--size-mobile-large-text)] md:text-[length:var(--size-md-large-text)] lg:text-[length:var(--size-lg-large-text)] font-black line-clamp-1 mb-2"
                                        itemProp="headline"
                                    >
                                        {el.name}
                                    </h2>
                                    
                                    <div className="flex-1">
                                        <p 
                                            className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] text-[var(--grey-text-color)] line-clamp-3"
                                            itemProp="description"
                                        >
                                            {truncateText(el.description, 100)}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-[6px] flex justify-between">
                                        <div className="flex items-center text-[12px] text-[var(--grey-text-color)] gap-[4px]">
                                            <IoEye size={16} />
                                            {viewsCount} {/* Актуальные просмотры */}
                                        </div>
                                        <div className="flex items-center text-[var(--grey-text-color)] text-[12px] gap-[4px]">
                                            <FaCalendarDays size={16} />
                                            {el.date}
                                        </div>
                                    </div>
                                    
                                    <meta itemProp="datePublished" content={publishedDate} />
                                    <meta itemProp="dateModified" content={publishedDate} />
                                    <meta itemProp="author" content="СТП Групп" />
                                </div>
                            </div>

                            <div className="p-4 pt-0 flex justify-between items-center">
                                <Link 
                                    href={getHrefWithCity(`/news/${el.id}`)}
                                    className="flex-1"
                                    itemProp="url"
                                >
                                    <Button 
                                        name="Читать полностью" 
                                        width="full" 
                                        height={35} 
                                        color="gray" 
                                        size="default" 
                                        aria-label={`Читать новость: ${el.name}`}
                                    />
                                </Link>
                            </div>
                        </article>
                    )
                })
            )}
        </div>
    )
}

export default NewsList