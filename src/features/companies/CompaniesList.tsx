"use client"

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Head from "next/head";

// Импорты изображений
import AviastrAp from "@/assets/company/aviastr_ap.png";
import Bashneft from "@/assets/company/bashneft.png";
import Chzmk from "@/assets/company/chzmk.png";
import Gazpromneft from "@/assets/company/gazpromneft.png";
import Lesafre from "@/assets/company/lesafre.png";
import Lukoil from "@/assets/company/lukoil.png";
import Mvideo from "@/assets/company/mvideo.png";
import Rosneft from "@/assets/company/rosneft.png";
import Rostelekom from "@/assets/company/rostelekom.png";
import Rpk from "@/assets/company/rpk.png";
import Technonikol from "@/assets/company/technonikol.png";
import Technoprom from "@/assets/company/technoprom.png";

// Тип для данных компании
interface Company {
  id: number;
  image: any;
  alt: string;
  name: string;
}

const CompaniesList = () => {
  // Данные компаний с правильными alt-текстами
  const companies: Company[] = [
    { id: 1, image: AviastrAp, alt: "Авиастр Ап", name: "Авиастр Ап" },
    { id: 2, image: Bashneft, alt: "Башнефть", name: "Башнефть" },
    { id: 3, image: Chzmk, alt: "ЧЗМК", name: "ЧЗМК" },
    { id: 4, image: Gazpromneft, alt: "Газпромнефть", name: "Газпромнефть" },
    { id: 5, image: Lesafre, alt: "Лесафре", name: "Лесафре" },
    { id: 6, image: Lukoil, alt: "Лукойл", name: "Лукойл" },
    { id: 7, image: Mvideo, alt: "М.Видео", name: "М.Видео" },
    { id: 8, image: Rosneft, alt: "Роснефть", name: "Роснефть" },
    { id: 9, image: Rostelekom, alt: "Ростелеком", name: "Ростелеком" },
    { id: 10, image: Rpk, alt: "РПК", name: "РПК" },
    { id: 11, image: Technonikol, alt: "Технониколь", name: "Технониколь" },
    { id: 12, image: Technoprom, alt: "Технопром", name: "Технопром" }
  ];
  
  // Добавляем 4 дополнительных клона в конец
  const extendedCompanies = [
    ...companies,
    ...companies.slice(0, 5) // первые 4 элемента в конец
  ];

  const [currentIndex, setCurrentIndex] = useState(0); // стартуем с первого слайда
  const [visibleCount, setVisibleCount] = useState(5);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const slideWidthPercent = 100 / (visibleCount + 1);

  // Переход к следующему слайду
  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev + 1);
  }, [isAnimating]);

  // Обработчик окончания transition
  const handleTransitionEnd = useCallback(() => {
    if (!containerRef.current) return;

    // Если дошли до 5-го элемента с конца (начало клонов)
    if (currentIndex >= companies.length) {
      containerRef.current.style.transition = "none";
      setCurrentIndex(0); // сброс на первый оригинальный слайд
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.transform = `translateX(0%)`;
        }
      });
    }

    setIsAnimating(false);
  }, [currentIndex, companies.length]);

  // Автоматический слайд
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Обновление видимого количества слайдов при ресайзе
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 540) {
        setVisibleCount(2.4);
      } else if (window.innerWidth < 768) {
        setVisibleCount(3);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(5);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Обновляем трансформацию при изменении currentIndex
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transition = isAnimating
        ? "transform 0.5s ease-in-out"
        : "none";
      containerRef.current.style.transform = `translateX(-${slideWidthPercent * currentIndex}%)`;
    }
  }, [currentIndex, isAnimating, slideWidthPercent]);

  // Создаем микроразметку для списка компаний
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Наши партнеры и клиенты",
    "description": "Крупнейшие компании России, которые являются нашими партнерами и клиентами",
    "numberOfItems": companies.length,
    "itemListElement": companies.map((company, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": company.name
    }))
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </Head>
      
      <div className="w-full overflow-hidden relative mt-[20px]">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-14 md:w-24 bg-gradient-to-r from-white via-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0)] z-2"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 md:w-24 bg-gradient-to-l from-white via-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0)] z-2"></div>

        <div
          ref={containerRef}
          className="flex relative"
          style={{
            width: `${(visibleCount + 1) * (100 / visibleCount)}%`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedCompanies.map((company, index) => (
            <div
              key={`${company.id}-${index}`}
              className={`flex-shrink-0 px-1.5 ${
                index === 0 ? "md:ml-[0px] max-[540px]:ml-[-10%]" : ""
              }`}
              style={{ width: `${slideWidthPercent}%`, minWidth: "120px" }}
            >
              <div className="w-full h-[80px] md:h-[125px] rounded-[20px] overflow-hidden mx-auto bg-white flex items-center justify-center">
                <Image
                  src={company.image}
                  alt={company.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CompaniesList;