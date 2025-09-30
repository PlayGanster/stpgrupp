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

    console.log('📨 API Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('🏙️ API Response:', data);
      
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
  const { pathname, search } = request.nextUrl;
  
  console.log('\n🚀 Middleware Triggered:', {
    path: pathname
  });

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
    return NextResponse.next();
  }

  // Проверяем текущий город в URL
  const pathParts = pathname.split('/').filter(Boolean);
  const currentCity = pathParts[0];

  // Если URL уже содержит поддерживаемый город - пропускаем
  if (isSupportedCity(currentCity)) {
    console.log('✅ Already on city page:', currentCity);
    const response = NextResponse.next();
    
    // Обновляем кэш текущим городом
    const cachedCity = getCachedCity(request);
    if (!cachedCity || cachedCity !== currentCity) {
      setCachedCity(response, currentCity, pathname);
      console.log('💾 Cache updated with:', currentCity);
    }
    
    return response;
  }

  // ВРЕМЕННО: Игнорируем кэш и всегда определяем город заново
  console.log('🔄 FORCED City Detection (ignoring cache)');
  const detectedCity = await detectCityViaAPI(request);
  const targetCity = detectedCity && isSupportedCity(detectedCity) 
    ? detectedCity 
    : 'vsia_rossia';

  console.log('🎯 Detection Result:', {
    detected: detectedCity,
    final: targetCity
  });

  // Создаем новый URL
  const newUrl = new URL(`/${targetCity}${pathname}${search}`, request.url);
  
  console.log('🔀 Redirecting to:', newUrl.toString());

  const response = NextResponse.redirect(newUrl);
  setCachedCity(response, targetCity, pathname);
  
  console.log('✅ Middleware completed\n');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots.txt).*)',
  ],
};