<<<<<<< HEAD
"use client"

import { getProduct, getProductSpecification, Product, Specification } from "@/actions/products"
import FeedbackList from "@/features/feedback/FeedbackList"
import ReelsList from "@/features/news/ReelsList"
import RightItem from "@/features/product/right-item/rightItem"
import ProductImages from "@/shared/components/product/ProductImages"
import Button from "@/shared/ui/button/Button"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import { IoHeartOutline, IoHeart } from "react-icons/io5"
import { isFavorite, toggleFavorite, FavoriteItem } from "@/shared/utils/favorites"
import { useCity } from "@/hooks/useCity"
import { CITY_CASES } from "@/config/cities"

const CACHE_DURATION = 10 * 60 * 1000; // 10 минут

// Компонент для безопасного отображения HTML
const SafeHTML = ({ 
  html, 
  className = "" 
}: { 
  html: string; 
  className?: string 
}) => {
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Функция для удаления SEO-ключей из текста
const removeSeoKeys = (text: string): string => {
  if (!text) return '';
  
  // Удаляем все вхождения [|...|] включая содержимое
  return text.replace(/\[\|.*?\|\]/g, '');
};

// Функция для извлечения SEO-ключей (для мета-тегов)
const extractSeoKeys = (text: string): string[] => {
  if (!text) return [];
  
  const matches = text.match(/\[\|(.*?)\|\]/g);
  if (!matches) return [];
  
  return matches.map(match => 
    match.replace(/\[\|/g, '').replace(/\|\]/g, '').trim()
  ).filter(Boolean);
};

// Функция для проверки, содержит ли текст HTML теги
const containsHTML = (text: string): boolean => {
  return /<[a-z][\s\S]*>/i.test(text);
};

// Функция для форматирования обычного текста с переносами строк
const formatPlainText = (text: string): string => {
  if (!text) return '';
  
  // Сначала удаляем SEO-ключи
  const cleanText = removeSeoKeys(text);
  if (!cleanText.trim()) return '';
  
  // Заменяем переносы строк на параграфы
  const paragraphs = cleanText.split('\n').filter(paragraph => paragraph.trim());
  
  if (paragraphs.length === 0) return '';
  
  // Оборачиваем каждый параграф в тег <p>
  return paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
};

// Функция для очистки и валидации HTML
const sanitizeHTML = (html: string): string => {
  // Сначала удаляем SEO-ключи
  const withoutSeoKeys = removeSeoKeys(html);
  if (!withoutSeoKeys.trim()) return '';
  
  // Разрешаем безопасные HTML теги
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 's', 'b', 'i',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'div', 'span', 'blockquote', 'hr'
  ];
  
  // Удаляем опасные теги и атрибуты, оставляя только разрешенные
  const cleanHTML = withoutSeoKeys.replace(/<(\/?)(\w+)([^>]*)>/gi, (match, slash, tag, attributes) => {
    const lowerTag = tag.toLowerCase();
    
    if (allowedTags.includes(lowerTag)) {
      // Для разрешенных тегов оставляем только базовые атрибуты
      if (['ul', 'ol'].includes(lowerTag)) {
        return `<${slash}${tag}>`;
      }
      return `<${slash}${tag}>`;
    }
    
    // Удаляем неразрешенные теги
    return '';
  });
  
  return cleanHTML;
};

// Функция для замены городских плейсхолдеров
const replaceCityPlaceholders = (text: string, cityData: any): string => {
  if (!text || !cityData) return text || '';
  
  return text
    .replace(/\[city\]/g, cityData.nominative)
    .replace(/\[city-dative\]/g, cityData.dative)
    .replace(/\[city-prepositional\]/g, cityData.prepositional);
};

