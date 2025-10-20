import CategoriesList from "@/features/catalog/categories/CategoriesList";
import { Metadata } from "next";
import Image from "next/image";
import Banner1 from "@/assets/banner1.png"
import Banner2 from "@/assets/banner2.png"
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { LiaFileContractSolid, LiaFileInvoiceDollarSolid } from "react-icons/lia";
import CompaniesList from "@/features/companies/CompaniesList";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';
import { 
  getCityInPrepositionalCase, 
  getCityInGenitiveCase, 
  getCityInDativeCase, 
  getCityWithPrepositionV,
  getSeoCityTitle,
  getSeoCityDescription 
} from '@/shared/utils/cityCases';
import { BsFillPatchCheckFill } from "react-icons/bs";

// Генерируем метаданные для страницы "О компании"
export async function generateMetadata({ params }: { params: { city?: string } }) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  
  return {
    title: `О компании СТП Групп ${getSeoCityTitle(citySlug)} | Аренда спецтехники`,
    description: `СТП Групп ${getSeoCityDescription(citySlug)} — надежный партнер в аренде спецтехники. О компании, наш парк техники и партнеры. Профессиональный подход и качественный сервис.`,
    keywords: `о компании СТП Групп ${getCityInGenitiveCase(citySlug)}, аренда спецтехники ${getCityInGenitiveCase(citySlug)}, строительная техника ${getCityInGenitiveCase(citySlug)}, партнеры компании`,
    openGraph: {
      title: `О компании СТП Групп ${getSeoCityTitle(citySlug)} | Аренда спецтехники`,
      description: `Узнайте больше о компании СТП Групп - аренда спецтехники ${getCityWithPrepositionV(citySlug)}. Наш парк техники и партнеры.`,
      type: "website",
      locale: "ru_RU",
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
      canonical: `https://xn----ftb8acaedin.xn--p1ai/${citySlug !== DEFAULT_CITY ? citySlug : ''}/about`,
    },
  };
}

export default function About({ params }: { params: { city?: string } }) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const cityDative = CITY_CASES[citySlug].dative;
  const cityPrepositional = CITY_CASES[citySlug].prepositional;
  const cityNominative = CITY_CASES[citySlug].nominative;

  return (
    <>
      {/* JSON-LD структурированные данные для страницы "О компании" */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": `О компании СТП Групп ${getSeoCityTitle(citySlug)}`,
            "description": "Информация о компании СТП Групп - аренда спецтехники для строительства и грузоперевозок",
            "url": `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}/about`,
            "publisher": {
              "@type": "Organization",
              "name": "СТП Групп",
              "description": "Аренда спецтехники для строительства и грузоперевозок"
            }
          })
        }}
      />
      
      <div className="wrapper">
        <div className="container relative mb-[20px]">
          
          {/* Главный заголовок H1 для страницы "О компании" */}
          <h1 className="lg:text-[length:var(--size-lg-heading-text)] md:text-[length:var(--size-md-heading-text)] text-[length:var(--size-mobile-heading-text)] font-black mb-3 mt-5 text-center">
            О компании СТП Групп
          </h1>
          
          {/* Баннер с семантическим тегом */}
          <section aria-label="О компании СТП Групп" className="mt-[20px] w-full lg:px-[50px] lg:pt-[40px] lg:pb-[70px] px-[25px] py-[35px] bg-[#E5E9F2] rounded-[40px] relative">
            <h2 className="lg:text-[length:var(--size-lg-banner-text)] md:text-[length:var(--size-md-banner-text)] text-[length:var(--size-mobile-banner-text)] font-extrabold leading-[1.2] relative z-1">СТП-ГРУПП - аренда спецтехники в {cityDative}</h2>
            <p className="lg:text-[length:var(--size-lg-default-text)] max-w-[75%] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] mt-[20px] relative z-1">Компания СТП-ГРУПП предлагает аренду строительной и дорожной спецтехники в {cityDative} и ближайших районах.<br/> Мы обеспечиваем быструю подачу техники, техническую исправность и прозрачные условия аренды</p>
            <p className="lg:text-[length:var(--size-lg-default-text)] max-w-[75%] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] mt-[12px] relative z-1">В нашем парке - экскаваторы, самосвалы, автокраны, бульдозеры, фронтальные погрузчики и другая техника для строительных, земляных и дорожных работ.</p>
            <div className="mt-[20px] flex flex-col gap-[6px] lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] relative z-1">
              <p className="flex gap-[12px] items-center font-bold"><BsFillPatchCheckFill size={18} color="#00AAFF" />Оперативная подача техники на объект</p>
              <p className="flex gap-[12px] items-center font-bold"><BsFillPatchCheckFill size={18} color="#00AAFF" />Исправное и обслуживаемое оборудование</p>
              <p className="flex gap-[12px] items-center font-bold"><BsFillPatchCheckFill size={18} color="#00AAFF" />Аренда с опытными машинистами</p>
              <p className="flex gap-[12px] items-center font-bold"><BsFillPatchCheckFill size={18} color="#00AAFF" />Фиксированные цены и работа по договору</p>
              <p className="flex gap-[12px] items-center font-bold"><BsFillPatchCheckFill size={18} color="#00AAFF" />Круглосуточная поддержка диспетчера</p>
            </div>
              <Image 
                className="lg:h-[460px] md:h-[360px] h-[360px] min-w-[360px] md:min-w-[360px] lg:min-w-[460px] w-auto absolute md:flex hidden right-[-100px] bottom-0 z-0" 
                src={Banner1} 
                alt={`Аренда строительной техники для грузоперевозок ${cityPrepositional}`} 
                priority
                width={480}
                height={480}
              />
          </section>

