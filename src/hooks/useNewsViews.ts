// hooks/useNewsViews.ts
import { useState, useEffect } from 'react';
import { getNews } from '@/actions/news';

export const useNewsViews = (newsId: number) => {
    const [views, setViews] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActualViews = async () => {
            try {
                setLoading(true);
                // Получаем свежие данные без кэша
                const newsData = await getNews(newsId, true);
                setViews(newsData?.view || 0);
            } catch (error) {
                console.error('Error fetching actual views:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActualViews();

        // Обновляем просмотры каждые 30 секунд
        const interval = setInterval(fetchActualViews, 30000);

        return () => clearInterval(interval);
    }, [newsId]);

    return { views, loading };
};