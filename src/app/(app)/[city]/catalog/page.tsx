import CategoriesList from "@/features/catalog/categories/CategoriesList";
import CatalogList from "@/features/catalog/list/CatalogList";
import { Metadata } from "next";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';

interface PageProps {
  params: { 
    city?: string;
  };
  searchParams: {
    category?: string;
    page?: string;
  };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const city = CITY_CASES[citySlug];
  const cityGenitive = city.genitive;
  const cityPrepositional = city.prepositional;
  
  // Получаем информацию о категории, если указана
  const categoryName = searchParams.category ? decodeURIComponent(searchParams.category) : '';

  const title = categoryName 
    ? `Каталог ${categoryName} ${cityGenitive} | Аренда спецтехники – СТП Групп`
    : `Каталог спецтехники ${cityGenitive} | Аренда спецтехники – СТП Групп`;

  const description = categoryName 
    ? `Аренда ${categoryName.toLowerCase()} ${cityGenitive} от компании СТП Групп. Выгодные условия, современная техника, оперативная доставка.`
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
          alt: `Каталог спецтехники ${cityGenitive} - СТП Групп`,
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
      canonical: `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}/catalog${searchParams.category ? `?category=${searchParams.category}` : ''}`,
    },
  };
}

export default function Catalog({ params, searchParams }: PageProps) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const city = CITY_CASES[citySlug];
  const cityGenitive = city.genitive;

  // Структурированные данные для каталога
  const catalogStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Каталог спецтехники для аренды ${cityGenitive}`,
    "description": `Аренда строительной, землеройной, грузовой техники и оборудования ${cityGenitive}`,
    "url": `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}/catalog`,
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
      }
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
          <h1 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black mt-[20px] mb-[30px] sr-only">
            Каталог спецтехники {citySlug !== DEFAULT_CITY ? `в ${city.dative}` : ''}
          </h1>
          
          <meta itemProp="name" content={`Каталог спецтехники для аренды ${cityGenitive}`} />
          <meta itemProp="description" content={`Аренда строительной техники и оборудования ${cityGenitive} от компании СТП Групп`} />
          
          <CategoriesList />
          <CatalogList all={true} category={false} />
        </main>
      </div>
    </div>
  );
}