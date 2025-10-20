"use client"

import CallForm from "@/features/form/CallForm";
import Modal from "@/shared/ui/modal/Modal";
import Link from "next/link";
import { useState } from "react"
import { RxCross2 } from "react-icons/rx";

interface ProductButtonType {
    nameProduct?: string
}

const ProductButton: React.FC<ProductButtonType> = ({
    nameProduct="Не загрузилось"
}) => {
    const [openModal, setOpenModal] = useState(false);


    return (
        <>
            {
                openModal ? (
                    <Modal setOpen={setOpenModal}>
                        <div className="w-full h-full flex justify-center items-center p-[12px]">
                            <div className="relative max-w-[700px] w-full p-[20px] md:p-[40px] bg-[#F2F1EF]  rounded-[20px] md:rounded-[40px]" onClick={(e) => e.stopPropagation()}>
                                <RxCross2 onClick={() => setOpenModal(false)} size={22} className="absolute top-[15px] right-[15px] z-22 cursor-pointer" />
                                <CallForm page={`Страница продукта ${nameProduct}`} productName={nameProduct} />
                            </div>
                        </div>
                    </Modal>
                ) : null
            }
            <div className="flex flex-row md:flex-col gap-[6px]">
                <button className="w-full min-h-[35px] py-[8px] md:min-h-[50px] flex justify-center items-center  text-white text-[length:var(--size-mobile-default-text)] rounded-[5px] cursor-pointer md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] font-semibold flex-col gap-[4px]" style={{ background: 'linear-gradient(90deg, #0dccff 0%, #4760ff 100%)' }} onClick={() => setOpenModal(true)}>
                    <span>Позвонить</span>
                    <span className="font-normal md:block hidden">8 999 333 22 11</span>
                </button>
                <Link href="https://wa.me/89630081446" className="w-full" target="_blank">
                    <button className="w-full min-h-[35px] md:min-h-[50px] py-[8px] flex justify-center items-center  text-white text-[length:var(--size-mobile-default-text)] rounded-[5px] cursor-pointer md:text-[length:var(--size-md-default-text)] lg:text-[length:var(--size-lg-default-text)] font-semibold flex-col gap-[4px] bg-gradient-to-r from-[#36c96d] to-[#2cd4b3] hover:from-[#2db55c] hover:to-[#24b89c]" >
                        <span>Написать в WhatsApp</span>
                        <span className="font-normal md:block hidden">Отвечает в течении часа</span>
                    </button>
                </Link>
            </div>
        </>
    )
}

export default ProductButton