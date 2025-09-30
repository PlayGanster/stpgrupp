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

  // Если IP невалидный, сразу возвращаем null
  if (!isValidIP(userIP)) {
    console.log('❌ Invalid IP, skipping API call');
    return null;
  }

  try {
    const apiUrl = `${API_BASE_URL}/detect-city?ip=${userIP}`;
    console.log('📡 API Request:', apiUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
      signal: controller.signal
    });

    clearTimeout(timeout);

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
      } else {
        console.log('❌ API Error:', data);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ HTTP Error:', errorText);
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('⏰ API Timeout');
    } else {
      console.log('💥 API Exception:', error.message);
    }
  }

  return null;
}

/**
 * Основной middleware
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  console.log('\n🚀 Middleware Triggered:', {
    path: pathname,
    search: search || '(empty)'
  });

  // Пропускаем статические файлы и API
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/robots')
  ) {
    console.log('⏩ Skipping static/API route');
    return NextResponse.next();
  }

  // Проверяем текущий город в URL
  const pathParts = pathname.split('/').filter(Boolean);
  const currentCity = pathParts[0];

  console.log('🔍 Path Analysis:', {
    pathParts,
    currentCity,
    isSupported: isSupportedCity(currentCity)
  });

  // Если уже на правильном городе - пропускаем
  if (isSupportedCity(currentCity)) {
    console.log('✅ Correct city in URL:', currentCity);
    const response = NextResponse.next();
    setCachedCity(response, currentCity, pathname);
    return response;
  }

  // Проверяем кэш
  const cachedCity = getCachedCity(request);
  const needsRefresh = shouldRefreshCache(request);
  
  console.log('💾 Cache Status:', {
    cached: cachedCity,
    needsRefresh,
    hasValidCache: !!cachedCity && !needsRefresh
  });

  let targetCity: string;
  let shouldUpdateCache = false;

  if (cachedCity && !needsRefresh) {
    // Используем кэш
    targetCity = cachedCity;
    console.log('🎯 Using Cached City:', targetCity);
  } else {
    // Определяем город заново
    console.log('🔄 Fresh City Detection');
    const detectedCity = await detectCityViaAPI(request);
    
    targetCity = detectedCity && isSupportedCity(detectedCity) 
      ? detectedCity 
      : 'vsia_rossia'; // fallback
    
    shouldUpdateCache = true;
    console.log('🎯 Detection Result:', {
      detected: detectedCity,
      final: targetCity
    });
  }

  // Создаем новый URL с городом
  const newUrl = new URL(`/${targetCity}${pathname}${search}`, request.url);
  
  console.log('🔀 Redirect:', {
    from: pathname,
    to: newUrl.toString()
  });

  const response = NextResponse.redirect(newUrl);
  
  // Обновляем кэш если нужно
  if (shouldUpdateCache) {
    setCachedCity(response, targetCity, pathname);
    console.log('💾 Cache Updated');
  }

  console.log('✅ Middleware Completed\n');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots.txt).*)',
  ],
};