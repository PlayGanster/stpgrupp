import NewsContent from "@/features/news/NewsContent";
import { Metadata } from "next";
import { getNews } from "@/actions/news";
import { API_BASE_URL, SITE_URL } from "@/constant/api-url";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';
import { 
  getCityInPrepositionalCase, 
  getCityInGenitiveCase, 
  getSeoCityTitle,
  getSeoCityDescription
} from '@/shared/utils/cityCases';

interface PageProps {
  params: { 
    id: string;
    city?: string;
  };
}

// Вспомогательная функция для обрезки текста
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const isDefaultCity = citySlug === DEFAULT_CITY;

  const cityPrepositional = getCityInPrepositionalCase(citySlug);
  const cityGenitive = getCityInGenitiveCase(citySlug);
  const seoCityTitle = getSeoCityTitle(citySlug);
  const seoCityDescription = getSeoCityDescription(citySlug);

  try {
    // Получаем данные новости
    const news = await getNews(parseInt(params.id));
    
    if (!news) {
      return {
        title: `Новость не найдена | Аренда спецтехники ${cityPrepositional} – СТП Групп`,
        description: `Запрошенная новость не существует или была удалена. Аренда спецтехники ${cityPrepositional} от компании СТП Групп.`,
      };
    }

    // Формируем метаданные на основе данных новости
    const title = `${news.name} | Новости компании СТП Групп ${seoCityTitle ? `${seoCityTitle}` : ''}`;
    const description = truncateText(news.description, 160);
    const canonicalUrl = `${SITE_URL}/${!isDefaultCity ? citySlug : ''}/news/${params.id}`;
    const imageUrl = `${API_BASE_URL}/uploads/newss/${news.image}`;

    return {
      title,
      description,
      keywords: `${news.name}, новости аренда спецтехники ${cityGenitive}, СТП Групп ${cityGenitive}, строительная техника ${cityGenitive}`,
      openGraph: {
        title,
        description,
        type: "article",
        locale: "ru_RU",
        url: canonicalUrl,
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: news.name,
          },
        ],
        publishedTime: news.created_at ? new Date(news.created_at).toISOString() : undefined,
        siteName: "СТП Групп",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
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
  } catch (error) {
    console.error('Ошибка загрузки новости для метаданных:', error);
    
    // Fallback метаданные
    return {
      title: `Новости компании | Аренда спецтехники ${cityPrepositional} – СТП Групп`,
      description: `Актуальные новости и события компании СТП Групп ${!isDefaultCity ? seoCityDescription : ''}. Аренда спецтехники с доставкой.`,
    };
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const isDefaultCity = citySlug === DEFAULT_CITY;

  let news = null;
  try {
    news = await getNews(parseInt(params.id));
  } catch (error) {
    console.error('Ошибка загрузки новости:', error);
  }

  // Структурированные данные для новости (JSON-LD)
  const newsStructuredData = news ? {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": news.name,
    "description": truncateText(news.description, 200),
    "image": `${API_BASE_URL}/uploads/newss/${news.image}`,
    "datePublished": news.created_at ? new Date(news.created_at).toISOString() : new Date().toISOString(),
    "dateModified": news.created_at ? new Date(news.created_at).toISOString() : (news.created_at ? new Date(news.created_at).toISOString() : new Date().toISOString()),
    "author": {
      "@type": "Organization",
      "name": "СТП Групп",
      "url": SITE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": "СТП Групп",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${!isDefaultCity ? citySlug : ''}/news/${params.id}`
    }
  } : null;

  return (
    <div className="wrapper">
      <div className="container pb-[20px]">
        {/* Структурированные данные для новости */}
        {newsStructuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(newsStructuredData) }}
          />
        )}
        

        <NewsContent />
      </div>
    </div>
  );
}