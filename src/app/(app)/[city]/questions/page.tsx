import QuestionsList from "@/features/questions/list/QuestionsList";
import { Metadata } from "next";
import { CITY_CASES, CitySlug, DEFAULT_CITY, isSupportedCity } from '@/config/cities';
import { getQuestionsList } from '@/actions/questions';
import { 
  getCityInPrepositionalCase, 
  getCityInGenitiveCase, 
  getCityInDativeCase,
  getSeoCityTitle,
  getSeoCityDescription,
} from '@/shared/utils/cityCases';

// Функция для замены плейсхолдеров города в тексте
function replaceCityPlaceholders(text: string, citySlug: CitySlug): string {
  const cityGenitive = getCityInGenitiveCase(citySlug);
  const cityDative = getCityInDativeCase(citySlug);
  const cityPrepositional = getCityInPrepositionalCase(citySlug);
  
  return text.replace(/\[city\]/g, cityGenitive)
             .replace(/\[city-dative\]/g, cityDative)
             .replace(/\[city-prepositional\]/g, cityPrepositional);
}

// Генерируем метаданные с учетом города
export async function generateMetadata({ params }: { params: { city?: string } }): Promise<Metadata> {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const isDefaultCity = citySlug === DEFAULT_CITY;

  const cityPrepositional = getCityInPrepositionalCase(citySlug);
  const cityGenitive = getCityInGenitiveCase(citySlug);
  const seoCityTitle = getSeoCityTitle(citySlug);
  const seoCityDescription = getSeoCityDescription(citySlug);
  
  const baseUrl = 'https://xn----ftb8acaedin.xn--p1ai';
  const pageUrl = isDefaultCity ? `${baseUrl}/questions` : `${baseUrl}/${citySlug}/questions`;

  // Получаем вопросы для мета-описания
  let questionsForMeta: any[] = [];
  try {
    const questionsData = await getQuestionsList();
    
    // Обрабатываем вопросы с заменой города (только первые 3 для описания)
    questionsForMeta = questionsData.slice(0, 3).map(question => ({
      question: replaceCityPlaceholders(question.question, citySlug),
      answer: question.answer ? replaceCityPlaceholders(question.answer, citySlug) : ""
    }));
  } catch (error) {
    console.error("Error fetching questions for metadata:", error);
    // Используем базовые вопросы в случае ошибки
    questionsForMeta = [
      {
        question: replaceCityPlaceholders("Как оформить аренду спецтехники в [city] через сайт?", citySlug),
        answer: replaceCityPlaceholders("Просто выберите нужную технику для работы в [city] и добавьте её в корзину.", citySlug)
      },
      {
        question: replaceCityPlaceholders("Какие документы нужны для аренды техники в [city]?", citySlug),
        answer: replaceCityPlaceholders("Для оформления аренды в [city] потребуется паспорт и водительское удостоверение.", citySlug)
      }
    ];
  }

  // Создаем описание на основе вопросов
  const questionTitles = questionsForMeta.map(q => q.question).join(', ');
  const metaDescription = `Ответы на вопросы: ${questionTitles}. Частые вопросы об аренде спецтехники ${!isDefaultCity ? seoCityDescription : ''}: цены, условия, доставка. Ответы от СТП Групп.`;

  return {
    title: `Вопросы и ответы об аренде спецтехники ${seoCityTitle ? `${seoCityTitle}` : ''} | СТП Групп`,
    description: metaDescription,
    keywords: `вопросы аренда спецтехники ${cityGenitive}, часто задаваемые вопросы ${cityGenitive}, аренда техники вопросы ${cityGenitive}, СТП Групп вопросы ${cityGenitive}, ${questionsForMeta.map(q => q.question.split('?')[0]).join(', ')}`,
    
    // Open Graph для социальных сетей
    openGraph: {
      title: `Вопросы и ответы об аренде спецтехники ${seoCityTitle ? `в ${seoCityTitle}` : ''} | СТП Групп`,
      description: metaDescription,
      type: "website",
      locale: "ru_RU",
      siteName: "СТП Групп",
      url: pageUrl,
      // images: [
      //   {
      //     url: 'https://xn----ftb8acaedin.xn--p1ai/og-faq-image.jpg',
      //     width: 1200,
      //     height: 630,
      //     alt: `FAQ по аренде спецтехники ${seoCityTitle ? `в ${seoCityTitle}` : ''}`,
      //   },
      // ],
    },
    
    // Robots для поисковых систем
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
    
    // Дополнительные мета-теги
    manifest: "/manifest.json",
    authors: [{ name: "СТП Групп" }],
    publisher: "СТП Групп",
    
    // Канонические ссылки
    alternates: {
      canonical: pageUrl,
      languages: {
        'ru-RU': pageUrl,
      },
    },
    
    // Верификация для поисковых систем (замените на реальные коды)
    // verification: {
    //   google: 'ваш-google-verification-code',
    //   yandex: 'ваш-yandex-verification-code',
    // },
    
    // // Дополнительные SEO-теги
    // other: {
    //   'yandex-verification': 'ваш-yandex-verification-code',
    //   'google-site-verification': 'ваш-google-verification-code',
    // }
  };
}

