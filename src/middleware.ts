// middleware.ts - с улучшенным логированием
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isSupportedCity } from '@/config/cities';
import { getCachedCity, setCachedCity, shouldRefreshCache } from '@/lib/city-cache';
import { getClientIP } from '@/lib/api-utils';
import { API_BASE_URL } from './constant/api-url';

// Функция для определения города через API
async function detectCityViaAPI(request: NextRequest): Promise<string | null> {
  console.log('🌐 === CITY DETECTION STARTED ===');
  
  try {
    const userIP = getClientIP(request);
    console.log('📡 Client IP:', userIP);
    console.log('🏠 Request URL:', request.url);
    console.log('👤 User Agent:', request.headers.get('user-agent'));

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
    console.log('📨 API HTTP OK:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('🏙️ === API RESPONSE DATA ===');
      console.log('🏙️ Full response:', JSON.stringify(data, null, 2));
      console.log('🏙️ Success:', data.success);
      console.log('🏙️ Detected City:', data.detected_city);
      console.log('🏙️ Normalized City:', data.normalized_city);
      console.log('🏙️ =========================');
      
      if (data.success && data.normalized_city) {
        console.log('✅ City detection SUCCESS:', data.normalized_city);
        return data.normalized_city;
      } else {
        console.log('❌ City detection FAILED in API response');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error Status:', response.status);
      console.log('❌ API Error Text:', errorText);
    }
  } catch (error: any) {
    console.log('💥 API Request FAILED:');
    console.log('💥 Error message:', error.message);
    console.log('💥 Error stack:', error.stack);
  }

  console.log('❌ === CITY DETECTION FAILED ===');
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search, hostname } = request.nextUrl;
  
  console.log('\n🚀 === MIDDLEWARE STARTED ===');
  console.log('🚀 Path:', pathname);
  console.log('🚀 Host:', hostname);
  console.log('🚀 Search params:', search);

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

  console.log('🔍 Checking current path:', {
    pathname,
    pathParts,
    possibleCity,
    isSupportedCity: isSupportedCity(possibleCity)
  });

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
  
  console.log('💾 Cache check:', {
    cachedCity,
    needsRefresh,
    hasCache: !!cachedCity
  });

  let targetCity: string;
  let shouldUpdateCache = false;

  if (cachedCity && !needsRefresh) {
    targetCity = cachedCity;
    console.log('🎯 Using CACHED city:', targetCity);
  } else {
    console.log('🔄 Detecting city FRESH...');
    const detectedCity = await detectCityViaAPI(request);
    const fallbackCity = 'vsia_rossia';
    
    console.log('🔮 Detection results:', {
      detectedCity,
      fallbackCity,
      isSupported: detectedCity && isSupportedCity(detectedCity)
    });
    
    targetCity = detectedCity && isSupportedCity(detectedCity) ? detectedCity : fallbackCity;
    shouldUpdateCache = true;
    console.log('🎯 Final target city:', targetCity);
  }

  const remainingPath = pathname;
  const newUrl = new URL(`/${targetCity}${remainingPath}${search}`, request.url);

  console.log('🔀 Redirect details:', {
    from: pathname,
    to: newUrl.toString(),
    shouldUpdateCache
  });

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