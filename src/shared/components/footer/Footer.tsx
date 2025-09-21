"use client"

import { DocumentList, menuHeader } from "@/constant/page-url"
import Image from "next/image"
import Link from "next/link"
import LogoImage from "@/assets/logo-white.png"
import Button from "@/shared/ui/button/Button"
import { useState } from "react"
import Modal from "@/shared/ui/modal/Modal"
import ContactForm from "@/features/form/ContactForm"
import { RxCross2 } from "react-icons/rx"
import { useCity } from "@/hooks/useCity"
import { CITY_CASES } from "@/config/cities"

const Footer = () => {
    const [openForm, setOpenForm] = useState(false);
    const { slug, isCityVersion, currentPath } = useCity();

    // Функция для создания ссылок с учетом города
    const getLink = (href: string) => {
        if (isCityVersion) {
            return `/${slug}${href}`;
        }
        return href;
    }

    // Функция для получения ссылки на смену города (аналогичная той, что в Header)
    const getCityLink = (newCity: string) => {
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

    // Получаем отображаемое название текущего города
    const getCurrentCityName = () => {
        if (!isCityVersion) return 'Вся Россия';
        const cityData = CITY_CASES[slug as keyof typeof CITY_CASES];
        return cityData ? cityData.nominative : 'Неизвестный город';
    }

    return (
        <>
            {
                openForm ? (
                    <Modal setOpen={setOpenForm}>
                        <div className="w-full h-full flex justify-center items-center p-[12px]">
                            <div className="relative max-w-[700px] w-full p-[20px] md:p-[40px] bg-[#F2F1EF]  rounded-[20px] md:rounded-[40px]" onClick={(e) => e.stopPropagation()}>
                                <RxCross2 onClick={() => setOpenForm(false)} size={22} className="absolute top-[15px] right-[15px] z-22 cursor-pointer" />
                                <ContactForm />
                            </div>
                        </div>
                    </Modal>
                ) : null
            }
            <div className="wrapper bg-[var(--bg-grey-color)]">
                <div className="container min-h-[100px] gap-[12px] flex flex-col md:flex-row py-[25px] md:py-[35px] justify-between">
                    <div className="md:w-[75%] md:items-start items-center justify-between flex flex-col gap-[20px] md:gap-[12px]">
                        <ul className="md:gap-[20px] gap-[12px] items-center flex font-semibold lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] md:flex-nowrap flex-wrap justify-center">
                            {
                                menuHeader.map((el, index) => (
                                    <Link href={getLink(el.href)} key={index}>
                                        <li className=" text-white hover:text-[var(--href-hover-color)] underline">{el.name}</li>
                                    </Link>
                                ))
                            }
                            <Link href={getLink("/about")}>
                                <li className=" text-white hover:text-[var(--href-hover-color)] cursor-pointer underline">О компании</li>
                            </Link>
                        </ul>
                        <ul className="gap-[3px] flex flex-col list-disc md:items-start items-center text-center md:text-start  lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)]  list-inside">
                            {
                                DocumentList.map((el, index) => (
                                    <Link href={getLink(el.href)} key={index}>
                                        <li className=" text-white hover:text-[var(--href-hover-color)] list-inside">{el.name}</li>
                                    </Link>
                                ))
                            }
                        </ul>
                        <div className="md:hidden flex flex-row items-center justify-center md:min-w-[15%] gap-[20px] flex-wrap">
                            <Link href={isCityVersion ? `/${slug}` : '/'} className="lg:h-[61px] lg:mt-[10px] md-[50px] h-[61px] min-w-max w-[auto]">
                                <Image src={LogoImage} alt="Логотип СТП ГРУПП" className="lg:h-[61px] md-[50px] h-[61px] min-w-max w-[auto]" />
                            </Link>
                            <div className="flex flex-col gap-[3px]">
                                <p className="lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] font-black text-white">Контакты:</p>
                                <Link href="tel:+79303334046" className="lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] text-white">+79303334046</Link>
                                <Link href="mailto:stp.grupp@mail.ru" className="lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] text-[var(--blue-color)]">stp.grupp@mail.ru</Link>
                                <p className="lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] text-white">Пн. - Вск. 9:00 - 23:00</p>
                            </div>
                            <div className="md:flex hidden">
                                <Button name="Заказать технику" onClick={() => setOpenForm(!openForm)} color="light-gray" size="default" />
                            </div>
                            <div className="md:hidden flex">
                                <Button name="Заказать технику" onClick={() => setOpenForm(!openForm)} color="light-gray" size="small" />
                            </div>
                        </div>
                        <p className="lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] text-[var(--grey-text-color)] text-center">Общество с ограниченной ответственностью СПЕЦТЕХПАРК ГРУПП ОГРН: 1234500005024 ИНН: 4500011167</p>
                    </div>
                    <div className="md:flex hidden flex-col md:min-w-[15%] gap-[12px]">
                        <Link href={isCityVersion ? `/${slug}` : '/'} className="lg:h-[61px] lg:mt-[10px] md-[50px] h-[40px] min-w-max w-[auto]">
                            <Image src={LogoImage} alt="Логотип СТП ГРУПП" className="lg:h-[61px] md-[50px] h-[40px] min-w-max w-[auto]" />
                        </Link>
                        <div className="flex flex-col gap-[3px]">
                            <p className="lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] font-black text-white">Контакты:</p>
                            <Link href="tel:+79303334046" className="lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] text-white">+79303334046</Link>
                            <Link href="mailto:stp.grupp@mail.ru" className="lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] text-[var(--blue-color)]">stp.grupp@mail.ru</Link>
                            <p className="lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)] text-white">Пн. - Вск. 9:00 - 23:00</p>
                        </div>
                        <div className="md:flex hidden">
                            <Button name="Заказать технику" onClick={() => setOpenForm(!openForm)} color="light-gray" size="default" />
                        </div>
                        <div className="md:hidden flex">
                            <Button name="Заказать технику" onClick={() => setOpenForm(!openForm)} color="light-gray" size="small" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Footer