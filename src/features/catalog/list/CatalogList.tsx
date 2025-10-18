"use client"

import { Category, getCategories, getCategoriesProducts } from "@/actions/categories";
import { getProductsList, Product, getProductSpecification, Specification } from "@/actions/products";
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

interface Filter {
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
  appliedFilters: Filter[];
  currentCity: string;
  productsCount: number;
}) => {
  // Определяем координаты для города на основе вашего списка
  const getCityCoordinates = (city: string) => {
    const cityCoordinates: { [key: string]: [number, number] } = {
      'moscow': [55.7558, 37.6173],
      'barnaul': [53.347, 83.7795],
      'arhangelsk': [64.5393, 40.5187],
      'astrahan': [46.3497, 48.0408],
      'ufa': [54.7351, 55.9587],
      'belgorod': [50.5955, 36.5873],
      'bryansk': [53.2436, 34.3634],
      'vladimir': [56.129, 40.4066],
      'volgograd': [48.708, 44.5133],
      'vologda': [59.2205, 39.8915],
      'voronezh': [51.6615, 39.2003],
      'ivanovo': [57.0004, 40.9739],
      'kaluga': [54.5138, 36.2612],
      'kemerovo': [55.3547, 86.0878],
      'kirov': [58.6035, 49.668],
      'syktyvkar': [61.6764, 50.8099],
      'kostroma': [57.7677, 40.9264],
      'novorossiysk': [44.7235, 37.7686],
      'krasnoyarsk': [56.0153, 92.8932],
      'kurgan': [55.441, 65.3411],
      'kursk': [51.7304, 36.1926],
      'lipeck': [52.6088, 39.5992],
      'joshkar-ola': [56.6324, 47.8909],
      'saransk': [54.1874, 45.1839],
      'murmansk': [68.9585, 33.0827],
      'n-novgorod': [56.2965, 43.9361],
      'novosibirsk': [55.0084, 82.9357],
      'omsk': [54.9885, 73.3242],
      'orenburg': [51.7872, 55.1017],
      'orel': [52.9703, 36.0635],
      'penza': [53.1951, 45.0183],
      'perm': [58.0105, 56.2342],
      'rostov-na-donu': [47.2221, 39.7203],
      'taganrog': [47.2362, 38.8969],
      'ryazan': [54.6269, 39.6916],
      'samara': [53.2415, 50.2212],
      'tolyatti': [53.5078, 49.4204],
      'saratov': [51.5924, 45.9608],
      'nizhniy-tagil': [57.9101, 59.9813],
      'tambov': [52.7212, 41.4523],
      'naberezhnye-chelny': [55.7436, 52.3959],
      'tver': [56.8587, 35.9176],
      'tomsk': [56.4846, 84.9482],
      'tula': [54.1931, 37.6173],
      'tyumen': [57.153, 65.5343],
      'tobolsk': [58.1981, 68.2535],
      'izhevsk': [56.8527, 53.2115],
      'ulyanovsk': [54.3142, 48.4031],
      'cheboksary': [56.1463, 47.2511],
      'noviy-urengoy': [66.0833, 76.6333],
      'surgut': [61.2541, 73.3962],
      'chelyabinsk': [55.1644, 61.4368],
      'magnitogorsk': [53.4071, 58.9798],
      'ekaterinburg': [56.8389, 60.6057],
      'kazan': [55.8304, 49.0661],
      'yaroslavl': [57.6261, 39.8845],
    };
    
    return cityCoordinates[city] || [55.7558, 37.6173]; // По умолчанию Москва
  };

  // Получаем адрес для отображения
  const getCityAddress = (city: string) => {
    const cityNames: { [key: string]: string } = {
      'moscow': 'Москва',
      'barnaul': 'Барнаул',
      'arhangelsk': 'Архангельск',
      'astrahan': 'Астрахань',
      'ufa': 'Уфа',
      'belgorod': 'Белгород',
      'bryansk': 'Брянск',
      'vladimir': 'Владимир',
      'volgograd': 'Волгоград',
      'vologda': 'Вологда',
      'voronezh': 'Воронеж',
      'ivanovo': 'Иваново',
      'kaluga': 'Калуга',
      'kemerovo': 'Кемерово',
      'kirov': 'Киров',
      'syktyvkar': 'Сыктывкар',
      'kostroma': 'Кострома',
      'novorossiysk': 'Новороссийск',
      'krasnoyarsk': 'Красноярск',
      'kurgan': 'Курган',
      'kursk': 'Курск',
      'lipeck': 'Липецк',
      'joshkar-ola': 'Йошкар-Ола',
      'saransk': 'Саранск',
      'murmansk': 'Мурманск',
      'n-novgorod': 'Нижний Новгород',
      'novosibirsk': 'Новосибирск',
      'omsk': 'Омск',
      'orenburg': 'Оренбург',
      'orel': 'Орёл',
      'penza': 'Пенза',
      'perm': 'Пермь',
      'rostov-na-donu': 'Ростов-на-Дону',
      'taganrog': 'Таганрог',
      'ryazan': 'Рязань',
      'samara': 'Самара',
      'tolyatti': 'Тольятти',
      'saratov': 'Саратов',
      'nizhniy-tagil': 'Нижний Тагил',
      'tambov': 'Тамбов',
      'naberezhnye-chelny': 'Набережные Челны',
      'tver': 'Тверь',
      'tomsk': 'Томск',
      'tula': 'Тула',
      'tyumen': 'Тюмень',
      'tobolsk': 'Тобольск',
      'izhevsk': 'Ижевск',
      'ulyanovsk': 'Ульяновск',
      'cheboksary': 'Чебоксары',
      'noviy-urengoy': 'Новый Уренгой',
      'surgut': 'Сургут',
      'chelyabinsk': 'Челябинск',
      'magnitogorsk': 'Магнитогорск',
      'ekaterinburg': 'Екатеринбург',
      'kazan': 'Казань',
      'yaroslavl': 'Ярославль',
    };
    
    return cityNames[currentCity] || 'Москва';
  };

  const coordinates = getCityCoordinates(currentCity);
  const address = getCityAddress(currentCity);

  // Формируем описание фильтров
  const getFiltersDescription = () => {
    const activeFilters = appliedFilters.filter(filter => filter.selected.length > 0);
    
    if (activeFilters.length === 0) {
      return `Показаны все ${productsCount} товаров в ${address}`;
    }
    
    const filterDescriptions = activeFilters.map(filter => 
      `${filter.name}: ${filter.selected.join(', ')}`
    );
    
    return `Найдено ${productsCount} товаров по фильтрам: ${filterDescriptions.join('; ')} в ${address}`;
  };

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!check) {
      alert("Пожалуйста, дайте согласие на обработку персональных данных")
      return
    }
    // Логика отправки формы
    console.log("Форма консультации отправлена", { phone })
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
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingFilters, setLoadingFilters] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [itemsCount, setItemsCount] = useState(3);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [appliedFilters, setAppliedFilters] = useState<Filter[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [productSpecifications, setProductSpecifications] = useState<Map<number, Specification[]>>(new Map());
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
        return categories.find(el => el.slug === category_slug);
    }, [categories, category_slug]);

    // Функция для формирования ссылки с учетом города
    const getHrefWithCity = (href: string) => {
      if (isCityVersion) {
        return `/${slug}${href}`;
      }
      return href;
    }

    // УЛУЧШЕННАЯ функция для обработки размеров окна
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

    // УЛУЧШЕННЫЙ эффект для обработки изменения размера окна
    useEffect(() => {
        if (!isMounted) return;
        
        updateItemsCount();
        
        const handleResize = () => {
            updateItemsCount();
        };
        
        let resizeTimeout: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 100);
        };
        
        window.addEventListener('resize', debouncedResize);
        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(resizeTimeout);
        };
    }, [updateItemsCount, isMounted]);

    // УЛУЧШЕННАЯ функция для получения grid классов
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

    // Функция для загрузки характеристик продуктов
    const loadProductSpecifications = useCallback(async (productIds: number[]) => {
        try {
            setLoadingFilters(true);
            const specificationsMap = new Map<number, Specification[]>();
            
            await Promise.all(
                productIds.map(async (productId) => {
                    try {
                        const specs = await getProductSpecification(productId);
                        if (specs && specs.length > 0) {
                            specificationsMap.set(productId, specs);
                        }
                    } catch (error) {
                        console.error(`Error loading specifications for product ${productId}:`, error);
                    }
                })
            );
            
            setProductSpecifications(specificationsMap);
            return specificationsMap;
        } catch (error) {
            console.error('Error loading product specifications:', error);
            return new Map();
        } finally {
            setLoadingFilters(false);
        }
    }, []);

    // Функция для извлечения фильтров из характеристик продуктов
    const extractFiltersFromSpecifications = useCallback((specificationsMap: Map<number, Specification[]>): Filter[] => {
        if (specificationsMap.size === 0) return [];

        const allSpecifications: Map<string, Set<string>> = new Map();
        
        specificationsMap.forEach((specs) => {
            specs.forEach((spec) => {
                if (spec.name && spec.value) {
                    const specName = spec.name.trim();
                    const specValue = spec.value.toString().trim();
                    
                    if (!allSpecifications.has(specName)) {
                        allSpecifications.set(specName, new Set());
                    }
                    allSpecifications.get(specName)!.add(specValue);
                }
            });
        });

        const filters: Filter[] = [];
        allSpecifications.forEach((values, name) => {
            if (values.size > 0) {
                filters.push({
                    name,
                    values: Array.from(values).sort(),
                    selected: [],
                    isExpanded: false,
                    showAll: false
                });
            }
        });

        return filters.sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    // Функция для применения фильтров к продуктам
    const applyFiltersToProducts = useCallback((productsList: Product[], currentFilters: Filter[], specsMap: Map<number, Specification[]>) => {
        const activeFilters = currentFilters.filter(filter => filter.selected.length > 0);
        
        if (activeFilters.length === 0) {
            return productsList;
        }

        const filtered = productsList.filter(product => {
            const productSpecs = specsMap.get(product.id);
            
            if (!productSpecs || productSpecs.length === 0) {
                return false;
            }

            return activeFilters.every(filter => {
                const productSpec = productSpecs.find(
                    (spec) => spec.name?.trim() === filter.name
                );

                if (!productSpec) {
                    return false;
                }

                const productValue = productSpec.value.toString().trim();
                return filter.selected.includes(productValue);
            });
        });

        return filtered;
    }, []);

    // Функция для обновления выбранных значений фильтра
    const handleFilterChange = useCallback((filterName: string, value: string, checked: boolean) => {
        setFilters(prev => prev.map(filter => {
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
        }));
    }, []);

    // Функция для переключения видимости фильтра
    const toggleFilterExpanded = useCallback((filterName: string, event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        setFilters(prev => prev.map(filter => 
            filter.name === filterName 
                ? { ...filter, isExpanded: !filter.isExpanded }
                : filter
        ));
    }, []);

    // Функция для показа/скрытия всех значений фильтра
    const toggleShowAll = useCallback((filterName: string, event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        setFilters(prev => prev.map(filter => 
            filter.name === filterName 
                ? { ...filter, showAll: !filter.showAll }
                : filter
        ));
    }, []);

    // Функция для сброса всех фильтров
    const resetFilters = useCallback(() => {
        const resetFilters = filters.map(filter => ({
            ...filter,
            selected: []
        }));
        setFilters(resetFilters);
        setAppliedFilters(resetFilters);
    }, [filters]);

    // Функция для применения фильтров
    const applyFilters = useCallback(() => {
        setAppliedFilters([...filters]);
        setShowFiltersModal(false);
    }, [filters]);

    // Функция для отмены фильтров в модальном окне
    const cancelFilters = useCallback(() => {
        setFilters([...appliedFilters]);
        setShowFiltersModal(false);
    }, [appliedFilters]);

    // Функция для фильтрации продуктов по поисковому запросу
    const filterProductsBySearch = useCallback((productsList: Product[], query: string) => {
        if (!query.trim() || !isCatalogPage) return productsList;
        
        const lowerQuery = query.toLowerCase().trim();
        return productsList.filter(product => 
            product.name.toLowerCase().includes(lowerQuery) ||
            (product.description && product.description.toLowerCase().includes(lowerQuery))
        );
    }, [isCatalogPage]);

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
                
                let productsToSet = cachedData.data_products;
                
                if (category_slug) {
                    const category = cachedData.data_category.find(el => el.slug === category_slug);
                    if (category) {
                        productsToSet = cachedData.data_products.filter(el => el.category_id === category.id);
                    }
                }
                
                setProducts(productsToSet);
                
                if (isCatalogPage && productsToSet.length > 0) {
                    const specsMap = await loadProductSpecifications(productsToSet.map(p => p.id));
                    const extractedFilters = extractFiltersFromSpecifications(specsMap);
                    setFilters(extractedFilters);
                    setAppliedFilters(extractedFilters);
                    
                    const searchFiltered = filterProductsBySearch(productsToSet, searchQuery);
                    const finalFiltered = applyFiltersToProducts(searchFiltered, extractedFilters, specsMap);
                    setFilteredProducts(finalFiltered);
                } else {
                    const searchFiltered = filterProductsBySearch(productsToSet, searchQuery);
                    setFilteredProducts(searchFiltered);
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

            let productsToSet = productsData;
            if (category_slug) {
                const category = categoriesWithCounts.find(el => el.slug === category_slug);
                if (category) {
                    productsToSet = productsData.filter((el: any) => el.category_id === category.id);
                }
            }

            setProducts(productsToSet);
            
            if (isCatalogPage && productsToSet.length > 0) {
                const specsMap = await loadProductSpecifications(productsToSet.map((p: any) => p.id));
                const extractedFilters = extractFiltersFromSpecifications(specsMap);
                setFilters(extractedFilters);
                setAppliedFilters(extractedFilters);
                
                const searchFiltered = filterProductsBySearch(productsToSet, searchQuery);
                const finalFiltered = applyFiltersToProducts(searchFiltered, extractedFilters, specsMap);
                setFilteredProducts(finalFiltered);
            } else {
                const searchFiltered = filterProductsBySearch(productsToSet, searchQuery);
                setFilteredProducts(searchFiltered);
            }
            
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Не удалось загрузить данные');
            
            const cachedData = getCachedData();
            if (cachedData) {
                setCategories(cachedData.data_category);
                setProducts(cachedData.data_products);
                const searchFiltered = filterProductsBySearch(cachedData.data_products, searchQuery);
                setFilteredProducts(searchFiltered);
            }
        } finally {
            setLoadingCategories(false);
            setLoadingProducts(false);
        }
    }, [
        category_slug, 
        getCachedData, 
        setCacheData, 
        searchQuery, 
        filterProductsBySearch, 
        loadProductSpecifications, 
        extractFiltersFromSpecifications, 
        applyFiltersToProducts, 
        isCatalogPage
    ]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (products.length > 0) {
            let result = [...products];
            
            if (searchQuery) {
                result = filterProductsBySearch(result, searchQuery);
            }
            
            if (isCatalogPage && productSpecifications.size > 0 && appliedFilters.some(f => f.selected.length > 0)) {
                result = applyFiltersToProducts(result, appliedFilters, productSpecifications);
            }
            
            setFilteredProducts(result);
        }
    }, [searchQuery, products, appliedFilters, productSpecifications, filterProductsBySearch, applyFiltersToProducts, isCatalogPage]);

    useEffect(() => {
        setShowFilters(isCatalogPage && filters.length > 0);
    }, [isCatalogPage, filters]);

    // Ограничиваем количество отображаемых фильтров
    const visibleFilters = useMemo(() => {
        return filters.slice(0, 3);
    }, [filters]);

    const hasMoreFilters = filters.length > 3;
    const hiddenFiltersCount = filters.length - 3;

    // Подсчет активных фильтров
    const activeFiltersCount = useMemo(() => {
        return appliedFilters.reduce((acc, filter) => acc + filter.selected.length, 0);
    }, [appliedFilters]);

    // Проверяем есть ли активные фильтры для отступа
    const hasActiveFilters = useMemo(() => {
        return appliedFilters.some(filter => filter.selected.length > 0);
    }, [appliedFilters]);

    // Рендер карты с фильтрами
    const renderFiltersMap = useMemo(() => {
        if (!isCatalogPage) return null;
        
        return (
            <FiltersMap 
                appliedFilters={appliedFilters}
                currentCity={currentCity}
                productsCount={filteredProducts.length}
            />
        );
    }, [isCatalogPage, appliedFilters, currentCity, filteredProducts.length]);

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
        const productsToUse = filteredProducts.length > 0 ? filteredProducts : products;
        
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
    }, [filteredProducts, products, currentCategory, searchQuery]);

    // Рендер заголовка с результатами поиска
    const renderSearchHeader = useMemo(() => {
        if (!isCatalogPage || !searchQuery) return null;
        
        return (
            <div className="w-full mb-6">
                <h2 className="text-lg font-semibold">
                    {filteredProducts.length > 0 
                        ? `Найдено ${filteredProducts.length} товаров по запросу: "${searchQuery}"`
                        : `По запросу "${searchQuery}" ничего не найдено`
                    }
                </h2>
                {filteredProducts.length > 0 && (
                    <Link 
                        href={getHrefWithCity('/catalog')} 
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Показать все товары
                    </Link>
                )}
            </div>
        );
    }, [isCatalogPage, searchQuery, filteredProducts.length, getHrefWithCity]);

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
    const FilterItem = ({ filter }: { filter: Filter }) => {
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

        if (loadingFilters) {
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
                        
                        {filters.some(f => f.selected.length > 0) && (
                            <button
                                onClick={applyFilters}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Применить ({filters.reduce((acc, f) => acc + f.selected.length, 0)})
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
        loadingFilters, 
        visibleFilters, 
        hasMoreFilters, 
        hiddenFiltersCount, 
        activeFiltersCount, 
        resetFilters, 
        applyFilters, 
        filters
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
                        <span className="text-gray-600 text-sm">Всего фильтров: {filters.length}</span>
                        {filters.some(f => f.selected.length > 0) && (
                            <button 
                                onClick={resetFilters}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Сбросить все
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                        {filters.map((filter) => (
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
                            Применить ({filters.reduce((acc, f) => acc + f.selected.length, 0)})
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }, [showFiltersModal, filters, resetFilters, applyFilters, cancelFilters]);

    // Рендер списка продуктов
    const renderList = useMemo(() => {
        const productsToRender = filteredProducts.length > 0 ? filteredProducts : products;
        
        const isLoading = loadingProducts && products.length === 0;

        const isCatalogRoute = pathname.includes("/catalog");
        
        // Количество элементов для скелетона загрузки
        const skeletonCount = isCatalogRoute ? 6 : 8;

        if (isLoading && isMounted) {
            const count = window.innerWidth >= 600 ? skeletonCount : 4;
            return [...Array(count)].map((_, index) => (
                <div 
                    key={index} 
                    className="px-[15px] py-[8px] min-[500px]:h-[200px] h-[200px] md:h-[350px] rounded-[10px] bg-gray-200 animate-pulse"
                    aria-hidden="true"
                />
            ));
        }

        if (productsToRender.length === 0) {
            const hasActiveFilters = appliedFilters.some(filter => filter.selected.length > 0);
            
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
        const productsToShow = all ? productsToRender : productsToRender.slice(0, (isCatalogRouteForLimit ? (window.innerWidth >= 600 ? 6 : 3) : (window.innerWidth >= 600 ? 8 : 4)));

        return (
            <>
                {appliedFilters.some(f => f.selected.length > 0) && (
                    <div className="col-span-full flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
                        <div className="flex flex-wrap gap-2">
                            <span className="font-medium">Применены фильтры: </span>
                            {appliedFilters.map(filter => 
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
        loadingProducts, 
        products, 
        filteredProducts, 
        all, 
        isCatalogPage, 
        searchQuery, 
        getHrefWithCity,
        appliedFilters,
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
                <div className="px-[15px] py-[8px] rounded-[10px] bg-[var(--grey-bg-header-color)] lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] text-white hover:bg-[var(--orange-hover-color)] transition-colors">
                    {el.name} ({el.count})
                </div>
            </Link>
        ));
    }, [shouldShowCategories, loadingCategories, categories, getHrefWithCity]);

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
                        content={`Результаты поиска по запросу "${searchQuery}". Найдено ${filteredProducts.length} товаров в нашем каталоге.`} 
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
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)]"
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