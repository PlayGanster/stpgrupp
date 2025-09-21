import { Metadata } from "next";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';
import Link from "next/link";

// Генерируем метаданные с учетом города
export async function generateMetadata({ params }: { params: { city?: string } }): Promise<Metadata> {
    const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
    const city = CITY_CASES[citySlug];

    const cityDative = city.dative;
    const cityGenitive = city.genitive;

    return {
        title: `Вакансии в компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''} | Работа на спецтехнике`,
        description: `Актуальные вакансии для машинистов и водителей спецтехники ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}. Работа на автокранах, экскаваторах, самосвалах. Стабильная зарплата.`,
        keywords: `вакансии машинист автокрана ${cityGenitive}, работа водитель самосвала ${cityGenitive}, вакансии машинист экскаватора ${cityGenitive}, работа на спецтехнике ${cityGenitive}, СТП Групп вакансии ${cityGenitive}`,
        openGraph: {
            title: `Вакансии в компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}`,
            description: `Работа для машинистов и водителей спецтехники ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}. Стабильные условия и своевременные выплаты.`,
            type: "website",
            locale: "ru_RU",
            images: [
                {
                    url: 'https://ваш-сайт.ru/og-vacancies.jpg',
                    width: 1200,
                    height: 630,
                    alt: `Вакансии в компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}`,
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
            canonical: `https://ваш-сайт.ru/${citySlug !== DEFAULT_CITY ? citySlug : ''}/vacancies`,
        },
    };
}

// Функция для замены плейсхолдеров в тексте вакансий
function replaceCityPlaceholders(text: string, cityData: typeof CITY_CASES[CitySlug]): string {
    return text.replace(/\[city\]/g, cityData.prepositional)
               .replace(/\[city-dative\]/g, cityData.dative)
               .replace(/\[city-genitive\]/g, cityData.genitive);
}

export default function VacanciesPage({ params }: { params: { city?: string } }) {
    const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
    const city = CITY_CASES[citySlug];
    const cityDative = city.dative;

    // Структурированные данные для вакансий
    const vacanciesStructuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Вакансии в компании СТП Групп ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}`,
        "description": `Актуальные вакансии для работы на спецтехнике ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}`,
        "numberOfItems": 4,
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "item": {
                    "@type": "JobPosting",
                    "title": "Машинист автокрана 90 т",
                    "description": "Требуется машинист автокрана 90 т. Работа на автокранах Zoomlion, XCMG. Обязательно иметь удостоверение машиниста автокрана – 8 разряда. Опыт работы не менее 3-х лет.",
                    "hiringOrganization": {
                        "@type": "Organization",
                        "name": "СТП Групп",
                        "sameAs": "https://ваш-сайт.ru"
                    },
                    "jobLocation": {
                        "@type": "Place",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": citySlug !== DEFAULT_CITY ? city.nominative : "Москва"
                        }
                    },
                    "employmentType": "FULL_TIME",
                    "qualifications": "Удостоверение машиниста автокрана 8 разряда, опыт работы от 3 лет",
                    "responsibilities": "Бережное отношение к технике, соблюдение правил ОТ и ТБ, работа на автокранах Zoomlion и XCMG"
                }
            },
            // Аналогично для остальных вакансий...
        ]
    };

    return (
        <div className="wrapper">
            <div className="container">
                {/* Структурированные данные для вакансий */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(vacanciesStructuredData) }}
                />
                
                <section className="pb-4" itemScope itemType="https://schema.org/ItemList">
                    <h1 
                        className="mt-[20px] text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black mb-[20px]" 
                        itemProp="name"
                    >
                        Вакансии {citySlug !== DEFAULT_CITY ? `в ${cityDative}` : 'в компании'}
                    </h1>
                    
                    <meta itemProp="description" content={`Актуальные вакансии для работы на спецтехнике ${citySlug !== DEFAULT_CITY ? `в ${cityDative}` : ''}`} />
                    <meta itemProp="numberOfItems" content="4" />

                    <div className="max-w-full mx-auto space-y-5 md:space-y-10">
                        {/* Вакансия 1 */}
                        <div 
                            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500"
                            itemProp="itemListElement"
                            itemScope
                            itemType="https://schema.org/ListItem"
                        >
                            <meta itemProp="position" content="1" />
                            <div itemScope itemType="https://schema.org/JobPosting">
                                <h3 
                                    className="lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] font-bold text-gray-800 mb-3"
                                    itemProp="title"
                                >
                                    Машинист автокрана 90 т
                                </h3>
                                <p 
                                    className="text-gray-600 mb-4 lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]"
                                    itemProp="description"
                                >
                                    Требуется машинист автокрана 90 т.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                                        <span className="text-blue-500 mr-2 mt-1">•</span>
                                        <span itemProp="responsibilities">Работа на автокранах Zoomlion, XCMG. Бережное отношение к вверенной технике и строгое соблюдение правил ОТ и ТБ, а также руководства по эксплуатации автокрана;</span>
                                    </li>
                                    <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                                        <span className="text-blue-500 mr-2 mt-1">•</span>
                                        <span itemProp="qualifications">Обязательно иметь удостоверение машиниста автокрана – 8 разряда;</span>
                                    </li>
                                    <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                                        <span className="text-blue-500 mr-2 mt-1">•</span>
                                        <span itemProp="experienceRequirements">Опыт работы не менее 3-х лет;</span>
                                    </li>
                                    <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                                        <span className="text-blue-500 mr-2 mt-1">•</span>
                                        <span>Стабильные выплаты заработной платы.</span>
                                    </li>
                                </ul>
                                <div itemProp="hiringOrganization" itemScope itemType="https://schema.org/Organization">
                                    <meta itemProp="name" content="СТП Групп" />
                                </div>
                                <div itemProp="jobLocation" itemScope itemType="https://schema.org/Place">
                                    <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                                        <meta itemProp="addressLocality" content={citySlug !== DEFAULT_CITY ? city.nominative : "Москва"} />
                                    </div>
                                </div>
                                <meta itemProp="employmentType" content="FULL_TIME" />
                            </div>
                        </div>

                        {/* Вакансия 2 */}
                        <div 
                            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500"
                            itemProp="itemListElement"
                            itemScope
                            itemType="https://schema.org/ListItem"
                        >
                            <meta itemProp="position" content="2" />
                            <div itemScope itemType="https://schema.org/JobPosting">
                                <h3 
                                    className="lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] font-bold text-gray-800 mb-3"
                                    itemProp="title"
                                >
                                    Водитель самосвала
                                </h3>
                                <p 
                                    className="text-gray-600 mb-4 lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]"
                                    itemProp="description"
                                >
                                    Требуется водителей самосвала
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                                        <span className="text-green-500 mr-2 mt-1">•</span>
                                        <span itemProp="experienceRequirements">Опыт работы не менее 3-х лет;</span>
                                    </li>
                                    <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                                        <span className="text-green-500 mr-2 mt-1">•</span>
                                        <span>Знание города;</span>
                                    </li>
                                    <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                                        <span className="text-green-500 mr-2 mt-1">•</span>
                                        <span>Знание ПДД;</span>
                                    </li>
                                    <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                                        <span className="text-green-500 mr-2 mt-1">•</span>
                                        <span itemProp="skills">Знание технической части автомобиля КамАЗ, SHAKMAN;</span>
                                    </li>
                                    <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                                        <span className="text-green-500 mr-2 mt-1">•</span>
                                        <span>Готовность к своевременное обслуживание и ТО, при необходимости ремонт в полевых условиях;</span>
                                    </li>
                                    <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                                        <span className="text-green-500 mr-2 mt-1">•</span>
                                        <span>Стабильные выплаты заработной платы.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

            {/* Вакансия 3 */}
              <div 
                  className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
              >
                  <meta itemProp="position" content="3" />
                  <div itemScope itemType="https://schema.org/JobPosting">
                      <h3 
                          className="lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] font-bold text-gray-800 mb-3"
                          itemProp="title"
                      >
                          Машинист экскаватора
                      </h3>
                      <p 
                          className="text-gray-600 mb-4 lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]"
                          itemProp="description"
                      >
                          Требуется машинист экскаватора
                      </p>
                      <ul className="space-y-2">
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-orange-500 mr-2 mt-1">•</span>
                              <span itemProp="experienceRequirements">Работа на экскаваторе-погрузчике HIDROMEK, HMK 102S (равноколесный на джойстиках, наработка 2400 моточасов);</span>
                          </li>
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-orange-500 mr-2 mt-1">•</span>
                              <span>Качественное выполнение работ на разных категориях объекта (почасовая работа в городе, промышленное строительство, уборка территорий, коммунальные работы, работы в частном секторе, общестроительные работы);</span>
                          </li>
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-orange-500 mr-2 mt-1">•</span>
                              <span>Техническое обслуживания и бережная эксплуатация техники;</span>
                          </li>
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-orange-500 mr-2 mt-1">•</span>
                              <span itemProp="skills">Опыт работы от 3-х лет;</span>
                          </li>
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-orange-500 mr-2 mt-1">•</span>
                              <span>Удостоверение тракториста-машиниста Категория С;</span>
                          </li>
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-orange-500 mr-2 mt-1">•</span>
                              <span>Стабильные выплаты заработной платы;</span>
                          </li>
                      </ul>
                  </div>
              </div>
            {/* Вакансия 4 */}
              <div 
                  className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
              >
                  <meta itemProp="position" content="3" />
                  <div itemScope itemType="https://schema.org/JobPosting">
                      <h3 
                          className="lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] font-bold text-gray-800 mb-3"
                          itemProp="title"
                      >
                          Водитель автовышки
                      </h3>
                      <p 
                          className="text-gray-600 mb-4 lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]"
                          itemProp="description"
                      >
                          Требуется водитель автовышки
                      </p>
                      <ul className="space-y-2">
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-purple-500 mr-2 mt-1">•</span>
                              <span itemProp="experienceRequirements">Работа на автовышке ПСС-131.22Э;</span>
                          </li>
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-purple-500 mr-2 mt-1">•</span>
                              <span>Водительское удостоверение категории C;</span>
                          </li>
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-purple-500 mr-2 mt-1">•</span>
                              <span>Строгое соблюдение правил безопасности при высотных работах;</span>
                          </li>
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-purple-500 mr-2 mt-1">•</span>
                              <span itemProp="skills">Опыт работы от 3-х лет;</span>
                          </li>
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-purple-500 mr-2 mt-1">•</span>
                              <span>Наличие удостоверения машиниста автовышки/АГП – 5 разряда;</span>
                          </li>
                          <li className="flex items-start lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                              <span className="text-purple-500 mr-2 mt-1">•</span>
                              <span>Стабильные выплаты заработной платы;</span>
                          </li>
                      </ul>
                  </div>
              </div>

                    </div>

                    {/* Контактная информация */}
                    <div className="mt-12 p-8 bg-gray-50 rounded-xl">
                        <h2 className="lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] font-bold text-gray-800 mb-4 ">Как откликнуться на вакансию?</h2>
                        <p className="text-gray-700 mb-6 lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                            Отправьте свое резюме на почту или позвоните по телефону. Наши специалисты 
                            свяжутся с вами для обсуждения деталей сотрудничества.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] mb-2">Контакты:</h3>
                                <p>
                                  <Link href="tel:+79303334046" className="lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] text-black">+79303334046</Link>
                                </p>
                                <p>
                                  <Link href="mailto:stp.grupp@mail.ru" className="lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)] text-[var(--blue-color)]">stp.grupp@mail.ru</Link>
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)]">Мы предлагаем:</h3>
                                <ul className="text-gray-700 space-y-1 lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]">
                                    <li>• Стабильную заработную плату</li>
                                    <li>• Официальное трудоустройство</li>
                                    <li>• Современную технику</li>
                                    <li>• Профессиональный коллектив</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}