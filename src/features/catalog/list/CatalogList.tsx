"use client"

import { Category, getCategories, getCategoriesProducts } from "@/actions/categories";
import { getProductsList, Product } from "@/actions/products";
import ItemCatalog from "@/shared/components/catalog/item/ItemCatalog";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useCity } from '@/hooks/useCity';
import Head from "next/head";

interface CatalogListType {
    all?: boolean;
    category?: boolean;
    admin?: boolean;
}

// Ключ для localStorage кеша
const CACHE_KEY = 'categories_catalog_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 минут

interface CacheData {
  data_category: Category[];
  data_products: Product[];
  timestamp: number;
}

const CatalogList: React.FC<CatalogListType> = ({
    all = true,
    category = true,
    admin = false
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [itemsCount, setItemsCount] = useState(4);
    const params = useParams();
    const category_slug = params.category as string;
    const { slug, isCityVersion } = useCity();

    // Получаем текущую категорию для SEO
    const currentCategory = useMemo(() => {
        return categories.find(el => el.slug === category_slug);
    }, [categories, category_slug]);

    // Функция для формирования ссылки с учетом города
    const getHrefWithCity = (href: string) => {
      if (isCityVersion) {
        return `/${slug}${href}`;
      }
      return href;
    }

    // Функция для получения данных из кеша
    const getCachedData = useCallback((): {data_category: Category[], data_products: Product[]} | null => {
        if (typeof window === 'undefined') return null;
        
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const cacheData: CacheData = JSON.parse(cached);
            const now = Date.now();

            if (now - cacheData.timestamp < CACHE_DURATION) {
                return {
                    data_category: cacheData.data_category,
                    data_products: cacheData.data_products
                };
            }
            
            localStorage.removeItem(CACHE_KEY);
            return null;
        } catch (error) {
            console.error('Error reading cache:', error);
            return null;
        }
    }, []);

    // Функция для сохранения данных в кеш
    const setCacheData = useCallback((data_category: Category[], data_products: Product[]) => {
        if (typeof window === 'undefined') return;
        
        try {
            const cacheData: CacheData = {
                data_category,
                data_products,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    }, []);

    // Функция для обработки размеров окна
    const updateItemsCount = useCallback(() => {
        if (window.innerWidth >= 1024) {
            setItemsCount(4);
        } else if (window.innerWidth < 1024 && window.innerWidth > 600) {
            setItemsCount(3);
        } else {
            setItemsCount(2);
        }
    }, []);

    // Функция для получения данных
    const fetchData = useCallback(async () => {
        try {
            setLoadingCategories(true);
            setLoadingProducts(true);
            setError(null);
            
            // Проверяем кеш
            const cachedData = getCachedData();
            if (cachedData) {
                setCategories(cachedData.data_category);
                
                if (category_slug) {
                    const category = cachedData.data_category.find(el => el.slug === category_slug);
                    if (category) {
                        const filteredProducts = cachedData.data_products.filter(el => el.category_id === category.id);
                        setProducts(filteredProducts);
                    }
                } else {
                    setProducts(cachedData.data_products);
                }
                
                return;
            }

            // Получаем свежие данные
            const [categoriesData, productsData]: any = await Promise.all([
                getCategories(),
                getProductsList()
            ]);

            // Обогащаем категории количеством продуктов
            const categoriesWithCounts = await Promise.all(
                categoriesData.map(async (el : any) => {
                    try {
                        const categoryProducts = await getCategoriesProducts(el.id);
                        return {
                            ...el,
                            count: categoryProducts.length
                        };
                    } catch (error) {
                        console.error(`Error fetching products for category ${el.id}:`, error);
                        return {
                            ...el,
                            count: 0
                        };
                    }
                })
            );

            setCategories(categoriesWithCounts);
            setCacheData(categoriesWithCounts, productsData);

            if (category_slug) {
                const category = categoriesWithCounts.find(el => el.slug === category_slug);
                if (category) {
                    const filteredProducts = productsData.filter((el: any) => el.category_id === category.id);
                    setProducts(filteredProducts);
                }
            } else {
                setProducts(productsData);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Не удалось загрузить данные');
            
            const cachedData = getCachedData();
            if (cachedData) {
                setCategories(cachedData.data_category);
                setProducts(cachedData.data_products);
            }
        } finally {
            setLoadingCategories(false);
            setLoadingProducts(false);
        }
    }, [category_slug, getCachedData, setCacheData]);

    // Эффект для обработки изменения размера окна
    useEffect(() => {
        updateItemsCount();
        window.addEventListener('resize', updateItemsCount);
        return () => window.removeEventListener('resize', updateItemsCount);
    }, [updateItemsCount]);

    // Эффект для загрузки данных
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Генерация микроразметки для категорий и продуктов
    const generateBreadcrumbSchema = useMemo(() => {
        const itemListElement = [];
        
        // Добавляем главную страницу
        itemListElement.push({
            "@type": "ListItem",
            "position": 1,
            "name": "Главная",
            "item": isCityVersion ? `https://example.com/${slug}` : "https://example.com"
        });
        
        // Добавляем каталог
        itemListElement.push({
            "@type": "ListItem",
            "position": 2,
            "name": "Каталог",
            "item": isCityVersion ? `https://example.com/${slug}/catalog` : "https://example.com/catalog"
        });
        
        // Если есть текущая категория, добавляем её
        if (currentCategory) {
            itemListElement.push({
                "@type": "ListItem",
                "position": 3,
                "name": currentCategory.name,
                "item": isCityVersion 
                    ? `https://example.com/${slug}/catalog/${currentCategory.slug}` 
                    : `https://example.com/catalog/${currentCategory.slug}`
            });
        }
        
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": itemListElement
        };
    }, [currentCategory, isCityVersion, slug]);

    // Генерация микроразметки для списка продуктов
    const generateProductListSchema = useMemo(() => {
        if (products.length === 0) return null;
        
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": currentCategory 
                ? `Товары в категории ${currentCategory.name}` 
                : "Все товары",
            "description": currentCategory 
                ? `Список товаров в категории ${currentCategory.name}` 
                : "Список всех товаров в каталоге",
            "numberOfItems": products.length,
            "itemListElement": products.map((product, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Product",
                    "name": product.name,
                    "description": product.description || `Качественный ${product.name} по доступной цене`,
                    "offers": {
                        "@type": "Offer",
                        "price": product.price,
                        "priceCurrency": "RUB",
                        "availability": "https://schema.org/InStock"
                    }
                }
            }))
        };
    }, [products, currentCategory]);

    // Рендер списка продуктов
    const renderList = useMemo(() => {
        if (loadingProducts) {
            return [...Array(itemsCount)].map((_, index) => (
                <div 
                    key={index} 
                    className="px-[15px] py-[8px] min-[500px]:h-[180px] h-[180px] md:h-[320px] rounded-[10px] bg-gray-200 animate-pulse"
                    aria-hidden="true"
                />
            ));
        }

        if (products.length === 0) {
            return (
                <p className="text-[length:var(--size-mobile-large-text)] font-black md:text-[length:var(--size-md-large-text)] lg:text-[length:var(--size-lg-large-text)] col-span-full">
                    Не найдено техники
                </p>
            );
        }

        const productsToRender = all ? products : products.slice(0, 7);
        
        return (
            <>
                {productsToRender.map((el) => (
                    <ItemCatalog 
                        key={el.id}
                        name={el.name} 
                        price={Math.round(el.price)} 
                        imgs={el.images} 
                        view_count={el.view}
                        admin={false} 
                        idItem={el.id} 
                    />
                ))}
                {!all && <ItemCatalog view="go" />}
            </>
        );
    }, [loadingProducts, products, all, itemsCount]);

    // Рендер категорий
    const renderCategory = useMemo(() => {
        if (!category) return null;

        if (loadingCategories) {
            return [...Array(8)].map((_, index) => (
                <div 
                    key={index} 
                    className="px-[15px] py-[8px] md:min-w-[100px] min-w-[80px] lg:min-w-[120px] md:h-[35px] h-[30px] lg:h-[40px] rounded-[10px] bg-gray-200 animate-pulse"
                    aria-hidden="true"
                />
            ));
        }

        return categories.map((el) => (
            <Link 
                href={getHrefWithCity(`/catalog/${el.slug}`)} 
                key={el.id}
                aria-label={`Перейти в категорию ${el.name} (${el.count} товаров)`}
            >
                <div className="px-[15px] py-[8px] rounded-[10px] bg-[var(--grey-text-color)] lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] text-white hover:bg-[var(--orange-hover-color)] transition-colors">
                    {el.name} ({el.count})
                </div>
            </Link>
        ));
    }, [category, loadingCategories, categories, getHrefWithCity]);

    return (
        <>  
            {/* Добавляем микроразметку в Head */}
            <Head>
                {category_slug && currentCategory && (
                    <title>{`${currentCategory.name} - каталог товаров`}</title>
                )}
                {category_slug && currentCategory && (
                    <meta 
                        name="description" 
                        content={`Широкий выбор ${currentCategory.name} в нашем каталоге. ${currentCategory.count} товаров по доступным ценам с доставкой.`} 
                    />
                )}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema) }}
                />
                {generateProductListSchema && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateProductListSchema) }}
                    />
                )}
            </Head>
            
            {/* Семантическая разметка для навигации по категориям */}
            <nav aria-label="Категории товаров">
                <div className="w-full flex flex-wrap gap-[6px] mt-[12px]">
                    {renderCategory}
                </div>
            </nav>
            
            {/* Семантическая разметка для списка товаров */}
            <section aria-label="Список товаров">
                <div className="w-full grid max-[600px]:grid-cols-2 min-[600px]:grid-cols-3 lg:grid-cols-4 gap-[12px] mt-[12px]">
                    {renderList}
                </div>
            </section>
        </>
    );
}

export default CatalogList;