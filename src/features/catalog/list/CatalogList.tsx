"use client"

import { Category, getCategories, getCategoriesProducts } from "@/actions/categories";
import { getProductsList, Product } from "@/actions/products";
import ItemCatalog from "@/shared/components/catalog/item/ItemCatalog";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useCity } from '@/hooks/useCity';
import Head from "next/head";
import Modal from "@/shared/ui/modal/Modal";
import Button from "@/shared/ui/button/Button";
import Checkbox from "@/shared/ui/checkbox/Checkbox";
import PhoneInput from "@/shared/ui/phoneInput/PhoneInput";
import ContactsMap from "@/features/contacts/map/ContactsMap";
import { CITY_CASES } from "@/config/cities";

interface CatalogListType {
    all?: boolean;
    category?: boolean;
    admin?: boolean;
}

interface DatabaseFilter {
  id: number;
  name: string;
  values: FilterValue[];
}

interface FilterValue {
  id: number;
  value: string;
  filter_id: number;
  product_ids: string;
  created_at: string;
}

interface UIFilter {
  name: string;
  values: string[];
  selected: string[];
  isExpanded: boolean;
  showAll: boolean;
}

// Компонент карты с примененными фильтрами
const FiltersMap = ({ 
  appliedFilters, 
  currentCity,
  productsCount 
}: { 
  appliedFilters: UIFilter[];
  currentCity: string;
  productsCount: number;
}) => {
  const getCityCoordinates = (city: string) => {
    const cityCoordinates: { [key: string]: [number, number] } = {
      'moscow': [55.7558, 37.6173],
      'barnaul': [53.347, 83.7795],
    };
    
    return cityCoordinates[city] || [55.7558, 37.6173];
  };

  const getCityAddress = (city: string) => {
    const cityNames: { [key: string]: string } = {
      'moscow': 'Москва',
      'barnaul': 'Барнаул',
    };
    
    return cityNames[currentCity] || 'Москва';
  };

  const coordinates = getCityCoordinates(currentCity);
  const address = getCityAddress(currentCity);

  return (
    <div className="w-full rounded-lg overflow-hidden h-[200px] mb-4">
        <ContactsMap 
          coordinates={coordinates} 
          address={address}
          zoom={10}
          height={200}
        />
    </div>
  );
};

// Компонент формы консультации
const ConsultationForm = () => {
  const [phone, setPhone] = useState('+7 (')
  const [check, setCheck] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { slug, isCityVersion } = useCity()

    const getCityInPrepositionalCase = () => {
      if (!isCityVersion || !slug) {
        return "Москве"
      }
      
      const cityData = CITY_CASES[slug as keyof typeof CITY_CASES]
      return cityData ? cityData.dative : "Москве"
    }
    
    const cityPrepositional = getCityInPrepositionalCase()

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!check) {
      alert("Пожалуйста, дайте согласие на обработку персональных данных")
      return
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 11) {
      alert("Пожалуйста, введите корректный номер телефона")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          comment: "",
          city: slug || 'moscow',
          cityName: cityPrepositional,
          type: 'consultation',
          page: "Каталог"
        })
      })

      const result = await response.json()

      if (result.success) {
        alert("Заявка успешно отправлена! Мы перезвоним вам в течение 2 минут.")
        setPhone('+7 (')
        setCheck(false)
      } else {
        console.error('Telegram API error:', result.error)
        alert("Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.")
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert("Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full lg:w-64 rounded-lg p-4 mt-6 border bg-[#F2F1F0] border-gray-200 self-start lg:block hidden">
      <h3 className="font-semibold text-lg text-center mb-2">Нужна консультация?</h3>
      <p className="text-sm text-center text-gray-600 mb-4">
        Закажите обратный звонок и наш специалист подберет автокран под Ваши задачи
        <br />
        <strong>Консультация - БЕСПЛАТНО</strong>
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <PhoneInput 
          phone={phone} 
          setPhone={setPhone} 
          aria-required="true"
          aria-describedby="consultation-phone-help"
        />
        <div id="consultation-phone-help" className="sr-only">
          Введите номер телефона для консультации
        </div>
        
        <Checkbox 
          value={check} 
          setValue={setCheck} 
          name="Согласие на обработку данных" 
          aria-required="true"
          size="smaller"
        />
        
        <Button 
          name="Заказать звонок" 
          weight="bold" 
          size="small" 
          height={35} 
          color="red"
          width="full"
        />
      </form>
    </div>
  )
}

