// lib/api-utils.ts
import { NextRequest } from 'next/server';

export function getClientIP(request: NextRequest): string | null {
  const headers = request.headers;
  
  console.log('🔍 IP HEADERS CHECK:');
  console.log('- x-real-ip:', headers.get('x-real-ip'));
  console.log('- x-forwarded-for:', headers.get('x-forwarded-for'));
  console.log('- x-forwarded-host:', headers.get('x-forwarded-host'));
  console.log('- host:', headers.get('host'));
  console.log('- remote-addr:', headers.get('remote-addr'));
  
  // Для nginx приоритет
  const clientIP = headers.get('x-real-ip') || 
                   headers.get('x-forwarded-for')?.split(',')[0].trim() || "";
  
  console.log('✅ Selected IP:', clientIP);
  return clientIP;
}