"use client"

import { API_BASE_URL } from "@/constant/api-url";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ItemCarouselType {
    imgs: string;
    name: string;
    itemProp?: string;
}

const ItemCarousel: React.FC<ItemCarouselType> = ({
    imgs,
    name,
    itemProp
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [images, setImages] = useState<{img: string}[]>([])

    useEffect(() => {
        const imagesNew = imgs.split(',');
        const list: {img: string}[] = imagesNew.map((el) => {
            return {img: el.trim()}; // trim() убирает лишние пробелы
        });
        setImages(list)
    }, [imgs]) // Добавил imgs в зависимости

    const handleEnter = (index: number) => {
        // Проверяем, что индекс в пределах массива
        if (index >= 0 && index < images.length) {
            setActiveIndex(index);
        }
    }

    const handleLeave = () => {
        setActiveIndex(0); // Возвращаемся к первой фотке
    }

    // Генерация микроразметки для изображений
    const generateImageSchema = () => {
        if (images.length === 0) return null;

        return {
            "@context": "https://schema.org",
            "@type": "ImageObject",
            "contentUrl": `${API_BASE_URL}/uploads/products/${images[activeIndex].img}`,
            "name": name,
            "description": `Изображение товара: ${name}`,
            "representativeOfPage": "true"
        };
    };

    if(images.length === 0) return (
        <div 
            className="md:h-[260px] min-[500px]:h-[180px] h-[120px] min-w-[120px] min-[500px]:min-w-[180px] md:min-w-[240px] flex justify-center items-center rounded-[20px] overflow-hidden relative bg-gray-200"
            aria-label={`${name} - нет изображений`}
        >
            <div className="text-gray-500 text-center p-4">
                Нет изображения
            </div>
        </div>
    )
    
    return (
        <div 
            className="md:h-[260px] min-[500px]:h-[180px] h-[120px] min-w-[120px] min-[500px]:min-w-[180px] md:min-w-[240px] flex justify-center items-center rounded-[20px] overflow-hidden relative"
            itemProp={itemProp}
            itemType="https://schema.org/ImageObject"
        >
            {/* Микроразметка для активного изображения */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateImageSchema()) }}
            />
            
            <ul 
                className="absolute flex z-1 left-0 top-0 w-full h-full cursor-pointer"
                onMouseLeave={handleLeave}
                aria-label="Навигация по изображениям товара"
            >
                {images.map((_, index) => (
                    <li 
                        key={index}
                        className="h-full"
                        style={{
                            width: `${(100 / images.length)}%`
                        }} 
                        onMouseEnter={() => handleEnter(index)}
                        aria-label={`Показать изображение ${index + 1} из ${images.length}`}
                    />
                ))}
            </ul>
            
            {/* Затемненный фон */}
            <div className="absolute top-0 left-0 w-full h-full">
                <Image
                    fill
                    alt={`Фон изображения для ${name}`}
                    src={`${API_BASE_URL}/uploads/products/${images[activeIndex].img}`}
                    className="object-cover brightness-50"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={activeIndex === 0} // Приоритетная загрузка только первого изображения
                    quality={75}
                    aria-hidden="true"
                />
            </div>
            
            {/* Основное изображение */}
            <div className="relative h-full w-full flex justify-center">
                <Image
                    fill
                    alt={images.length > 1 
                        ? `${name} - изображение ${activeIndex + 1} из ${images.length}`
                        : name
                    }
                    src={`${API_BASE_URL}/uploads/products/${images[activeIndex].img}`}
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading={activeIndex === 0 ? "eager" : "lazy"}
                    quality={85}
                    itemProp="contentUrl"
                />
            </div>
            
            {/* Индикатор количества изображений (для доступности) */}
            {images.length > 1 && (
                <div 
                    className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {activeIndex + 1} / {images.length}
                </div>
            )}
            
            {/* Дополнительные мета-теги для микроразметки */}
            <meta itemProp="name" content={name} />
            <meta itemProp="description" content={`Изображение товара: ${name}`} />
        </div>
    )
}

export default ItemCarousel;