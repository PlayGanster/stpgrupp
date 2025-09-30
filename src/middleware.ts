// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isSupportedCity } from '@/config/cities';
import { getCachedCity, setCachedCity, shouldRefreshCache } from '@/lib/city-cache';
import { getClientIP, isValidIP } from '@/lib/api-utils';
import { API_BASE_URL } from './constant/api-url';

/**
 * Определяет город через API
 */
async function detectCityViaAPI(request: NextRequest): Promise<string | null> {
  const userIP = getClientIP(request);
  
  console.log('🌐 City Detection Started:', {
    ip: userIP,
    isValid: isValidIP(userIP)
  });

  if (!isValidIP(userIP)) {
    console.log('❌ Invalid IP, skipping API call');
    return null;
  }

  try {
    const apiUrl = `${API_BASE_URL}/detect-city?ip=${userIP}`;
    console.log('📡 API Request:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    console.log('📨 API Response:', {
      status: response.status,
      ok: response.ok
    });

    if (response.ok) {
      const data = await response.json();
      console.log('🏙️ API Data:', data);
      
      if (data.success && data.normalized_city) {
        console.log('✅ City Detected:', data.normalized_city);
        return data.normalized_city;
      }
    }
  } catch (error: any) {
    console.log('💥 API Exception:', error.message);
  }

  return null;
}

/**
 * Основной middleware
 */
export async function middleware(request: NextRequest) {
  const { pathname, search, hostname } = request.nextUrl;
  
  console.log('\n🚀 Middleware Triggered:', {
    path: pathname,
    hostname: hostname
  });

  // ВАЖНО: Пропускаем если это уже редирект с городом
  const pathParts = pathname.split('/').filter(Boolean);
  const currentCity = pathParts[0];

  // Если URL уже содержит поддерживаемый город - ПРОПУСКАЕМ
  if (isSupportedCity(currentCity)) {
    console.log('✅ Already on city page:', currentCity);
    const response = NextResponse.next();
    
    // Обновляем кэш только если нужно
    const cachedCity = getCachedCity(request);
    if (!cachedCity || cachedCity !== currentCity) {
      setCachedCity(response, currentCity, pathname);
      console.log('💾 Cache updated');
    }
    
    return response;
  }

  // Пропускаем статические файлы и API
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/favicon')
  ) {
    console.log('⏩ Skipping static/API route');
    return NextResponse.next();
  }

  // Проверяем кэш
  const cachedCity = getCachedCity(request);
  const needsRefresh = shouldRefreshCache(request);
  
  let targetCity: string;

  if (cachedCity && !needsRefresh) {
    targetCity = cachedCity;
    console.log('🎯 Using cached city:', targetCity);
  } else {
    // Определяем город заново
    console.log('🔄 Detecting city...');
    const detectedCity = await detectCityViaAPI(request);
    targetCity = detectedCity && isSupportedCity(detectedCity) 
      ? detectedCity 
      : 'vsia_rossia';
    console.log('🎯 Detected city:', targetCity);
  }

  // Создаем новый URL
  const newUrl = new URL(`/${targetCity}${pathname}${search}`, request.url);
  
  console.log('🔀 Redirecting to:', newUrl.toString());

  const response = NextResponse.redirect(newUrl);
  
  // Обновляем кэш если нужно
  if (!cachedCity || needsRefresh) {
    setCachedCity(response, targetCity, pathname);
  }

  console.log('✅ Middleware completed\n');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots.txt).*)',
  ],
};