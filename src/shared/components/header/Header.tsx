"use client";
import { menuHeader } from '@/constant/page-url';
import Button from '@/shared/ui/button/Button';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FaPhone } from 'react-icons/fa6';
import { RxCross2, RxHamburgerMenu } from 'react-icons/rx';
import LogoImage from "@/assets/stpgrupplogo.png"
import LogoImageWhite from "@/assets/logo-white.png"
import Image from 'next/image';
import { BsGeoAlt } from 'react-icons/bs';
import { CITY_CASES, isSupportedCity } from '@/config/cities';
import { useCity } from '@/hooks/useCity';
import Modal from '@/shared/ui/modal/Modal';
import { useRouter } from 'next/navigation';
import CallForm from '@/features/form/CallForm';
import { API_BASE_URL } from '@/constant/api-url';

const Header = () => {
  const [openBurger, setOpenBurger] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const { slug, isCityVersion, currentPath } = useCity();
  const [openForm, setOpenForm] = useState(false);
  const [logoIsVisible, setLogoIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [showCityPopup, setShowCityPopup] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string>('');
  const router = useRouter();

  const handleOpen = () => setOpenBurger(!openBurger);

  // Функция для определения города по GPS
  const detectCityByGPS = async () => {
    if (!navigator.geolocation) {
      console.log('📍 GPS not supported');
      return;
    }

    if (isDetectingGPS) return;
    
    setIsDetectingGPS(true);
    console.log('📍 Starting GPS detection...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('📍 Coordinates:', { lat: latitude, lng: longitude });

          const city = await detectCityByCoordinates(latitude, longitude);
          
          if (city && isSupportedCity(city)) {
            console.log('📍 GPS city detected:', city);
            saveGPSCache(city, latitude, longitude);
            updateCityIfNeeded(city);
          } else {
            console.log('📍 No city found for coordinates');
          }
        } catch (error) {
          console.error('📍 GPS detection failed:', error);
        } finally {
          setIsDetectingGPS(false);
        }
      },
      (error) => {
        console.log('📍 GPS error:', error.message);
        setIsDetectingGPS(false);
        
        // Показываем сообщение об ошибке
        if (error.code === error.PERMISSION_DENIED) {
          alert('Для определения точного города разрешите доступ к геолокации');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 минут
      }
    );
  };

  const detectCityByCoordinates = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/detect-city-gps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lng }),
      });

      const data = await response.json();
      console.log('📍 GPS API response:', data);

      if (data.success && data.normalized_city) {
        return data.normalized_city;
      }
    } catch (error) {
      console.error('📍 GPS API error:', error);
    }
    
    return null;
  };

  const updateCityIfNeeded = (detectedCity: string) => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);
    const currentCity = pathParts[0];

    // Если текущий город не совпадает с определенным по GPS
    if (currentCity !== detectedCity && isSupportedCity(detectedCity)) {
      console.log('📍 City mismatch, updating...', { current: currentCity, detected: detectedCity });
      
      // Сохраняем в куки
      document.cookie = `user_city=${JSON.stringify({
        city: detectedCity,
        timestamp: Date.now(),
        path: currentPath
      })}; path=/; max-age=900`;
      
      // Показываем кастомное всплывающее уведомление
      setDetectedCity(detectedCity);
      setShowCityPopup(true);
    } else {
      console.log('📍 Already on correct city:', detectedCity);
    }
  };

  // Функция для перехода на город
  const switchToDetectedCity = () => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);
    const currentCity = pathParts[0];
    
    const newPath = `/${detectedCity}${currentPath.substring(currentCity ? currentCity.length + 1 : 0)}`;
    window.location.href = newPath;
    setShowCityPopup(false);
  };

  // Функция для отказа от перехода
  const declineCitySwitch = () => {
    setShowCityPopup(false);
    // Сохраняем в localStorage что пользователь отказался
  };

  const saveGPSCache = (city: string, lat: number, lng: number) => {
    const cache = {
      city,
      timestamp: Date.now(),
      coordinates: { lat, lng }
    };
    localStorage.setItem('gps_city_cache', JSON.stringify(cache));
  };

  const getGPSCache = () => {
    try {
      const cache = localStorage.getItem('gps_city_cache');
      return cache ? JSON.parse(cache) : null;
    } catch {
      return null;
    }
  };

  // Автоматически определяем город по GPS при загрузке
  useEffect(() => {
    // Проверяем, не отказался ли пользователь ранее

    // Проверяем есть ли свежий GPS кэш (1 час)
    const gpsCache = getGPSCache();
    if (gpsCache && Date.now() - gpsCache.timestamp < 60 * 60 * 1000) {
      console.log('📍 Using cached GPS city:', gpsCache.city);
      updateCityIfNeeded(gpsCache.city);
      return;
    }

    // Запускаем GPS определение через 2 секунды после загрузки
    const timer = setTimeout(() => {
      detectCityByGPS();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    let catalogUrl = '/catalog';
    if (isCityVersion && slug) {
      catalogUrl = `/${slug}/catalog`;
    }
    
    const searchParams = new URLSearchParams();
    searchParams.append('query_search', searchQuery.trim());
    
    router.push(`${catalogUrl}?${searchParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    if (openBurger) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openBurger]);

  useEffect(() => {
    if(openCity) {
      document.documentElement.classList.add('no-scroll');
      document.body.classList.add("no-scroll");
    }else {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove("no-scroll");
    }
  }, [openCity])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
          setLogoIsVisible(true);
      }else {
        setLogoIsVisible(false)
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getLink = (newCity: string) => {
    let pathWithoutCity = currentPath;
    
    if (isCityVersion && currentPath.startsWith(`/${slug}`)) {
      pathWithoutCity = currentPath.slice(`/${slug}`.length);
      if (pathWithoutCity === '') pathWithoutCity = '/';
    }

    if (newCity === 'all') {
      return pathWithoutCity;
    } else {
      return `/${newCity}${pathWithoutCity === '/' ? '' : pathWithoutCity}`;
    }
  }

  const getCurrentCityName = () => {
    if (!isCityVersion) return 'Вся Россия';
    const cityData = CITY_CASES[slug as keyof typeof CITY_CASES];
    return cityData ? cityData.nominative : 'Неизвестный город';
  }

  const getCityName = (cityKey: string): string => {
    const cityData = CITY_CASES[cityKey as keyof typeof CITY_CASES];
    return cityData ? cityData.nominative : cityKey;
  }

  // Рендер всплывающего уведомления о смене города
  // Рендер всплывающего уведомления о смене города
// Рендер всплывающего уведомления о смене города
const renderCityPopup = () => {
  if (!showCityPopup) return null;

  return (
    <div onClick={(e) => e.stopPropagation()} className="absolute top-[150%] w-[220px] right-[-20px] flex justify-center z-[24]">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-xs mx-4">
        <div className="p-3">
          <div className="flex items-start gap-2">
            <BsGeoAlt className="text-blue-600 text-lg mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 mb-2">
                Ваш город <span className="font-semibold text-blue-600">{getCityName(detectedCity)}</span><br/>
                Перейти на него?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={switchToDetectedCity}
                  className="flex-1 py-1.5 px-3 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Да
                </button>
                <button
                  onClick={declineCitySwitch}
                  className="flex-1 py-1.5 px-3 text-sm border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Нет
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  const renderCitySelect = () => {
     if(!openCity) return;
     return (
        <>
          <div className="wrapper w-dvw bg-white rounded-b-[20px] fixed md:top-[120px] top-[90px] z-50 shadow-xl">
            <div className="container w-full h-[calc(100dvh-120px)] md:h-[calc(100dvh-90px)] overflow-y-auto">
              {/* Кнопка для определения по GPS */}
              <div className="py-3 border-b border-gray-200">
                <button
                  onClick={() => {
                    setOpenCity(false);
                    detectCityByGPS();
                  }}
                  disabled={isDetectingGPS}
                  className="
                    w-full flex items-center justify-center gap-2
                    h-10 px-4
                    bg-blue-500 text-white
                    rounded-md
                    text-sm font-medium
                    hover:bg-blue-600
                    disabled:bg-gray-400 disabled:cursor-not-allowed
                    transition-colors duration-150 cursor-pointer
                  "
                >
                  <BsGeoAlt size={16} />
                  {isDetectingGPS ? 'Определяем...' : 'Определить мой город по GPS'}
                </button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 py-3">
                {Object.entries(CITY_CASES).sort(([keyA, cityA], [keyB, cityB]) => 
                  cityA.nominative.localeCompare(cityB.nominative)
                ).map(([key, city]) => {
                  if(key === "vsia_rossia") return null;
                  return (
                    <Link 
                      href={getLink(key)} 
                      onClick={() => setOpenCity(false)}
                      key={key}
                      className="
                        inline-flex items-center justify-center
                        h-8 px-2
                        bg-white border border-gray-200 
                        rounded-md
                        md:text-[0.9rem] text-xs font-medium text-gray-700
                        hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700
                        transition-colors duration-150
                        whitespace-nowrap
                        overflow-hidden text-ellipsis
                      "
                      title={city.nominative}
                    >
                      {city.nominative}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="w-dvw h-dvh bg-black opacity-50 fixed top-0 left-0 z-49" onClick={() => setOpenCity(false)}></div>
        </>
     )
  }

  const getMenuLink = (href: string) => {
    if (isCityVersion) {
      return `/${slug}${href}`;
    }
    return href;
  }

  return (
    <>
      
      {
        openForm ? (
            <Modal setOpen={setOpenForm}>
                <div className="w-full h-full flex justify-center items-center p-[12px]">
                    <div className="relative max-w-[700px] w-full p-[20px] md:p-[40px] bg-[#E5E9F2]  rounded-[20px] md:rounded-[40px]" onClick={(e) => e.stopPropagation()}>
                        <RxCross2 onClick={() => setOpenForm(false)} size={22} className="absolute top-[15px] right-[15px] z-22 cursor-pointer" />
                        <CallForm />
                    </div>
                </div>
            </Modal>
        ) : null
      }
      <div className="wrapper bg-[var(--bg-grey-color)] z-50 fixed w-[100dvw]">
        <div className="container h-[45px] justify-between flex items-center gap-[20px]">
          {
            logoIsVisible ? (
              <div className='flex gap-[20px] items-center'>
                <Link href={isCityVersion ? `/${slug}` : '/'} className="lg:h-[30px] lg:mt-[10px] h-[30px] min-w-max w-[auto]">
                  <Image src={LogoImageWhite} alt="Логотип СТП ГРУПП" className="md:h-[32px] h-[30px] md:mt-[-5px] min-w-max w-[auto]" />
                </Link>
                <ul className="gap-[12px] items-center md:flex hidden">
                  {
                    menuHeader.map((el, index) => (
                      <Link href={getMenuLink(el.href)} key={index}>
                        <li className="text-[14px] text-white hover:text-[var(--href-hover-color)]">{el.name}</li>
                      </Link>
                    ))
                  }
                </ul>
                {openBurger ? (<RxCross2 className="md:hidden flex text-white" onClick={handleOpen} size={24} />) : (<RxHamburgerMenu className="md:hidden flex text-white" onClick={handleOpen} size={24} />)}
              </div>
            ) : (
              <>
                  {openBurger ? (<RxCross2 className="md:hidden flex text-white" onClick={handleOpen} size={24} />) : (<RxHamburgerMenu className="md:hidden flex text-white" onClick={handleOpen} size={24} />)}
              </>
            )
          }
          {
            logoIsVisible ? "" : (
              <ul className="gap-[12px] items-center md:flex hidden">
                {
                  menuHeader.map((el, index) => (
                    <Link href={getMenuLink(el.href)} key={index}>
                      <li className="text-[14px] text-white hover:text-[var(--href-hover-color)]">{el.name}</li>
                    </Link>
                  ))
                }
              </ul>
            )
          }
          <div className="flex items-center gap-[12px]">
            <div className="lg:flex hidden"><Button onClick={() => setOpenForm(!openForm)} name="Позвонить по телефону" icon={FaPhone} height={35} size="default" padding="normal" /></div>
            <div className="lg:flex hidden"><Link target='_blank' href="https://wa.me/89630081446"><Button name="Написать в WhatsApp" color="green" icon={FaWhatsapp} height={35} size="default" padding="normal" /></Link></div>
            <div className="md:flex hidden lg:hidden"><Button onClick={() => setOpenForm(!openForm)} name="Позвонить по телефону" icon={FaPhone} height={35} size="small" padding="normal" /></div>
            <div className="md:flex hidden lg:hidden"><Link target='_blank' href="https://wa.me/89630081446"><Button name="Написать в WhatsApp" color="green" icon={FaWhatsapp} height={35} size="small" padding="normal" /></Link></div>
            <div className="md:hidden flex lg:hidden"><Button onClick={() => setOpenForm(!openForm)} icon={FaPhone} height={35} size="no-name" padding="small" /></div>
            <div className="md:hidden flex lg:hidden"><Link target='_blank' href="https://wa.me/89630081446"><Button color="green" icon={FaWhatsapp} height={35} size="no-name" padding="small" /></Link></div>
          </div>
        </div>
      </div>
      {
        openCity ? (
          <div className="w-dvw md:h-[75px] h-[45px] mt-[45px]"></div>
        ) : null
      }
      <div className={`wrapper ${openCity ? "z-50 fixed top-[45px] w-dvw bg-white" : "w-dvw"}`}>
        <div className={`container ${openCity ? "" : "mt-[45px]"} flex justify-between items-center gap-[12px] h-[45px] md:h-[75px]`}>
          <Link href={isCityVersion ? `/${slug}` : '/'} className="lg:h-[61px] lg:mt-[10px] md-[50px] h-[40px] min-w-max w-[auto]">
            <Image src={LogoImage} alt="Логотип СТП ГРУПП" className="lg:h-[61px] md-[50px] h-[40px] min-w-max w-[auto]" />
          </Link>
          <div className="md:flex hidden lg:mt-[20px] lg:max-w-[1000px] max-w-[550px] w-full h-[35px] lg:h-[40px] justify-between rounded-[12px] bg-[var(--blue-color)]">
            <div className="w-full p-[2px] h-full">
              <input 
                placeholder="Поиск по технике" 
                className="w-full bg-white outline-none p-[8px_15px] rounded-[10px_10px_8px_8px] h-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="lg:flex hidden"><Button name="Найти" height={40} size="default" onClick={handleSearch} /></div>
            <div className="lg:hidden flex"><Button name="Найти" height={35} size="default" onClick={handleSearch} /></div>
          </div>
          <div className="flex lg:mt-[20px] hover:text-[var(--href-hover-color)] relative underline cursor-pointer text-[14px] lg:text-[18px] items-center gap-[6px]" onClick={() => setOpenCity(!openCity)}>
            <div className="lg:flex hidden"><BsGeoAlt size={18} /></div>
            <div className="lg:hidden flex"><BsGeoAlt size={14} /></div> 
            {getCurrentCityName()}
            {isDetectingGPS && " (определяем...)"}
            {renderCityPopup()}
          </div>
        </div>
      </div>
      <div className="wrapper">
        <div className="container md:hidden flex w-full min-h-[35px]">
          <div className="md:hidden mt-[10px] flex w-full h-[35px] lg:h-[45px] justify-between rounded-[12px] bg-[var(--blue-color)]">
            <div className="w-full p-[2px] h-full">
              <input 
                placeholder="Поиск по технике" 
                className="w-full text-[14px] bg-white outline-none p-[8px_15px] rounded-[10px_10px_8px_8px] h-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="lg:flex hidden"><Button name="Найти" height={45} size="default" onClick={handleSearch} /></div>
            <div className="lg:hidden flex"><Button name="Найти" height={35} size="default" onClick={handleSearch} /></div>
          </div>
        </div>
      </div>
      {
        openBurger ? (
          <div className=" w-[100dvw] h-full top-[45px] flex bg-[var(--bg-grey-color)] fixed z-50  md:hidden items-center justify-center">
            <ul className="gap-[12px] items-center flex-col justify-center text-center">
              {
                menuHeader.map((el, index) => (
                  <Link 
                    href={getMenuLink(el.href)} 
                    onClick={handleOpen} 
                    key={index}
                  >
                    <li className="text-[18px] text-white hover:text-[var(--href-hover-color)]">{el.name}</li>
                  </Link>
                ))
              }
            </ul>
          </div>
        ) : null
      }
      {renderCitySelect()}
    </>
  );
};

export default Header;