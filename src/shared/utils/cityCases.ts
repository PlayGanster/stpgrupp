import { CITY_CASES, CitySlug, DEFAULT_CITY } from '@/config/cities';

// Функция для получения города в предложном падеже (в Москве, в Санкт-Петербурге)
export function getCityInPrepositionalCase(citySlug: CitySlug): string {
  const city = CITY_CASES[citySlug];
  return citySlug === DEFAULT_CITY ? 'Москвы' : `в ${city.prepositional.split(' ')[1]}`;
}

// Функция для получения города в родительном падеже (аренда Москвы)
export function getCityInGenitiveCase(citySlug: CitySlug): string {
  const city = CITY_CASES[citySlug];
  return citySlug === DEFAULT_CITY ? 'России' : city.genitive;
}

// Функция для получения города в дательном падеже (к Москве) - если где-то нужен
export function getCityInDativeCase(citySlug: CitySlug): string {
  const city = CITY_CASES[citySlug];
  return citySlug === DEFAULT_CITY ? 'России' : city.dative;
}

// Функция для получения города с предлогом "в" (в Москве)
export function getCityWithPrepositionV(citySlug: CitySlug): string {
  const city = CITY_CASES[citySlug];
  return citySlug === DEFAULT_CITY ? 'в России' : `в ${city.prepositional.split(' ')[1]}`;
}

// Функция для SEO заголовков
export function getSeoCityTitle(citySlug: CitySlug): string {
  return citySlug !== DEFAULT_CITY ? `в ${CITY_CASES[citySlug].prepositional.split(' ')[1]}` : '';
}

// Функция для SEO описаний
export function getSeoCityDescription(citySlug: CitySlug): string {
  return citySlug !== DEFAULT_CITY ? `в ${CITY_CASES[citySlug].prepositional.split(' ')[1]}` : '';
}