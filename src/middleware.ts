// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isSupportedCity } from '@/config/cities';
import { getCachedCity, setCachedCity, shouldRefreshCache } from '@/lib/city-cache';
import { API_BASE_URL } from './constant/api-url';

/**
 * Middleware теперь только проверяет кэш и редиректит
 * GPS определение будет на клиенте
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  console.log('\n🚀 Middleware Triggered:', { path: pathname });

  // Пропускаем статические файлы и API
  if (shouldSkipPath(pathname)) {
    return NextResponse.next();
  }

  // Проверяем текущий город в URL
  const pathParts = pathname.split('/').filter(Boolean);
  const currentCity = pathParts[0];

  // Если URL уже содержит поддерживаемый город - пропускаем
  if (isSupportedCity(currentCity)) {
    console.log('✅ Already on city page:', currentCity);
    const response = NextResponse.next();
    
    // Обновляем кэш
    const cachedCity = getCachedCity(request);
    if (!cachedCity || cachedCity !== currentCity) {
      setCachedCity(response, currentCity, pathname);
      console.log('💾 Cache updated:', currentCity);
    }
    
    return response;
  }

  // Если нет города в URL, проверяем кэш
  const cachedCity = getCachedCity(request);
  
  if (cachedCity && isSupportedCity(cachedCity)) {
    console.log('🎯 Using cached city:', cachedCity);
    const newUrl = new URL(`/${cachedCity}${pathname}${search}`, request.url);
    const response = NextResponse.redirect(newUrl);
    return response;
  }

  // Если кэша нет - редиректим на Москву (вместо Вся Россия)
  console.log('🎯 No city detected, using Moscow as default');
  const newUrl = new URL('/moscow', request.url);
  const response = NextResponse.redirect(newUrl);
  setCachedCity(response, 'moscow', pathname);
  
  return response;
}

function shouldSkipPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/favicon')
  );
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots.txt).*)',
  ],
};