"use client"

import Link from "next/link"
import { useState } from "react"
import { IoMdArrowDropdown, IoMdArrowDropright, IoMdArrowDropup } from "react-icons/io"
import { IoCaretForwardOutline } from "react-icons/io5"

const Sidebar = () => {
    const [menu, setMenu] = useState([
        {
            name: "Категории",
            items: [
                {
                    name: "Создать категорию",
                    href: "/admin/categories/create"
                },
                {
                    name: "Список категорий",
                    href: "/admin/categories"
                }
            ]
        },
        {
            name: "Новости",
            items: [
                {
                    name: "Создать новость",
                    href: "/admin/news/create"
                },
                {
                    name: "Список новостей",
                    href: "/admin/news"
                }
            ],
            open: false
        },
        {
            name: "Техника",
            items: [
                {
                    name: "Создать технику",
                    href: "/admin/technika/create"
                },
                {
                    name: "Список техники",
                    href: "/admin"
                }
            ],
            open: false
        },
        {
            name: "Вопросы",
            items: [
                {
                    name: "Создать вопрос",
                    href: "/admin/questions/create"
                },
                {
                    name: "Список вопросов",
                    href: "/admin/questions"
                }
            ],
            open: false
        },
        {
            name: "Наши работы",
            items: [
                {
                    name: "Создать рилс",
                    href: "/admin/reels/create"
                },
                {
                    name: "Список рилсов",
                    href: "/admin/reels"
                }
            ],
            open: false
        },
        {
            name: "Отзывы",
            items: [
                {
                    name: "Создать отзыв",
                    href: "/admin/reels/create"
                },
                {
                    name: "Список отзывов",
                    href: "/admin/reels"
                }
            ],
            open: false
        }
    ])

    const handleOpenItems = (i: number) => {
        const copy = menu.filter((el, index) => {
            if(i === index) el.open = !el.open;
            return el;
        })
        setMenu(copy)
    }

    return (
        <div className="w-[250px] h-dvh bg-[var(--bg-grey-color)] relative">
            <div className="w-full h-[60px] border-b-2 border-[var(--grey-color)] px-[12px] justify-center flex items-center font-black text-white text-[24px]">
                АДМИН-ПАНЕЛЬ
            </div>
            <div className="h-[calc(100dvh_-_60px)] overflow-y-auto py-[12px]">
                <ul className="flex flex-col gap-[12px]">
                    {
                        menu.map((el, index) => {
                            return (
                                <li className="flex flex-col gap-[6px] px-[12px]" key={index}>
                                    <div className="w-full text-[16px] justify-between items-center flex text-white cursor-pointer" onClick={()=> handleOpenItems(index)}>
                                        {el.name} {el.open ? (<IoMdArrowDropdown size={20} />) : (<IoMdArrowDropright size={20} />)}
                                    </div>
                                    {
                                        el.open ? (
                                            <>
                                                {
                                                    el.items.map((item, index) => (
                                                        <Link href={item.href} key={index}>
                                                            <div className=" text-white text-[14px] flex items-center gap-[3px] cursor-pointer">
                                                                <IoCaretForwardOutline size={14} /> {item.name}
                                                            </div>
                                                        </Link>
                                                    ))
                                                }
                                            </>
                                        ) : null
                                    }
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        </div>
    )
}

export default Sidebar