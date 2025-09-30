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
 * Очищает путь от существующих городов
 */
function cleanPathFromCities(pathname: string): string {
  const pathParts = pathname.split('/').filter(Boolean);
  
  // Если первый элемент - поддерживаемый город, убираем его
  if (pathParts.length > 0 && isSupportedCity(pathParts[0])) {
    return '/' + pathParts.slice(1).join('/');
  }
  
  return pathname;
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
    return NextResponse.next();
  }

  // Очищаем путь от городов (на случай редиректа)
  const cleanPath = cleanPathFromCities(pathname);
  console.log('🧹 Cleaned path:', { original: pathname, cleaned: cleanPath });

  // Проверяем текущий город в URL (после очистки)
  const pathParts = cleanPath.split('/').filter(Boolean);
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
    setCachedCity(response, currentCity, cleanPath);
    return response;
  }

  // Определяем город заново (игнорируем кэш для теста)
  console.log('🔄 Fresh City Detection');
  const detectedCity = await detectCityViaAPI(request);
  const targetCity = detectedCity && isSupportedCity(detectedCity) 
    ? detectedCity 
    : 'vsia_rossia';

  console.log('🎯 Detection Result:', {
    detected: detectedCity,
    final: targetCity
  });

  // Создаем новый URL с городом (используем очищенный путь)
  const newPath = `/${targetCity}${cleanPath === '/' ? '' : cleanPath}`;
  const newUrl = new URL(newPath + search, request.url);
  
  console.log('🔀 Redirect:', {
    from: pathname,
    to: newUrl.toString(),
    cleanPath,
    newPath
  });

  // Редирект только если город изменился
  if (currentCity !== targetCity) {
    const response = NextResponse.redirect(newUrl);
    setCachedCity(response, targetCity, cleanPath);
    console.log('✅ Redirecting completed\n');
    return response;
  }

  console.log('⏭️ No redirect needed\n');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots.txt).*)',
  ],
};