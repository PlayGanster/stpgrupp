// lib/ip-utils.ts
import { NextRequest } from 'next/server';

export function getClientIP(request: NextRequest): string | null {
  const headers = request.headers;
  
  // Все возможные заголовки с IP
  const ipHeaders = [
    'x-real-ip',
    'x-forwarded-for', 
    'x-client-ip',
    'cf-connecting-ip',
    'fastly-client-ip',
    'true-client-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ];

  let clientIP: string | null = null;

  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      console.log(`🔍 Found IP header ${header}:`, value);
      
      if (header === 'x-forwarded-for' || header === 'forwarded-for') {
        clientIP = value.split(',')[0].trim();
        break;
      }
      
      if (header === 'forwarded') {
        const forMatch = value.match(/for=([^;]+)/);
        if (forMatch) {
          clientIP = forMatch[1].trim();
          // Убираем кавычки если есть
          clientIP = clientIP.replace(/^"(.*)"$/, '$1');
          break;
        }
      }
      
      clientIP = value.trim();
      break;
    }
  }

  // Фильтруем локальные IP
  if (clientIP && isLocalIP(clientIP)) {
    console.log('🚫 Filtered local IP:', clientIP);
    
    // На продакшене возвращаем null для локальных IP
    if (process.env.NODE_ENV === 'production') {
      return null;
    }
    
    // На деве используем тестовые IP
    return getTestIP();
  }

  console.log('✅ Using IP:', clientIP);
  return clientIP;
}

function isLocalIP(ip: string): boolean {
  const localIPs = [
    '::1', '127.0.0.1', 'localhost',
    '10.', '192.168.', '172.16.', '172.17.', '172.18.', '172.19.',
    '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.',
    '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.'
  ];
  
  return localIPs.some(local => ip.startsWith(local));
}

function getTestIP(): string {
  const testIPs = [
    '95.84.234.1', // Москва
    '95.84.235.1', // СПб
    '95.84.236.1', // Екатеринбург
    '95.84.237.1', // Казань
    '95.84.238.1', // Новосибирск
    '95.84.239.1', // Сочи
  ];
  
  const randomIP = testIPs[Math.floor(Math.random() * testIPs.length)];
  console.log('🎲 Using test IP:', randomIP);
  return randomIP;
}