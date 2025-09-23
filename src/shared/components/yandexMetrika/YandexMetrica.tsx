'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: any[]) => void;
    Ya?: any;
  }
}

interface YandexMetrikaConfig {
  webvisor: boolean;
  clickmap: boolean;
  accurateTrackBounce: boolean;
  trackLinks: boolean;
  trackHash?: boolean;
}

export default function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (window.ym) {
      const config: YandexMetrikaConfig = {
        webvisor: true,
        clickmap: true,
        accurateTrackBounce: true,
        trackLinks: true,
        trackHash: true,
      };
      
      window.ym(103220886, 'init', config);
    }
  }, []);

  useEffect(() => {
    if (window.ym) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window.ym(103220886, 'hit', url);
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
            })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
          `
        }}
      />
      <noscript>
        <div>
          <img 
            src="https://mc.yandex.ru/watch/103220886" 
            style={{ position: 'absolute', left: '-9999px' }} 
            alt="" 
          />
        </div>
      </noscript>
    </>
  );
}