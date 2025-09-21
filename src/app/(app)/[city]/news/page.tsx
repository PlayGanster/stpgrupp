import NewsList from "@/features/news/NewsList";
import { Metadata } from "next";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';

export async function generateMetadata({ params }: { params: { city?: string } }): Promise<Metadata> {
    const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
    const city = CITY_CASES[citySlug];

    const cityDative = city.dative;
    const cityGenitive = city.genitive;
    const cityPrepositional = city.prepositional;

    return {
        title: `Новости компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''} | Аренда спецтехники`,
        description: `Последние новости и события компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityPrepositional}` : ''}. Обновления парка техники, акции на аренду, новые услуги и проекты.`,
        keywords: `новости аренда спецтехники ${cityGenitive}, события СТП Групп ${cityGenitive}, обновления парка техники ${cityGenitive}, акции на аренду ${cityGenitive}`,
        openGraph: {
            title: `Новости компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}`,
            description: `Актуальные новости и события из мира аренды спецтехники ${citySlug !== DEFAULT_CITY ? `в ${cityPrepositional}` : ''}`,
            type: "website",
            locale: "ru_RU",
            // images: [
            //     {
            //         url: 'https://xn----ftb8acaedin.xn--p1ai/og-news.jpg',
            //         width: 1200,
            //         height: 630,
            //         alt: `Новости компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}`,
            //     },
            // ],
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
            canonical: `https://xn----ftb8acaedin.xn--p1ai/${citySlug !== DEFAULT_CITY ? citySlug : ''}/news`,
        },
    };
}

export default function NewsPage({ params }: { params: { city?: string } }) {
    const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
    const city = CITY_CASES[citySlug];
    const cityDative = city.dative;

    // Структурированные данные для страницы новостей
    const newsStructuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Новости компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}`,
        "description": `Актуальные новости и события из мира аренды спецтехники ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}`,
        "url": `https://xn----ftb8acaedin.xn--p1ai/${citySlug !== DEFAULT_CITY ? citySlug : ''}/news`,
        "publisher": {
            "@type": "Organization",
            "name": "СТП Групп",
            "logo": {
                "@type": "ImageObject",
                "url": "https://xn----ftb8acaedin.xn--p1ai/logo.png"
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
                                    "item": `https://xn----ftb8acaedin.xn--p1ai/${citySlug !== DEFAULT_CITY ? citySlug : ''}`
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "Новости",
                                    "item": `https://xn----ftb8acaedin.xn--p1ai/${citySlug !== DEFAULT_CITY ? citySlug : ''}/news`
                                }
                            ]
                        })
                    }}
                />

                <section itemScope itemType="https://schema.org/CollectionPage">
                    <h1 
                        className="mt-[20px] text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black" 
                        itemProp="headline"
                    >
                        Новости {citySlug !== DEFAULT_CITY ? `в ${cityDative}` : 'компании'}
                    </h1>
                    
                    <meta itemProp="description" content={`Актуальные новости и события компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}`} />
                    
                    <NewsList />
                </section>
            </div>
        </div>
    );
}