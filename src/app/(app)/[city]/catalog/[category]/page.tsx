import CategoriesList from "@/features/catalog/categories/CategoriesList";
import CatalogList from "@/features/catalog/list/CatalogList";
import { Metadata } from "next";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';
import { getCategories, Category } from '@/actions/categories';
import { SITE_URL } from "@/constant/api-url";
import { 
  getCityInGenitiveCase, 
  getCityInDativeCase,
  getCityInPrepositionalCase,
  getSeoCityTitle,
  getSeoCityDescription,
} from '@/shared/utils/cityCases';

interface PageProps {
  params: { 
    city?: string;
    category?: string;
  };
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const isDefaultCity = citySlug === DEFAULT_CITY;
  
  const cityGenitive = getCityInGenitiveCase(citySlug);
  const cityPrepositional = getCityInPrepositionalCase(citySlug);
  const seoCityTitle = getSeoCityTitle(citySlug);
  const seoCityDescription = getSeoCityDescription(citySlug);
  
  // Получаем информацию о категории из params
  let categoryName = '';
  let categoryDescription = '';
  
  if (params.category) {
    try {
      // Получаем все категории
      const categories: Category[] = await getCategories();
      
      // Находим категорию по slug
      const category = categories.find(cat => cat.slug === params.category);
      
      if (category) {
        categoryName = category.name;
        categoryDescription = category.name || `Аренда ${category.name.toLowerCase()} ${seoCityDescription} от компании СТП Групп`;
      } else {
        // Если категория не найдена, используем slug как fallback
        categoryName = decodeURIComponent(params.category);
        categoryDescription = `Аренда ${categoryName.toLowerCase()} ${seoCityDescription} от компании СТП Групп`;
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий для метаданных:', error);
      // Fallback: используем slug как название категории
      categoryName = decodeURIComponent(params.category);
      categoryDescription = `Аренда ${categoryName.toLowerCase()} ${seoCityDescription} от компании СТП Групп`;
    }
  }

  const title = categoryName 
    ? `Каталог ${categoryName} | Аренда спецтехники ${seoCityTitle} – СТП Групп`
    : `Каталог спецтехники ${seoCityTitle} | Аренда строительной техники – СТП Групп`;

  const description = categoryName 
    ? categoryDescription
    : `Полный каталог спецтехники для аренды ${seoCityDescription} от компании СТП Групп. Строительная, землеройная, грузовая техника и оборудование.`;

  return {
    title,
    description,
    keywords: categoryName 
      ? `аренда ${categoryName.toLowerCase()} ${cityGenitive}, ${categoryName.toLowerCase()} напрокат ${cityGenitive}, цены на аренду ${categoryName.toLowerCase()} ${cityGenitive}`
      : `аренда спецтехники ${cityGenitive}, каталог спецтехники ${cityGenitive}, строительная техника напрокат ${cityGenitive}, аренда оборудования ${cityGenitive}`,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ru_RU",
      images: [
        {
          url: `${SITE_URL}/og-catalog.jpg`,
          width: 1200,
          height: 630,
          alt: categoryName 
            ? `Аренда ${categoryName.toLowerCase()} ${seoCityTitle} - СТП Групп`
            : `Каталог спецтехники ${seoCityTitle} - СТП Групп`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `${SITE_URL}/${!isDefaultCity ? citySlug : ''}${params.category ? `/catalog/${params.category}` : '/catalog'}`,
    },
  };
}

export default async function Catalog({ params, searchParams }: PageProps) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const isDefaultCity = citySlug === DEFAULT_CITY;
  
  const cityGenitive = getCityInGenitiveCase(citySlug);
  const cityDative = getCityInDativeCase(citySlug);
  const seoCityTitle = getSeoCityTitle(citySlug);
  const seoCityDescription = getSeoCityDescription(citySlug);
  
  let categoryName = '';
  let categoryDescription = '';
  let categories: Category[] = [];
  
  try {
    // Получаем все категории
    categories = await getCategories();
    
    // Находим текущую категорию
    if (params.category) {
      const category = categories.find(cat => cat.slug === params.category);
      if (category) {
        categoryName = category.name;
        categoryDescription = category.name || `Аренда ${category.name.toLowerCase()} ${seoCityDescription}`;
      } else {
        categoryName = decodeURIComponent(params.category);
        categoryDescription = `Аренда ${categoryName.toLowerCase()} ${seoCityDescription}`;
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error);
    // В случае ошибки используем slug как название
    if (params.category) {
      categoryName = decodeURIComponent(params.category);
      categoryDescription = `Аренда ${categoryName.toLowerCase()} ${seoCityDescription}`;
    }
  }

  // Структурированные данные для каталога
  const catalogStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": categoryName 
      ? `Аренда ${categoryName.toLowerCase()} ${seoCityTitle}`
      : `Каталог спецтехники для аренды ${seoCityTitle}`,
    "description": categoryName 
      ? categoryDescription
      : `Аренда строительной, землеройной, грузовой техники и оборудования ${seoCityDescription}`,
    "url": `${SITE_URL}/${!isDefaultCity ? citySlug : ''}${params.category ? `/catalog/${params.category}` : '/catalog'}`,
    "numberOfItems": 50,
    "itemListOrder": "https://schema.org/ItemListUnordered",
  };

  return (
    <div className="wrapper">
      <div className="container pb-[20px]">
        {/* Структурированные данные для каталога */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogStructuredData) }}
        />
        
        <main itemScope itemType="https://schema.org/ItemList">
          {/* Видимый заголовок для категории */}
          {categoryName && (
            <h1 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black mt-[20px] mb-[30px] sr-only">
              {categoryName} {!isDefaultCity ? `в ${cityDative}` : ''}
            </h1>
          )}
          
          {/* Скрытый заголовок для общего каталога */}
          {!categoryName && (
            <h1 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black mt-[20px] mb-[30px] sr-only">
              Каталог спецтехники {!isDefaultCity ? `в ${cityDative}` : ''}
            </h1>
          )}
          
          <meta itemProp="name" content={categoryName 
            ? `Аренда ${categoryName.toLowerCase()} ${seoCityTitle}`
            : `Каталог спецтехники для аренды ${seoCityTitle}`
          } />
          
          <meta itemProp="description" content={categoryName 
            ? categoryDescription
            : `Аренда строительной техники и оборудования ${seoCityDescription} от компании СТП Групп`
          } />
          
          <CategoriesList />
          <CatalogList all={true} category={false} />
        </main>
      </div>
    </div>
  );
}