const LeftInfoProduct = () => {
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [specifications, setSpecifications] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [favoriteState, setFavoriteState] = useState(false);
    const { slug, isCityVersion } = useCity();
    const params = useParams();
    const product_id = params.id as string;

    // Получаем данные города
    const cityData = useMemo(() => {
        if (!isCityVersion) return null;
        return CITY_CASES[slug as keyof typeof CITY_CASES] || null;
    }, [isCityVersion, slug]);

    // Извлеченные SEO-ключи для потенциального использования в мета-тегов
    const seoKeywords = useMemo(() => {
        if (!product?.description) return [];
        return extractSeoKeys(product.description);
    }, [product?.description]);

    // Функция для переключения избранного
    const handleToggleFavorite = useCallback(() => {
        if (!product) return;

        const favoriteItem: Omit<FavoriteItem, 'addedAt'> = {
            id: Number(product.id),
            name: product.name,
            price: product.price,
            image: product.images?.[0]
        };

        const newState = toggleFavorite(favoriteItem);
        setFavoriteState(newState);
    }, [product]);

    // Проверяем, есть ли товар в избранном при загрузке
    useEffect(() => {
        if (product) {
            setFavoriteState(isFavorite(Number(product.id)));
        }
    }, [product]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const now = Date.now();
            const cachedProduct = localStorage.getItem(`cachedProduct${product_id}`);
            const cacheTimestamp = localStorage.getItem(`productCacheTimestamp${product_id}`);
            
            // Параллельная загрузка спецификаций и проверка кэша
            const [specificationData, cachedProductData] = await Promise.allSettled([
                getProductSpecification(Number(product_id)),
                (cachedProduct && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) 
                    ? JSON.parse(cachedProduct) 
                    : null
            ]);

            // Сортируем характеристики по display_order
            if (specificationData.status === 'fulfilled' && specificationData.value) {
                const sortedSpecs = [...specificationData.value].sort((a: any, b: any) => 
                    (a.display_order || 0) - (b.display_order || 0)
                );
                setSpecifications(sortedSpecs);
            } else {
                setSpecifications(null);
            }

            if (cachedProductData.status === 'fulfilled' && cachedProductData.value) {
                setProduct(cachedProductData.value);
                setLoading(false);
                return;
            }

            // Если кэша нет или он устарел, загружаем продукт
            const productData = await getProduct(Number(product_id));
            
            if (productData) {
                setProduct(productData);
                localStorage.setItem(`cachedProduct${product_id}`, JSON.stringify(productData));
                localStorage.setItem(`productCacheTimestamp${product_id}`, now.toString());
            } else {
                throw new Error('Не удалось загрузить товар');
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
            console.error('Ошибка загрузки товара:', err);
        } finally {
            setLoading(false);
        }
    }, [product_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Мемоизированная функция для отображения пустого состояния
    const renderNull = useCallback((item: any) => {
        if (!item || item.length === 0) {
            return (
                <p className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] leading-[1.2]">
                    Нет данных
                </p>
            );
        }
        return null;
    }, []);

    // Мемоизированный скелетон загрузки
    const SkeletonLoader = useMemo(() => ({ 
        width, height, className = "" 
    }: { 
        width?: string; height: string; className?: string 
    }) => (
        <div 
            className={`animate-pulse bg-gray-200 rounded-[5px] ${className}`} 
            style={{ width: width || '100%', height }}
        />
    ), []);

    // Мемоизированная функция для получения названия города
    const getCityName = useCallback(() => {
        if (!isCityVersion) return 'Вся Россия';
        const cityData = CITY_CASES[slug as keyof typeof CITY_CASES];
        return cityData ? cityData.nominative : 'Неизвестный город';
    }, [isCityVersion, slug]);

    // Мемоизированная обработка описания с удалением SEO-ключей и заменой городских плейсхолдеров
    const processedDescription = useMemo(() => {
        if (!product?.description) return '';
        
        const description = product.description.trim();
        
        // Сначала заменяем городские плейсхолдеры
        let processedText = description;
        if (cityData) {
            processedText = replaceCityPlaceholders(description, cityData);
        }
        
        // Если описание содержит HTML теги, очищаем и удаляем SEO-ключи
        if (containsHTML(processedText)) {
            return sanitizeHTML(processedText);
        }
        
        // Если это обычный текст, удаляем SEO-ключи и форматируем
        return formatPlainText(processedText);
    }, [product?.description, cityData]);

    // Мемоизированная обработка названия товара с заменой городских плейсхолдеров
    const processedProductName = useMemo(() => {
        if (!product?.name) return '';
        
        if (cityData) {
            return replaceCityPlaceholders(product.name, cityData);
        }
        
        return product.name;
    }, [product?.name, cityData]);

    // Мемоизированная обработка характеристик с заменой городских плейсхолдеров
    const processedSpecifications = useMemo(() => {
        if (!specifications) return [];
        
        return specifications.map((spec: any) => ({
            ...spec,
            name: cityData ? replaceCityPlaceholders(spec.name, cityData) : spec.name,
            value: cityData ? replaceCityPlaceholders(spec.value, cityData) : spec.value
        })).sort((a: any, b: any) => 
            (a.display_order || 0) - (b.display_order || 0)
        );
    }, [specifications, cityData]);

    // Для отладки - можно посмотреть извлеченные ключи
    useEffect(() => {
        if (seoKeywords.length > 0) {
            console.log('Извлеченные SEO-ключи:', seoKeywords);
            // Здесь можно использовать seoKeywords для мета-тегов
            // Например, добавить в keywords мета-тег
        }
    }, [seoKeywords]);

    if (!product && !loading) return null;

    return (
        <div className="lg:max-w-[610px] md:max-w-[500px] w-full mt-[12px]">
            {/* Заголовок товара - h1 для SEO */}
            <div className="flex gap-[20px]">
                <div className="w-full">
                    {loading ? (
                        <SkeletonLoader height="40px" />
                    ) : (
                        <h1 className="text-black text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] leading-[1.2] font-black">
                            {processedProductName}
                        </h1>
                    )}
                    
                    <div className="mt-[12px] hidden items-center gap-[12px] md:flex">
                        <Button 
                            height={35} 
                            padding="normal" 
                            size="default" 
                            icon={favoriteState ? IoHeart : IoHeartOutline} 
                            name={favoriteState ? "Удалить из избранного" : "Добавить в избранное"} 
                            color={favoriteState ? "red" : "light-gray"} 
                            onClick={handleToggleFavorite}
                        />
                    </div>
                    <div className="mt-[12px] flex items-center gap-[12px] md:hidden">
                        <Button 
                            height={35} 
                            padding="normal" 
                            size="small" 
                            icon={favoriteState ? IoHeart : IoHeartOutline} 
                            name={favoriteState ? "Удалить из избранного" : "Добавить в избранное"} 
                            color={favoriteState ? "red" : "light-gray"} 
                            onClick={handleToggleFavorite}
                        />
                    </div>
                </div>
            </div>

            {/* Изображения товара с alt атрибутами */}
            {loading ? (
                <SkeletonLoader 
                    height="200px" 
                    className="mt-[12px] min-[450px]:h-[350px] lg:h-[400px]" 
                />
            ) : (
                <ProductImages imgs={product?.images} />
            )}

            <div className="md:hidden flex w-full h-[75px]">
                <RightItem />
            </div>
            {/* Расположение - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                {loading ? (
                    <SkeletonLoader height="25px" />
                ) : (
                    <>
                        {getCityName()}
                    </>
                )}
            </div>

            {/* Характеристики - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Характеристики
                </h2>
                {loading ? (
                    <SkeletonLoader height="100px" />
                ) : (
                    <>
                        {renderNull(processedSpecifications)}
                        {processedSpecifications.length > 0 && (
                            <ul className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] leading-[1.2]">
                                {processedSpecifications.map((el: any, index: any) => (
                                    <li key={el.id} className="flex gap-[4px] mb-[6px] items-baseline">
                                        <p className="whitespace-nowrap font-medium">{el.name}:</p>
                                        <p className="text-[var(--grey-text-color)] whitespace-nowrap overflow-hidden text-ellipsis">
                                            {el.value}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>

            {/* Описание - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Описание
                </h2>
                {loading ? (
                    <SkeletonLoader height="100px" />
                ) : (
                    <>
                        {renderNull(product?.description)}
                        {processedDescription && (
                            <div className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] leading-[1.2] description-good">
                                <SafeHTML 
                                    html={processedDescription} 
                                    className="rich-text-content"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Отзывы - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col" id="reviews">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Отзывы
                </h2>
                {loading ? (
                    <SkeletonLoader height="400px" className="mt-[12px]" />
                ) : (
                    <div className="w-full max-h-[485px] overflow-hidden relative">
                        <FeedbackList view={6} />
                    </div>
                )}
            </div>

            {/* Наши работы - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Наши работы
                </h2>
                <ReelsList />
            </div>

            {/* Добавляем стили для форматированного текста */}
            <style jsx global>{`
                .rich-text-content h1 {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin: 1em 0 0.5em 0;
                }
                
                .rich-text-content h2 {
                    font-size: 1.25em;
                    font-weight: bold;
                    margin: 1em 0 0.5em 0;
                }
                
                .rich-text-content h3 {
                    font-size: 1.1em;
                    font-weight: bold;
                    margin: 1em 0 0.5em 0;
                }
                
                .rich-text-content p {
                    margin: 0 0 1em 0;
                    line-height: 1.5;
                }
                
                .rich-text-content ul,
                .rich-text-content ol {
                    padding-left: 1.5em;
                    margin: 1em 0;
                }
                
                .rich-text-content li {
                    margin-bottom: 0.5em;
                    line-height: 1.4;
                }
                
                .rich-text-content blockquote {
                    border-left: 3px solid #ddd;
                    padding-left: 1em;
                    margin: 1em 0;
                    font-style: italic;
                }
                
                .rich-text-content strong {
                    font-weight: bold;
                }
                
                .rich-text-content em {
                    font-style: italic;
                }
                
                .rich-text-content u {
                    text-decoration: underline;
                }
                
                .rich-text-content s {
                    text-decoration: line-through;
                }
                
                .rich-text-content hr {
                    border: none;
                    border-top: 1px solid #ddd;
                    margin: 1.5em 0;
                }
            `}</style>
        </div>
    );
};

