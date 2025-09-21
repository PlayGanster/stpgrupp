import LeftInfoProduct from "@/features/product/left-info/LeftInfoProduct";
import TopBlockProduct from "@/features/product/top-block/TopBlockProduct";
import RightItem from "@/features/product/right-item/rightItem";
import { Metadata } from "next";
import { getProduct } from "@/actions/products";
import { API_BASE_URL } from "@/constant/api-url";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';

interface PageProps {
  params: { 
    id: string;
    city?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const city = CITY_CASES[citySlug];
  const cityGenitive = city.genitive;
  const cityPrepositional = city.dative;

  try {
    // Получаем данные товара
    const product = await getProduct(parseInt(params.id));
    
    if (!product) {
      return {
        title: `Товар не найден | Аренда спецтехники – СТП Групп`,
        description: `Запрошенный товар не существует или был удален.`,
      };
    }

    // Формируем метаданные на основе данных товара
    return {
      title: `${product.name} - аренда в ${cityPrepositional} | Цена ${product.price} ₽ в час | СТП Групп`,
      description: `Аренда ${product.name.toLowerCase()} в ${cityPrepositional} от ${product.price} ₽ в час. ${truncateText(product.description, 120)} Заказать спецтехнику с доставкой.`,
      keywords: `аренда ${product.name.toLowerCase()} ${cityGenitive}, ${product.name.toLowerCase()} напрокат ${cityGenitive}, цена аренды ${product.name.toLowerCase()} ${cityGenitive}, СТП Групп ${cityGenitive}`,
      openGraph: {
        title: `${product.name} - аренда в ${cityPrepositional} | СТП Групп`,
        description: `Аренда ${product.name.toLowerCase()} в ${cityPrepositional} от ${product.price} ₽ в час. ${truncateText(product.description, 100)}`,
        type: "website", // Используем "website" вместо "product"
        locale: "ru_RU",
        images: [
          {
            url: `${API_BASE_URL}/uploads/products/${getMainImage(product.images)}`,
            width: 800,
            height: 600,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} - аренда в ${cityPrepositional}`,
        description: `Аренда ${product.name.toLowerCase()} в ${cityPrepositional} от ${product.price} ₽ в час. ${truncateText(product.description, 100)}`,
        images: [`${API_BASE_URL}/uploads/products/${getMainImage(product.images)}`],
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}/catalog/${params.id}`,
      },
    };
  } catch (error) {
    console.error('Ошибка загрузки товара для метаданных:', error);
    
    // Fallback метаданные
    return {
      title: `Аренда спецтехники ${citySlug !== DEFAULT_CITY ? `в ${cityPrepositional}` : ''} | СТП Групп`,
      description: `Аренда строительной и специальной техники ${citySlug !== DEFAULT_CITY ? `в ${cityPrepositional}` : ''} по выгодным ценам. Большой парк техники, доставка, опытные операторы.`,
    };
  }
}

// Вспомогательная функция для обрезки текста
function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...';
}

// Функция для получения главного изображения
function getMainImage(imagesString: string): string {
  try {
    const images = JSON.parse(imagesString);
    return Array.isArray(images) && images.length > 0 ? images[0] : '/images/default-product.jpg';
  } catch {
    return imagesString || '/images/default-product.jpg';
  }
}

export default async function ProductPage({ params }: PageProps) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const city = CITY_CASES[citySlug];

  let product = null;
  try {
    product = await getProduct(parseInt(params.id));
  } catch (error) {
    console.error('Ошибка загрузки товара:', error);
  }

  // Структурированные данные для товара (JSON-LD)
  const productStructuredData = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": truncateText(product.description, 200),
    "image": `${API_BASE_URL}/uploads/products/${getMainImage(product.images)}`,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock",
      "areaServed": city.accusative
    },
    "brand": {
      "@type": "Brand",
      "name": "СТП Групп"
    }
  } : null;

  return (
    <div className="wrapper overflow-y-hidden pb-[20px]">
      <div className="container">
        {/* Структурированные данные для товара */}
        {productStructuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
          />
        )}
        
        {/* BreadcrumbList для навигации */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Главная",
                  "item": `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}`
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Каталог техники",
                  "item": `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}/catalog`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": product ? product.name : "Товар",
                  "item": `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}/catalog/${params.id}`
                }
              ]
            })
          }}
        />

        <TopBlockProduct />
        <div className="flex md:gap-[40px] md:flex-row flex-col-reverse">
            <LeftInfoProduct />
            <div className="md:flex hidden"><RightItem /></div>
        </div>
      </div>
    </div>
  );
}