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

const Header = () => {
  const [openBurger, setOpenBurger] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const { slug, isCityVersion, currentPath } = useCity();
  const [openForm, setOpenForm] = useState(false);
  const [logoIsVisible, setLogoIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Состояние для поискового запроса
  const router = useRouter();

  const handleOpen = () => setOpenBurger(!openBurger);

  // Функция для обработки поиска
  const handleSearch = () => {
    if (!searchQuery.trim()) return; // Не делаем ничего если запрос пустой
    
    // Создаем базовый URL для каталога с учетом города
    let catalogUrl = '/catalog';
    if (isCityVersion && slug) {
      catalogUrl = `/${slug}/catalog`;
    }
    
    // Добавляем поисковый параметр
    const searchParams = new URLSearchParams();
    searchParams.append('query_search', searchQuery.trim());
    
    // Перенаправляем на страницу каталога с поисковым запросом
    router.push(`${catalogUrl}?${searchParams.toString()}`);
  };

  // Обработка нажатия Enter в поле поиска
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

  const renderCitySelect = () => {
     if(!openCity) return;
     return (
        <>
          <div className="wrapper w-dvw bg-white rounded-b-[20px] fixed md:top-[120px] top-[90px] z-50 shadow-xl">
            <div className="container w-full h-[calc(100dvh-120px)] md:h-[calc(100dvh-90px)] overflow-y-auto">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 py-3">
                <Link
                href={getLink("all")} 
                onClick={() => setOpenCity(false)}
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
                title="Вся Россия">
                  Вся Россия
                </Link>
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
          <div className="flex lg:mt-[20px] hover:text-[var(--href-hover-color)] underline cursor-pointer text-[14px] lg:text-[18px] items-center gap-[6px]" onClick={() => setOpenCity(!openCity)}>
            <div className="lg:flex hidden"><BsGeoAlt size={18} /></div>
            <div className="lg:hidden flex"><BsGeoAlt size={14} /></div> 
            {getCurrentCityName()}
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