<section className="mt-[20px]">
  <div className="max-w-full mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {/* Карточка 1 */}
      <div className="group relative bg-[#E5E9F2] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <div className=" p-6 ">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500" />
          <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-500">🚜</div>
          <div className="mb-2">
            <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              120
            </span>
            <span className="text-2xl lg:text-3xl font-bold text-gray-700">+</span>
          </div>
          <div className="text-lg font-semibold text-gray-800 mb-2 leading-tight">
            единиц техники
          </div>
        </div>
        <div className="text-sm h-[70px] pt-[12px] px-6 text-gray-700 font-bold leading-relaxed bg-gradient-to-r from-[#36c96d] to-[#2cd4b3] hover:from-[#2db55c] hover:to-[#24b89c]">
          Обслуженной, исправной и надежной техники
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Карточка 2 */}
      <div className="group relative bg-[#E5E9F2] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
  <div className="p-6">
    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500" />
    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-500">⭐</div>
    <div className="mb-2">
      <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        5
      </span>
      <span className="text-2xl lg:text-3xl font-bold text-gray-700">+ лет</span>
    </div>
    <div className="text-lg font-semibold text-gray-800 mb-2 leading-tight">
      на рынке
    </div>
  </div>
  <div className="text-sm h-[70px] pt-[12px] px-6 text-gray-700 font-bold leading-relaxed bg-gradient-to-r from-[#36c96d] to-[#2cd4b3] hover:from-[#2db55c] hover:to-[#24b89c]">
    Можете довериться нашему многолетнему опыту
  </div>
  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
</div>

{/* Карточка 3 */}
<div className="group relative bg-[#E5E9F2] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
  <div className="p-6">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500" />
    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-500">💬</div>
    <div className="mb-2">
      <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        300
      </span>
      <span className="text-2xl lg:text-3xl font-bold text-gray-700">+</span>
    </div>
    <div className="text-lg font-semibold text-gray-800 mb-2 leading-tight">
      отзывов
    </div>
  </div>
  <div className="text-sm h-[70px] pt-[12px] px-6 text-gray-700 font-bold leading-relaxed bg-gradient-to-r from-[#36c96d] to-[#2cd4b3] hover:from-[#2db55c] hover:to-[#24b89c]">
    Положительных отзывов от живых людей
  </div>
  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
</div>

{/* Карточка 4 */}
<div className="group relative bg-[#E5E9F2] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
  <div className="p-6">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500" />
    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-500">✅</div>
    <div className="mb-2">
      <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        8000
      </span>
      <span className="text-2xl lg:text-3xl font-bold text-gray-700">+</span>
    </div>
    <div className="text-lg font-semibold text-gray-800 mb-2 leading-tight">
      заявок закрыто
    </div>
  </div>
  <div className="text-sm h-[70px] pt-[12px] px-6 text-gray-700 font-bold leading-relaxed bg-gradient-to-r from-[#36c96d] to-[#2cd4b3] hover:from-[#2db55c] hover:to-[#24b89c]">
    Более 80% клиентов возвращаются к нам
  </div>
  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
</div>
    </div>
  </div>
</section>
          
          <CategoriesList />

          {/* Секция "Наши Партнеры" */}
          <section aria-label="Наши партнеры" className="w-full mt-[20px]">
            <h2 className="font-black text-lg md:text-xl lg:text-2xl">Наши Партнеры</h2>
            <CompaniesList />
          </section>

        </div>
      </div>
    </>
  );
}