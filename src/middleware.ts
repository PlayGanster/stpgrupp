// middleware.ts - упрощенная версия
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isSupportedCity } from '@/config/cities';
import { getCachedCity, setCachedCity, shouldRefreshCache } from '@/lib/city-cache';
import { getClientIP } from '@/lib/api-utils';
import { API_BASE_URL } from './constant/api-url';

// Функция для определения города через API
async function detectCityViaAPI(request: NextRequest): Promise<string | null> {
  try {
    const userIP = getClientIP(request);
    console.log('🌐 Detecting city for IP:', userIP);

    const apiBase = API_BASE_URL;
    const apiUrl = userIP ? `${apiBase}/detect-city?ip=${userIP}` : `${apiBase}/detect-city`;
    
    console.log('📡 Calling API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Важно для продакшена!
      cache: 'no-cache',
    });

    console.log('📨 API Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('🏙️ API Response data:', data);
      
      if (data.success && data.normalized_city) {
        return data.normalized_city;
      }
    } else {
      console.error('❌ API Error:', await response.text());
    }
  } catch (error: any) {
    console.error('💥 Detection failed:', error.message);
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Пропускаем статические файлы и API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/static') ||
      pathname.includes('.') ||
      pathname.startsWith('/sitemap') ||
      pathname.startsWith('/robots')) {
    return NextResponse.next();
  }

  console.log('🚀 Middleware triggered for:', pathname);

  // Проверяем, есть ли уже город в URL
  const pathParts = pathname.split('/').filter(Boolean);
  const possibleCity = pathParts[0];

  // Если URL уже содержит поддерживаемый город
  if (isSupportedCity(possibleCity)) {
    console.log('✅ Already on correct city:', possibleCity);
    const response = NextResponse.next();
    setCachedCity(response, possibleCity, pathname);
    return response;
  }

  // Проверяем кэш
  const cachedCity = getCachedCity(request);
  const needsRefresh = shouldRefreshCache(request);
  
  let targetCity: string;
  let shouldUpdateCache = false;

  if (cachedCity && !needsRefresh) {
    targetCity = cachedCity;
    console.log('🎯 Using cached city:', targetCity);
  } else {
    console.log('🔄 Detecting city fresh...');
    const detectedCity = await detectCityViaAPI(request);
    const fallbackCity = 'vsia_rossia';
    
    targetCity = detectedCity && isSupportedCity(detectedCity) ? detectedCity : fallbackCity;
    shouldUpdateCache = true;
    console.log('🆕 Detection result:', { detectedCity, targetCity });
  }

  const remainingPath = pathname;
  const newUrl = new URL(`/${targetCity}${remainingPath}${search}`, request.url);

  console.log('🔀 Redirecting to:', newUrl.toString());
  
  const response = NextResponse.redirect(newUrl);
  if (shouldUpdateCache) {
    setCachedCity(response, targetCity, pathname);
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots.txt|debug).*)',
  ],
};