=======
"use client"

import { getProduct, getProductSpecification, Product, Specification } from "@/actions/products"
import FeedbackList from "@/features/feedback/FeedbackList"
import ReelsList from "@/features/news/ReelsList"
import RightItem from "@/features/product/right-item/rightItem"
import ProductImages from "@/shared/components/product/ProductImages"
import Button from "@/shared/ui/button/Button"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import { IoHeartOutline, IoHeart } from "react-icons/io5"
import { isFavorite, toggleFavorite, FavoriteItem } from "@/shared/utils/favorites"
import { useCity } from "@/hooks/useCity"
import { CITY_CASES } from "@/config/cities"

const CACHE_DURATION = 10 * 60 * 1000; // 10 минут

// Компонент для безопасного отображения HTML
const SafeHTML = ({ 
  html, 
  className = "" 
}: { 
  html: string; 
  className?: string 
}) => {
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Функция для удаления SEO-ключей из текста
const removeSeoKeys = (text: string): string => {
  if (!text) return '';
  
  // Удаляем все вхождения [|...|] включая содержимое
  return text.replace(/\[\|.*?\|\]/g, '');
};

// Функция для извлечения SEO-ключей (для мета-тегов)
const extractSeoKeys = (text: string): string[] => {
  if (!text) return [];
  
  const matches = text.match(/\[\|(.*?)\|\]/g);
  if (!matches) return [];
  
  return matches.map(match => 
    match.replace(/\[\|/g, '').replace(/\|\]/g, '').trim()
  ).filter(Boolean);
};

// Функция для проверки, содержит ли текст HTML теги
const containsHTML = (text: string): boolean => {
  return /<[a-z][\s\S]*>/i.test(text);
};

// Функция для форматирования обычного текста с переносами строк
const formatPlainText = (text: string): string => {
  if (!text) return '';
  
  // Сначала удаляем SEO-ключи
  const cleanText = removeSeoKeys(text);
  if (!cleanText.trim()) return '';
  
  // Заменяем переносы строк на параграфы
  const paragraphs = cleanText.split('\n').filter(paragraph => paragraph.trim());
  
  if (paragraphs.length === 0) return '';
  
  // Оборачиваем каждый параграф в тег <p>
  return paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
};

// Функция для очистки и валидации HTML
const sanitizeHTML = (html: string): string => {
  // Сначала удаляем SEO-ключи
  const withoutSeoKeys = removeSeoKeys(html);
  if (!withoutSeoKeys.trim()) return '';
  
  // Разрешаем безопасные HTML теги
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 's', 'b', 'i',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'div', 'span', 'blockquote', 'hr'
  ];
  
  // Удаляем опасные теги и атрибуты, оставляя только разрешенные
  const cleanHTML = withoutSeoKeys.replace(/<(\/?)(\w+)([^>]*)>/gi, (match, slash, tag, attributes) => {
    const lowerTag = tag.toLowerCase();
    
    if (allowedTags.includes(lowerTag)) {
      // Для разрешенных тегов оставляем только базовые атрибуты
      if (['ul', 'ol'].includes(lowerTag)) {
        return `<${slash}${tag}>`;
      }
      return `<${slash}${tag}>`;
    }
    
    // Удаляем неразрешенные теги
    return '';
  });
  
  return cleanHTML;
};

