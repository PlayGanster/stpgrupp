// hooks/use-city.ts
'use client';

import { useParams, usePathname } from 'next/navigation';
import { CITY_CASES, CitySlug, isSupportedCity } from '@/config/cities';

export function useCity() {
  const params = useParams();
  const pathname = usePathname();
  
  const citySlug = params.city as string | undefined;
  
  if (!citySlug || !isSupportedCity(citySlug)) {
    return {
      slug: null,
      name: 'Россия',
      cases: null,
      isCityVersion: false,
      currentPath: pathname
    };
  }

  const cityData = CITY_CASES[citySlug];

  return {
    slug: citySlug,
    name: cityData.nominative,
    cases: cityData,
    isCityVersion: true,
    currentPath: pathname
  };
}