// hooks/useNewsView.ts
import { useState, useEffect } from 'react';
import { incrementNewsView } from '@/actions/news';

export const useNewsView = (newsId: number) => {
    const [hasViewed, setHasViewed] = useState(false);

    useEffect(() => {
        const registerView = async () => {
            // Проверяем, видел ли пользователь эту новость сегодня
            const today = new Date().toDateString();
            const viewKey = `news_view_${newsId}_${today}`;
            const hasViewedToday = localStorage.getItem(viewKey);

            if (!hasViewedToday) {
                const success = await incrementNewsView(newsId);
                if (success) {
                    // Сохраняем в localStorage на 24 часа
                    localStorage.setItem(viewKey, 'true');
                    
                    // Устанавливаем время истечения
                    const expirationTime = new Date();
                    expirationTime.setHours(24, 0, 0, 0); // До конца дня
                    localStorage.setItem(`${viewKey}_expires`, expirationTime.getTime().toString());
                    
                    setHasViewed(true);
                }
            } else {
                setHasViewed(true);
            }
        };

        // Очистка старых записей
        const cleanupOldViews = () => {
            const today = new Date();
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('news_view_') && key.includes('_expires')) {
                    const expires = parseInt(localStorage.getItem(key) || '0');
                    if (expires < today.getTime()) {
                        const viewKey = key.replace('_expires', '');
                        localStorage.removeItem(viewKey);
                        localStorage.removeItem(key);
                    }
                }
            });
        };

        cleanupOldViews();
        registerView();
    }, [newsId]);

    return hasViewed;
};