// Функция для замены городских плейсхолдеров
const replaceCityPlaceholders = (text: string, cityData: any): string => {
  if (!text || !cityData) return text || '';
  
  return text
    .replace(/\[city\]/g, cityData.genitive || cityData.nominative || '')
    .replace(/\[city-dative\]/g, cityData.dative || cityData.nominative || '')
    .replace(/\[city-prepositional\]/g, cityData.prepositional || cityData.nominative || '');
};

const LeftInfoProduct = () => {
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [specifications, setSpecifications] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [favoriteState, setFavoriteState] = useState(false);
    const { slug, isCityVersion } = useCity();
    const params = useParams();
    const product_id = params.id as string;

    // Получаем данные города
    const cityData = useMemo(() => {
        if (!isCityVersion) return null;
        return CITY_CASES[slug as keyof typeof CITY_CASES] || null;
    }, [isCityVersion, slug]);

    // Извлеченные SEO-ключи для потенциального использования в мета-тегов
    const seoKeywords = useMemo(() => {
        if (!product?.description) return [];
        return extractSeoKeys(product.description);
    }, [product?.description]);

    // Функция для переключения избранного
    const handleToggleFavorite = useCallback(() => {
        if (!product) return;

        const favoriteItem: Omit<FavoriteItem, 'addedAt'> = {
            id: Number(product.id),
            name: product.name,
            price: product.price,
            image: product.images?.[0]
        };

        const newState = toggleFavorite(favoriteItem);
        setFavoriteState(newState);
    }, [product]);

    // Проверяем, есть ли товар в избранном при загрузке
    useEffect(() => {
        if (product) {
            setFavoriteState(isFavorite(Number(product.id)));
        }
    }, [product]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const now = Date.now();
            const cachedProduct = localStorage.getItem(`cachedProduct${product_id}`);
            const cacheTimestamp = localStorage.getItem(`productCacheTimestamp${product_id}`);
            
            // Параллельная загрузка спецификаций и проверка кэша
            const [specificationData, cachedProductData] = await Promise.allSettled([
                getProductSpecification(Number(product_id)),
                (cachedProduct && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) 
                    ? JSON.parse(cachedProduct) 
                    : null
            ]);

            // Сортируем характеристики по display_order
            if (specificationData.status === 'fulfilled' && specificationData.value) {
                const sortedSpecs = [...specificationData.value].sort((a: any, b: any) => 
                    (a.display_order || 0) - (b.display_order || 0)
                );
                setSpecifications(sortedSpecs);
            } else {
                setSpecifications(null);
            }

            if (cachedProductData.status === 'fulfilled' && cachedProductData.value) {
                setProduct(cachedProductData.value);
                setLoading(false);
                return;
            }

            // Если кэша нет или он устарел, загружаем продукт
            const productData = await getProduct(Number(product_id));
            
            if (productData) {
                setProduct(productData);
                localStorage.setItem(`cachedProduct${product_id}`, JSON.stringify(productData));
                localStorage.setItem(`productCacheTimestamp${product_id}`, now.toString());
            } else {
                throw new Error('Не удалось загрузить товар');
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
            console.error('Ошибка загрузки товара:', err);
        } finally {
            setLoading(false);
        }
    }, [product_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Мемоизированная функция для отображения пустого состояния
    const renderNull = useCallback((item: any) => {
        if (!item || item.length === 0) {
            return (
                <p className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] leading-[1.2]">
                    Нет данных
                </p>
            );
        }
        return null;
    }, []);

    // Мемоизированный скелетон загрузки
    const SkeletonLoader = useMemo(() => ({ 
        width, height, className = "" 
    }: { 
        width?: string; height: string; className?: string 
    }) => (
        <div 
            className={`animate-pulse bg-gray-200 rounded-[5px] ${className}`} 
            style={{ width: width || '100%', height }}
        />
    ), []);

    // Мемоизированная функция для получения названия города
    const getCityName = useCallback(() => {
        if (!isCityVersion) return 'Вся Россия';
        const cityData = CITY_CASES[slug as keyof typeof CITY_CASES];
        return cityData ? cityData.nominative : 'Неизвестный город';
    }, [isCityVersion, slug]);

    // Мемоизированная обработка описания с удалением SEO-ключей и заменой городских плейсхолдеров
    const processedDescription = useMemo(() => {
        if (!product?.description) return '';
        
        const description = product.description.trim();
        
        // Сначала заменяем городские плейсхолдеры
        let processedText = description;
        if (cityData) {
            processedText = replaceCityPlaceholders(description, cityData);
        }
        
        // Если описание содержит HTML теги, очищаем и удаляем SEO-ключи
        if (containsHTML(processedText)) {
            return sanitizeHTML(processedText);
        }
        
        // Если это обычный текст, удаляем SEO-ключи и форматируем
        return formatPlainText(processedText);
    }, [product?.description, cityData]);

    // Мемоизированная обработка названия товара с заменой городских плейсхолдеров
    const processedProductName = useMemo(() => {
        if (!product?.name) return '';
        
        if (cityData) {
            return replaceCityPlaceholders(product.name, cityData);
        }
        
        return product.name;
    }, [product?.name, cityData]);

    // Мемоизированная обработка характеристик с заменой городских плейсхолдеров
    const processedSpecifications = useMemo(() => {
        if (!specifications) return [];
        
        return specifications.map((spec: any) => ({
            ...spec,
            name: cityData ? replaceCityPlaceholders(spec.name, cityData) : spec.name,
            value: cityData ? replaceCityPlaceholders(spec.value, cityData) : spec.value
        })).sort((a: any, b: any) => 
            (a.display_order || 0) - (b.display_order || 0)
        );
    }, [specifications, cityData]);

    // Для отладки - можно посмотреть извлеченные ключи
    useEffect(() => {
        if (seoKeywords.length > 0) {
            console.log('Извлеченные SEO-ключи:', seoKeywords);
            // Здесь можно использовать seoKeywords для мета-тегов
            // Например, добавить в keywords мета-тег
        }
    }, [seoKeywords]);

    if (!product && !loading) return null;

    return (
        <div className="lg:max-w-[610px] md:max-w-[500px] w-full mt-[12px]">
            {/* Заголовок товара - h1 для SEO */}
            <div className="flex gap-[20px]">
                <div className="w-full">
                    {loading ? (
                        <SkeletonLoader height="40px" />
                    ) : (
                        <h1 className="text-black text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] leading-[1.2] font-black">
                            {processedProductName}
                        </h1>
                    )}
                    
                    <div className="mt-[12px] hidden items-center gap-[12px] md:flex">
                        <Button 
                            height={35} 
                            padding="normal" 
                            size="default" 
                            icon={favoriteState ? IoHeart : IoHeartOutline} 
                            name={favoriteState ? "Удалить из избранного" : "Добавить в избранное"} 
                            color={favoriteState ? "red" : "light-gray"} 
                            onClick={handleToggleFavorite}
                        />
                    </div>
                    <div className="mt-[12px] flex items-center gap-[12px] md:hidden">
                        <Button 
                            height={35} 
                            padding="normal" 
                            size="small" 
                            icon={favoriteState ? IoHeart : IoHeartOutline} 
                            name={favoriteState ? "Удалить из избранного" : "Добавить в избранное"} 
                            color={favoriteState ? "red" : "light-gray"} 
                            onClick={handleToggleFavorite}
                        />
                    </div>
                </div>
            </div>

            {/* Изображения товара с alt атрибутами */}
            {loading ? (
                <SkeletonLoader 
                    height="200px" 
                    className="mt-[12px] min-[450px]:h-[350px] lg:h-[400px]" 
                />
            ) : (
                <ProductImages imgs={product?.images} />
            )}

            <div className="md:hidden flex w-full h-[75px]">
                <RightItem />
            </div>
            {/* Расположение - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                {loading ? (
                    <SkeletonLoader height="25px" />
                ) : (
                    <>
                        {getCityName()}
                    </>
                )}
            </div>

            {/* Характеристики - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Характеристики
                </h2>
                {loading ? (
                    <SkeletonLoader height="100px" />
                ) : (
                    <>
                        {renderNull(processedSpecifications)}
                        {processedSpecifications.length > 0 && (
                            <ul className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] leading-[1.2]">
                                {processedSpecifications.map((el: any, index: any) => (
                                    <li key={el.id} className="flex gap-[4px] mb-[6px] items-baseline">
                                        <p className="whitespace-nowrap font-medium">{el.name}:</p>
                                        <p className="text-[var(--grey-text-color)] whitespace-nowrap overflow-hidden text-ellipsis">
                                            {el.value}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>

            {/* Описание - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Описание
                </h2>
                {loading ? (
                    <SkeletonLoader height="100px" />
                ) : (
                    <>
                        {renderNull(product?.description)}
                        {processedDescription && (
                            <div className="text-[length:var(--size-mobile-default-text)] md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] leading-[1.2] description-good">
                                <SafeHTML 
                                    html={processedDescription} 
                                    className="rich-text-content"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Отзывы - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col" id="reviews">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Отзывы
                </h2>
                {loading ? (
                    <SkeletonLoader height="400px" className="mt-[12px]" />
                ) : (
                    <div className="w-full max-h-[485px] overflow-hidden relative">
                        <FeedbackList view={6} />
                    </div>
                )}
            </div>

            {/* Наши работы - h2 для иерархии заголовков */}
            <div className="mt-[12px] gap-[8px] flex flex-col">
                <h2 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
                    Наши работы
                </h2>
                <ReelsList />
            </div>

            {/* Добавляем стили для форматированного текста */}
            <style jsx global>{`
                .rich-text-content h1 {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin: 1em 0 0.5em 0;
                }
                
                .rich-text-content h2 {
                    font-size: 1.25em;
                    font-weight: bold;
                    margin: 1em 0 0.5em 0;
                }
                
                .rich-text-content h3 {
                    font-size: 1.1em;
                    font-weight: bold;
                    margin: 1em 0 0.5em 0;
                }
                
                .rich-text-content p {
                    margin: 0 0 1em 0;
                    line-height: 1.5;
                }
                
                .rich-text-content ul,
                .rich-text-content ol {
                    padding-left: 1.5em;
                    margin: 1em 0;
                }
                
                .rich-text-content li {
                    margin-bottom: 0.5em;
                    line-height: 1.4;
                }
                
                .rich-text-content blockquote {
                    border-left: 3px solid #ddd;
                    padding-left: 1em;
                    margin: 1em 0;
                    font-style: italic;
                }
                
                .rich-text-content strong {
                    font-weight: bold;
                }
                
                .rich-text-content em {
                    font-style: italic;
                }
                
                .rich-text-content u {
                    text-decoration: underline;
                }
                
                .rich-text-content s {
                    text-decoration: line-through;
                }
                
                .rich-text-content hr {
                    border: none;
                    border-top: 1px solid #ddd;
                    margin: 1.5em 0;
                }
            `}</style>
        </div>
    );
};

>>>>>>> cd3d847b884b71f64c6011074de35290a904de8a
export default LeftInfoProduct;