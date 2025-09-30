"use client"

import CallForm from "@/features/form/CallForm";
import Modal from "@/shared/ui/modal/Modal";
import Link from "next/link";
import { useState } from "react"
import { RxCross2 } from "react-icons/rx";

const ProductButton = () => {
    const [openModal, setOpenModal] = useState(false);


    return (
        <>
            {
                openModal ? (
                    <Modal setOpen={setOpenModal}>
                        <div className="w-full h-full flex justify-center items-center p-[12px]">
                            <div className="relative max-w-[700px] w-full p-[20px] md:p-[40px] bg-[#F2F1EF]  rounded-[20px] md:rounded-[40px]" onClick={(e) => e.stopPropagation()}>
                                <RxCross2 onClick={() => setOpenModal(false)} size={22} className="absolute top-[15px] right-[15px] z-22 cursor-pointer" />
                                <CallForm />
                            </div>
                        </div>
                    </Modal>
                ) : null
            }
            <div className="flex flex-row md:flex-col gap-[6px]">
                <button className="w-full min-h-[35px] py-[8px] md:min-h-[50px] flex justify-center items-center bg-[var(--blue-color)] text-white text-[length:var(--size-mobile-default-text)] rounded-[5px] cursor-pointer md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] font-semibold flex-col gap-[4px]" onClick={() => setOpenModal(true)}>
                    <span>Позвонить</span>
                    <span className="font-normal md:block hidden">8 999 333 22 11</span>
                </button>
                <Link href="https://wa.me/89630081446" className="w-full" target="_blank">
                    <button className="w-full min-h-[35px] md:min-h-[50px] py-[8px] flex justify-center items-center bg-[var(--green-text-color)] text-white text-[length:var(--size-mobile-default-text)] rounded-[5px] cursor-pointer md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] font-semibold flex-col gap-[4px]">
                        <span>Написать в WhatsApp</span>
                        <span className="font-normal md:block hidden">Отвечает в течении часа</span>
                    </button>
                </Link>
            </div>
        </>
    )
}

export default ProductButton