import { API_BASE_URL } from '@/constant/api-url';

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  count?: number;
}

// Общая функция для выполнения запросов
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
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return fallback;
  }
}

// Fallback данные для категорий
const fallbackCategories: Category[] = [
  { id: 1, name: 'Краны', slug: 'krani' },
  { id: 2, name: 'Автовышки', slug: 'avtovishki' },
  { id: 3, name: 'Экскаваторы', slug: 'ekskovatori' },
  { id: 4, name: 'Манипуляторы', slug: 'manipulator' },
  { id: 5, name: 'Навесное', slug: 'navesnoe' },
  { id: 6, name: 'Трал', slug: 'tral' },
  { id: 7, name: 'Прочее', slug: 'prochee' }
];

export async function getCategories(): Promise<Category[]> {
  return fetchWithCache<Category[]>(
    `${API_BASE_URL}/categories/`,
    fallbackCategories
  );
}

export async function getCategory(id: number): Promise<Category | null> {
  const data = await fetchWithCache<Category | Category[]>(
    `${API_BASE_URL}/categories/${id}`,
    { id: 7, name: 'Прочее', slug: 'prochee' }
  );
  
  return Array.isArray(data) ? data[0] || null : data;
}

export async function getCategoriesProducts(id: number): Promise<Category[]> {
  return fetchWithCache<Category[]>(
    `${API_BASE_URL}/products-category/${id}`,
    []
  );
}

// Дополнительные полезные функции для работы с категориями
export function getCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  return categories.find(category => category.slug === slug);
}

export function getCategoryImageUrl(category: Category): string {
  if (!category.image) return '';
  
  // Если путь уже полный URL, возвращаем как есть
  if (category.image.startsWith('http')) {
    return category.image;
  }
  
  // Если относительный путь, добавляем базовый URL
  return `${API_BASE_URL}/uploads/categorys/${category.image}`;
}

export function sortCategoriesByName(categories: Category[], ascending: boolean = true): Category[] {
  return [...categories].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });
}

export function filterCategoriesWithProducts(categories: Category[]): Category[] {
  return categories.filter(category => category.count && category.count > 0);
}

export function searchCategories(categories: Category[], searchTerm: string): Category[] {
  const term = searchTerm.toLowerCase();
  return categories.filter(category =>
    category.name.toLowerCase().includes(term) ||
    category.slug.toLowerCase().includes(term)
  );
}

// Функция для обогащения категорий количеством продуктов
export async function getCategoriesWithCounts(): Promise<Category[]> {
  try {
    const categories = await getCategories();
    
    // Получаем количество продуктов для каждой категории
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        try {
          const products = await getCategoriesProducts(category.id);
          return {
            ...category,
            count: products.length
          };
        } catch (error) {
          console.error(`Error fetching products for category ${category.id}:`, error);
          return {
            ...category,
            count: 0
          };
        }
      })
    );
    
    return categoriesWithCounts;
  } catch (error) {
    console.error('Error fetching categories with counts:', error);
    return fallbackCategories;
  }
}

// Функция для генерации URL категории
export function getCategoryUrl(category: Category): string {
  return `/catalog/${category.slug}`;
}

// Функция для валидации slug категории
export function isValidCategorySlug(slug: string, categories: Category[]): boolean {
  return categories.some(category => category.slug === slug);
}