const CatalogList: React.FC<CatalogListType> = ({
    all = true,
    category = true,
    admin = false
}) => {
    const [data, setData] = useState<{
      categories: Category[];
      products: Product[];
      filteredProducts: Product[];
      databaseFilters: DatabaseFilter[];
      uiFilters: UIFilter[];
      appliedFilters: UIFilter[];
    }>({
      categories: [],
      products: [],
      filteredProducts: [],
      databaseFilters: [],
      uiFilters: [],
      appliedFilters: []
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [itemsCount, setItemsCount] = useState(3);
    const [showFilters, setShowFilters] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const params = useParams();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const category_slug = params.category as string;
    const { slug, isCityVersion } = useCity();

    // Эффект для установки mounted состояния
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Получаем текущий город из хука useCity
    const currentCity = useMemo(() => {
        return slug || 'moscow';
    }, [slug]);

    // Проверяем, находимся ли мы на странице каталога
    const isCatalogPage = useMemo(() => {
        if (isCityVersion) {
            return pathname === `/${slug}/catalog` || pathname.startsWith(`/${slug}/catalog/`);
        }
        return pathname === '/catalog' || pathname.startsWith('/catalog/');
    }, [pathname, isCityVersion, slug]);

    // Получаем поисковый запрос из URL параметров
    const searchQuery = useMemo(() => {
        if (!isCatalogPage) return '';
        return searchParams.get('query_search') || '';
    }, [searchParams, isCatalogPage]);

    // Получаем текущую категорию для SEO
    const currentCategory = useMemo(() => {
        return data.categories.find(el => el.slug === category_slug);
    }, [data.categories, category_slug]);

    // Функция для формирования ссылки с учетом города
    const getHrefWithCity = (href: string) => {
      if (isCityVersion) {
        return `/${slug}${href}`;
      }
      return href;
    }

    // Функция для обработки размеров окна
    const updateItemsCount = useCallback(() => {
        if (!isMounted) return;
        
        const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
        const isCatalogRoute = pathname.includes("/catalog");
        
        if (containerWidth >= 1024) {
            setItemsCount(isCatalogRoute ? 3 : 4);
        } else if (containerWidth < 1024 && containerWidth > 768) {
            setItemsCount(3);
        } else if (containerWidth <= 768 && containerWidth > 480) {
            setItemsCount(2);
        } else {
            setItemsCount(1);
        }
    }, [pathname, isMounted]);

    // Эффект для обработки изменения размера окна
    useEffect(() => {
        if (!isMounted) return;
        
        updateItemsCount();
        
        const handleResize = () => {
            updateItemsCount();
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [updateItemsCount, isMounted]);

    // Функция для получения grid классов
    const getGridClasses = useMemo(() => {
        if (!isMounted) return "grid-cols-1";
        
        const isCatalogRoute = pathname.includes("/catalog");
        const width = containerRef.current?.offsetWidth || window.innerWidth;
        
        if (width >= 1024) {
            return isCatalogRoute ? "lg:grid-cols-3" : "lg:grid-cols-4";
        } else if (width < 1024 && width > 768) {
            return "md:grid-cols-3";
        } else if (width <= 768 && width > 480) {
            return "sm:grid-cols-2";
        } else {
            return "grid-cols-1";
        }
    }, [pathname, isMounted]);

    // Функция для загрузки фильтров из базы данных
    const loadDatabaseFilters = useCallback(async (): Promise<DatabaseFilter[]> => {
        try {
            const { getFiltersWithValues } = await import('@/actions/filters');
            return await getFiltersWithValues();
        } catch (error) {
            console.error('Error loading database filters:', error);
            return [];
        }
    }, []);

    // Функция для применения фильтров к продуктам
    const applyFiltersToProducts = useCallback((productsList: Product[] , currentFilters: UIFilter[], databaseFilters: DatabaseFilter[]) => {
        const activeFilters = currentFilters.filter(filter => filter.selected.length > 0);
        
        if (activeFilters.length === 0) {
            return productsList;
        }

        const filtered = productsList.filter(product => {
            return activeFilters.every(filter => {
                const filterData = databaseFilters.find(f => f.name === filter.name);
                if (!filterData) return false;

                const productFilterValues = filterData.values
                    .filter(value => {
                        if (!value.product_ids) return false;
                        const productIds = value.product_ids.split(',').map(id => parseInt(id.trim()));
                        return productIds.includes(product.id);
                    })
                    .map(value => value.value);

                return filter.selected.some(selectedValue => 
                    productFilterValues.includes(selectedValue)
                );
            });
        });

        return filtered;
    }, []);

    // Функция для фильтрации продуктов по поисковому запросу
    const filterProductsBySearch = useCallback((productsList: Product[], query: string) => {
        if (!query.trim() || !isCatalogPage) return productsList;
        
        const lowerQuery = query.toLowerCase().trim();
        return productsList.filter(product => 
            product.name.toLowerCase().includes(lowerQuery) ||
            (product.description && product.description.toLowerCase().includes(lowerQuery))
        );
    }, [isCatalogPage]);

    // ОСНОВНАЯ ФУНКЦИЯ ДЛЯ ЗАГРУЗКИ ДАННЫХ
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Получаем данные параллельно
            const [categoriesData, productsData, filtersData] = await Promise.all([
                getCategories(),
                getProductsList(),
                isCatalogPage ? loadDatabaseFilters() : Promise.resolve([])
            ]);

            // Обогащаем категории количеством продуктов
            const categoriesWithCounts = await Promise.all(
                categoriesData.map(async (el: any) => {
                    try {
                        const categoryProducts = await getCategoriesProducts(el.id);
                        return {
                            ...el,
                            count: categoryProducts.length
                        };
                    } catch (error) {
                        return {
                            ...el,
                            count: 0
                        };
                    }
                })
            );

            let productsToSet: any = productsData;
            if (category_slug) {
                const category = categoriesWithCounts.find(el => el.slug === category_slug);
                if (category) {
                    productsToSet = productsData.filter((el: any) => el.category_id === category.id);
                }
            }

            // Преобразуем фильтры в UI формат
            const uiFiltersData: UIFilter[] = filtersData.map(filter => ({
                name: filter.name,
                values: Array.from(new Set(filter.values.map(v => v.value))).sort(),
                selected: [],
                isExpanded: false,
                showAll: false
            }));

            // Применяем поиск и фильтры
            let filteredProducts: any = productsToSet;
            
            if (searchQuery) {
                filteredProducts = filterProductsBySearch(filteredProducts, searchQuery);
            }
            
            if (isCatalogPage && filtersData.length > 0) {
                filteredProducts = applyFiltersToProducts(filteredProducts, uiFiltersData, filtersData);
            }

            // ОДНОВРЕМЕННО УСТАНАВЛИВАЕМ ВСЕ ДАННЫЕ
            setData({
                categories: categoriesWithCounts,
                products: productsToSet,
                filteredProducts,
                databaseFilters: filtersData,
                uiFilters: uiFiltersData,
                appliedFilters: uiFiltersData
            });
            
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    }, [category_slug, searchQuery, isCatalogPage, loadDatabaseFilters, filterProductsBySearch, applyFiltersToProducts]);

    // ОСНОВНОЙ EFFECT ДЛЯ ЗАГРУЗКИ ДАННЫХ
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // EFFECT ДЛЯ ПРИМЕНЕНИЯ ФИЛЬТРОВ ПРИ ИХ ИЗМЕНЕНИИ
    useEffect(() => {
        if (data.products.length > 0 && data.databaseFilters.length > 0) {
            let result = [...data.products];
            
            if (searchQuery) {
                result = filterProductsBySearch(result, searchQuery);
            }
            
            if (isCatalogPage && data.appliedFilters.some(f => f.selected.length > 0)) {
                result = applyFiltersToProducts(result, data.appliedFilters, data.databaseFilters);
            }
            
            setData(prev => ({
                ...prev,
                filteredProducts: result
            }));
        }
    }, [searchQuery, data.appliedFilters, data.databaseFilters, data.products]);

    useEffect(() => {
        setShowFilters(isCatalogPage && data.uiFilters.length > 0);
    }, [isCatalogPage, data.uiFilters]);

    // Функция для обновления выбранных значений фильтра
    const handleFilterChange = useCallback((filterName: string, value: string, checked: boolean) => {
        setData(prev => ({
            ...prev,
            uiFilters: prev.uiFilters.map(filter => {
                if (filter.name === filterName) {
                    if (checked) {
                        return {
                            ...filter,
                            selected: [...filter.selected, value]
                        };
                    } else {
                        return {
                            ...filter,
                            selected: filter.selected.filter(v => v !== value)
                        };
                    }
                }
                return filter;
            })
        }));
    }, []);

    // Функция для переключения видимости фильтра
    const toggleFilterExpanded = useCallback((filterName: string, event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        setData(prev => ({
            ...prev,
            uiFilters: prev.uiFilters.map(filter => 
                filter.name === filterName 
                    ? { ...filter, isExpanded: !filter.isExpanded }
                    : filter
            )
        }));
    }, []);

    // Функция для показа/скрытия всех значений фильтра
    const toggleShowAll = useCallback((filterName: string, event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        setData(prev => ({
            ...prev,
            uiFilters: prev.uiFilters.map(filter => 
                filter.name === filterName 
                    ? { ...filter, showAll: !filter.showAll }
                    : filter
            )
        }));
    }, []);

    // Функция для сброса всех фильтров
    const resetFilters = useCallback(() => {
        setData(prev => {
            const resetUiFilters = prev.uiFilters.map(filter => ({
                ...filter,
                selected: []
            }));
            
            return {
                ...prev,
                uiFilters: resetUiFilters,
                appliedFilters: resetUiFilters
            };
        });
    }, []);

    // Функция для применения фильтров
    const applyFilters = useCallback(() => {
        setData(prev => ({
            ...prev,
            appliedFilters: [...prev.uiFilters]
        }));
        setShowFiltersModal(false);
    }, []);

    // Функция для отмены фильтров в модальном окне
    const cancelFilters = useCallback(() => {
        setData(prev => ({
            ...prev,
            uiFilters: [...prev.appliedFilters]
        }));
        setShowFiltersModal(false);
    }, []);

    // Ограничиваем количество отображаемых фильтров
    const visibleFilters = useMemo(() => {
        return data.uiFilters.slice(0, 3);
    }, [data.uiFilters]);

    const hasMoreFilters = data.uiFilters.length > 3;
    const hiddenFiltersCount = data.uiFilters.length - 3;

    // Подсчет активных фильтров
    const activeFiltersCount = useMemo(() => {
        return data.appliedFilters.reduce((acc, filter) => acc + filter.selected.length, 0);
    }, [data.appliedFilters]);

    // Проверяем есть ли активные фильтры для отступа
    const hasActiveFilters = useMemo(() => {
        return data.appliedFilters.some(filter => filter.selected.length > 0);
    }, [data.appliedFilters]);

    // Рендер карты с фильтрами
    const renderFiltersMap = useMemo(() => {
        if (!isCatalogPage) return null;
        
        return (
            <FiltersMap 
                appliedFilters={data.appliedFilters}
                currentCity={currentCity}
                productsCount={data.filteredProducts.length}
            />
        );
    }, [isCatalogPage, data.appliedFilters, currentCity, data.filteredProducts.length]);

    // Генерация микроразметки
    const generateBreadcrumbSchema = useMemo(() => {
        const itemListElement = [];
        
        itemListElement.push({
            "@type": "ListItem",
            "position": 1,
            "name": "Главная",
            "item": isCityVersion ? `https://example.com/${slug}` : "https://example.com"
        });
        
        itemListElement.push({
            "@type": "ListItem",
            "position": 2,
            "name": "Каталог",
            "item": isCityVersion ? `https://example.com/${slug}/catalog` : "https://example.com/catalog"
        });
        
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

    const generateProductListSchema = useMemo(() => {
        const productsToUse = data.filteredProducts.length > 0 ? data.filteredProducts : data.products;
        
        if (productsToUse.length === 0) return null;
        
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": searchQuery 
                ? `Результаты поиска: "${searchQuery}"`
                : currentCategory 
                    ? `Товары в категории ${currentCategory.name}` 
                    : "Все товары",
            "description": searchQuery 
                ? `Товары по запросу "${searchQuery}"`
                : currentCategory 
                    ? `Список товаров в категории ${currentCategory.name}` 
                    : "Список всех товаров в каталоге",
            "numberOfItems": productsToUse.length,
            "itemListElement": productsToUse.map((product, index) => ({
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
    }, [data.filteredProducts, data.products, currentCategory, searchQuery]);

    // Рендер заголовка с результатами поиска
    const renderSearchHeader = useMemo(() => {
        if (!isCatalogPage || !searchQuery) return null;
        
        return (
            <div className="w-full mb-6">
                <h2 className="text-lg font-semibold">
                    {data.filteredProducts.length > 0 
                        ? `Найдено ${data.filteredProducts.length} товаров по запросу: "${searchQuery}"`
                        : `По запросу "${searchQuery}" ничего не найдено`
                    }
                </h2>
                {data.filteredProducts.length > 0 && (
                    <Link 
                        href={getHrefWithCity('/catalog')} 
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Показать все товары
                    </Link>
                )}
            </div>
        );
    }, [isCatalogPage, searchQuery, data.filteredProducts.length, getHrefWithCity]);

    // Скелетон загрузки для фильтров
    const FilterSkeleton = () => (
        <div className="w-full lg:w-64 space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            {[...Array(3)].map((_, index) => (
                <div key={index} className="border-b pb-3">
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-2">
                                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    // Компонент для рендера одного фильтра
    const FilterItem = ({ filter }: { filter: UIFilter }) => {
        const displayValues = filter.showAll ? filter.values : filter.values.slice(0, 5);
        const hasMoreValues = filter.values.length > 5;
        
        return (
            <div key={filter.name} className="border-b border-gray-100 pb-3">
                <button
                    onClick={(e) => toggleFilterExpanded(filter.name, e)}
                    className="flex justify-between items-center w-full text-left font-medium mb-2 text-gray-700 hover:text-gray-900 py-1"
                >
                    <span className="text-sm font-medium">{filter.name}</span>
                    <span className={`transform transition-transform ${filter.isExpanded ? 'rotate-180' : ''} text-gray-400`}>
                        ▼
                    </span>
                </button>
                
                {filter.isExpanded && (
                    <div className="space-y-1">
                        <div className="max-h-40 overflow-y-auto">
                            {displayValues.map((value) => (
                                <label key={value} className="flex items-center space-x-2 cursor-pointer py-1 hover:bg-gray-50 px-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={filter.selected.includes(value)}
                                        onChange={(e) => handleFilterChange(filter.name, value, e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="text-sm text-gray-600">{value}</span>
                                </label>
                            ))}
                        </div>
                        
                        {hasMoreValues && (
                            <button
                                onClick={(e) => toggleShowAll(filter.name, e)}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-2 px-1"
                            >
                                {filter.showAll ? 'Скрыть' : `Показать еще ${filter.values.length - 5}`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Рендер фильтров для десктопа
    const renderDesktopFilters = useMemo(() => {
        if (!showFilters) return null;

        if (loading) {
            return <FilterSkeleton />;
        }

        return (
            <div className="w-full lg:block hidden mt-[12px] lg:w-64 space-y-6">
                {/* Блок фильтров */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Фильтры</h3>
                        {activeFiltersCount > 0 && (
                            <button 
                                onClick={resetFilters}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Сбросить
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        {visibleFilters.map((filter) => (
                            <FilterItem key={filter.name} filter={filter} />
                        ))}
                        
                        {hasMoreFilters && (
                            <button
                                onClick={() => setShowFiltersModal(true)}
                                className="w-full py-2 text-center text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                            >
                                Еще {hiddenFiltersCount} фильтр{hiddenFiltersCount > 1 ? 'а' : ''}
                            </button>
                        )}
                        
                        {data.uiFilters.some(f => f.selected.length > 0) && (
                            <button
                                onClick={applyFilters}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Применить ({data.uiFilters.reduce((acc, f) => acc + f.selected.length, 0)})
                            </button>
                        )}
                    </div>
                </div>

                {/* Форма консультации */}
                <ConsultationForm />
            </div>
        );
    }, [
        showFilters, 
        loading, 
        visibleFilters, 
        hasMoreFilters, 
        hiddenFiltersCount, 
        activeFiltersCount, 
        resetFilters, 
        applyFilters, 
        data.uiFilters
    ]);

    // Рендер модального окна с фильтрами
    const renderFiltersModal = useMemo(() => {
        if (!showFiltersModal) return null;

        return (
            <Modal setOpen={setShowFiltersModal} ariaLabel="Фильтры товаров">
                <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                        <h3 className="font-semibold text-xl">Фильтры</h3>
                        <button 
                            onClick={cancelFilters}
                            className="text-gray-500 hover:text-gray-700 text-2xl p-1"
                        >
                            ×
                        </button>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 text-sm">Всего фильтров: {data.uiFilters.length}</span>
                        {data.uiFilters.some(f => f.selected.length > 0) && (
                            <button 
                                onClick={resetFilters}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Сбросить все
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                        {data.uiFilters.map((filter) => (
                            <FilterItem key={filter.name} filter={filter} />
                        ))}
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={cancelFilters}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Применить ({data.uiFilters.reduce((acc, f) => acc + f.selected.length, 0)})
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }, [showFiltersModal, data.uiFilters, resetFilters, applyFilters, cancelFilters]);

    // Рендер списка продуктов
    const renderList = useMemo(() => {
        const productsToRender = data.filteredProducts.length > 0 ? data.filteredProducts : data.products;
        
        const isLoading = loading && data.products.length === 0;

        const isCatalogRoute = pathname.includes("/catalog");
        
        if (isLoading && isMounted) {
            const count = window.innerWidth >= 600 ? 6 : 4;
            return [...Array(count)].map((_, index) => (
                <div 
                    key={index} 
                    className="px-[15px] py-[8px] min-[500px]:h-[200px] h-[200px] md:h-[350px] rounded-[10px] bg-gray-200 animate-pulse"
                    aria-hidden="true"
                />
            ));
        }

        if (productsToRender.length === 0) {
            const hasActiveFilters = data.appliedFilters.some(filter => filter.selected.length > 0);
            
            if (isCatalogPage && searchQuery) {
                return (
                    <div className="col-span-full text-center py-8">
                        <p className="text-[length:var(--size-mobile-large-text)] font-black md:text-[length:var(--size-md-large-text)] lg:text-[length:var(--size-lg-large-text)]">
                            По запросу "{searchQuery}" ничего не найдено
                        </p>
                        <Link 
                            href={getHrefWithCity('/catalog')} 
                            className="text-blue-600 hover:underline mt-4 inline-block"
                        >
                            Вернуться к каталогу
                        </Link>
                    </div>
                );
            }
            
            if (hasActiveFilters) {
                return (
                    <div className="col-span-full text-center py-8">
                        <p className="text-[length:var(--size-mobile-large-text)] font-black md:text-[length:var(--size-md-large-text)] lg:text-[length:var(--size-lg-large-text)] mb-4">
                            По выбранным фильтрам товаров не найдено
                        </p>
                        <button 
                            onClick={resetFilters}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                );
            }
            
            return (
                <div className="col-span-full text-center py-8">
                    <p className="text-[length:var(--size-mobile-large-text)] font-black md:text-[length:var(--size-md-large-text)] lg:text-[length:var(--size-lg-large-text)]">
                        Не найдено техники
                    </p>
                </div>
            );
        }

        // Ограничиваем количество товаров для не-каталога
        const isCatalogRouteForLimit = pathname.includes("/catalog");
        const productsToShow = all ? productsToRender : productsToRender.slice(0, (isCatalogRouteForLimit ? (window.innerWidth >= 600 ? 6 : 3) : (window.innerWidth >= 600 ? 7 : 3)));

        return (
            <>
                {data.appliedFilters.some(f => f.selected.length > 0) && (
                    <div className="col-span-full flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
                        <div className="flex flex-wrap gap-2">
                            <span className="font-medium">Применены фильтры: </span>
                            {data.appliedFilters.map(filter => 
                                filter.selected.map(value => (
                                    <span key={`${filter.name}-${value}`} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                        {filter.name}: {value}
                                    </span>
                                ))
                            )}
                        </div>
                        <button 
                            onClick={resetFilters}
                            className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap ml-4"
                        >
                            Сбросить все
                        </button>
                    </div>
                )}
                
                {productsToShow.map((el) => (
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
    }, [
        loading, 
        data.products, 
        data.filteredProducts, 
        data.appliedFilters,
        all, 
        isCatalogPage, 
        searchQuery, 
        getHrefWithCity,
        resetFilters,
        pathname,
        isMounted
    ]);

    // Скрываем категории на странице поиска
    const shouldShowCategories = useMemo(() => {
        return category && (!isCatalogPage || !searchQuery);
    }, [category, isCatalogPage, searchQuery]);

    // Рендер категорий
    const renderCategory = useMemo(() => {
        if (!shouldShowCategories) return null;

        if (loading) {
            return [...Array(8)].map((_, index) => (
                <div 
                    key={index} 
                    className="px-[15px] py-[8px] md:min-w-[100px] min-w-[80px] lg:min-w-[120px] md:h-[35px] h-[30px] lg:h-[40px] rounded-[10px] bg-gray-200 animate-pulse"
                    aria-hidden="true"
                />
            ));
        }

        return data.categories.map((el) => (
            <Link 
                href={getHrefWithCity(`/catalog/${el.slug}`)} 
                key={el.id}
                aria-label={`Перейти в категорию ${el.name} (${el.count} товаров)`}
            >
                <div className="px-[15px] py-[8px] rounded-[10px] bg-[var(--grey-bg-header-color)] lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] text-white hover:bg-[var(--orange-hover-color)] transition-colors">
                    {el.name} ({el.count})
                </div>
            </Link>
        ));
    }, [shouldShowCategories, loading, data.categories, getHrefWithCity]);

    if (loading) {
        return (
            <div className="w-full">
                <div className="w-full flex flex-wrap gap-[10px] mt-[16px] mb-[20px]">
                    {[...Array(8)].map((_, index) => (
                        <div 
                            key={index} 
                            className="px-[15px] py-[8px] md:min-w-[100px] min-w-[80px] lg:min-w-[120px] md:h-[35px] h-[30px] lg:h-[40px] rounded-[10px] bg-gray-200 animate-pulse"
                            aria-hidden="true"
                        />
                    ))}
                </div>
                <div className={`w-full grid grid-cols-1 sm:grid-cols-2 ${getGridClasses} gap-[20px]`}>
                    {[...Array(6)].map((_, index) => (
                        <div 
                            key={index} 
                            className="px-[15px] py-[8px] min-[500px]:h-[200px] h-[200px] md:h-[350px] rounded-[10px] bg-gray-200 animate-pulse"
                            aria-hidden="true"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>  
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
                {searchQuery && (
                    <title>{`Поиск: "${searchQuery}" - каталог товаров`}</title>
                )}
                {searchQuery && (
                    <meta 
                        name="description" 
                        content={`Результаты поиска по запросу "${searchQuery}". Найдено ${data.filteredProducts.length} товаров в нашем каталоге.`} 
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
            
            {renderSearchHeader}
            
            <div ref={containerRef} className="w-full">
                {shouldShowCategories && (
                    <nav aria-label="Категории товаров">
                        <div className="w-full flex flex-wrap gap-[10px] mt-[16px] mb-[20px]">
                            {renderCategory}
                        </div>
                    </nav>
                )}
                
                <div className="flex flex-col lg:flex-row lg:items-start">
                    {renderDesktopFilters && (
                        <div className="lg:mr-6">
                            {renderDesktopFilters}
                        </div>
                    )}
                    
                    {renderFiltersModal}
                    
                    <section 
                        aria-label={searchQuery ? `Результаты поиска: ${searchQuery}` : "Список товаров"}
                        className="flex-1 min-w-0"
                    >
                        {/* Кнопка фильтров для мобильных - всегда показываем если есть фильтры */}
                        {showFilters && (
                            <div className="lg:hidden mb-4">
                                <button
                                    onClick={() => setShowFiltersModal(true)}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]"
                                >
                                    <span>Фильтры</span>
                                    {activeFiltersCount > 0 && (
                                        <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}
                
                        {/* Карта с примененными фильтрами */}
                        {renderFiltersMap}
                        
                        {/* Список товаров с отступом */}
                        <div className={`w-full grid grid-cols-1 sm:grid-cols-2 ${getGridClasses} gap-[20px] ${hasActiveFilters ? 'mt-3' : 'mt-3'}`}>
                            {renderList}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

export default CatalogList;