// middleware.ts - с полным логированием заголовков
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isSupportedCity } from '@/config/cities';
import { getCachedCity, setCachedCity, shouldRefreshCache } from '@/lib/city-cache';
import { getClientIP } from '@/lib/api-utils';
import { API_BASE_URL } from './constant/api-url';

// Функция для логирования всех заголовков
function logAllHeaders(request: NextRequest) {
  const headers: { [key: string]: string } = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  
  console.log('📋 ALL REQUEST HEADERS:');
  console.log(JSON.stringify(headers, null, 2));
  console.log('======================');
}

// Функция для определения города через API
async function detectCityViaAPI(request: NextRequest): Promise<string | null> {
  console.log('🌐 === CITY DETECTION STARTED ===');
  
  // Логируем все заголовки
  logAllHeaders(request);
  
  try {
    const userIP = getClientIP(request);
    console.log('📡 Client IP from getClientIP:', userIP);

    const apiBase = API_BASE_URL;
    const apiUrl = userIP ? `${apiBase}/detect-city?ip=${userIP}` : `${apiBase}/detect-city`;
    
    console.log('🔗 API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    console.log('📨 API HTTP Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('🏙️ API Response:', data);
      
      if (data.success && data.normalized_city) {
        console.log('✅ City detection SUCCESS:', data.normalized_city);
        return data.normalized_city;
      }
    } else {
      console.error('❌ API Error:', response.status);
    }
  } catch (error: any) {
    console.error('💥 API Request FAILED:', error.message);
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search, hostname } = request.nextUrl;
  
  console.log('\n🚀 === MIDDLEWARE STARTED ===');
  console.log('🚀 Path:', pathname);
  console.log('🚀 Hostname from URL:', hostname);
  console.log('🚀 Full URL:', request.url);

  // Логируем все заголовки для диагностики
  logAllHeaders(request);

  // Пропускаем статические файлы и API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/static') ||
      pathname.includes('.') ||
      pathname.startsWith('/sitemap') ||
      pathname.startsWith('/robots')) {
    console.log('⏩ Skipping static/API route');
    return NextResponse.next();
  }

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
    console.log('🎯 Using CACHED city:', targetCity);
  } else {
    console.log('🔄 Detecting city FRESH...');
    const detectedCity = await detectCityViaAPI(request);
    const fallbackCity = 'vsia_rossia';
    
    targetCity = detectedCity && isSupportedCity(detectedCity) ? detectedCity : fallbackCity;
    shouldUpdateCache = true;
    console.log('🎯 Final target city:', targetCity);
  }

  const newUrl = new URL(`/${targetCity}${pathname}${search}`, request.url);

  console.log('🔀 Redirecting to:', newUrl.toString());
  console.log('✅ === MIDDLEWARE COMPLETED ===\n');
  
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