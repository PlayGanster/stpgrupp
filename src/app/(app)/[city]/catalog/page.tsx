import CategoriesList from "@/features/catalog/categories/CategoriesList";
import CatalogList from "@/features/catalog/list/CatalogList";
import { Metadata } from "next";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';
import { SITE_URL } from "@/constant/api-url";
import { 
  getCityInGenitiveCase, 
  getCityInDativeCase,
  getSeoCityTitle,
  getSeoCityDescription,
} from '@/shared/utils/cityCases';

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
  const isDefaultCity = citySlug === DEFAULT_CITY;
  
  const cityGenitive = getCityInGenitiveCase(citySlug);
  const seoCityTitle = getSeoCityTitle(citySlug);
  const seoCityDescription = getSeoCityDescription(citySlug);
  
  // Получаем информацию о категории, если указана
  const categoryName = searchParams.category ? decodeURIComponent(searchParams.category) : '';

  const title = categoryName 
    ? `Каталог ${categoryName} ${seoCityTitle} | Аренда спецтехники – СТП Групп`
    : `Каталог спецтехники ${seoCityTitle} | Аренда спецтехники – СТП Групп`;

  const description = categoryName 
    ? `Аренда ${categoryName.toLowerCase()} ${seoCityDescription} от компании СТП Групп. Выгодные условия, современная техника, оперативная доставка.`
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
          alt: `Каталог спецтехники ${seoCityTitle} - СТП Групп`,
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
      canonical: `${SITE_URL}/${!isDefaultCity ? citySlug : ''}/catalog${searchParams.category ? `?category=${searchParams.category}` : ''}`,
    },
  };
}

export default function Catalog({ params, searchParams }: PageProps) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const isDefaultCity = citySlug === DEFAULT_CITY;
  
  const cityGenitive = getCityInGenitiveCase(citySlug);
  const cityDative = getCityInDativeCase(citySlug);
  const seoCityTitle = getSeoCityTitle(citySlug);
  const seoCityDescription = getSeoCityDescription(citySlug);

  // Структурированные данные для каталога
  const catalogStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Каталог спецтехники для аренды ${seoCityTitle}`,
    "description": `Аренда строительной, землеройной, грузовой техники и оборудования ${seoCityDescription}`,
    "url": `${SITE_URL}/${!isDefaultCity ? citySlug : ''}/catalog`,
    "numberOfItems": 50, // Примерное количество единиц техники
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
          <h1 className="text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black mt-[20px] mb-[30px] sr-only">
            Каталог спецтехники {!isDefaultCity ? `в ${cityDative}` : ''}
          </h1>
          
          <meta itemProp="name" content={`Каталог спецтехники для аренды ${seoCityTitle}`} />
          <meta itemProp="description" content={`Аренда строительной техники и оборудования ${seoCityDescription} от компании СТП Групп`} />
          
          <CategoriesList />
          <CatalogList all={true} category={false} />
        </main>
      </div>
    </div>
  );
}