import { API_BASE_URL } from '@/constant/api-url';

export interface News {
    id: number;
    name: string;
    description: string;
    date: number;
    image: string;
    created_at: number;
    view: number;
}

export async function incrementNewsView(id: number): Promise<boolean> {
    try {
        // Получаем текущую новость чтобы узнать текущее количество просмотров
        const currentNews = await getNews(id);
        
        if (!currentNews) return false;

        // Увеличиваем счетчик просмотров на 1
        const updatedViews = (currentNews.view || 0) + 1;

        // Отправляем PUT запрос на обновление новости
        const response = await fetch(`${API_BASE_URL}/news/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...currentNews,
                view: updatedViews
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error incrementing view count:', error);
        return false;
    }
}

// Общая функция для выполнения запросов
async function fetchWithCache<T>(
    url: string, 
    fallback: T,
    noCache: boolean = false
): Promise<T> {
    try {
        const response = await fetch(url, {
            next: noCache ? { revalidate: 0 } : { revalidate: 900 }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return fallback;
    }
}

// Функция для получения одной новости по ID
export async function getNews(id: number, noCache: boolean = false): Promise<News | null> {
    const fallbackNews = null;
    
    return fetchWithCache<News | null>(
        `${API_BASE_URL}/news/${id}`, 
        fallbackNews,
        noCache
    );
}

// Функция для получения всех новостей
export async function getNewsList(): Promise<News[]> {
    const fallbackNews: News[] = [];
    
    const data = await fetchWithCache<News[] | News>(
        `${API_BASE_URL}/news/`, 
        fallbackNews
    );
    
    return Array.isArray(data) ? data : [data];
}

// Дополнительные полезные функции для работы с новостями
export function formatNewsDate(timestamp: number): string {
    const date = new Date(timestamp * 1000); // Предполагаем, что timestamp в секундах
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

export function formatNewsDateTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

export function getNewsExcerpt(description: string, maxLength: number = 150): string {
    if (description.length <= maxLength) return description;
    
    return description.substring(0, maxLength).trim() + '...';
}

export function sortNewsByDate(news: News[], ascending: boolean = false): News[] {
    return [...news].sort((a, b) => {
        return ascending ? a.date - b.date : b.date - a.date;
    });
}

export function filterNewsByDateRange(news: News[], startDate: Date, endDate: Date): News[] {
    return news.filter(item => {
        const itemDate = new Date(item.date * 1000);
        return itemDate >= startDate && itemDate <= endDate;
    });
}

export function getNewsImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // Если путь уже полный URL, возвращаем как есть
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Если относительный путь, добавляем базовый URL
    return `${API_BASE_URL}/uploads/newss/${imagePath}`;
}

// Функция для поиска новостей
export function searchNews(news: News[], searchTerm: string): News[] {
    const term = searchTerm.toLowerCase();
    return news.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
    );
}

// Функция для группировки новостей по годам
export function groupNewsByYear(news: News[]): Record<number, News[]> {
    return news.reduce((groups, item) => {
        const year = new Date(item.date * 1000).getFullYear();
        if (!groups[year]) {
            groups[year] = [];
        }
        groups[year].push(item);
        return groups;
    }, {} as Record<number, News[]>);
}