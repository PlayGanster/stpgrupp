// middleware.ts - улучшенная версия
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { detectCity, ALL_CITIES, isSupportedCity } from '@/config/cities';

export function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;
  
  // Пропускаем статические файлы и API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/static') ||
      pathname.includes('.') ||
      pathname.startsWith('/sitemap') || // Добавляем исключение для карты сайта
      pathname.startsWith('/robots')) {   // И для robots.txt
    return NextResponse.next();
  }

  // Проверяем, есть ли уже город в URL
  const pathParts = pathname.split('/').filter(Boolean);
  const possibleCity = pathParts[0];

  // Если URL уже содержит поддерживаемый город (включая "Вся Россия")
  if (isSupportedCity(possibleCity)) {
    // Добавляем канонический URL для избежания дублирования контента
    const response = NextResponse.next();
    
    // Устанавливаем заголовок x-default для hreflang
    response.headers.set('Link', `<${origin}/vsia_rossia>; rel="alternate"; hreflang="x-default"`);
    
    return response;
  }

  // Автоматически определяем город
  const detectedCity = detectCity(request);
  const fallbackCity = 'vsia_rossia';
  
  // Выбираем город: определенный или фолбэк
  let targetCity = detectedCity && isSupportedCity(detectedCity) ? detectedCity : fallbackCity;

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
      return NextResponse.redirect(newUrl);
    } else {
      return NextResponse.rewrite(newUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots.txt).*)',
  ],
};