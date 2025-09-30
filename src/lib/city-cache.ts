import { NextRequest, NextResponse } from "next/server";

// lib/city-cache.ts
interface CityCache {
  city: string;
  timestamp: number;
  path: string; // сохраняем путь где определили город
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 минут

export function getCachedCity(request: NextRequest): string | null {
  try {
    const cookie = request.cookies.get('user_city');
    if (!cookie?.value) return null;

    const cache: CityCache = JSON.parse(cookie.value);
    
    // Проверяем не устарел ли кэш
    if (Date.now() - cache.timestamp > CACHE_DURATION) {
      return null;
    }
    
    return cache.city;
  } catch {
    return null;
  }
}

export function setCachedCity(response: NextResponse, city: string, path: string = '/') {
  const cache: CityCache = {
    city,
    timestamp: Date.now(),
    path
  };
  
  response.cookies.set('user_city', JSON.stringify(cache), {
    maxAge: CACHE_DURATION / 1000, // в секундах
    path: '/',
    sameSite: 'lax',
    httpOnly: true
  });
}

export function shouldRefreshCache(request: NextRequest): boolean {
  const cookie = request.cookies.get('user_city');
  if (!cookie?.value) return true;

  try {
    const cache: CityCache = JSON.parse(cookie.value);
    return Date.now() - cache.timestamp > CACHE_DURATION;
  } catch {
    return true;
  }
}