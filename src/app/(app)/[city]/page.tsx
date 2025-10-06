import CategoriesList from "@/features/catalog/categories/CategoriesList";
import { Metadata } from "next";
import Image from "next/image";
import Banner1 from "@/assets/banner1.png"
import Banner2 from "@/assets/banner2.png"
import ContactForm from "@/features/form/ContactForm";
import FeedbackList from "@/features/feedback/FeedbackList";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { LiaFileContractSolid, LiaFileInvoiceDollarSolid } from "react-icons/lia";
import CompaniesList from "@/features/companies/CompaniesList";
import NewsSmallList from "@/features/news/NewsSmallList";
import CatalogList from "@/features/catalog/list/CatalogList";
import ReelsList from "@/features/news/ReelsList";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';
import { 
  getCityInPrepositionalCase, 
  getCityInGenitiveCase, 
  getCityInDativeCase, 
  getCityWithPrepositionV,
  getSeoCityTitle,
  getSeoCityDescription 
} from '@/shared/utils/cityCases';

// Генерируем метаданные с учетом города
export async function generateMetadata({ params }: { params: { city?: string } }) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  
  return {
    title: `СТП Групп ${getSeoCityTitle(citySlug)} | Аренда спецтехники для строительства и грузоперевозок`,
    description: `СТП Групп ${getSeoCityDescription(citySlug)} — аренда спецтехники: экскаваторы, погрузчики, краны и другая строительная техника. Выгодные условия, оперативная доставка, профессиональные машинисты.`,
    keywords: `аренда спецтехники ${getCityInGenitiveCase(citySlug)}, строительная техника ${getCityInGenitiveCase(citySlug)}, аренда экскаватора ${getCityInGenitiveCase(citySlug)}, аренда погрузчика ${getCityInGenitiveCase(citySlug)}, грузоперевозки ${getCityInGenitiveCase(citySlug)}, строительная техника в аренду ${getCityInGenitiveCase(citySlug)}`,
    openGraph: {
      title: `СТП Групп ${getSeoCityTitle(citySlug)} | Аренда спецтехники`,
      description: `Аренда спецтехники для строительства и грузоперевозок ${getCityWithPrepositionV(citySlug)} по лучшим ценам`,
      type: "website",
      locale: "ru_RU",
      // images: [
      //   {
      //     url: 'https://xn----ftb8acaedin.xn--p1ai/og-image.jpg',
      //     width: 1200,
      //     height: 630,
      //     alt: `Аренда спецтехники ${getSeoCityTitle(citySlug)} - СТП Групп`,
      //   },
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
    manifest: "/manifest.json",
    authors: [{ name: "СТП Групп" }],
    publisher: "СТП Групп",
    alternates: {
      canonical: `https://xn----ftb8acaedin.xn--p1ai/${citySlug !== DEFAULT_CITY ? citySlug : ''}`,
      languages: {
        'ru-RU': `https://xn----ftb8acaedin.xn--p1ai/${citySlug !== DEFAULT_CITY ? citySlug : ''}`,
        'x-default': `https://xn----ftb8acaedin.xn--p1ai/vsia_rossia`,
      },
    },
    verification: {
      google: 'ваш-google-verification-code',
      yandex: 'ваш-yandex-verification-code',
    },
  };
}

