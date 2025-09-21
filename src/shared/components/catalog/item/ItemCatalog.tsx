"use client"

import Link from "next/link";
import ItemCarousel from "./ItemCarousel";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useState, useEffect, useCallback, useMemo } from "react";
import { isFavorite, toggleFavorite, FavoriteItem } from "@/shared/utils/favorites";
import { useCity } from '@/hooks/useCity';
import { getProductSpecification, Specification } from "@/actions/products";
import { CITY_CASES } from '@/config/cities'; // Импортируем конфигурацию городов
import { BsGeoAlt } from "react-icons/bs";
import Image from "next/image";
import ImageViewAll from "@/assets/view_all.jpg"

interface ItemCatalogType {
  name?: string;
  price?: number;
  imgs?: string;
  idItem?: number;
  view_count?: number;
  view?: "item" | "go";
  admin?: boolean;
  itemProp?: string;
  itemType?: string;
  position?: number;
}

const ItemCatalog: React.FC<ItemCatalogType> = ({
  name,
  price,
  imgs,
  idItem,
  view,
  admin,
  itemProp,
  itemType,
  position
}) => {
    const [favoriteState, setFavoriteState] = useState(false);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [loadingSpecs, setLoadingSpecs] = useState(false);
    const { slug, isCityVersion } = useCity();

    // Функция для получения названия города
    const getCityName = useCallback(() => {
      if (!isCityVersion) return 'Вся Россия';
      const cityData = CITY_CASES[slug as keyof typeof CITY_CASES];
      return cityData ? cityData.nominative : 'Неизвестный город';
    }, [isCityVersion, slug]);

    // Функция для формирования ссылки с учетом города
    const getHrefWithCity = (href: string) => {
      if (isCityVersion) {
        return `/${slug}${href}`;
      }
      return href;
    }

    // Функция для формирования абсолютного URL
    const getAbsoluteUrl = (path: string) => {
      return `https://ваш-сайт.ru${isCityVersion ? `/${slug}${path}` : path}`;
    }

    // Функция для загрузки характеристик товара
    const fetchSpecifications = useCallback(async () => {
      if (!idItem || view === "go") return;
      
      try {
        setLoadingSpecs(true);
        const specs = await getProductSpecification(idItem);
        setSpecifications(specs || []);
      } catch (error) {
        console.error('Error fetching specifications:', error);
        setSpecifications([]);
      } finally {
        setLoadingSpecs(false);
      }
    }, [idItem, view]);

    // Загружаем характеристики при монтировании компонента
    useEffect(() => {
      if (idItem && view !== "go") {
        fetchSpecifications();
      }
    }, [idItem, view, fetchSpecifications]);

    // Функция для переключения избранного
    const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!idItem || !name || !price) return;

        const favoriteItem: Omit<FavoriteItem, 'addedAt'> = {
            id: idItem,
            name: name,
            price: price,
            image: imgs
        };

        const newState = toggleFavorite(favoriteItem);
        setFavoriteState(newState);
    }, [idItem, name, price, imgs]);

    // Проверяем, есть ли товар в избранном при загрузке
    useEffect(() => {
        if (idItem) {
            setFavoriteState(isFavorite(idItem));
        }
    }, [idItem]);

    const hrefGet = () => {
      if(admin) return getHrefWithCity(`/admin/technika/${idItem}`)
      return getHrefWithCity(`/catalog/product/${idItem}`)
    }

    // Получаем первые две характеристики для отображения
    const displaySpecs = useMemo(() => {
      return specifications.slice(0, 2);
    }, [specifications]);

    // Генерация микроразметки для продукта
    const generateProductSchema = useCallback(() => {
      if (!idItem || !name || !price || view === "go") return null;

      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": name,
        "description": `${name} - доступен для аренды по цене от ${price} руб.`,
        "offers": {
          "@type": "Offer",
          "price": price,
          "priceCurrency": "RUB",
          "availability": "https://schema.org/InStock",
          "url": getAbsoluteUrl(`/catalog/product/${idItem}`)
        },
        "url": getAbsoluteUrl(`/catalog/product/${idItem}`)
      };
    }, [idItem, name, price, isCityVersion, slug]);

    const renderItem = () => {
        if(view === "go") return (
            <Link 
              href={getHrefWithCity("/catalog")}
              aria-label="Посмотреть все товары в каталоге"
            >
                <div 
                  className="min-[500px]:h-[180px] h-[120px] md:h-[260px] bg-[var(--bg-grey-color)] rounded-[20px] text-[white] flex justify-center items-center cursor-pointer lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] relative"
                  itemScope
                  itemType="https://schema.org/ItemList"
                >
                  <Image fill 
                    className="object-cover rounded-[20px] brightness-25"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" alt={'Посмотреть все'} src={ImageViewAll} />
                  <span className="relative z-2">
                    Посмотреть все
                  </span>
                  <meta itemProp="name" content="Все товары в каталоге" />
                </div>
            </Link>
        )
        
        if(imgs && name && price && idItem) return (
          <article 
            itemProp={itemProp}
            itemType={itemType}
            className="flex flex-col"
          >
            {/* Микроразметка для продукта */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(generateProductSchema()) }}
            />
            
            <Link href={hrefGet()} itemProp="url">
              <div className="relative">
                <ItemCarousel 
                  imgs={imgs} 
                  name={name} 
                  itemProp="image" 
                />
              </div>
            </Link>
            
            <div className="flex gap-[12px] mt-[6px] h-full">
              <div className="w-[90%] flex flex-col justify-between">
                <Link href={hrefGet()}>
                  <h3 
                    className="lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] font-semibold cursor-pointer hover:text-[var(--href-hover-color)]"
                    itemProp="name"
                  >
                    {name}
                  </h3>
                </Link>
                
                {/* Блок характеристик */}
                {displaySpecs.length > 0 && (
                  <div className="mt-1 mb-1">
                    {displaySpecs.map((spec: any, index: any) => (
                      <div 
                        key={index} 
                        className="text-xs text-gray-600 line-clamp-1"
                        title={`${spec.name}: ${spec.value}`}
                      >
                        <span className="font-medium">{spec.name}:</span> {spec.value}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Скелетон загрузки характеристик */}
                {loadingSpecs && (
                  <div className="mt-1 mb-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                )}
                
                <div itemProp="offers" itemScope itemType="https://schema.org/Offer" className="flex items-center lg:mt-[0px] mt-[12px] gap-2 justify-between">
                  <p 
                    className="lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] font-black"
                    itemProp="price"
                    content={price.toString()}
                  >
                    От {price} руб.
                  </p>
                  <meta itemProp="priceCurrency" content="RUB" />
                  <meta itemProp="availability" content="https://schema.org/InStock" />
                  <meta itemProp="url" content={getAbsoluteUrl(`/catalog/product/${idItem}`)} />
                </div>
              </div>
              
              <div className="w-[10%] flex justify-start items-end flex-col relative">
                <div 
                  className="p-1 cursor-pointer hover:bg-gray-100 rounded transition-colors"
                  onClick={handleToggleFavorite}
                  aria-label={favoriteState ? `Удалить ${name} из избранного` : `Добавить ${name} в избранное`}
                >
                  {favoriteState ? (
                    <FaHeart size={20} color="#FF4052" aria-hidden="true" />
                  ) : (
                    <FaRegHeart size={20} color="#666" aria-hidden="true" />
                  )}
                </div>
                
                <span className="flex absolute min-w-max right-0 bottom-0 gap-[4px] lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] max-[400px]:text-[length:10px] font-regular items-center"><span className="min-[401px]:hidden"><BsGeoAlt size={12} /></span><span className="max-[401px]:hidden"><BsGeoAlt size={16} /></span>  {getCityName()}</span>
              </div>
            </div>
            
            {/* Дополнительные мета-теги для микроразметки */}
            <meta itemProp="position" content={position ? position.toString() : "1"} />
            <link itemProp="url" href={getAbsoluteUrl(`/catalog/product/${idItem}`)} />
          </article>
        )
    }

    return (
        <>
            {renderItem()}
        </>
    )
}

export default ItemCatalog;