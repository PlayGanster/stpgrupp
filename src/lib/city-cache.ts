// lib/city-cache.ts
import { NextRequest, NextResponse } from 'next/server';

interface CityCache {
  city: string;
  timestamp: number;
  path: string;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 минут
const COOKIE_NAME = 'user_city';

/**
 * Получает город из кэша
 */
export function getCachedCity(request: NextRequest): string | null {
  try {
    const cookie = request.cookies.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const cache: CityCache = JSON.parse(cookie.value);
    
    // Проверяем актуальность кэша
    if (Date.now() - cache.timestamp > CACHE_DURATION) {
      return null;
    }
    
    return cache.city;
  } catch {
    return null;
  }
}

/**
 * Сохраняет город в кэш
 */
export function setCachedCity(response: NextResponse, city: string, path: string = '/'): void {
  const cache: CityCache = {
    city,
    timestamp: Date.now(),
    path
  };
  
  response.cookies.set(COOKIE_NAME, JSON.stringify(cache), {
    maxAge: CACHE_DURATION / 1000,
    path: '/',
    sameSite: 'lax',
    httpOnly: true
  });
}

/**
 * Проверяет нужно ли обновить кэш
 */
export function shouldRefreshCache(request: NextRequest): boolean {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return true;

  try {
    const cache: CityCache = JSON.parse(cookie.value);
    return Date.now() - cache.timestamp > CACHE_DURATION;
  } catch {
    return true;
  }
}