export default function Home({ params }: { params: { city?: string } }) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const cityDative = getCityInDativeCase(citySlug);
  const cityPrepositional = getCityInPrepositionalCase(citySlug);
  const cityNominative = CITY_CASES[citySlug].nominative;
  
  const renderBannerCity = () => {
    if(cityPrepositional === "России") return "по России"
    return cityPrepositional
  }

  return (
    <>
      {/* JSON-LD структурированные данные */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": `СТП Групп ${getSeoCityTitle(citySlug)}`,
            "description": "Аренда спецтехники для строительства и грузоперевозок",
            "url": `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}`,
            "logo": "https://ваш-сайт.ru/logo.png",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": citySlug !== DEFAULT_CITY ? cityNominative : "Москва",
              "addressCountry": "RU"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+7-930-333-40-46",
              "contactType": "customer service",
              "areaServed": "RU",
              "availableLanguage": "Russian"
            },
            "sameAs": [
              "https://vk.com/ваша-группа",
              "https://t.me/ваш-канал",
            ]
          })
        }}
      />
      
      
      <div className="wrapper">
        <div className="container relative mb-[20px]">
          
          {/* Главный заголовок H1 - теперь видимый, а не скрытый */}
          <h1 className="lg:text-[length:var(--size-lg-heading-text)] md:text-[length:var(--size-md-heading-text)] text-[length:var(--size-mobile-heading-text)] font-black mb-6 sr-only">
            Аренда спецтехники {cityPrepositional} для строительства и грузоперевозок
          </h1>
          
          <CategoriesList />
          
          {/* Баннер с семантическим тегом */}
          <section aria-label="Главный баннер компании" className="mt-[20px] w-full flex justify-between md:flex-row flex-col items-center lg:px-[50px] lg:pt-[40px] lg:pb-[70px] px-[25px] py-[35px] bg-[#E5E9F2] rounded-[40px] relative">
            
            <div className="h-full min-w-max w-full relative flex flex-col md:flex-col z-1">
              <div>
                {/* H2 для основного предложения */}
                <h2 className="lg:text-[length:var(--size-lg-banner-text)] md:text-[length:var(--size-md-banner-text)] text-[length:var(--size-mobile-banner-text)] font-black leading-[1.2]">
                  Гарант решения<br/>Ваших задач
                </h2>
                
                {/* H3 для подзаголовка */}
                <h3 className="lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] break-words mt-[12px] hidden md:flex">
                  Аренда спецтехники {renderBannerCity()} по лучшим ценам
                </h3>
                <h3 className="lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-md-default-text)] break-words mt-[12px] leading-[1.2] md:hidden flex">
                  Аренда спецтехники<br/>{renderBannerCity()} по лучшим ценам
                </h3>
              </div>
              
              {/* Преимущества с семантическим списком */}
              <ul aria-label="Преимущества компании" className="md:mt-[65px] mt-[24px] flex gap-[12px] md:flex-row flex-col">
                <li className="bg-[white] flex lg:justify-center justify-start px-[15px] items-center lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] font-regular rounded-[20px] md:w-[210px] md:h-[60px] lg:w-[240px] lg:h-[70px] w-[180px] h-[45px] gap-[6px] leading-[1]">
                  <IoShieldCheckmarkOutline className="lg:w-[32px] lg:h-[32px] md:w-[26px] md:h-[26px] w-[22px] h-[22px]" aria-hidden="true" />
                  Работаем<br/>по договору
                </li>
                <li className="bg-[white] flex lg:justify-center justify-start px-[15px] items-center lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] font-regular rounded-[20px] md:w-[210px] md:h-[60px] lg:w-[240px] lg:h-[70px] w-[180px] h-[45px] gap-[6px] leading-[1]">
                  <LiaFileInvoiceDollarSolid className="lg:w-[32px] lg:h-[32px] md:w-[26px] md:h-[26px] w-[22px] h-[22px]" aria-hidden="true" />
                  Безналичный расчет<br/>
                  НДС / без НДС
                </li>
                <li className="bg-[white] flex lg:justify-center justify-start px-[15px] items-center lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] font-regular rounded-[20px] md:w-[210px] md:h-[60px] lg:w-[240px] lg:h-[70px] w-[180px] h-[45px] gap-[6px] leading-[1]">
                  <LiaFileContractSolid className="lg:w-[32px] lg:h-[32px] md:w-[26px] md:h-[26px] w-[22px] h-[22px]" aria-hidden="true" />
                  Электронный<br/>
                  Документооборот
                </li>
              </ul>
            </div>
            
            <div className="w-full flex max-h-[454px] h-full justify-end relative">
              <Image 
                className="lg:h-[400px] md:h-[240px] h-[360px] min-w-[520px] md:min-w-[420px] lg:min-w-[680px] w-auto absolute right-[-40px] bottom-[-120px] md:bottom-[-225px] lg:bottom-[-270px] z-0 lg:flex hidden" 
                src={Banner2} 
                alt={`Аренда экскаваторов и погрузчиков ${cityPrepositional} - СТП Групп`} 
                priority
                width={680}
                height={490}
              />
              <Image 
                className="lg:h-[460px] md:h-[360px] h-[360px] min-w-[360px] md:min-w-[360px] lg:min-w-[460px] w-auto absolute right-[-130px] bottom-[-35px] md:bottom-[-169.5px] lg:right-[-150px] lg:bottom-[-223.5px] z-0" 
                src={Banner1} 
                alt={`Аренда строительной техники для грузоперевозок ${cityPrepositional}`} 
                priority
                width={480}
                height={480}
              />
            </div>
          </section>

          {/* Секция с формой обратной связи */}
          <section aria-label="Контактная форма" className="w-full gap-[20px] lg:gap-[70px] md:flex-row flex-col flex items-start mt-[20px]">
            <div className="w-full md:w-[60%] lg:w-[65%] px-[30px] py-[30px] bg-[#F2F1EF] rounded-[40px]">
              <ContactForm />
            </div>
            <div className="w-full md:w-[40%] lg:w-[35%] max-h-[485px] overflow-hidden relative">
              <FeedbackList view={6} />
            </div>
          </section>

          {/* Секция "Наши Партнеры" */}
          <section aria-label="Наши партнеры" className="w-full mt-[20px]">
            <h2 className="font-black lg:text-[length:var(--size-lg-heading-text)] md:text-[length:var(--size-md-heading-text)] text-[length:var(--size-mobile-heading-text)]">Наши Партнеры</h2>
            <CompaniesList />
          </section>

          {/* Секция "Каталог" */}
          <section aria-label="Каталог техники" className="w-full mt-[20px]">
            <h2 className="font-black lg:text-[length:var(--size-lg-heading-text)] md:text-[length:var(--size-md-heading-text)] text-[length:var(--size-mobile-heading-text)]">Каталог техники {cityPrepositional}</h2>
            <CatalogList all={false} />
          </section>

          {/* Секция "Наши работы" */}
          <section aria-label="Наши работы" className="w-full mt-[20px]">
            <h2 className="font-black lg:text-[length:var(--size-lg-heading-text)] md:text-[length:var(--size-md-heading-text)] text-[length:var(--size-mobile-heading-text)]">Наши работы</h2>
            <ReelsList />
          </section>

          {/* Секция "Новости" */}
          <section aria-label="Новости компании" className="w-full mt-[20px]">
            <h2 className="font-black lg:text-[length:var(--size-lg-heading-text)] md:text-[length:var(--size-md-heading-text)] text-[length:var(--size-mobile-heading-text)]">Новости</h2>
            <NewsSmallList />
          </section>
        </div>
      </div>
    </>
  );
}