import Link from 'next/link';
import React from 'react'
import { IconType } from 'react-icons'

interface ButtonType {
    icon?: IconType;
    name?: string | React.ReactNode;
    color?: "blue" | "green" | "red" | "gray" | "light-gray";
    onClick?: any;
    href?: string;
    size?: "small" | "default" | "no-name" | "large";
    height?: 35 | 45 | 40;
    padding?: "normal" | "small";
    width?: "full";
    weight?: "bold";
    disabled?: boolean;
}

const Button: React.FC<ButtonType> = ({
    icon: Icon,
    name,
    color="blue",
    onClick,
    href,
    size="default",
    height=35,
    padding="normal",
    width,
    weight,
    disabled=false
}) => {
    const styleColor = () => {
        if (disabled) {
            return "bg-gray-300 text-gray-500 cursor-not-allowed";
        }
        
        if(color === "blue") { 
            return "bg-gradient-to-r from-[#0dccff] to-[#4760ff] hover:from-[#00b8f5] hover:to-[#3a50e5]"; 
        }else if(color === "green") {
             return "bg-gradient-to-r from-[#36c96d] to-[#2cd4b3] hover:from-[#2db55c] hover:to-[#24b89c]"; 
        }else if(color === "red") {
            return "bg-gradient-to-r from-[#fc0077] to-[#ff7275] hover:from-[#e0006a] hover:to-[#e66568]"; 
        }else if(color === "gray") {
            return "bg-[#707070] hover:bg-[#5a5a5a]"; 
        }else if(color === "light-gray") {
            return "bg-[#F2F1EF] text-[black!important] hover:bg-[#e5e4e2]"; 
        }
    }

    const styleWeight = () => {
        if(weight === "bold") return "font-semibold"
    }

    const styleSize = () => {
        if(size === "default") return "text-[14px]"
        if(size === "small") return "text-[12px]"
        if(size === "large") return "text-[18px]"
    }

    const styleIcon = () => {
        if(size === "default") return 16
        if(size === "small") return 14
        if(size === "no-name") return 18
    }

    const stylePadding = () => {
        if(padding === "normal") return "p-[8px_15px]"
        else return "p-[8px]"
    }

    const styleHeight = () => {
        if(height === 35) return "h-[35px]"
        else if(height === 45) return "h-[45px]"
        else return "h-[40px]"
    }

    const styleWidth = () => {
        if(width === "full") return "w-full"
    }

    const buttonClasses = `button-default ${styleWeight()} ${styleWidth()} ${styleColor()} ${styleHeight()} ${stylePadding()} ${styleSize()} transition-all duration-200 text-white ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`;

    if(href !== undefined && !disabled) {
        return (
            <Link href={href}>
                <button className={buttonClasses}>
                    {Icon ? <Icon className="min-w-[16px]" size={styleIcon()} /> : null} {name}
                </button>
            </Link>
        )
    }
    
    return (
        <button 
            onClick={disabled ? undefined : onClick} 
            className={buttonClasses}
            disabled={disabled}
        >
            {Icon ? <Icon className="min-w-[16px]" size={styleIcon()} /> : null} {name}
        </button>
    )
}

export default Button