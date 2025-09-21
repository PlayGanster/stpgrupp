import { API_BASE_URL } from '@/constant/api-url';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    location: string;
    category_id: number | null;
    images: string;
    created_at: number;
    slug?: string;
    view?: number;
}

export interface Specification {
    id: number;
    name: string;
    value: string;
}

// Общая функция для выполнения запросов с кешированием
async function fetchWithCache<T>(url: string, fallback: T): Promise<T> {
    try {
        const response = await fetch(url, {
            next: {
                revalidate: 900 // 15 минут кеширования
            }
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

// Функция для получения всех продуктов
export async function getProductsList(): Promise<Product[] | null> {
    const fallbackProducts: Product[] | null = null;

    return fetchWithCache<Product[] | null>(`${API_BASE_URL}/products/`, fallbackProducts);
}

// Функция для получения одного продукта по ID
export async function getProduct(id: number): Promise<Product | null> {
    const fallbackProduct = null;
    
    const data = await fetchWithCache<Product | Product[] | null>(
        `${API_BASE_URL}/products/${id}`, 
        fallbackProduct
    );
    
    return Array.isArray(data) ? data[0] || null : data;
}

// Функция для получения спецификаций продукта
export async function getProductSpecification(id: number): Promise<Specification[] | null> {
    const fallbackSpecifications = null;
    
    return fetchWithCache<Specification[] | null>(
        `${API_BASE_URL}/specifications-product/${id}`, 
        fallbackSpecifications
    );
}

// Дополнительные полезные функции для работы с продуктами
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
}

export function getMainImage(imagesString: string): string {
    try {
        const images = JSON.parse(imagesString);
        return Array.isArray(images) && images.length > 0 ? images[0] : '';
    } catch {
        return imagesString; // Если images не JSON, возвращаем как есть
    }
}

export function getAllImages(imagesString: string): string[] {
    try {
        const images = JSON.parse(imagesString);
        return Array.isArray(images) ? images : [imagesString];
    } catch {
        return [imagesString];
    }
}

export function generateProductSlug(name: string, id: number): string {
    const slug = name
        .toLowerCase()
        .replace(/[^\w\u0400-\u04FF]+/g, '-')
        .replace(/^-+|-+$/g, '');
    
    return `${slug}-${id}`;
}

export function filterProductsByCategory(products: Product[], categoryId: number): Product[] {
    return products.filter(product => product.category_id === categoryId);
}

export function sortProductsByPrice(products: Product[], ascending: boolean = true): Product[] {
    return [...products].sort((a, b) => {
        return ascending ? a.price - b.price : b.price - a.price;
    });
}

export function searchProducts(products: Product[], searchTerm: string): Product[] {
    const term = searchTerm.toLowerCase();
    return products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.location.toLowerCase().includes(term)
    );
}