// lib/api-utils.ts
import { NextRequest } from 'next/server';

/**
 * Получает реальный IP клиента из заголовков nginx
 */
export function getClientIP(request: NextRequest): string | null {
  const headers = request.headers;
  
  // Приоритет заголовков для nginx
  const clientIP = headers.get('x-real-ip') || 
                   headers.get('x-forwarded-for')?.split(',')[0].trim();
  
  console.log('🔍 IP Detection:', {
    'x-real-ip': headers.get('x-real-ip'),
    'x-forwarded-for': headers.get('x-forwarded-for'),
    'selected': clientIP
  });
  
  return clientIP;
}

/**
 * Проверяет валидность IP
 */
export function isValidIP(ip: string | null): boolean {
  if (!ip) return false;
  
  const localIPs = [
    '::1', '127.0.0.1', 'localhost', '::ffff:127.0.0.1',
    '192.168.', '10.', '172.16.', '172.17.', '172.18.', '172.19.'
  ];
  
  return !localIPs.some(local => ip.startsWith(local));
}