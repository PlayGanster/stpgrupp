"use client"

import { FaCheck } from "react-icons/fa";
import { memo, useCallback } from "react";

interface CheckboxType {
    value: boolean;
    setValue: React.Dispatch<React.SetStateAction<boolean>>;
    name: string;
}

const Checkbox: React.FC<CheckboxType> = memo(({
    value,
    setValue,
    name
}) => {
    const handleClick = useCallback(() => {
        setValue(prev => !prev);
    }, [setValue]);

    return (
        <div className="flex gap-[6px] mt-[12px] cursor-pointer" onClick={handleClick}>
            <div className="w-[18px] h-[18px] flex justify-center items-center bg-white rounded-[4px]">
                {value && <FaCheck size={12} />}
            </div>
            <p className="lg:text-[length:var(--size-lg-small-text)] md:text-[length:var(--size-md-small-text)] text-[length:var(--size-mobile-small-text)]">
                {name}
            </p>
        </div>
    )
});

Checkbox.displayName = "Checkbox";

export default Checkbox;