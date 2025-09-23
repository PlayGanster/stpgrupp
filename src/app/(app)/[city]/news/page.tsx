import NewsList from "@/features/news/NewsList";
import { Metadata } from "next";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';
import { SITE_URL } from "@/constant/api-url";
import { 
  getCityInPrepositionalCase, 
  getCityInGenitiveCase, 
  getCityInDativeCase,
  getSeoCityTitle,
  getSeoCityDescription
} from '@/shared/utils/cityCases';

interface PageProps {
  params: { 
    city?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const isDefaultCity = citySlug === DEFAULT_CITY;

  const cityPrepositional = getCityInPrepositionalCase(citySlug);
  const cityGenitive = getCityInGenitiveCase(citySlug);
  const seoCityTitle = getSeoCityTitle(citySlug);
  const seoCityDescription = getSeoCityDescription(citySlug);

  const title = `Новости компании СТП Групп ${seoCityTitle ? `${seoCityTitle}` : ''} | Аренда спецтехники`;
  const description = `Последние новости и события компании СТП Групп ${!isDefaultCity ? seoCityDescription : ''}. Обновления парка техники, акции на аренду, новые услуги и проекты.`;
  const canonicalUrl = `${SITE_URL}/${!isDefaultCity ? citySlug : ''}/news`;

  return {
    title,
    description,
    keywords: `новости аренда спецтехники ${cityGenitive}, события СТП Групп ${cityGenitive}, обновления парка техники ${cityGenitive}, акции на аренду ${cityGenitive}, строительная техника ${cityGenitive}`,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ru_RU",
      url: canonicalUrl,
      siteName: "СТП Групп",
      images: [
        {
          url: `${SITE_URL}/og-news.jpg`,
          width: 1200,
          height: 630,
          alt: title,
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
      canonical: canonicalUrl,
    },
  };
}

export default function NewsPage({ params }: PageProps) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const isDefaultCity = citySlug === DEFAULT_CITY;
  
  const cityDative = getCityInDativeCase(citySlug);
  const cityPrepositional = getCityInPrepositionalCase(citySlug);
  const seoCityTitle = getSeoCityTitle(citySlug);

  // Структурированные данные для страницы новостей
  const newsStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Новости компании СТП Групп ${seoCityTitle ? `в ${seoCityTitle}` : ''}`,
    "description": `Актуальные новости и события из мира аренды спецтехники ${!isDefaultCity ? cityPrepositional : ''}`,
    "url": `${SITE_URL}/${!isDefaultCity ? citySlug : ''}/news`,
    "publisher": {
      "@type": "Organization",
      "name": "СТП Групп",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    }
  };

  return (
    <div className="wrapper">
      <div className="container">
        {/* Структурированные данные для страницы новостей */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newsStructuredData) }}
        />

        <section itemScope itemType="https://schema.org/CollectionPage">
          <h1 
            className="mt-[20px] text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black" 
            itemProp="headline"
          >
            Новости {!isDefaultCity ? cityPrepositional : 'компании'}
          </h1>
          
          <meta itemProp="description" content={`Актуальные новости и события компании СТП Групп ${!isDefaultCity ? cityPrepositional : ''}`} />
          
          <NewsList />
        </section>
      </div>
    </div>
  );
}