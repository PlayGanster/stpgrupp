import CategoriesList from "@/features/catalog/categories/CategoriesList";
import CatalogList from "@/features/catalog/list/CatalogList";
import { Metadata } from "next";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';
import { getCategories, Category } from '@/actions/categories'; // Предполагается, что у вас есть этот action

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
  const city = CITY_CASES[citySlug];
  const cityGenitive = city.genitive;
  const cityPrepositional = city.prepositional;
  
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
        categoryDescription = category.name || `Аренда ${category.name.toLowerCase()} ${cityGenitive} от компании СТП Групп`;
      } else {
        // Если категория не найдена, используем slug как fallback
        categoryName = decodeURIComponent(params.category);
        categoryDescription = `Аренда ${categoryName.toLowerCase()} ${cityGenitive} от компании СТП Групп`;
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий для метаданных:', error);
      // Fallback: используем slug как название категории
      categoryName = decodeURIComponent(params.category);
      categoryDescription = `Аренда ${categoryName.toLowerCase()} ${cityGenitive} от компании СТП Групп`;
    }
  }

  const title = categoryName 
    ? `Каталог ${categoryName} | Аренда спецтехники ${cityGenitive} – СТП Групп`
    : `Каталог спецтехники ${cityGenitive} | Аренда строительной техники – СТП Групп`;

  const description = categoryName 
    ? categoryDescription
    : `Полный каталог спецтехники для аренды ${cityGenitive} от компании СТП Групп. Строительная, землеройная, грузовая техника и оборудование.`;

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
          url: 'https://ваш-сайт.ru/og-catalog.jpg',
          width: 1200,
          height: 630,
          alt: categoryName 
            ? `Аренда ${categoryName.toLowerCase()} ${cityGenitive} - СТП Групп`
            : `Каталог спецтехники ${cityGenitive} - СТП Групп`,
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
      canonical: `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}${params.category ? `/catalog/${params.category}` : '/catalog'}`,
    },
  };
}

export default async function Catalog({ params, searchParams }: PageProps) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const city = CITY_CASES[citySlug];
  const cityGenitive = city.genitive;
  const cityPrepositional = city.prepositional;
  
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
        categoryDescription = category.name || `Аренда ${category.name.toLowerCase()} ${cityGenitive}`;
      } else {
        categoryName = decodeURIComponent(params.category);
        categoryDescription = `Аренда ${categoryName.toLowerCase()} ${cityGenitive}`;
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error);
    // В случае ошибки используем slug как название
    if (params.category) {
      categoryName = decodeURIComponent(params.category);
      categoryDescription = `Аренда ${categoryName.toLowerCase()} ${cityGenitive}`;
    }
  }

  // Структурированные данные для каталога
  const catalogStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": categoryName 
      ? `Аренда ${categoryName.toLowerCase()} ${cityGenitive}`
      : `Каталог спецтехники для аренды ${cityGenitive}`,
    "description": categoryName 
      ? categoryDescription
      : `Аренда строительной, землеройной, грузовой техники и оборудования ${cityGenitive}`,
    "url": `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}${params.category ? `/catalog/${params.category}` : '/catalog'}`,
    "numberOfItems": 50, // Примерное количество единиц техники
    "itemListOrder": "https://schema.org/ItemListUnordered",
  };

  // Структурированные данные для навигации
  const breadcrumbStructuredData = {
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
      ...(categoryName ? [{
        "@type": "ListItem",
        "position": 3,
        "name": categoryName,
        "item": `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}/catalog/${params.category}`
      }] : [])
    ]
  };

  return (
    <div className="wrapper">
      <div className="container pb-[20px]">
        {/* Структурированные данные для каталога */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogStructuredData) }}
        />
        
        {/* Структурированные данные для навигации */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
        />

        <main itemScope itemType="https://schema.org/ItemList">
          {/* Видимый заголовок для категории */}
          {categoryName && (
            <h1 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black mt-[20px] mb-[30px] sr-only">
              {categoryName} {citySlug !== DEFAULT_CITY ? `в ${city.dative}` : ''}
            </h1>
          )}
          
          {/* Скрытый заголовок для общего каталога */}
          {!categoryName && (
            <h1 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black mt-[20px] mb-[30px] sr-only">
              Каталог спецтехники {citySlug !== DEFAULT_CITY ? `в ${city.dative}` : ''}
            </h1>
          )}
          
          <meta itemProp="name" content={categoryName 
            ? `Аренда ${categoryName.toLowerCase()} ${cityGenitive}`
            : `Каталог спецтехники для аренды ${cityGenitive}`
          } />
          <meta itemProp="description" content={categoryName 
            ? categoryDescription
            : `Аренда строительной техники и оборудования ${cityGenitive} от компании СТП Групп`
          } />
          
          <CategoriesList />
          <CatalogList all={true} category={false} />
        </main>
      </div>
    </div>
  );
}