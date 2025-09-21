"use client"

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface QuestionItemType {
    name: string;
    description: string;
    itemProp?: string;
    itemType?: string;
}

const QuestionItem: React.FC<QuestionItemType> = ({
    name,
    description,
    itemProp,
    itemType
}) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => {
        setOpen(!open)
    }

    return (
        <div 
            onClick={handleOpen} 
            className="flex flex-col gap-[12px]"
            itemProp={itemProp}
            itemType={itemType}
        >
            <div 
                className="flex gap-[8px] font-[700] cursor-pointer lg:text-[length:var(--size-lg-large-text)] md:text-[length:var(--size-md-large-text)] text-[length:var(--size-mobile-large-text)] items-start md:items-center select-none" 
                itemProp="name"
            >
                {name} 
                <IoIosArrowDown 
                    size={22} 
                    className="transition-all mt-[3px]" 
                    style={{transform: `rotateZ(${open ? "180deg" : "360deg"})`}} 
                />
            </div>
            
            {open && (
                <div 
                    className="
                        transition-all duration-1000 
                        overflow-hidden 
                        lg:text-[length:var(--size-lg-default-text)] md:text-[length:var(--size-md-default-text)] text-[length:var(--size-mobile-default-text)]
                        opacity-100 max-h-[1000px]
                        font-[500]
                    "
                    style={{
                        opacity: open ? 1 : 0,
                        maxHeight: open ? "1000px" : "0px",
                        transitionProperty: 'opacity, max-height',
                        transitionDuration: '1000ms',
                        transitionTimingFunction: 'ease-in-out'
                    }}
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                >
                    <span itemProp="text">{description}</span>
                </div>
            )}
        </div>
    )
}

export default QuestionItem