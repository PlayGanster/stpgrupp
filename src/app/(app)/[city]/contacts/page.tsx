import { Metadata } from "next";
import ContactsMap from "@/features/contacts/map/ContactsMap";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';
import { SITE_URL } from "@/constant/api-url";
import { 
  getCityInPrepositionalCase, 
  getCityInGenitiveCase, 
  getCityInDativeCase,
  getSeoCityTitle,
  getSeoCityDescription,
} from '@/shared/utils/cityCases';
import ContactForm from "@/features/form/ContactForm";

// Генерируем метаданные с учетом города
export async function generateMetadata({ params }: { params: { city?: string } }): Promise<Metadata> {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const isDefaultCity = citySlug === DEFAULT_CITY;

  const cityPrepositional = getCityInPrepositionalCase(citySlug);
  const cityGenitive = getCityInGenitiveCase(citySlug);
  const cityDative = getCityInDativeCase(citySlug);
  const seoCityTitle = getSeoCityTitle(citySlug);
  const seoCityDescription = getSeoCityDescription(citySlug);

  return {
    title: `Контакты СТП Групп ${seoCityTitle} | Аренда спецтехники – телефон, адрес, реквизиты`,
    description: `Контактная информация СТП Групп ${seoCityDescription}. Телефон, адрес, график работы. Закажите аренду спецтехники с быстрой доставкой ${!isDefaultCity ? seoCityDescription : ''}.`,
    keywords: `контакты СТП Групп ${cityGenitive}, аренда спецтехники ${cityGenitive} телефон, адрес компании спецтехники ${cityGenitive}, заказать аренду техники ${cityGenitive}`,
    openGraph: {
      title: `Контакты СТП Групп ${seoCityTitle}`,
      description: `Контактная информация для заказа аренды спецтехники ${seoCityDescription}. Телефон, адрес, график работы.`,
      type: "website",
      locale: "ru_RU",
      // images: [
      //   {
      //     url: 'https://ваш-сайт.ru/og-contacts.jpg',
      //     width: 1200,
      //     height: 630,
      //     alt: `Контакты СТП Групп ${seoCityTitle}`,
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
    alternates: {
      canonical: `${SITE_URL}/${!isDefaultCity ? citySlug : ''}/contacts`,
    },
  };
}

const getCityContacts = (citySlug: CitySlug) => {
  // Здесь можно получать контакты для конкретного города из API/базы
  // Пока заглушка с возможностью расширения под разные города
  const contactsByCity: Partial<Record<CitySlug, any>> = {
    moscow: {
      phone: "+7 930 333 4046",
      email: "stp.grupp@mail.ru",
      address: `Курганская область, Белозерский район, село Белозерское, ул. Советская, д. 32, кв. 12`,
      workHours: "ПН-ВС 8:00-23:00",
      coordinates: [55.825694, 65.589889] as [number, number]
    },
    // Можно добавить контакты для других городов
  };

  return contactsByCity[citySlug] || contactsByCity.moscow!;
};

export default function ContactsPage({ params }: { params: { city?: string } }) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const isDefaultCity = citySlug === DEFAULT_CITY;
  
  const cityPrepositional = getCityInPrepositionalCase(citySlug);
  const cityDative = getCityInDativeCase(citySlug);
  const cityGenitive = getCityInGenitiveCase(citySlug);
  const cityNominative = CITY_CASES[citySlug]?.nominative || cityDative;
  const seoCityTitle = getSeoCityTitle(citySlug);

  const contactInfo = {
    ...getCityContacts(citySlug),
    company: {
      name: 'ООО "СПЕЦТЕХПАРК ГРУПП"',
      inn: "4500011167",
      ogrn: "1234500005024",
      kpp: "450001001",
      legalAddress: "Курганская область, Белозерский район, село Белозерское, ул. Советская, д. 32, кв. 12"
    },
    social: {
      whatsapp: "+7 (963) 008 1446",
      telegram: "@stpgrupp_official",
      vk: "stpgrupp",
      youtube: "@stpgrupp"
    },
    bank: {
      name: "ПАО СБЕРБАНК",
      bik: "044525225",
      account: "40702810238000141632",
      corrAccount: "30101810400000000225"
    }
  };

  // Структурированные данные для организации
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": `СТП Групп ${seoCityTitle}`,
    "description": "Аренда спецтехники для строительства и грузоперевозок",
    "url": `${SITE_URL}/${!isDefaultCity ? citySlug : ''}`,
    "logo": `${SITE_URL}/logo.png`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": contactInfo.address,
      "addressLocality": !isDefaultCity ? cityNominative : "Курганская область",
      "addressCountry": "RU"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": contactInfo.phone,
      "contactType": "customer service",
      "email": contactInfo.email,
      "areaServed": "RU",
      "availableLanguage": "Russian",
      "hoursAvailable": contactInfo.workHours
    },
    "sameAs": [
      `https://wa.me/${contactInfo.social.whatsapp.replace(/[^0-9+]/g, '')}`,
      `https://t.me/${contactInfo.social.telegram.replace('@', '')}`,
      `https://vk.com/${contactInfo.social.vk}`,
      `https://youtube.com/${contactInfo.social.youtube}`
    ]
  };

  // Структурированные данные для местной бизнес-страницы
  const localBusinessStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `СТП Групп ${seoCityTitle}`,
    "description": "Аренда строительной техники и спецтранспорта",
    "url": `${SITE_URL}/${!isDefaultCity ? citySlug : ''}`,
    "telephone": contactInfo.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": contactInfo.address,
      "addressLocality": !isDefaultCity ? cityNominative : "Курганская область",
      "addressCountry": "RU"
    },
    "openingHours": contactInfo.workHours,
    "priceRange": "$$",
    "areaServed": !isDefaultCity ? cityNominative : "Россия"
  };

  return (
    <div className="wrapper">
      <div className="container pb-[20px]">
        {/* Структурированные данные */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessStructuredData) }}
        />

        <h1 className="mt-[20px] text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black">
          Контакты {seoCityTitle}
        </h1>
        
        {/* Основной контент с картой справа */}
        <div className="mt-[12px] flex flex-col lg:flex-row gap-8">
          {/* Левая часть - текстовая информация (40%) */}
          <div className="lg:w-2/5 ">
            <section itemScope itemType="https://schema.org/ContactPoint">
              <h2 className="text-[18px] md:text-[21px] font-semibold">Контактная информация</h2>
              <div className="mt-4 space-y-3">
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">Телефон:</span> 
                  <a href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`} 
                     className="hover:text-[var(--orange-hover-color)] ml-2"
                     itemProp="telephone">
                    {contactInfo.phone}
                  </a>
                </p>
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">Эл. почта:</span> 
                  <a href={`mailto:${contactInfo.email}`} 
                     className="hover:text-[var(--orange-hover-color)] ml-2"
                     itemProp="email">
                    {contactInfo.email}
                  </a>
                </p>
              </div>
            </section>

            <section className="mt-[20px]">
              <h2 className="text-[18px] md:text-[21px] font-semibold">Социальные сети</h2>
              <div className="mt-4 space-y-3">
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">WhatsApp:</span> 
                  <a href={`https://wa.me/${contactInfo.social.whatsapp.replace(/[^0-9+]/g, '')}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="hover:text-[var(--orange-hover-color)] ml-2">
                    {contactInfo.social.whatsapp}
                  </a>
                </p>
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">Telegram:</span> 
                  <a href={`https://t.me/${contactInfo.social.telegram.replace('@', '')}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="hover:text-[var(--orange-hover-color)] ml-2">
                    {contactInfo.social.telegram}
                  </a>
                </p>
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">ВКонтакте:</span> 
                  <a href={`https://vk.com/${contactInfo.social.vk}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="hover:text-[var(--orange-hover-color)] ml-2">
                    vk.com/{contactInfo.social.vk}
                  </a>
                </p>
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">YouTube:</span> 
                  <a href={`https://youtube.com/${contactInfo.social.youtube}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="hover:text-[var(--orange-hover-color)] ml-2">
                    youtube.com/{contactInfo.social.youtube}
                  </a>
                </p>
              </div>
            </section>

            <section className="mt-[20px]" itemScope itemType="https://schema.org/PostalAddress">
              <h2 className="text-[18px] md:text-[21px] font-semibold">Адрес</h2>
              <div className="mt-4 space-y-3">
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">Адрес: </span> 
                  <span itemProp="streetAddress">{contactInfo.address}</span>
                </p>
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">График работы: </span> 
                  <span itemProp="openingHours">{contactInfo.workHours}</span>
                </p>
              </div>
            </section>

            <section className="mt-[20px]" itemScope itemType="https://schema.org/Organization">
              <h2 className="text-[18px] md:text-[21px] font-semibold">Юридическая информация</h2>
              <div className="mt-4 space-y-3">
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">Название: </span> 
                  <span itemProp="name">{contactInfo.company.name}</span>
                </p>
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">ИНН: </span> 
                  <span itemProp="taxID">{contactInfo.company.inn}</span>
                </p>
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">ОГРН: </span> 
                  <span itemProp="identifier">{contactInfo.company.ogrn}</span>
                </p>
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">КПП: </span> 
                  {contactInfo.company.kpp}
                </p>
                <p className="font-[500] text-[14px] md:text-[16px]">
                  <span className="text-[var(--grey-text-color)]">Юридический адрес: </span> 
                  {contactInfo.company.legalAddress}
                </p>
              </div>
            </section>
          </div>

          {/* Правая часть - карта и форма (60%) */}
          <div className="lg:w-3/5 flex flex-col">
            {/* Карта занимает доступное пространство */}
            <div className="flex-1">
              <ContactsMap coordinates={contactInfo.coordinates} address={contactInfo.address} />
            </div>
            
            {/* Форма под картой */}
            <div className="mt-8  px-[30px] py-[30px] bg-[#F2F1EF] rounded-[40px]">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}