export default function QuestionsPage({ params }: { params: { city?: string } }) {
  const citySlug: CitySlug = params.city && isSupportedCity(params.city) ? params.city : DEFAULT_CITY;
  const isDefaultCity = citySlug === DEFAULT_CITY;
  const cityDative = getCityInDativeCase(citySlug);
  const cityPrepositional = getCityInPrepositionalCase(citySlug);

  // Предобрабатываем базовые вопросы на сервере
  const baseQuestions = [
    {
      id: 1,
      question: replaceCityPlaceholders("Как оформить аренду спецтехники в [city] через сайт?", citySlug),
      answer: replaceCityPlaceholders("Просто выберите нужную технику для работы в [city] и добавьте её в корзину. Затем перейдите в раздел 'Оформить заявку', заполните форму и отправьте запрос. Мы оперативно свяжемся с вами для уточнения деталей по доставке в [city-dative].", citySlug),
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      question: replaceCityPlaceholders("Какие документы нужны для аренды техники в [city]?", citySlug),
      answer: replaceCityPlaceholders("Для оформления аренды в [city] потребуется паспорт и водительское удостоверение (если требуется оператор). Все документы мы подготовим для вас в [city-dative].", citySlug),
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      question: replaceCityPlaceholders("Как происходит доставка техники в [city]?", citySlug),
      answer: replaceCityPlaceholders("Доставка техники в [city] осуществляется нашими низкорамными манипуляторами. Стоимость доставки зависит от расстояния и рассчитывается индивидуально для каждого заказа в [city-dative].", citySlug),
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      question: replaceCityPlaceholders("Какие гарантии вы предоставляете при аренде в [city]?", citySlug),
      answer: replaceCityPlaceholders("Мы предоставляем полную техническую исправность арендуемой техники в [city]. В случае поломки по нашей вине оперативно заменим оборудование или вернем средства за простой в [city-dative].", citySlug),
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      question: replaceCityPlaceholders("Можно ли арендовать технику с оператором в [city]?", citySlug),
      answer: replaceCityPlaceholders("Да, мы предоставляем технику как с опытными операторами, так и без. Все наши операторы в [city] имеют необходимые допуски и большой опыт работы.", citySlug),
      created_at: new Date().toISOString()
    }
  ];

  return (
    <div className="wrapper">
      <div className="container">
        <section itemScope itemType="https://schema.org/FAQPage">
          <h1 
            className="mt-[20px] text-[length:var(--size-mobile-heading-text)] md:text-[length:var(--size-md-heading-text)] lg:text-[length:var(--size-lg-heading-text)] font-black" 
            itemProp="headline"
          >
            Часто задаваемые вопросы {!isDefaultCity ? `об аренде спецтехники ${cityPrepositional}` : 'об аренде спецтехники'}
          </h1>
          
          <div className="prose max-w-none mt-6 sr-only" itemProp="mainContent">
            <p className="text-lg text-gray-600 mb-8">
              {!isDefaultCity 
                ? `Здесь собраны ответы на самые популярные вопросы об аренде спецтехники ${cityPrepositional}. Если не нашли ответ - свяжитесь с нами!`
                : 'Ответы на самые частые вопросы об аренде строительной техники по всей России. Наша команда готова помочь вам!'
              }
            </p>
          </div>
          
          {/* Передаем предобработанные вопросы и slug города */}
          <QuestionsList 
            citySlug={citySlug} 
            preprocessedBaseQuestions={baseQuestions}
          />
        </section>
      </div>
    </div>
  );
}