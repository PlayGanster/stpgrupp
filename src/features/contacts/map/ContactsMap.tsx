"use client"

import { useEffect, useRef, useCallback } from 'react'

interface ContactsMapProps {
  coordinates: [number, number];
  address: string;
  zoom?: number;
  height?: number;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function ContactsMap({ coordinates, address, zoom=17, height=400 }: ContactsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const scriptLoadedRef = useRef(false)

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.ymaps) return

    window.ymaps.ready(() => {
      // Очищаем предыдущую карту если существует
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
      }

      const map = new window.ymaps.Map(mapRef.current, {
        center: coordinates,
        zoom: zoom,
        controls: ['zoomControl']
      })

      const placemark = new window.ymaps.Placemark(
        coordinates,
        {
          hintContent: address,
          balloonContent: address
        },
        {
          preset: 'islands#redDotIcon',
          iconColor: '#FF0000'
        }
      )

      map.geoObjects.add(placemark)
      map.behaviors.disable('scrollZoom')
      
      mapInstanceRef.current = map
    })
  }, [coordinates, address])

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return

    const loadMap = () => {
      scriptLoadedRef.current = true
      initializeMap()
    }

    if (window.ymaps) {
      loadMap()
    } else if (!scriptLoadedRef.current) {
      const script = document.createElement('script')
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YMAPS_API_KEY}&lang=ru_RU`
      script.async = true
      script.onload = loadMap
      script.onerror = () => {
        console.error('Failed to load Yandex Maps script')
        scriptLoadedRef.current = false
      }
      
      document.head.appendChild(script)

      return () => {
        // Не удаляем скрипт при размонтировании, так как он может понадобиться другим компонентам
      }
    }
  }, [initializeMap])

  // Обновляем карту при изменении координат или адреса
  useEffect(() => {
    if (scriptLoadedRef.current && window.ymaps) {
      initializeMap()
    }
  }, [initializeMap])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy()
        } catch (e) {
          console.error('Error destroying map:', e)
        }
      }
    }
  }, [])

  return (
    <div className={`mt-[12px] ${`h-[${height}px]`} rounded-[20px] overflow-hidden`} 
         aria-label="Карта с местоположением офиса">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}