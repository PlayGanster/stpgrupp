import { API_BASE_URL } from "@/constant/api-url";

export interface Review {
    id: number;
    customer_name: string;
    description: string;
    date: string;
    product_id: number;
    rating: number;
    images: string | null;
    created_at: number;
}

// Общая функция для выполнения запросов
async function fetchWithCache<T>(url: string, options?: RequestInit): Promise<T | null> {
    try {
        const response = await fetch(url, {
            ...options,
            next: {
                revalidate: 900 // 15 минут
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null;
    }
}

export async function getReviewByProduct(id: number): Promise<Review[] | null> {
    return fetchWithCache<Review[]>(`${API_BASE_URL}/reviews-product/${id}`);
}

export async function getReviews(): Promise<Review[] | null> {
    return fetchWithCache<Review[]>(`${API_BASE_URL}/reviews`);
}

// Дополнительные полезные функции для работы с отзывами
export function filterReviewsByRating(reviews: Review[], minRating: number = 4): Review[] {
    return reviews.filter(review => review.rating >= minRating);
}

export function sortReviewsByDate(reviews: Review[], ascending: boolean = false): Review[] {
    return reviews.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return ascending ? dateA - dateB : dateB - dateA;
    });
}

export function getAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10; // Округляем до 1 decimal
}

export function formatReviewDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}