import NewsContent from "@/features/news/NewsContent";
import { Metadata } from "next";
import { getNews } from "@/actions/news";
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
    // Получаем данные новости
    const news = await getNews(parseInt(params.id));
    
    if (!news) {
      return {
        title: `Новость не найдена | Аренда спецтехники – СТП Групп`,
        description: `Запрошенная новость не существует или была удалена.`,
      };
    }

    // Формируем метаданные на основе данных новости
    return {
      title: `${news.name} | Новости компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityPrepositional}` : ''}`,
      description: truncateText(news.description, 160),
      keywords: `${news.name}, новости аренда спецтехники ${cityGenitive}, СТП Групп ${cityGenitive}`,
      openGraph: {
        title: news.name,
        description: truncateText(news.description, 160),
        type: "article",
        locale: "ru_RU",
        images: [
          {
            url: `${API_BASE_URL}/uploads/newss/${news.image}`,
            width: 800,
            height: 600,
            alt: news.name,
          },
        ],
        publishedTime: news.created_at ? new Date(news.created_at).toISOString() : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: news.name,
        description: truncateText(news.description, 160),
        images: [`${API_BASE_URL}/uploads/newss/${news.image}`],
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}/news/${params.id}`,
      },
    };
  } catch (error) {
    console.error('Ошибка загрузки новости для метаданных:', error);
    
    // Fallback метаданные
    return {
      title: `Новости компании | Аренда спецтехники – СТП Групп`,
      description: `Актуальные новости и события компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityPrepositional}` : ''}`,
    };
  }
}

// Вспомогательная функция для обрезки текста
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...';
}

export default async function NewsDetailPage({ params }: PageProps) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const city = CITY_CASES[citySlug];
  const cityDative = city.dative;

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
    "dateModified": news.created_at ? new Date(news.created_at).toISOString() : new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "СТП Групп"
    },
    "publisher": {
      "@type": "Organization",
      "name": "СТП Групп",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ваш-сайт.ru/logo.png"
      }
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
                  "name": "Новости",
                  "item": `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}/news`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": news ? news.name : "Новость",
                  "item": `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}/news/${params.id}`
                }
              ]
            })
          }}
        />

        <NewsContent />
      </div>
    </div>
  );
}