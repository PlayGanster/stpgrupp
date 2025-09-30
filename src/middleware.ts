// middleware.ts - с улучшенным логированием
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ALL_CITIES, isSupportedCity } from '@/config/cities';
import { API_BASE_URL } from './constant/api-url';

// Функция для получения IP из запроса
function getClientIP(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return null;
}

// Функция для определения города через API
async function detectCityViaAPI(request: NextRequest): Promise<{city: string | null, debug: any}> {
  const debugInfo: any = {
    ip: null,
    apiUrl: null,
    responseStatus: null,
    error: null
  };

  try {
    // Получаем IP пользователя
    const userIP = getClientIP(request);
    debugInfo.ip = userIP;

    // Вызываем API для определения города
    const apiUrl = `${API_BASE_URL}/detect-city${userIP ? `?ip=${userIP}` : ''}`;
    debugInfo.apiUrl = apiUrl;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    debugInfo.responseStatus = response.status;

    if (response.ok) {
      const data = await response.json();
      debugInfo.apiResponse = data;
      
      if (data.success && data.normalized_city) {
        return { city: data.normalized_city, debug: debugInfo };
      }
    } else {
      debugInfo.error = `HTTP ${response.status}`;
    }
  } catch (error: any) {
    debugInfo.error = error.message;
    console.error('City detection API failed:', error);
  }

  return { city: null, debug: debugInfo };
}

export async function middleware(request: NextRequest) {
  const { pathname, search, origin, hostname } = request.nextUrl;
  
  // Пропускаем статические файлы и API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/static') ||
      pathname.includes('.') ||
      pathname.startsWith('/sitemap') ||
      pathname.startsWith('/robots')) {
    return NextResponse.next();
  }

  // Проверяем, есть ли уже город в URL
  const pathParts = pathname.split('/').filter(Boolean);
  const possibleCity = pathParts[0];

  // Если URL уже содержит поддерживаемый город
  if (isSupportedCity(possibleCity)) {
    const response = NextResponse.next();
    response.headers.set('Link', `<${origin}/vsia_rossia>; rel="alternate"; hreflang="x-default"`);
    return response;
  }

  // Определяем город через API
  const { city: detectedCity, debug } = await detectCityViaAPI(request);
  const fallbackCity = 'vsia_rossia';
  
  // Выбираем город: определенный или фолбэк
  let targetCity = detectedCity && isSupportedCity(detectedCity) ? detectedCity : fallbackCity;

  // Логируем в серверную консоль
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Path:', pathname);
  console.log('Detected IP:', debug.ip);
  console.log('API URL:', debug.apiUrl);
  console.log('Response Status:', debug.responseStatus);
  console.log('API Response:', debug.apiResponse);
  console.log('Detected City:', detectedCity);
  console.log('Target City:', targetCity);
  console.log('=====================');

  // Если мы уже на правильном городе, но путь не начинается с него
  // ИЛИ если путь начинается с невалидного города
  const shouldRewrite = !isSupportedCity(possibleCity) || possibleCity !== targetCity;

  if (shouldRewrite) {
    // Сохраняем остаток пути после невалидного города
    const remainingPath = !isSupportedCity(possibleCity) && pathParts.length > 0 
      ? pathname.substring(possibleCity.length + 1) 
      : pathname;

    const newUrl = new URL(`/${targetCity}${remainingPath}${search}`, request.url);
    
    // Для корневого пути или явно невалидных городов делаем редирект
    if (pathname === '/' || !isSupportedCity(possibleCity)) {
      console.log('REDIRECTING to:', newUrl.toString());
      const response = NextResponse.redirect(newUrl);
      // Добавляем debug info в заголовки для отладки
      response.headers.set('x-debug-city', targetCity);
      response.headers.set('x-debug-detected', detectedCity || 'null');
      return response;
    } else {
      console.log('REWRITING to:', newUrl.toString());
      const response = NextResponse.rewrite(newUrl);
      response.headers.set('x-debug-city', targetCity);
      response.headers.set('x-debug-detected', detectedCity || 'null');
      return response;
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-debug-city', 'no_redirect');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots.txt).*)',
  ],
};