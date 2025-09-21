"use client"

import { API_BASE_URL } from "@/constant/api-url";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ProductImagesType {
    imgs: string | undefined;
}

const ProductImages: React.FC<ProductImagesType> = ({
    imgs
}) => {
    const [selectImg, setSelectImg] = useState(0);
    const [images, setImages] = useState<{img: string}[]>([])

    useEffect(() => {
        if(imgs !== undefined) {
            const imagesNew = imgs.split(',');
            const list: {img: string}[] = imagesNew.map((el) => {
                return {img: el.trim()}; // trim() убирает лишние пробелы
            });
            setImages(list)
        }
    }, [])

    if(images.length === 0) return null
    return (
        <div className="mt-[12px] flex-col gap-[12px]">
            <div className="w-full relative max-[450px]:h-[200px] min-[450px]:h-[350px] lg:h-[458px]">
                <Image
                    fill
                    alt="Картинка"
                    src={`${API_BASE_URL}/uploads/products/${images[selectImg].img}`}
                    className="object-cover brightness-50"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
                <Image src={`${API_BASE_URL}/uploads/products/${images[selectImg].img}`} fill className="object-contain" sizes="(max-width: 610px) 100vw, 50vw" alt="Картинка техники" />
            </div>
            <div className="min-w-full mt-[12px] overflow-x-auto">
                <div className="flex gap-[4px] md:flex-wrap">
                    {
                        images.map((el, index) => {
                            if(index === selectImg) {
                                return (
                                    <div key={index} className="min-w-[75px] cursor-pointer h-[55px] relative border-[2px] border-[var(--blue-color)]">
                                        <Image
                                            fill
                                            alt="Картинка"
                                            src={`${API_BASE_URL}/uploads/products/${el.img}`}
                                            className="object-cover brightness-50"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                        <Image src={`${API_BASE_URL}/uploads/products/${el.img}`} fill className="object-contain" sizes="(max-width: 610px) 100vw, 50vw" alt="Картинка техники" />
                                    </div>
                                )
                            }else {
                                return (
                                    <div key={index} className="min-w-[75px] cursor-pointer h-[55px] relative border-[2px] border-transparent" onClick={() => setSelectImg(index)}>
                                        <Image
                                            fill
                                            alt="Картинка"
                                            src={`${API_BASE_URL}/uploads/products/${el.img}`}
                                            className="object-cover brightness-50"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                        <Image src={`${API_BASE_URL}/uploads/products/${el.img}`} fill className="object-contain" sizes="(max-width: 610px) 100vw, 50vw" alt="Картинка техники" />
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default ProductImages