import Link from 'next/link';
import React from 'react'
import { IconType } from 'react-icons'

interface ButtonType {
    icon?: IconType;
    name?: string | React.ReactNode;
    color?: "blue" | "green" | "red" | "gray" | "light-gray" | "red";
    onClick?: any;
    href?: string;
    size?: "small" | "default" | "no-name" | "large";
    height?: 35 | 45 | 40;
    padding?: "normal" | "small";
    width?: "full";
    weight?: "bold"
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
    weight
}) => {
    const styleColor = () => {
        if(color === "blue") { 
            return "bg-[var(--blue-color)] hover:bg-[#008aed]"; 
        }else if(color === "green") {
             return "bg-[var(--green-color)] hover:bg-[#00B253]"; 
        }else if(color === "red") {
            return `bg-[#FF4052]`; 
        }else if(color === "gray") {
            return `bg-[#707070]`; 
        }else if(color === "light-gray") {
            return `bg-[#F2F1EF] text-[black!important]`; 
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

    if(href !== undefined) {
        return (
            <Link href="href">
                <button className={`button-default ${styleWeight()} ${styleWidth()} ${styleColor()} ${styleHeight()} ${stylePadding()} ${styleSize()}`}>
                    {Icon ? <Icon className="min-w-[16px]" size={styleIcon()} /> : null} {name}
                </button>
            </Link>
        )
    }
    return (
        <button onClick={onClick} className={`button-default ${styleWeight()} ${styleWidth()} ${styleColor()} ${styleHeight()} ${stylePadding()} ${styleSize()}`}>
            {Icon ? <Icon className="min-w-[16px]" size={styleIcon()} /> : null} {name}
        </button>
    )
}

export default Button